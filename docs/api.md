# LifeOS — Alexa+ Guardian API Reference

## 1. REST Endpoints

### 1.1 Health Check
- **`GET /health`**
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "lifeos-guardian",
    "database": "connected",
    "simulationMode": true,
    "mcp": "ready",
    "version": "1.0.0",
    "timestamp": "2026-10-04T07:00:00.000Z"
  }
  ```

---

### 1.2 Goals API
- **`GET /api/goals`**: Returns all active and archived goals.
- **`GET /api/goals/:goalId`**: Returns complete goal status, health score, criteria checks, and current risk.
- **`POST /api/goals`**: Creates a new goal.
  ```json
  {
    "title": "Deliver Hackathon Keynote",
    "description": "Make sure I reach on time and tech demo is ready",
    "deadline": "2026-10-04T09:00:00.000Z",
    "targetLocation": "Innovation Hall 4",
    "priority": "critical"
  }
  ```

---

### 1.3 Tasks & Dependencies API
- **`GET /api/tasks?goalId=:id`**: Returns task breakdown for a goal.
- **`GET /api/tasks/dependencies?goalId=:id`**: Returns dependency analysis, critical paths, and blocked tasks.

---

### 1.4 Risks & Context API
- **`GET /api/risks?goalId=:id`**: Returns deterministic predictive risk score and explainable reasons.
- **`GET /api/context?goalId=:id`**: Returns latest environmental context snapshot (travel, weather, team).
- **`GET /api/context/changes?goalId=:id`**: Returns delta changes between previous and current snapshots.

---

### 1.5 Approvals API
- **`GET /api/approvals`**: Returns all pending and resolved consequential approvals.
- **`POST /api/approvals/:id/resolve`**:
  ```json
  {
    "decision": "approved", // or "rejected"
    "resolvedBy": "Alex"
  }
  ```

---

### 1.6 Disruption Simulation API
- **`POST /api/disruptions/inject`**:
  ```json
  {
    "type": "traffic_delay", // or "adverse_weather", "team_blocker", "train_delayed"
    "delayMinutes": 33,
    "goalId": "goal_hackathon_001"
  }
  ```
- **`POST /api/disruptions/reset`**: Resets simulated environment back to nominal conditions.

---

### 1.7 Natural Language Voice Agent API
- **`POST /api/agent/command`**:
  ```json
  {
    "command": "Alexa, make sure I reach my hackathon tomorrow by 9 AM and my team is ready.",
    "goalId": "goal_hackathon_001"
  }
  ```
  Returns intent, suggested MCP tool, natural language response, and execution verification.

---

## 2. MCP Streamable HTTP Protocol

### 2.1 Initiating MCP SSE Stream
- **Request:**
  ```http
  GET /mcp HTTP/1.1
  Host: localhost:5050
  Accept: text/event-stream
  ```
- **Response:**
  ```http
  HTTP/1.1 200 OK
  Content-Type: text/event-stream
  Connection: keep-alive

  event: endpoint
  data: /mcp/messages?sessionId=e1b3069c-0975-4c07-b353-8e4d3a011707
  ```

### 2.2 Client JSON-RPC Message
- **Request:**
  ```http
  POST /mcp/messages?sessionId=e1b3069c-0975-4c07-b353-8e4d3a011707 HTTP/1.1
  Content-Type: application/json

  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_travel_status",
      "arguments": { "goalId": "goal_hackathon_001" }
    }
  }
  ```
