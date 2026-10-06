# LifeOS — Alexa+ Guardian
### Autonomous Goal Protection & Personal Operations Agent

> **“Tell Alexa what you want to accomplish. Guardian watches what could go wrong and helps make sure it gets done.”**
>
> *“Alexa can answer a question. Guardian protects an objective.”*

---

## 1. Project Overview

**LifeOS — Alexa+ Guardian** is an autonomous personal operations agent built specifically for the **Amazon Alexa+ / MCP Hackathon**.

Traditional voice assistants and chatbot agents reactively answer one-off prompts (*“Set an alarm for 8 AM”*, *“What is the weather?”*). They suffer from context amnesia, do not understand higher-level objectives, and cannot autonomously protect an objective when real-world conditions shift unexpectedly.

**LifeOS Guardian changes the fundamental paradigm:**
1. **Goal > Command**: Maintains persistent goal state rather than isolated chat turns.
2. **Monitor > Respond**: Continuously watches external context streams (traffic, weather, team deliverables).
3. **Replan > Notify**: Doesn't just alert the user when something breaks—it calculates viable alternatives.
4. **Explain > Black Box**: Returns explainable risk factors, not opaque numeric scores.
5. **Permission > Blind Autonomy**: Enforces strict consequence-aware permissions before executing real-world actions.

---

## 2. The Core Problem

Users don't care about setting reminders or checking five different apps—they care about **accomplishing outcomes**.
When preparing for a mission-critical milestone (e.g. pitching at a major hackathon by 9:00 AM):
- A highway accident adds 33 minutes to travel.
- A teammate gets stuck on backend deployment, blocking demo testing.
- Rain reduces road visibility.

Existing tools expect the human to manually notice each separate problem, recalculate departure times, find alternatives, and message teammates. If the user doesn't check their phone, the goal fails silently.

---

## 3. The Guardian Solution: Continuous Goal Protection

Guardian sits between the user's objective and the unpredictable real world:

```
USER GOAL: "Make sure I reach my hackathon tomorrow by 9 AM and my team is ready"
   │
   ▼
CONTEXT STREAMS (Travel, Weather, Calendar, Team Deliverables)
   │
   ▼
PREDICTIVE RISK ENGINE (Evaluates arrival buffer & prerequisite blockers)
   │
   ▼
UNEXPECTED DISRUPTION INJECTED (Traffic adds +33m; buffer drops to 5m)
   │
   ▼
WHAT-CHANGED ENGINE (Detects delta & assesses HIGH risk impact)
   │
   ▼
AUTONOMOUS REPLANNING (Discovers Express Metro route arriving at 8:32 AM)
   │
   ▼
CONSEQUENCE-AWARE PERMISSION (Requests user consent for route & teammate alert)
   │
   ▼
VERIFIED ACTION EXECUTION (Route switched, message delivered & confirmed)
   │
   ▼
GOAL PROTECTED & ON TRACK
```

---

## 4. Key Differentiators & Unique Features

### 🛡️ 1. Goal Shield
Continuously verifies four success criteria:
- `arrive_before_deadline`: Arrival time verified against live travel conditions.
- `presentation_ready`: Pitch deck status verified.
- `demo_ready`: Rehearsal test status verified.
- `team_ready`: Collaborator readiness verified.
Computes an explainable **Goal Health Score (0–100%)**.

### 🔍 2. What-Changed Engine
Maintains environmental context snapshots and computes structured deltas:
- Previous State vs. Current State.
- Exposes `detect_context_changes` tool and `mcp://guardian/context/changes` resource.

### 🧠 3. Dependency Intelligence
Understands task topology and critical paths:
- Recognizes that `Demo Testing` is **BLOCKED** because `Backend Deployment` is incomplete.
- Tells the user: *"Your demo cannot be tested yet because backend deployment is incomplete by Rahul."*

### ⚖️ 4. Deterministic Predictive Risk Engine
No hallucinated risk claims. Deterministic, explainable scoring:
- `deadline < 2 hours`: `+30`
- `travel buffer < 15 minutes`: `+25`
- `critical task incomplete`: `+25`
- `dependency blocked`: `+20`
- `bad weather advisory`: `+10`
- `team member deliverable incomplete`: `+10`
Thresholds: `0-29 LOW`, `30-59 MEDIUM`, `60-79 HIGH`, `80-100 CRITICAL`.

### 🔐 5. Consequence-Aware Permissions (Human-in-the-Loop)
Strict authorization guardrails:
- **LOW RISK (Auto-Permitted)**: Read calendar, fetch weather, compute ETA, analyze risk.
- **MEDIUM RISK (Approval Required)**: Send messages to teammates, switch itinerary routes.
- **HIGH RISK (Explicit User Consent Mandatory)**: Financial purchases, booking cancellations.

### ✅ 6. Verified Action Execution
Never marks an action successful just because the LLM emitted text. Verifies message delivery and route application with confirmation receipts.

