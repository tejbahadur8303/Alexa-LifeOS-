import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { storage } from './db/storage.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { allTools } from './tools/index.js';
import { allResources } from './resources/index.js';
import { allPrompts } from './prompts/index.js';
import { goalService } from './services/goal.service.js';
import { taskService } from './services/task.service.js';
import { riskService } from './services/risk.service.js';
import { planningService } from './services/planning.service.js';
import { permissionService } from './services/permission.service.js';
import { changeDetectionService } from './services/change-detection.service.js';
import { travelSimulator } from './adapters/simulation/travel.simulator.js';
import { weatherSimulator } from './adapters/simulation/weather.simulator.js';
import { teamSimulator } from './adapters/simulation/team.simulator.js';
import { messagingSimulator } from './adapters/simulation/messaging.simulator.js';
import { planner } from '../../agent/planner/index.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5050', 10);
const SIMULATION_MODE = process.env.SIMULATION_MODE !== 'false';

export function createMcpServerInstance() {
  const server = new McpServer({
    name: 'lifeos-guardian',
    version: '1.0.0',
    description: 'LifeOS Alexa+ Guardian: Autonomous Goal Protection & Personal Operations MCP Server',
  });

  // Register Tools
  for (const t of allTools) {
    // Convert ZodObject shape to parameter object expected by McpServer
    const shape = (t.parameters as any).shape || {};
    server.tool(t.name, t.description, shape, async (args: any) => {
      const result = await t.handler(args);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    });
  }

  // Register Static Resources
  for (const r of allResources) {
    if ('uri' in r && typeof r.uri === 'string') {
      server.resource(r.name, r.uri, async (uri) => {
        const data = await (r.handler as any)(uri.href);
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: r.mimeType,
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      });
    }
  }

  // Register Prompts
  for (const p of allPrompts) {
    const argsShape: Record<string, any> = {};
    for (const arg of p.arguments) {
      argsShape[arg.name] = arg.required ? z.string() : z.string().optional();
    }
    server.prompt(p.name, p.description, argsShape, (args: any) => {
      const messages = p.generateMessages(args) as Array<{
        role: 'user' | 'assistant';
        content: { type: 'text'; text: string };
      }>;
      return { messages };
    });
  }

  return server;
}

