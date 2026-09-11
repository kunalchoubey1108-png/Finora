# SBI Agentic AI Acquisition & Onboarding Platform

A banking-grade Next.js + TypeScript prototype built for SBI hackathon demos, with governance-first agentic AI for customer acquisition and secure onboarding.

## Live deployment

[Open the Vercel preview](https://temporary-express-basin-f9funk2.vercel.app)

> This anonymous Vercel preview is temporary. Claim it in Vercel before it expires to keep the URL active.

## What it includes

- Explicit multi-agent orchestration with a visible workflow
- Governance and audit-first decision support across every module
- Business-value lead scoring with explainability and regulatory signals
- Segment-aware offer recommendation, governance-aware personalized bundles, and campaign optimization
- Realistic Video KYC flow with exception routing, spoof-risk signaling, and manual review handling
- Tailwind-powered enterprise UI with audit timeline and governance panel

## Updated architecture

- `app/page.tsx` – enterprise-grade dashboard, journey simulator, governance controls, and audit log
- `app/api/orchestrate/route.ts` – orchestrator endpoint for full journey execution
- `lib/types.ts` – reusable typed interfaces for governance, audit records, decision scores, and KYC states
- `lib/agents.ts` – specialized scoring, strategy, personalization, offer, and KYC agent services
- `lib/governance.ts` – audit and governance utilities for traceable decisions
- `lib/orchestrator.ts` – coordination layer for the end-to-end acquisition and onboarding workflow
- `data/leads.ts` – richer synthetic Indian banking personas with language preferences and risk signals

## Production-style demo flow

1. The orchestrator ranks leads by business value and risk, not just conversion probability.
2. It generates a governance-aware acquisition strategy and campaign optimization plan.
3. It personalizes customer messaging in the lead's preferred language.
4. It recommends the best SBI product bundle with a governance label.
5. It simulates a secure Video KYC onboarding flow with exception routing and audit logs.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Notes

- The platform is intentionally presented as reviewable and not fully autonomous.
- Every stage emits audit records and governance signals for compliance review.
- The UI is styled with Tailwind for a polished enterprise demo.

# SBI-Agentic-AI