---

## 5. System Architecture

```
alexa-guardian/
├── mcp-server/           # MCP 2025-11-25 Streamable HTTP Server & REST API
│   ├── src/
│   │   ├── server.ts     # Streamable HTTP MCP & Express gateway
│   │   ├── tools/        # 10 MCP Tool definitions (Goal, Risk, Travel, Tasks, etc.)
│   │   ├── resources/    # 5 MCP Resource providers (mcp://guardian/...)
│   │   ├── prompts/      # Reusable MCP Prompts (planning, risk, briefing)
│   │   ├── services/     # Business logic coordination services
│   │   ├── adapters/     # Simulation & Live Provider Adapters
│   │   ├── db/           # Dual-mode Storage (MongoDB + In-Memory fallback)
│   │   └── models/       # TypeScript types & Mongoose schemas
│   └── tests/            # Vitest Unit, Integration, and E2E Demo test suites
│
├── agent/                # Algorithmic reasoning engines
│   ├── planner/          # Autonomous replanning & Alexa natural language parser
│   ├── risk-engine/      # Explainable deterministic risk scoring
│   ├── goal-engine/      # Continuous Goal Shield evaluation
│   ├── dependency-engine/# Blocker detection & topological impact
│   ├── permission-engine/# 3-tier consequence authorization policy
│   └── change-detector/  # What-changed snapshot differencing
│
├── web/                  # React + TypeScript + Vite Operations Console
│   ├── src/
│   │   ├── pages/        # Dashboard, Goals, Approvals, Activity, Settings
│   │   ├── components/   # GoalCard, RiskCard, DependencyGraph, DisruptionSimulator
│   │   └── services/     # API client
│
├── database/seed/        # Realistic seed fixtures (users, goals, tasks, events, team)
├── docs/                 # Architecture, MCP, Demo Script, and API docs
└── docker-compose.yml    # MongoDB container configuration
```

---

## 6. MCP Implementation Details

- **Specification**: `MCP 2025-11-25` or newer
- **Transport**: `Streamable HTTP` (`SSEServerTransport` via `@modelcontextprotocol/sdk`)
- **MCP Endpoint**: `http://localhost:5050/mcp`
- **Direct RPC Endpoint**: `http://localhost:5050/mcp/rpc`

### Core MCP Tools (Selected Highlights)
- `create_goal`: Initialize monitored objective.
- `get_goal_status`: Full health score and criteria breakdown.
- `get_travel_status`: Live ETA, traffic status, and buffer minutes.
- `find_alternative_route`: Calculates uncongested backup transit routes.
- `analyze_goal_risk`: Deterministic scoring and explainability.
- `detect_context_changes`: Answers *"What changed?"*.
- `get_blockers`: Identifies blocked tasks and prerequisite culprits.
- `replan_goal`: Formulates mitigation plan.
- `send_message`: Dispatches verified message to team members.
- `resolve_approval`: Authorizes and executes consequential actions.

### Core MCP Resources
- `mcp://guardian/goals/active`: Current active goal and health.
- `mcp://guardian/trip/current`: Real-time travel ETA and buffer.
- `mcp://guardian/risks/current`: Latest risk assessment and factors.
- `mcp://guardian/context/changes`: What-changed delta stream.
- `mcp://guardian/approvals/pending`: Actions awaiting authorization.

---

## 7. Local Setup & Quick Start

The application runs **100% locally in simulation mode without requiring external paid APIs**.

### Prerequisites
- Node.js `v18+` (v20+ recommended)
- npm `v9+`
- (Optional) Docker or local MongoDB instance (An automatic In-Memory Store fallback is included if MongoDB is not running!).

### 1. Clone & Install
```bash
git clone <repo-url> alexa-guardian
cd alexa-guardian
npm install
```

### 2. Configure Environment
```bash
cp mcp-server/.env.example mcp-server/.env
```

### 3. Seed Database
```bash
npm run seed
```
*Output: Seeds Alex (User), Hackathon Objective, Tasks with dependencies, Events, and Team members (Rahul, Aman, Priya).*

### 4. Run the Full Stack (Server + Web Console)
```bash
npm run dev:all
```
- **Web Console**: `http://localhost:5173`
- **MCP Server**: `http://localhost:5050`
- **Health Check**: `http://localhost:5050/health`

Alternatively, run server and web in separate terminals:
```bash
# Terminal 1: MCP Server
npm run server

# Terminal 2: Web Console
npm run web
```

---

## 8. Verification & Test Suite

LifeOS Guardian includes a full suite of unit tests, integration tests, and an end-to-end simulation of the primary hackathon demo scenario:

```bash
npm test
```