export async function createApp() {
  const app = express();

  // Middleware with universal local CORS support (handles localhost:5173, 127.0.0.1:6274 MCP Inspector, etc.)
  app.use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'x-request-id',
        'mcp-session-id',
        'Mcp-Session-Id',
        'mcp-protocol-version',
        'Mcp-Protocol-Version',
        'last-event-id',
        '*',
      ],
      exposedHeaders: ['Mcp-Session-Id', 'mcp-session-id', 'Content-Type'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );
  app.options('*', cors());
  app.use(express.json());
  app.use(requestLogger);

  // Initialize DB Storage & Seed data
  const { mongo } = await storage.init();

  // -------------------------------------------------------------
  // Streamable HTTP MCP Transport (MCP 2025-11-25) Session Manager
  // -------------------------------------------------------------
  const IDLE_MS = 30 * 60000;
  const MAX_SESSIONS = 1000;
  const sessions = new Map<
    string,
    { transport: StreamableHTTPServerTransport; server: McpServer; open: number; lastActive: number }
  >();

  const trackResponse = (session: { open: number; lastActive: number }, res: express.Response) => {
    if (!res.socket || res.destroyed) return;
    session.open++;
    res.on('close', () => {
      session.open--;
      session.lastActive = Date.now();
    });
  };

  const cleanupInterval = setInterval(() => {
    const cutoff = Date.now() - IDLE_MS;
    for (const [sid, { transport, server, open, lastActive }] of sessions.entries()) {
      if (open === 0 && lastActive < cutoff) {
        transport.close().catch(console.error);
        server.close().catch(console.error);
        sessions.delete(sid);
      }
    }
  }, 60000);
  cleanupInterval.unref();

  const mcpPostHandler = async (req: express.Request, res: express.Response) => {
    const rawSessionId = req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id'];
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

    const acceptHeader = (req.headers['accept'] || '') as string;
    if (!acceptHeader.includes('application/json') || !acceptHeader.includes('text/event-stream')) {
      req.headers['accept'] = 'application/json, text/event-stream';
    }

    try {
      const session = sessionId ? sessions.get(sessionId) : undefined;
      let transport: StreamableHTTPServerTransport;

      const isInit =
        req.body?.method === 'initialize' ||
        (Array.isArray(req.body) && req.body.some((r: any) => r?.method === 'initialize'));

      if (session) {
        transport = session.transport;
        trackResponse(session, res);
      } else if (!sessionId && isInit) {
        if (sessions.size >= MAX_SESSIONS) {
          return res.status(503).json({
            jsonrpc: '2.0',
            error: { code: -32000, message: 'Too many open sessions' },
            id: null,
          });
        }

        const instanceServer = createMcpServerInstance();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: (sid: string) => {
            sessions.set(sid, { transport, server: instanceServer, open: 0, lastActive: Date.now() });
          },
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && sessions.has(sid)) {
            sessions.delete(sid);
          }
        };

        await instanceServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
        return;
      } else if (sessionId) {
        return res.status(404).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Session not found' },
          id: null,
        });
      } else {
        // Stateless fallback
        const instanceServer = createMcpServerInstance();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });
        await instanceServer.connect(transport);
        await transport.handleRequest(req, res, req.body);
        res.on('close', () => {
          transport.close().catch(() => {});
          instanceServer.close().catch(() => {});
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal server error',
          },
          id: null,
        });
      }
    }
  };

  const mcpGetHandler = async (req: express.Request, res: express.Response) => {
    const rawSessionId = req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id'] || req.query.sessionId;
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

    if (!sessionId) {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Missing Mcp-Session-Id header' },
        id: null,
      });
    }

    const session = sessions.get(sessionId as string);
    if (!session) {
      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Session not found' },
        id: null,
      });
    }

    trackResponse(session, res);
    await session.transport.handleRequest(req, res);
  };

  const mcpDeleteHandler = async (req: express.Request, res: express.Response) => {
    const rawSessionId = req.headers['mcp-session-id'] || req.headers['Mcp-Session-Id'];
    const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

    if (!sessionId) {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Missing Mcp-Session-Id header' },
        id: null,
      });
    }

    const session = sessions.get(sessionId as string);
    if (!session) {
      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Session not found' },
        id: null,
      });
    }

    try {
      trackResponse(session, res);
      await session.transport.handleRequest(req, res);
      sessions.delete(sessionId as string);
    } catch (error) {
      console.error('Error handling MCP DELETE request:', error);
      if (!res.headersSent) {
        res.status(500).send('Error processing session termination');
      }
    }
  };

  app.post('/mcp', mcpPostHandler);
  app.post('/mcp/*', mcpPostHandler);
  app.get('/mcp', mcpGetHandler);
  app.get('/mcp/*', mcpGetHandler);
  app.delete('/mcp', mcpDeleteHandler);
  app.delete('/mcp/*', mcpDeleteHandler);

  // Direct JSON-RPC endpoint for simple testing & non-SSE clients
  app.post('/mcp/rpc', async (req, res) => {
    try {
      const { method, params, id } = req.body;
      if (method === 'tools/list') {
        const toolsList = allTools.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: (t.parameters as any).shape,
        }));
        return res.json({ jsonrpc: '2.0', id, result: { tools: toolsList } });
      }

      if (method === 'tools/call') {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        const targetTool = allTools.find((t) => t.name === toolName);
        if (!targetTool) {
          return res.status(404).json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Tool "${toolName}" not found` },
          });
        }
        const toolResult = await targetTool.handler(toolArgs);
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }],
          },
        });
      }

      if (method === 'resources/list') {
        const resList = allResources.map((r: any) => ({
          uri: r.uri || 'mcp://guardian/pattern',
          name: r.name,
          mimeType: r.mimeType,
          description: r.description,
        }));
        return res.json({ jsonrpc: '2.0', id, result: { resources: resList } });
      }

      if (method === 'prompts/list') {
        const promptList = allPrompts.map((p) => ({
          name: p.name,
          description: p.description,
          arguments: p.arguments,
        }));
        return res.json({ jsonrpc: '2.0', id, result: { prompts: promptList } });
      }

      res.status(400).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method "${method}" not supported via direct RPC` },
      });
    } catch (err: any) {
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id,
        error: { code: -32603, message: err.message },
      });
    }
  });

  // -------------------------------------------------------------
  // Health Check Endpoint (Section 30)
  // -------------------------------------------------------------
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'lifeos-guardian',
      database: storage.isMongo() ? 'connected' : 'in-memory-fallback',
      simulationMode: SIMULATION_MODE,
      mcp: 'ready',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // REST API Endpoints for Web Dashboard
  // -------------------------------------------------------------

  // Goals
  app.get('/api/goals', async (req, res) => {
    const goals = await storage.getAllGoals();
    res.json(goals);
  });

  app.get('/api/goals/:goalId', async (req, res) => {
    const status = await goalService.getGoalStatus(req.params.goalId);
    if (!status) return res.status(404).json({ error: 'Goal not found' });
    res.json(status);
  });

  app.post('/api/goals', async (req, res) => {
    const goal = await goalService.createGoal(req.body);
    res.status(201).json(goal);
  });

  // Tasks
  app.get('/api/tasks', async (req, res) => {
    const goalId = (req.query.goalId as string) || 'goal_hackathon_001';
    const tasks = await storage.getTasksByGoal(goalId);
    res.json(tasks);
  });

  app.get('/api/tasks/dependencies', async (req, res) => {
    const goalId = (req.query.goalId as string) || 'goal_hackathon_001';
    const analysis = await taskService.getTaskDependencies(goalId);
    res.json(analysis);
  });

  // Risk and Context
  app.get('/api/risks', async (req, res) => {
    const goalId = (req.query.goalId as string) || 'goal_hackathon_001';
    const risk = await riskService.analyzeGoalRisk(goalId);
    res.json(risk);
  });

  app.get('/api/context', async (req, res) => {
    const goalId = (req.query.goalId as string) || 'goal_hackathon_001';
    const snapshot = await changeDetectionService.captureCurrentSnapshot(goalId);
    res.json(snapshot);
  });

  app.get('/api/context/changes', async (req, res) => {
    const goalId = (req.query.goalId as string) || 'goal_hackathon_001';
    const changes = await changeDetectionService.detectContextChanges(goalId);
    res.json(changes);
  });

  // Approvals
  app.get('/api/approvals', async (req, res) => {
    const approvals = await storage.getApprovals();
    res.json(approvals);
  });

  app.post('/api/approvals/:id/resolve', async (req, res) => {
    const { decision, resolvedBy } = req.body;
    const result = await permissionService.resolveApproval(req.params.id, decision, resolvedBy);
    res.json(result);
  });

  // Activity / Audit Logs
  app.get('/api/activity', async (req, res) => {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const actions = await storage.getActions(limit);
    res.json(actions);
  });

  // Replanning Trigger
  app.post('/api/replan', async (req, res) => {
    const goalId = (req.body.goalId as string) || 'goal_hackathon_001';
    const replan = await planningService.replanGoal(goalId);
    res.json(replan);
  });

  // Disruption Simulator (Section 18)
  app.post('/api/disruptions/inject', async (req, res) => {
    const { type, delayMinutes } = req.body;
    const goalId = req.body.goalId || 'goal_hackathon_001';

    let summary = '';
    if (type === 'traffic_delay') {
      const delay = delayMinutes || 33;
      await travelSimulator.injectTrafficDelay(delay);
      summary = `Traffic disruption injected: ETA increased by +${delay} minutes (now 78 min). Arrival buffer dropped to 5 min.`;
    } else if (type === 'adverse_weather') {
      await weatherSimulator.injectAdverseWeather('Severe Thunderstorm & High Winds', 85);
      summary = 'Severe weather disruption injected: Thunderstorm advisory issued with 85% precipitation risk.';
    } else if (type === 'team_blocker') {
      await teamSimulator.updateMemberStatus('team_rahul', 'blocked');
      const backendTask = (await storage.getTasksByGoal(goalId)).find((t) => t.id === 'task_001');
      if (backendTask) {
        backendTask.status = 'blocked';
        backendTask.blockedReason = 'Staging server connectivity drop';
        await storage.saveTask(backendTask);
      }
      summary = 'Team blocker injected: Rahul reported staging server connectivity failure.';
    } else if (type === 'train_delayed') {
      await travelSimulator.injectTrafficDelay(25);
      summary = 'Transit delay injected: Rail line maintenance causing 25 min schedule slip.';
    } else {
      await travelSimulator.injectTrafficDelay(33);
      summary = 'Standard demo disruption injected: Traffic delay +33m on primary route.';
    }

    // Trigger Goal Shield context capture, risk recalculation, and replanning
    const snapshot = await changeDetectionService.captureCurrentSnapshot(goalId);
    const risk = await riskService.analyzeGoalRisk(goalId);
    const replan = await planningService.replanGoal(goalId);

    // Log the disruption event
    await storage.logAction({
      id: `disrupt_${Date.now()}`,
      requestId: `req_${Date.now()}`,
      goalId,
      toolName: 'inject_disruption',
      actionType: 'simulation_disruption',
      parameters: { type, delayMinutes },
      status: 'verified',
      riskClassification: 'LOW',
      requiresApproval: false,
      verified: true,
      latencyMs: 15,
      timestamp: new Date().toISOString(),
      explanation: summary,
    });

    res.json({
      success: true,
      summary,
      snapshot,
      risk,
      replan,
    });
  });

  // Disruption Reset
  app.post('/api/disruptions/reset', async (req, res) => {
    const goalId = req.body.goalId || 'goal_hackathon_001';
    await travelSimulator.resetToNormal();
    await weatherSimulator.resetToNormal();
    await teamSimulator.resetToNormal();

    // Reset tasks
    const tasks = await storage.getTasksByGoal(goalId);
    for (const t of tasks) {
      if (t.id === 'task_001') t.status = 'incomplete';
      if (t.id === 'task_002') t.status = 'blocked';
      await storage.saveTask(t);
    }

    const snapshot = await changeDetectionService.captureCurrentSnapshot(goalId);
    const risk = await riskService.analyzeGoalRisk(goalId);

    res.json({
      success: true,
      message: 'Simulation reset to normal nominal state.',
      snapshot,
      risk,
    });
  });

  // Natural Language Voice / Chat Agent Command (Section 39)
  app.post('/api/agent/command', async (req, res) => {
    try {
      const { command, goalId = 'goal_hackathon_001' } = req.body;
      const goal = await storage.getGoal(goalId);
      const risk = await storage.getLatestRisk(goalId);
      const travel = await travelSimulator.getTravelStatus(goalId);
      const pendingApprovals = await permissionService.getPendingApprovals();

      const interpretation = planner.interpretNaturalLanguage(command, {
        goal,
        risk,
        travel,
        pendingApprovals,
      });

      let executionResult: any = null;

      // Automatically execute if the command approves an action
      if (interpretation.intent === 'approve_route') {
        const routeApproval = pendingApprovals.find((a) => a.actionType === 'switch_route');
        if (routeApproval) {
          executionResult = await permissionService.resolveApproval(
            routeApproval.id,
            'approved',
            'Alex'
          );
          // Recalculate risk & health
          await riskService.analyzeGoalRisk(goalId);
        }
      } else if (interpretation.intent === 'approve_message') {
        const msgApproval = pendingApprovals.find((a) => a.actionType === 'send_message');
        if (msgApproval) {
          executionResult = await permissionService.resolveApproval(
            msgApproval.id,
            'approved',
            'Alex'
          );
          await riskService.analyzeGoalRisk(goalId);
        }
      } else if (interpretation.intent === 'daily_briefing') {
        executionResult = await planningService.generateDailyBriefing();
      } else if (interpretation.intent === 'detect_changes') {
        executionResult = await changeDetectionService.detectContextChanges(goalId);
      }

      res.json({
        success: true,
        command,
        intent: interpretation.intent,
        response: interpretation.response,
        executionResult,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Memory & Preferences
  app.get('/api/memories', async (req, res) => {
    const userId = (req.query.userId as string) || 'usr_alex_001';
    const memories = await storage.getMemories(userId);
    res.json(memories);
  });

  app.use(errorHandler);

  return app;
}

// Start Server if launched directly
const isMain = process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js');
if (isMain) {
  createApp().then((app) => {
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  LifeOS — Alexa+ Guardian Server Running`);
      console.log(`  URL:             http://localhost:${PORT}`);
      console.log(`  Streamable MCP:  http://localhost:${PORT}/mcp`);
      console.log(`  Direct MCP RPC:  http://localhost:${PORT}/mcp/rpc`);
      console.log(`  Health Check:    http://localhost:${PORT}/health`);
      console.log(`  Mode:            ${SIMULATION_MODE ? 'LOCAL SIMULATION' : 'LIVE ADAPTERS'}`);
      console.log(`======================================================\n`);
    });
  });
}
