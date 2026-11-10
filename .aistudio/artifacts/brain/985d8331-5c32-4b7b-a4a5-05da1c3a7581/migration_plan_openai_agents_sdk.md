# Architecture Evaluation & Migration Plan: Responses API to OpenAI Agents SDK

**Target Project:** Turbocharger Monorepo Workspace Studio (`turbo-charger`)  
**Scope:** Factory Coding Agent Workspaces (`apps/factory`), Monorepo Diagnostics, and Server Tools  
**Action:** Evaluation & Scoped Migration Plan (No code modified)  
**Date:** November 10, 2026  

---

## 1. Executive Summary

This evaluation analyzes whether the Turbocharger application should migrate its AI-assisted coding and diagnostic capabilities from the **OpenAI Responses API** (direct request/response model calls with manual tool execution loops) to the **OpenAI Agents SDK** (`@openai/agents`).

### Recommendation: **Targeted Hybrid Migration (Strongly Justified)**
- **Migrate to Agents SDK:** The multi-turn coding agent workspaces in `apps/factory/FactoryApp.tsx` (autonomous codebase exploration, multi-step `cargo`/`pnpm` testing, diff generation, and sandbox command execution).
- **Retain on Responses API / Deterministic Primitives:** Fast single-turn queries, direct deterministic algorithms (`deterministicHexHash`, boundary policy audits), and HTTP content-negotiation endpoints (`Accept: text/markdown`).

---

## 2. Mapping Existing Responses API Workflows

The current architecture structures AI interactions around multi-turn coding sessions:

| Component / Workflow | Current Responses API Pattern | Tools Involved | Streaming & State |
|---|---|---|---|
| **Factory Workspace Session** (`FactoryApp.tsx`) | Iterative prompt-response loop (`role: 'user' \| 'assistant' \| 'tool'`), manual status transitions (`running` → `completed` \| `failed`). | Bash tool (`cargo check`, `cargo test`, `git status`, `pnpm turbo run build`). | State stored in React component state (`workspaces`, `selectedWorkspaceId`). |
| **Workspace Composer & Maintenance** | Pre-configured task routines (`examples/basic`, toolchain snapshot verification). | Shell commands, environment fingerprinting. | Single-turn dispatch with follow-up input loop. |
| **Monorepo Task Graph & Cache Tools** | Deterministic mathematical calculation in `turboEngine.ts` and `server.ts`. | None (pure TypeScript execution). | Synchronous REST endpoints, no LLM loop. |
| **Content Negotiation & Agent 404s** | Deterministic Markdown/HTML string templates. | None. | Synchronous Express middleware with `Vary: Accept`. |

### Pain Points of Current Manual Responses API Loop:
1. **Manual Tool Coordination Boilerplate:** In the Responses API, the application must intercept tool call requests, run the bash command, package the output as a `role: 'tool'` message, and issue another API request back to the model.
2. **Monolithic Responsibility:** A single model prompt is expected to handle repository triage, Rust compiler diagnostics, TypeScript frontend edits, and git committing simultaneously.
3. **Absence of Native Tracing:** Tracking why a model took 3 iterations of `cargo test` requires custom logging pipelines instead of standard OpenTelemetry spans.
4. **Lack of Guardrails:** Safety checks (e.g., blocking `rm -rf`, preventing leaks of `.env` secrets) must be hand-coded in every endpoint.

---

## 3. Decision Matrix: Responses API vs. OpenAI Agents SDK

| Capability | Current Responses API | OpenAI Agents SDK (`@openai/agents`) | Value for Turbocharger |
|---|---|---|---|
| **Multi-turn Agent Loop** | Developer-managed `while (hasToolCalls)` loop | Native autonomous loop via `run()` or `Runner` | **High:** Eliminates ~300 lines of orchestration boilerplate in `server.ts`. |
| **Specialist Handoffs** | Monolithic prompt; high prompt drift | Native `handoffs: [rustAgent, nextjsAgent]` | **Very High:** Separates Rust engine tasks from Next.js/React tasks cleanly. |
| **Guardrails** | Ad-hoc Regex checks on commands | Parallel and pre-execution `Guardrail` primitives | **High:** Protects sandboxes from unsafe bash operations and key exposure. |
| **Tracing & Observability** | Custom in-memory `toolLogs` | Built-in OpenTelemetry tracing of reasoning & tool spans | **High:** Streams execution steps directly to `FactoryApp` transcript and terminal tabs. |
| **MCP Integration** | Manual schema conversion | First-class Model Context Protocol (MCP) support | **High:** Allows Turborepo crate tools to expose MCP servers natively. |
| **Deterministic Calculations** | Fast (0.38ms in TypeScript) | Unnecessary overhead for pure deterministic math | **None:** Keep pure TS for cache hashes and boundary checks. |

---

## 4. Proposed Architecture: Multi-Agent Handoff Network

