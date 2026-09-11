## Add `bank-acquisition-call-agents` skill

### What this adds

Three production-ready CALL-E phone-call agents wired into a white-label
**bank customer-acquisition platform** built with Next.js 14 + TypeScript.
Any bank can deploy it — the `{bank}` token resolves at runtime from a
`BankRegistry`.

---

### Contribution area

**Agent Skills** → `skills/bank-acquisition-call-agents/`

---

### The three agents

| # | Agent | CALL-E trigger | Goal |
|---|-------|----------------|------|
| 1 | **Lead Outreach** | `conversionProbability ≥ 70` after AI scoring | Introduce bank, qualify intent, capture callback preference |
| 2 | **Offer Explanation** | Lead expressed interest | Walk through top 3 personalised bundles, handle objections, capture verbal consent |
| 3 | **Customer Support** | Post-KYC query or callback request | Answer KYC status questions, explain declined offers, escalate when unresolved |

---

### CALL-E integration method

**CLI** (`CALLE_INTEGRATION=skills_sh_skill`)

```typescript
// lib/calleClient.ts
import { execSync } from "child_process";

export function startCall({ toPhone, goal, language, region }) {
  const cmd =
    `env CALLE_SOURCE=skills_sh CALLE_INTEGRATION=skills_sh_skill ` +
    `CALLE_INTEGRATION_VERSION=0.1.0 calle call start` +
    ` --to-phone "${toPhone}" --goal "${goal}" --json`;
  return JSON.parse(execSync(cmd, { encoding: "utf-8" }));
}
```

---

### Side effects

- Places real outbound phone calls when API endpoints are invoked
- Writes an `AuditRecord` to the in-memory log before every call
- Sets `governanceFlags: ["DNC"]` when intent is "not-interested" — no retry

---

### Cancellation

- Calls cannot be cancelled after `run_call` is dispatched
- To prevent a scheduled call: remove the lead from the call queue before dispatch
- DNC flag: set `lead.governanceFlags.push("DNC")` — all agents check before dialling

---

### Dry run / preview

No real call is placed by the preview script:

```bash
node skills/bank-acquisition-call-agents/scripts/preview-goals.js
```

Output:
```
── Agent 1: Lead Outreach ──
You are a friendly, professional banking relationship manager calling on behalf
of Apex Bank. Your goal is to introduce Apex Bank to Priya Sharma in Mumbai...

── Agent 2: Offer Explanation ──
You are a Apex Bank banking advisor calling Priya Sharma in Mumbai...

── Agent 3: Customer Support ──
You are a Apex Bank customer support specialist calling Priya Sharma...

✓  No calls placed. Review the goals above before going live.
```

---

### Credential handling

| Secret | Where |
|--------|-------|
| CALL-E token | `~/.calle-mcp/cli/.../token.json` — never committed |
| Bank config | `lib/bankRegistry.ts` — names/themes only, no secrets |
| Lead phone numbers | Supplied per-request in POST body, never logged to console |

---

### Safety notes

1. **Threshold gate** — outreach only fires for leads with `conversionProbability ≥ 70`
2. **DNC flag** — "not interested" response sets a do-not-call governance flag
3. **Mandatory disclosures** — borderline/manual-review offers trigger a spoken compliance disclosure before any pitch
4. **Audit trail** — every call is timestamped in `AuditRecord[]`
5. **Escalation boundary** — support agent never makes promises beyond the script

---

### Source repository

https://github.com/kunalchoubey/AgenticAI_Bank

### README entry (to add under `### Skills`)

```markdown
- [`bank-acquisition-call-agents`](skills/bank-acquisition-call-agents/) - Three-agent CALL-E skill for AI-driven bank customer acquisition: outbound lead outreach, personalised offer explanation, and KYC support callbacks — with governance disclosures, audit trail, and a live Call Center dashboard.
```

---

### Checklist

- [x] Skill placed in `skills/bank-acquisition-call-agents/`
- [x] `SKILL.md` includes setup, side effects, cancellation, credential handling, and dry-run docs
- [x] `scripts/preview-goals.js` runs without placing a real call
- [x] `references/architecture.md` explains the data flow
- [x] README list entry added under `### Skills`
- [x] Phone numbers are never included in goal text sent to CALL-E
