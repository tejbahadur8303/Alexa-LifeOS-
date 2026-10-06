# Model Context Protocol (MCP) Implementation Guide

## 1. Specification Compliance

- **MCP Protocol Specification Version**: `2025-11-25` or newer
- **Transport**: `Streamable HTTP` (`SSEServerTransport` via `@modelcontextprotocol/sdk`)
- **JSON-RPC Version**: `2.0`
- **Session Management**: Dynamic UUID session multiplexing with graceful teardown on client disconnect.

---

## 2. Server Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/mcp` | `GET` | Initiates the persistent Server-Sent Events (SSE) Streamable HTTP session. Emits an initial `endpoint` event with the session URL. |
| `/mcp/messages?sessionId=<ID>` | `POST` | Receives client JSON-RPC 2.0 messages for the active session. |
| `/mcp/rpc` | `POST` | Direct stateless JSON-RPC 2.0 endpoint (convenient for curl, unit testing, and CLI integrations). |
| `/health` | `GET` | Health check and MCP readiness endpoint. |

---

## 3. Registered MCP Tools

| Tool Name | Risk Level | Description | Key Parameters |
|---|---|---|---|
| `create_goal` | LOW | Creates a new monitored high-level goal with success criteria and target deadline. | `title`, `description`, `deadline`, `targetLocation?`, `successCriteria?` |
| `get_goal_status` | LOW | Returns complete health status, criteria checks, risks, and travel conditions. | `goalId` |
| `update_goal` | MEDIUM | Updates goal properties (deadline, priority, status). | `goalId`, `priority?`, `status?`, `nextAction?` |
| `complete_goal` | LOW | Marks goal completed after verifying all success criteria. | `goalId` |
| `create_task` | LOW | Creates a milestone task linked to a goal with assignees and dependencies. | `goalId`, `title`, `assignee`, `isCritical?`, `dependencies?` |
| `update_task` | MEDIUM | Updates task status (`incomplete`, `in_progress`, `complete`, `blocked`). | `taskId`, `status?`, `blockedReason?` |
| `get_tasks` | LOW | Lists all tasks for a goal. | `goalId` |
| `get_task_dependencies` | LOW | Analyzes dependency chains, critical paths, and cycles. | `goalId` |
| `get_blockers` | LOW | Returns blocked tasks and their prerequisite blockers. | `goalId` |
| `get_calendar_events` | LOW | Returns upcoming calendar events. | `userId?` |
| `get_event_details` | LOW | Retrieves event metadata. | `eventId` |
| `get_route` | LOW | Calculates transit steps, departure time, and duration. | `origin`, `destination`, `deadline` |
| `get_eta` | LOW | Computes estimated travel duration in minutes under current traffic. | `origin`, `destination` |
| `get_travel_status` | LOW | Returns trip departure/arrival times, buffer minutes, and traffic severity. | `goalId?` |
| `find_alternative_route` | LOW | Discovers uncongested alternative routes when primary route is blocked. | `goalId` |
| `get_weather` | LOW | Fetches current weather and rain probability. | `location` |
| `get_weather_forecast` | LOW | Forecasts future commuting conditions. | `location`, `time` |
| `analyze_goal_risk` | LOW | Executes deterministic risk evaluation returning score, level, and reasons. | `goalId` |
| `detect_context_changes` | LOW | Compares current context with previous snapshot to report what changed. | `goalId` |
| `calculate_goal_impact` | LOW | Projects the risk impact of hypothetical delays. | `goalId`, `addedTravelDelayMinutes?` |
| `replan_goal` | MEDIUM | Generates protective mitigation proposals and requests approvals. | `goalId` |
| `generate_next_actions` | LOW | Returns prioritized next steps. | `goalId` |
| `generate_daily_briefing` | LOW | Synthesizes morning operational summary for Alexa+ voice output. | `userId?` |
| `send_message` | MEDIUM | Dispatches verified message to team collaborator. | `recipient`, `message`, `channel?`, `isPreApproved?` |
| `get_team_status` | LOW | Queries readiness states of all team members. | None |
| `save_memory` | LOW | Persists structured operational facts or user preferences. | `memoryType`, `key`, `value` |
| `search_memory` | LOW | Queries structured memory store. | `query` |
| `get_user_preferences` | LOW | Returns user buffer preferences and transport modes. | `userId?` |
| `request_action_approval` | LOW | Enqueues a consequential action for user authorization. | `goalId`, `actionType`, `title`, `impactSummary`, `payload` |
| `get_pending_approvals` | LOW | Returns all actions awaiting authorization. | None |
| `resolve_approval` | USER | Authorizes or rejects a pending action and executes verified mitigations. | `approvalId`, `decision`, `resolvedBy?` |

---

## 4. Exposed MCP Resources

- `mcp://guardian/user/preferences`: Operational buffer preferences, transport modes, and contacts.
- `mcp://guardian/goals/active`: Current active goal health, progress, and success criteria.
- `mcp://guardian/goals/{goalId}`: Specific goal details by ID.
- `mcp://guardian/tasks/today`: Scheduled task list and blocker states.
- `mcp://guardian/trip/current`: Active travel ETA, route, and arrival buffer minutes.
- `mcp://guardian/context/current`: Latest environmental snapshot (travel, weather, team, tasks).
- `mcp://guardian/context/changes`: Detections and deltas from What-Changed engine.
- `mcp://guardian/risks/current`: Current deterministic predictive risk assessment.
- `mcp://guardian/team/current`: Team readiness metrics and assigned deliverables.
- `mcp://guardian/approvals/pending`: Actions awaiting user authorization.

---

## 5. Reusable MCP Prompts

- `goal_planning`: Guides agent to decompose an objective into success criteria, required context streams, and dependencies.
- `goal_risk_analysis`: Evaluates explainable risk factors against strict rules.
- `goal_replanning`: Formulates a mitigation plan when an external disruption threatens a goal.
- `daily_briefing`: Prepares a concise voice-friendly operational morning summary for Alexa+.
- `change_analysis`: Answers "What changed?", "Does this affect my goal?", and "What should happen next?".
- `action_explanation`: Explains the consequences and necessity of an action before requesting permission.

---

## 6. Testing via MCP Inspector

1. Start the LifeOS Guardian server:
   ```bash
   npm run server
   ```
2. In a separate terminal, launch the official MCP Inspector:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
3. Connect Inspector:
   - **Transport Type**: `SSE` (Streamable HTTP)
   - **URL**: `http://localhost:5050/mcp`
4. Inspect tools, resources, and prompts interactively.