```
                   ┌──────────────────────────────┐
                   │    Triage Orchestrator       │
                   │ (gpt-4o / o3-mini reasoning) │
                   └──────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │ Handoff                │ Handoff                │ Handoff
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Rust / Cargo    │    │  TypeScript / UI │    │  Turborepo Build │
│ Specialist Agent │    │ Specialist Agent │    │  & Cache Agent   │
├──────────────────┤    ├──────────────────┤    ├──────────────────┤
│ Model: o3-mini   │    │ Model: gpt-4o    │    │ Model: gpt-4o    │
│ Tools:           │    │ Tools:           │    │ Tools:           │
│ - cargoCheck     │    │ - pnpmBuild      │    │ - turboGraphGen  │
│ - cargoTest      │    │ - eslintCheck    │    │ - cacheHashSim   │
│ - rustfmt        │    │ - tsxTypecheck   │    │ - boundaryAudit  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Agent Roles:
1. **Triage Orchestrator Agent**: Analyzes user issue or maintenance request, determines which packages/crates are impacted, and hands off to specialists.
2. **Rust & Engine Specialist Agent**: Operates on `crates/turborepo-*` with tools `cargo test`, `cargo check`, and Rust AST parsing.
3. **TypeScript / Monorepo Specialist Agent**: Operates on `apps/` and `packages/` with tools for package.json exports, TypeScript configuration, and ESLint.
4. **Turborepo Build & Remote Cache Agent**: Validates `turbo.json`, computes remote cache hash signatures, and verifies boundary tags.

---

## 5. Scoped Migration Boundary

```
MIGRATE TO OPENAI AGENTS SDK:
├── apps/factory/FactoryApp.tsx        -> Connect to /api/agent/run SSE stream
├── server.ts: /api/agent/run          -> Runner with Triage, Rust, TS, and Turbo agents
├── server.ts: /api/agent/trace/:id    -> Native OpenTelemetry trace streaming
└── Guardrails: BashSafeGuardrail     -> Block destructive or private data access

REMAIN ON RESPONSES API / DETERMINISTIC PRIMITIVES:
├── src/engine/turboEngine.ts          -> 64-bit deterministicHexHash & topological wave math
├── server.ts: /api/server/status      -> Node.js system telemetry
├── server.ts: /api/npm/*              -> Registry lookups & publish dry-runs
├── Content Negotiation (Vary: Accept) -> Raw Markdown / HTML responses
└── sitemap.xml & llms.txt             -> Static machine-readable assets
```

---

## 6. Phased Implementation Roadmap

### Phase 1: Dependency & Model Configuration
- Install `@openai/agents` and `@types/node` updates.
- Configure recommended models based on current OpenAI documentation:
  - **Reasoning / Logic Tasks:** `o3-mini` (or `o1`) for Rust compilation and topological cycle detection.
  - **Orchestration & Fast Iteration:** `gpt-4o` (or `gpt-4o-mini`) for general transcript interaction and UI code generation.
- Ensure `OPENAI_API_KEY` is loaded securely via `.env` (server-side only).

### Phase 2: Agent Definition & Tool Encapsulation
- Define tool functions with Zod input schemas matching the Agents SDK format:
  - `executeSandboxBash({ command, cwd, timeoutMs })`
  - `resolveWorkspacePackage({ specifier })`
  - `verifyCacheDigest({ task, target })`
- Implement `BashSafeGuardrail` to intercept dangerous commands (`rm`, `eval`, credential access).

### Phase 3: Backend SSE Endpoint & Runner
- Create Express endpoint `POST /api/agent/session`:
  - Instantiates `Runner.run(triageAgent, messages, { stream: true })`.
  - Streams typed events: `agent_started`, `tool_call`, `tool_output`, `handoff`, `message_delta`, `completed`.
  - Emits OpenTelemetry trace IDs for integration with frontend timeline.

### Phase 4: Frontend UI Adaptation in `FactoryApp.tsx`
- Replace simulated mock dispatch with EventSource / fetch stream reader.
- Visualize agent handoffs explicitly in the transcript (e.g., *“Triage Agent handed off to Rust Specialist Agent”*).
- Stream tool execution logs into the Terminal Output tab in real time.

---

## 7. Rollback Plan

If migration encounters latency spikes or breaking upstream changes:
1. **Feature Flag Fallback:** Introduce `USE_AGENTS_SDK=true/false` in `.env.example`.
2. **Direct Route Fallback:** If `USE_AGENTS_SDK=false`, the server automatically routes workspace prompts through the existing deterministic simulation in `server.ts`.
3. **Zero Frontend Lock-in:** The `WorkspaceMessage` schema in `FactoryApp.tsx` remains identical (`role: 'user' | 'assistant' | 'tool'`), ensuring UI components render seamlessly regardless of the backend engine.

---

## 8. Validation Checklist

- [ ] **SSE Streaming Integrity:** Verify token stream delivers incremental text without buffering through Caddy / Express proxy.
- [ ] **Tool Call Execution:** Verify `cargo check` and `turbo run` tool calls return valid stdout/stderr and exit codes.
- [ ] **Handoff Verification:** Verify an instruction touching both Rust crates and Next.js apps triggers a verified handoff between `rustAgent` and `nextjsAgent`.
- [ ] **Guardrail Enforcement:** Test forbidden commands (`cat .env`, `rm -rf /`) and verify they are rejected with a safe refusal.
- [ ] **Acceptance Criteria Retention:** Ensure all 10 Agentic Readiness standards (content negotiation, agent-friendly 404s, sitemap, llms.txt) continue passing 100%.
- [ ] **Zero Secret Leakage:** Audit client bundle to ensure `OPENAI_API_KEY` is never exposed to the browser.