### Test Coverage Highlights:
- `tests/unit/risk-engine.test.ts`: Risk scoring rules, buffer penalties, explainability.
- `tests/unit/dependency-engine.test.ts`: Cycle detection, blocker extraction.
- `tests/unit/permission-engine.test.ts`: Low/Medium/High risk authorization enforcement.
- `tests/unit/change-detection.test.ts`: Snapshot deltas and impact classification.
- `tests/unit/planner.test.ts`: Replanning logic and natural language parsing.
- `tests/unit/goal-engine.test.ts`: Success criteria and Goal Health calculations.
- `tests/integration/mcp-tools.test.ts`: Tool execution and error schemas.
- `tests/integration/mcp-resources.test.ts`: Resource schema checks.
- `tests/e2e/demo-scenario.test.ts`: **Full primary demo lifecycle test** (Goal Creation &rarr; Traffic Disruption &rarr; Risk Escalation &rarr; Replanning &rarr; Permission Approval &rarr; Action Verification &rarr; Goal Protected).

---

## 9. Testing with Official MCP Inspector

LifeOS Guardian is fully compatible with the official Model Context Protocol Inspector:

1. Ensure the server is running:
   ```bash
   npm run server
   ```
2. In a new terminal, launch MCP Inspector:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
3. In the Inspector UI:
   - **Transport**: `SSE` (Streamable HTTP)
   - **URL**: `http://localhost:5050/mcp`
4. Click **Connect**. You can now interactively call tools (`get_travel_status`, `analyze_goal_risk`), query resources, and inspect prompts!

---

## 10. The Winning Hackathon Demo Flow

1. **User Objective**:
   > *“Alexa, make sure I reach my hackathon tomorrow by 9 AM and my team is ready.”*
   Guardian displays **78% Progress**, **30m Travel Buffer**, **MEDIUM Risk** (due to Rahul's incomplete backend).
2. **Inject Disruption**:
   In the console, click **`[ +33m TRAFFIC DELAY ]`**.
   ETA spikes to 78m. Arrival moves to 8:55 AM. Buffer drops to **5 minutes**.
3. **Guardian Alerts**:
   Risk jumps to **HIGH RISK (Score 82/100)**.
   Guardian explains: *"Traffic has increased your travel time. Current route arrives at 8:55 AM with only 5m buffer. I found an Express Transit alternative arriving at 8:32 AM (28m buffer)."*
4. **Approval**:
   User: *"Take the alternative."* &rarr; Click **[ APPROVE ]**.
   Route switches. Buffer restored to 28 minutes.
5. **Blocker Resolution**:
   Guardian: *"Your team's backend is still blocking the demo. Would you like me to message Rahul?"*
   User: *"Yes."* &rarr; Click **[ APPROVE ]**.
   Message delivered and verified.
6. **Goal Protected**:
   Final status: Travel safe, presentation ready, Rahul notified. Goal Protected!

---

## 11. Alexa+ Integration Guide

To connect LifeOS Guardian to Amazon Alexa+:

1. **Deploy MCP Server to Public HTTPS**:
   Deploy `mcp-server` to AWS ECS, App Runner, or use a secure tunnel (`ngrok http 5050`).
2. **Configure Alexa+ Skill Manifest**:
   Point the Alexa+ Developer Console MCP integration to:
   ```text
   https://<your-guardian-domain>/mcp
   ```
3. **Register Custom Directives**:
   Map voice utterances (*"Alexa, protect my goal"*, *"Alexa, brief me"*, *"What changed?"*) to Guardian's MCP tools (`generate_daily_briefing`, `detect_context_changes`, `replan_goal`).
4. **Grant Voice Confirmation Permissions**:
   Configure Alexa+ to invoke voice confirmation (`resolve_approval`) whenever Guardian returns an `APPROVAL_REQUIRED` result.

---

## 12. Security & Safety Model

- **No Secrets in Frontend**: Zero API keys or database connection strings in the React bundle.
- **Strict Consequence Guardrails**: Medium/high-risk actions cannot be executed autonomously by LLM generation alone; they require user confirmation.
- **Audit Logging**: Every action, tool invocation, and decision rationale is permanently logged with timestamps and correlation IDs.
- **Idempotency Keys**: Consequential actions utilize `goalId + actionType + targetId` to prevent accidental duplicate messages or bookings.
- **Input Validation**: All MCP tools and API routes validate inputs with strict Zod schemas.

---

## 13. Future Real-Service Adapters

Guardian is built with dependency injection interfaces:
- `TravelProvider`: `SimulatedTravelProvider` &rarr; `GoogleMapsTravelProvider`
- `CalendarProvider`: `SimulatedCalendarProvider` &rarr; `GoogleCalendarProvider` / `OutlookCalendarProvider`
- `WeatherProvider`: `SimulatedWeatherProvider` &rarr; `OpenWeatherMapProvider`
- `MessagingProvider`: `SimulatedMessagingProvider` &rarr; `SlackWebhookProvider` / `TwilioSmsProvider`

Simply toggle `SIMULATION_MODE=false` in `.env` and supply the corresponding API credentials to transition to production adapters without altering the core agent engines.
