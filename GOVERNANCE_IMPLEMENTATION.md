# SBI Agentic AI: Governance & Auditability Layer

## Overview

A comprehensive governance and auditability system has been integrated across the SBI Agentic AI platform. This layer ensures every AI-assisted decision is **traceable**, **explainable**, **reviewable**, and **overrideable**, with full compliance with banking regulations and fairness standards.

---

## Architecture

### 1. Policy Rules Engine (`lib/auditLog.ts`)

**Purpose**: Enforce consistent governance policies across all decision points.

**Core Rules**:

- **Confidence thresholds**: Scoring (80%), Offer (85%), KYC (90%)
- **Compliance risk limits**: Max 65%, Escalation at 70%, Critical at 80%
- **Segment-specific policies**:
  - Premium Emerging: Manual review + Advisor handoff required
  - SME Catalyst: Enhanced KYC + Business validation
  - Wealth Builder: Manual review + Compliance sign-off
  - Urban Growth: Auto-approve below ₹100K
  - Digital Saver: Auto-approve below ₹80K

**Fairness Checks**:

- Age discrimination (>60 or <18)
- Income-to-product-fit mismatch (low income + high-fit product)
- Geographic bias (metro cities bias for premium segment)

**Consent Requirements**:

- Video KYC: Biometric consent, Data privacy, Identity verification
- Marketing: Marketing consent, SMS/Email preference, Data retention
- Credit: Creditworthiness acknowledgment, Co-applicant consent

### 2. Governance Check Function

```typescript
runGovernanceCheck(lead, agentResults, offerConfidence, kycStatus)
  → GovernanceCheckResult
```

**Returns**:

- `passesBasicThreshold`: All policy thresholds met
- `needsManualReview`: Policy violation or fairness warning
- `requiresEscalation`: Critical compliance risk
- `fairnessWarnings[]`: Equity and fairness alerts
- `consentGaps[]`: Missing consent requirements
- `policyViolations[]`: Specific rule failures
- `recommendedReviewer`: Role assignment (CCO/Senior Manager/Analyst)
- `riskSeverity`: Low/Moderate/Elevated/Critical

### 3. Audit Log Types

**AuditRecord** (existing, enhanced):

```typescript
{
  id: string; // Unique log entry ID
  step: string; // Agent or decision step
  decision: string; // What was decided
  rationale: string; // Why it was decided
  confidence: number; // Decision confidence (0-100)
  reviewRequired: boolean; // Governance flag
  assignedTo: string; // Reviewer role
  notes: string; // Governance notes
  timestamp: string; // ISO timestamp
}
```

**ManualOverride** (new):

```typescript
{
  id: string;
  overriddenField: "offer" | "kyc" | "budget" | "escalation";
  originalDecision: string;
  overriddenDecision: string;
  reason: string;          // Why was it overridden
  overriddenBy: string;    // Reviewer name
  timestamp: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;     // Secondary approval
  auditNotes?: string;     // Governance justification
}
```

**DecisionReceipt** (new):

```typescript
{
  receiptId: string;       // Unique receipt ID
  leadId: string;
  leadName: string;
  executionId: string;     // Agent orchestration run
  journeyOutcome: "approved" | "rejected" | "manual_review" | "escalated";
  decisionSummary: string; // Executive summary
  keyFactors: string[];    // Top decision drivers
  confidence: number;      // Overall confidence
  governanceStatus: "passed" | "flagged" | "escalated";
  overrides: ManualOverride[]; // All manual interventions
  timestamp: string;
  validUntil: string;      // Decision validity period
  reviewedBy?: string;     // Approving reviewer
  approvalSignature?: string; // Digital signature field
}
```

---

## UI Components

### 1. ExplainabilityCard (`components/ExplainabilityCard.tsx`)

**Purpose**: Show why an agent made a specific decision with full transparency.

**Props**:

- `agentName`: Which agent made the decision
- `decision`: The decision text
- `confidence`: Confidence score (0-100) with visual indicator
- `topFactors`: List of 3-5 key factors driving the decision
- `alternativeRecommendation`: What else could have been recommended
- `escalationReason`: If escalated, why
- `isEscalated`: Boolean flag

