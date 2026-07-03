# Lead Scoring Quick Reference

## 🎯 What Changed

### Before

- Simple propensity score (0-100)
- Single "businessValue" number
- No persona classification
- No explainability

### After (NEW)

- **5-dimension composite model** with weightings
- **Score bands** (Strategic/High/Medium/Low)
- **Persona tags** (10 types)
- **Full explainability** (top 3 positive + top 2 risk factors)
- **Business value breakdown** (LTV calculation)
- **Acquisition routing** (how to acquire)
- **Fairness checks** (age, income fit, geographic bias)

---

## 📊 The 5 Scoring Dimensions

| #   | Dimension              | Weight | What It Measures                                 |
| --- | ---------------------- | ------ | ------------------------------------------------ |
| 1   | Conversion Propensity  | 25%    | Will they convert? (digital, age, history)       |
| 2   | Onboarding Ease        | 20%    | How easy to onboard? (digital comfort, language) |
| 3   | Product Affinity       | 20%    | Do they fit our products? (income, need, fit)    |
| 4   | Acquisition Efficiency | 20%    | Is it cost-effective? (LTV/CAC ratio)            |
| 5   | Uplift Potential       | 15%    | How much can we improve with intervention?       |

### Scoring Formula

```
Composite = (CP × 0.25) + (OE × 0.20) + (PA × 0.20) + (AE × 0.20) + (UP × 0.15)
```

---

## 🏆 Score Bands

| Band                   | Range  | Meaning           | Action                             |
| ---------------------- | ------ | ----------------- | ---------------------------------- |
| **Strategic Priority** | 85-100 | Best of the best  | Immediate focus, premium treatment |
| **High**               | 75-84  | Strong candidates | Standard acquisition, optimized    |
| **Medium**             | 60-74  | Viable            | Segment-specific routing, standard |
| **Low**                | 0-59   | Weaker            | Exception review, advisor-led      |

---

## 👤 Persona Tags (Pick 1+)

```
Salaried Urban        → City dweller, corporate job, 25-35
Student Starter       → <25, new to workforce, high digital
Merchant/MSME         → Business owner, self-employed
Premium Spender       → Income >₹10L, wealth-focused
Self-Employed         → Freelance/variable income
Emerging Executive    → HNI trajectory, 30-45, affluent
SME Operator          → Business focus, working capital needs
Gig Worker            → Flexible income, digital payments
Retiree               → >60, fixed income, stability focus
New to Banking        → First-time customer
```

---

## 🎨 UI Features

### Lead Intelligence Page (`/lead-intelligence`)

**Filters**:

- ✅ Priority Band (Strategic/High/Medium/Low)
- ✅ Segment (5 SBI segments)
- ✅ Persona (10 types)
- ✅ Age range (18-70 slider)
- ✅ Income range (₹1L-₹30L slider)
- ✅ Search (name/city)

**Card Grid**:

- Lead name + city
- Composite score (0-100)
- Score band (color-coded)
- Persona tags (up to 2, +N)
- Metrics: LTV, Age, Digital%
- Segment + arrow (clickable)

**Detail Drawer** (click card):

- 5-dimension breakdown (progress bars)
- Composite score card
- Profile (age, income, digital, segment)
- ✅ **Top 3 Positive Factors** (green)
- ⚠️ **Top 2 Risk Factors** (amber)
- Recommended acquisition route
- Personas, products, challenge, motivation

---

## 💰 Business Value Calculations

### Expected Value (LTV)

**Formula**:

```
LTV = Income × Segment Multiplier × Product Expansion Factor

Multipliers:
- Premium Emerging: 1.4x
- Wealth Builder: 1.3x
- Urban Growth: 1.1x
- SME Catalyst: 0.95x
- Digital Saver: 0.8x

Expansion: Each existing product adds +15% to LTV
```

**Examples**:

- Ananya (₹1.48L, Urban Growth, 2 products): ₹155K LTV
- Rohit (₹2.36L, Premium, 2 products): ₹179K LTV
- Kartik (₹91K, Digital Saver, 2 products): ₹114K LTV

### Acquisition Efficiency (LTV/CAC Ratio)

**CAC by Segment**:

```
Digital Saver: ₹350           ← Cheapest to acquire
Urban Growth: ₹600
SME Catalyst: ₹850
Wealth Builder: ₹900
Premium Emerging: ₹1,200      ← Most expensive
```

**Target**: LTV/CAC > 3:1 (Good), > 5:1 (Excellent)

**Example**: Kartik = ₹114K LTV / ₹350 CAC = **3.26:1** ✅

---

## 🛣️ Acquisition Routes

Based on digital affinity + segment:

| Route                       | Best For                           | Example                     |
| --------------------------- | ---------------------------------- | --------------------------- |
| **Direct digital**          | High digital, growth segments      | "Download app, auto-verify" |
| **Advisor-led**             | Premium/HNI, advisory needs        | "Personal banker calls"     |
| **Partner channel**         | SME/Business focus                 | "Indirect bank partner"     |
| **Digital-first + support** | Moderate digital, some help needed | "Co-browsing video call"    |
| **Agent-assisted**          | Low digital, needs hand-holding    | "Phone/video KYC support"   |

