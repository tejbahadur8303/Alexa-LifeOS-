# LifeOS Guardian MCP Server

Autonomous Goal Protection & Personal Operations MCP Server for Amazon Alexa+.

## Overview

LifeOS Guardian MCP Server implements the **MCP 2025-11-25** specification over **Streamable HTTP** (`SSEServerTransport`). It provides:
- **Continuous Goal Shielding**: Persistent goal evaluation and success criteria verification.
- **Predictive Risk Engine**: Deterministic explainable risk scoring.
- **What-Changed Engine**: Environmental context snapshot diffing.
- **Dependency Reasoning**: Task blockers and critical paths.
- **Consequence-Aware Permissions**: Human-in-the-loop authorization guardrails.

---

## Quick Start

### 1. Install & Configure
```bash
npm install
cp .env.example .env
```

### 2. Run Database Seed
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
Server runs at `http://localhost:5050`.

### 4. Run Test Suite
```bash
npm test
```

---

## Key Endpoints

- **Streamable HTTP MCP**: `GET http://localhost:5050/mcp`
- **Direct JSON-RPC**: `POST http://localhost:5050/mcp/rpc`
- **Health Check**: `GET http://localhost:5050/health`
- **Dashboard API**: `GET http://localhost:5050/api/goals`, `GET http://localhost:5050/api/risks`