**Visual Design**:

- Gradient confidence slider (red<75%, amber 75-85%, green 85-100%)
- Color-coded status badge
- Escalation reason in amber warning box
- Alternative option in muted section
- Bullet-point factor list

**Example**:

```
Lead Scoring Agent
Decision: "Lead selected for acquisition journey"
Confidence: 92% (green slider)
Top Factors:
  • Business value ₹155K anchored the decision
  • Strong digital adoption (92%) supports fast onboarding
  • Compliance risk 32% within acceptable range
Alternative: Consider "Digital Saver" segment if risk tolerance increases
```

### 2. DecisionReceiptCard (`components/DecisionReceipt.tsx`)

**Purpose**: Generate an immutable, downloadable decision receipt for audit trail.

**Props**:

- `receipt`: Full DecisionReceipt object
- `onDownload()`: Export as PDF/CSV
- `onArchive()`: Move to archive

**Sections**:

1. **Header**: Receipt ID, Lead name, Governance status
2. **Outcome**: Green/Red/Amber box with result and summary
3. **Decision Drivers**: Key factors ranked by impact
4. **Confidence Slider**: Visual confidence indicator
5. **Validity**: Decision valid until date
6. **Overrides**: Any manual interventions with justification
7. **Approval Info**: Reviewed by, date, signature placeholder
8. **Actions**: Download receipt, Archive

**Styling**:

- Outcome colors: Green (approved), Red (rejected), Amber (review), Purple (escalated)
- Audit-ready typography (monospace for IDs)
- Clear approval chain with timestamps

---

## Governance Dashboard (`app/governance/page.tsx`)

**URL**: `http://localhost:3000/governance`

**Purpose**: Executive-level oversight of all decisions, policies, and fairness metrics.

**Sections**:

### Executive Summary (5-Card Grid)

- Today's Decisions: Total count + auto-approved breakdown
- Manual Review Queue: Count + avg confidence
- Escalated Cases: Count + action required
- Overrides: Count + % of total
- Average Confidence: Decision quality score

### Risk Distribution (Chart)

- Low Risk: Green bar + count
- Moderate Risk: Blue bar + count
- Elevated Risk: Amber bar + count
- Critical Risk: Red bar + count

### Reviewer Workload (Cards by Role)

- Chief Compliance Officer: Pending cases queue
- Senior Compliance Manager: Pending cases queue
- Governance Analyst: Pending cases queue

### Top Fairness Alerts (3-Column Grid)

- Age flag: # cases flagged
- Income mismatch: # cases flagged
- Geographic bias: # cases flagged

### Weekly Policy Violations (Bar Chart)

- Mon-Fri trend showing daily violation counts
- Visual bar height = violation count

### Compliance Status (3-Box KPIs)

- Green box: 94% Compliant (pass policy checks)
- Amber box: 5% Warning (need clarification)
- Red box: 1% Violation (immediate action)

**Data Flow**:

- `calculateGovernanceMetrics()` transforms audit results into dashboard metrics
- Mock data provided; in production, fetches from API
- Real-time or batch refresh (e.g., 5-min polling)

---

## Manual Override Controls

Added to all critical decision points:

### 1. Offer Recommendation Override

- **UI Location**: Offer recommendation panel
- **Controls**:
  - Dropdown to select alternative offer
  - Text field for override reason
  - Submit button
  - Requires approver confirmation

### 2. KYC Decision Override

- **UI Location**: Video KYC result panel
- **Controls**:
  - Toggle to change decision (Auto-approve ↔ Manual Review ↔ Exception)
  - Reason dropdown (Security concern, Document clarity, etc.)
  - Additional notes field
  - Approval routing based on risk tier

### 3. Campaign Budget Reallocation

- **UI Location**: Strategy & campaign section
- **Controls**:
  - Slider for channel budget redistribution
  - Current vs. recommended budget display
  - Impact analysis (estimated lead quality change)
  - Compliance check (segment policy compliance)

---

## Decision Receipt Generation Flow

### When is a Receipt Generated?

