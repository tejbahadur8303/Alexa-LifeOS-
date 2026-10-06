import { describe, it, expect, beforeAll } from 'vitest';
import { storage } from '../../src/db/storage.js';
import { allTools } from '../../src/tools/index.js';

describe('MCP Tools Integration Tests', () => {
  beforeAll(async () => {
    process.env.FORCE_MEMORY_DB = 'true';
    await storage.init();
  });

  function getTool(name: string) {
    const t = allTools.find((item) => item.name === name);
    if (!t) throw new Error(`Tool ${name} not found`);
    return t;
  }

  it('invokes get_travel_status successfully', async () => {
    const tool = getTool('get_travel_status');
    const res: any = await tool.handler({ goalId: 'goal_hackathon_001' });
    expect(res.success).toBe(true);
    expect(res.data.etaMinutes).toBeDefined();
    expect(res.data.currentBufferMinutes).toBeDefined();
  });

  it('invokes analyze_goal_risk and produces structured risk assessment', async () => {
    const tool = getTool('analyze_goal_risk');
    const res: any = await tool.handler({ goalId: 'goal_hackathon_001' });
    expect(res.success).toBe(true);
    expect(res.data.riskLevel).toBeDefined();
    expect(res.data.riskScore).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.data.reasons)).toBe(true);
  });

  it('invokes get_blockers and detects downstream dependencies', async () => {
    const tool = getTool('get_blockers');
    const res: any = await tool.handler({ goalId: 'goal_hackathon_001' });
    expect(res.success).toBe(true);
    expect(res.data.blockedTasksCount).toBeGreaterThan(0);
    expect(res.data.blockers.some((b: any) => b.assignee === 'Alex')).toBe(true);
  });

  it('invokes request_action_approval and resolve_approval with verification', async () => {
    const reqTool = getTool('request_action_approval');
    const reqRes: any = await reqTool.handler({
      goalId: 'goal_hackathon_001',
      actionType: 'send_message',
      title: 'Alert Rahul',
      description: 'Ask for staging update',
      impactSummary: 'High priority alert',
      payload: { recipient: 'Rahul', message: 'Please update staging.' },
    });

    expect(reqRes.success).toBe(true);
    const approvalId = reqRes.data.id;

    const resolveTool = getTool('resolve_approval');
    const resolveRes: any = await resolveTool.handler({
      approvalId,
      decision: 'approved',
      resolvedBy: 'Alex',
    });

    expect(resolveRes.success).toBe(true);
    expect(resolveRes.data.verified).toBe(true);
    expect(resolveRes.data.executionResult.delivered).toBe(true);
  });
});