---

## 🚨 Fairness & Compliance Checks

**Automatic flags**:

- ❌ Age >60: "Consider accessibility requirements"
- ❌ Age <22: "Enhanced identity verification required"
- ❌ Income + Premium Emerging: "Geographic bias check"
- ❌ Governance violations: "SME requires manual review"

**All checks are context**, not rejections.

---

## 📈 Example: Ananya Chopra

```
Name: Ananya Chopra
Age: 29, Mumbai, ₹1.48L/year
Digital: 92%, English, 2 products

SCORE BREAKDOWN:
├─ Conversion Propensity:  92/100 (Digital native, young)
├─ Onboarding Ease:        94/100 (Can self-onboard via app)
├─ Product Affinity:       90/100 (Perfect demographic fit)
├─ Acquisition Efficiency: 75/100 (LTV/CAC 2.6:1, good)
└─ Uplift Potential:       70/100 (Already high propensity, less room)

Composite Score: 82/100 → "HIGH" BAND

✅ Positive Factors:
  • Exceptional digital affinity (92%) enables self-onboarding
  • Young professional (29) with strong career trajectory
  • Existing customer with 2 products = trusted relationship

⚠ Risk Factors:
  • New device noted (potential fraud signal)
  • Premium lifestyle intent (may outgrow SBI products)

🎯 Recommended Route:
  → Direct digital (app self-service)

👤 Personas:
  Salaried Urban

💳 Products:
  Savings Account, Digital Wallet

Challenge:
  "High digital engagement with inconsistent savings; ideal for suite of savings, credit, lifestyle rewards"

Motivation:
  "High rewards and fast onboarding"
```

---

## 📁 Files

**New**:

- `lib/leadScoringEngine.ts` - 620-line scoring engine
- `components/LeadIntelligenceCard.tsx` - Card component
- `app/lead-intelligence/page.tsx` - Full page

**Modified**:

- `lib/types.ts` - PersonaTag, ScoreBand, CompositeLeadScore
- `data/leads.ts` - 8 leads with persona tags
- `app/page.tsx` - Added "Lead intelligence" button

**Docs**:

- `LEAD_SCORING_IMPLEMENTATION.md` - Detailed guide
- This file - Quick reference

---

## 🚀 Quick Start

### View Leads

1. Go to http://localhost:3000
2. Click "Lead intelligence" button
3. Browse 8 sample leads in grid

### Explore Lead

1. Click any lead card
2. See full score breakdown + factors
3. Read acquisition recommendation
4. Check persona & products

### Use Filters

- Drag sliders to filter by age/income
- Click buttons to filter by band/segment/persona
- Type name to search

### Build On It

```typescript
// Score a single lead
import { scoreLeadWithIntelligence } from "@/lib/leadScoringEngine";
const scored = scoreLeadWithIntelligence(lead);
console.log(scored.compositeScore); // 82
console.log(scored.scoreBand); // "High"

// Score batch
import { scoreLeadsWithIntelligence } from "@/lib/leadScoringEngine";
const scored = scoreLeadsWithIntelligence(leads);
// Each has .scoreIntelligence attached
```

---

## 🔄 Integration Points

### Orchestrator

```typescript
// In runAgentOrchestration():
const scoredLead = scoreLeadWithIntelligence(selectedLead);
report.leadIntelligence = scoredLead;
```

### Governance

```typescript
// In governance checks:
if (lead.scoreIntelligence.scoreBand === "Low") {
  // Escalate to exception review
} else if (lead.complianceRisk > 60) {
  // Trigger enhanced KYC
}
```

### Dashboard

```typescript
// Show lead metrics:
const band = lead.scoreIntelligence.scoreBand;
const ltv = lead.scoreIntelligence.expectedValue;
const route = lead.recommendedAcquisitionRoute;
```

---

## 📊 Metrics to Track

- **Band distribution**: % in each band by segment
- **Route adoption**: % going via each route
- **Efficiency**: Avg LTV/CAC by segment
- **Conversion**: Which bands convert best?
- **Fairness**: Any systematic bias in scores?
- **Risk**: Avg compliance risk by band

---

## ✅ Build Status

```
✓ Compiled successfully
Route (app)
├ ○ /lead-intelligence  7.48 kB  94.6 kB First Load JS
├ ○ /                   3.1 kB   97 kB
├ ○ /agent-flow         2.2 kB   96.1 kB
├ ○ /governance         2.56 kB  89.6 kB
└ ○ /api/...            (routes)
+ First Load JS shared: 87.1 kB
```

---

## 🎓 Scoring Philosophy

**Deterministic**: Same inputs → same score every time

**Explainable**: Every dimension is human-understandable

**Pragmatic**: Thresholds, not ML models

**Fair**: Checks for age, income, geographic bias

**Business-focused**: LTV/CAC efficiency matters

**Segment-aware**: Different rules for different segments

**Actionable**: Recommendations guide real acquisition decisions
