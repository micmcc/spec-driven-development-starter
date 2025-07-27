---
id: DOC-abc1234
title: ADR Template — Draft
type: doc
status: draft
owner: michael.mccullough
domain: technical
last_reviewed: '2025-07-27'
edit_url: >-
  https://github.com/micmcc/spec-driven-development-starter/edit/main/specs/technical/adrs/ADR-template.md
---

# ADR Template

> Use this template to create new Architecture Decision Records. Keep each ADR focused on **one** decision.

## 1. Status
- **Status:** Draft  
- **Date:** 2025-07-27  
- **Decision Owner(s):** Michael McCullough  
- **Reviewers:** _TBD_

## 2. Context
Describe the background and the forces at play. What problem are we solving? Why now? Include relevant constraints, assumptions, and prior decisions.

- Problem statement:
- Goals / success criteria:
- Non-goals:
- Constraints (technical, org, compliance):
- Related specs / documents:
  - [[link to spec]]
  - [[link to issue / discussion]]

## 3. Decision
State the decision succinctly. Prefer active voice and measurable outcomes.

> We will … because … This enables … and trades off …

## 4. Options Considered
List realistic alternatives, with a brief summary of pros/cons.

| Option | Summary | Pros | Cons |
|---|---|---|---|
| A | _what it is_ | _pro 1, pro 2_ | _con 1, con 2_ |
| B | _what it is_ | _pro 1, pro 2_ | _con 1, con 2_ |
| C | _what it is_ | _pro 1, pro 2_ | _con 1, con 2_ |

### Decision Drivers
- _e.g., delivery speed, operability, cost, maintainability, risk, team skill set_

## 5. Consequences
Describe the results of this decision.

### Positive
- _benefit_

### Negative / Risks
- _risk and mitigation_

## 6. Implementation Plan
High-level plan to realize the decision.

- Phases / milestones:
- Owner(s):
- Dependencies:
- Success metrics / telemetry:

## 7. Rollback Plan
If we revert this decision, how do we unwind data/schema/config/code safely?

## 8. Alignment & Traceability
- **Depends on:** _ADR-00x, FEAT-xxxxxxx_
- **Implements:** _ARCH-00x / spec IDs_
- **Covers tests:** _TEST-xxxxxxx_
- **Code refs:**
  - `src/...`
  - `infra/...`

## 9. Open Questions
- _TBD_

## 10. References
- _Links, benchmarks, docs, RFCs_

---

> **How to use:**
> 1. Copy this file to `specs/technical/adrs/ADR-xxx-short-title.md`.
> 2. Replace placeholders and fill sections.
> 3. Set `status: in-review` when sharing for feedback; `approved` when accepted; `implemented` when delivered; `deprecated` when superseded.