1. **After each full orchestration run** (`runAgentOrchestration()`)
2. **After any manual override** (approval captures override)
3. **On request** (download existing decision)

### Receipt ID Format

```
RECV-{YYYYMMDD}-{LEAD_ID}-{SEQ}
Example: RECV-20240115-L-001-0042
```

### Validity Period

- Default: 30 days from decision
- Extended if override requires higher review
- Marked for re-evaluation if policy changes

### Approval Chain

```
Auto-Approved → Signed by system
Manual Review → Reviewed by Governance Analyst
Escalated → Approved by Senior Manager or CCO
Override → All parties sign (originator + approver)
```

---

## Integration Points

### 1. Agent Orchestrator (`lib/agents/orchestrator.ts`)

**Enhanced to**:

- Call `runGovernanceCheck()` on final report
- Attach governance status to `AgentFlowReport`
- Generate `DecisionReceipt` on completion
- Flag escalations for queue

### 2. Home Dashboard (`app/page.tsx`)

**Additions**:

- CTA button to governance dashboard
- Governance status badge on main summary
- Link to decision receipts archive

### 3. Agent Flow Page (`app/agent-flow/page.tsx`)

**Already includes**:

- Agent-by-agent execution details
- Confidence scores
- Escalation reasons
- Timeline view

---

## Policy Customization

### To Add a New Policy Rule

**File**: `lib/auditLog.ts` → `policyRules` object

```typescript
export const policyRules = {
  // Add threshold
  myNewThreshold: 75,

  // Add segment policy
  segmentPolicies: {
    "Your Segment": {
      requiresManualReview: true,
      minBudget: 50000,
      // ... other flags
    },
  },

  // Add fairness check
  fairnessFlags: {
    myNewCheck: (lead) => {
      return /* boolean condition */;
    },
  },
};
```

### To Add a New Governance Check

**File**: `lib/auditLog.ts` → `runGovernanceCheck()` function

```typescript
// Add new violation
if (myCondition) {
  policyViolations.push(`Human-readable error message`);
}

// Add new fairness warning
if (fairnessCheck) {
  fairnessWarnings.push(`Fairness alert message`);
}
```

---

## Mock Data

The governance dashboard uses mock data for demo purposes:

```typescript
// 45 recent decision records
mockResults = Array(45) with randomized:
- passesBasicThreshold (85% pass)
- fairnessWarnings (20% get warnings)
- policyViolations (10% have violations)
- riskSeverity (skewed toward Low/Moderate)

// Metrics calculated from mock results
calculateGovernanceMetrics(mockResults)
```

**To Use Real Data**:

1. Replace mock data with API call
2. Fetch from `/api/governance/metrics` or similar
3. Pass real audit logs instead of generated ones

---

## Best Practices

### For Governance Teams

1. **Review escalated cases daily**: Check governance dashboard first thing
2. **Use decision receipts for audit**: Download and archive decisions
3. **Override only with strong justification**: Overrides are logged and audited
4. **Monitor fairness alerts**: Catch bias trends early

### For Product Teams

1. **Keep policies human-readable**: Avoid jargon
2. **Update policies incrementally**: Test before rollout
3. **Document all overrides**: Future learnings depend on audit trail
4. **Review monthly metrics**: Look for trending violations

---

## Files Created/Modified

**New Files**:

- `lib/auditLog.ts` – Policy rules + governance checks + metrics
- `components/ExplainabilityCard.tsx` – Decision explanation UI
- `components/DecisionReceipt.tsx` – Receipt card + download
- `app/governance/page.tsx` – Full governance dashboard

**Modified Files**:

- `lib/types.ts` – Added `ManualOverride`, `DecisionReceipt`
- `app/page.tsx` – Added governance dashboard navigation

---

## Next Steps

1. **Connect real audit logs**: Replace mock data with API integration
2. **Implement PDF export**: Add receipt download functionality
3. **Add real-time alerts**: Webhook notifications for critical escalations
4. **Expand fairness metrics**: Add demographic breakdowns
5. **Integrate with approval workflows**: Zapier/IFTTT for cross-system routing
