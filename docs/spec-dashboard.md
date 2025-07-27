# Spec Dashboard

Generated from `out/spec-index.json`. Update by running:

```bash
node tools/validate-specs.js && node tools/generate-spec-dashboard.js
```

## Overview

### By Type
| Type | Count |
|---|---:|
| doc | 2 |
| feature | 32 |
| planning | 7 |

### By Status
| Status | Count |
|---|---:|
| draft | 34 |
| open | 7 |

### By Domain
| Domain | Count |
|---|---:|
| features | 6 |
| general | 19 |
| technical | 9 |
| templates | 1 |
| tools | 6 |

### By Owner
| Owner | Count |
|---|---:|
| unassigned | 41 |

## Gap Analysis

### Features without Tests (32)
| ID | Title | File |
|---|---|---|
| FEAT-c1661c3 | Product Intent | specs/product-intent.md |
| FEAT-eef851b | TODO and Task Generator | specs/tools/update-todos.md |
| FEAT-9e910df | Quick Reference Generator | specs/tools/update-quick-reference.md |
| FEAT-bf489e4 | Copilot Instructions Generator | specs/tools/update-copilot-instructions.md |
| FEAT-b70fccc | Context Update Orchestrator | specs/tools/update-all-context.md |
| FEAT-7b327aa | Tools System Overview | specs/tools/tools-overview.md |
| FEAT-6f1ec11 | Specification Context Extractor | specs/tools/spec-extractor.md |
| FEAT-912f4e6 | Test Cases: Project Management | specs/tests/project-test-cases.md |
| FEAT-c8ecc04 | Test Cases: Authentication Middleware | specs/tests/middleware-test-cases.md |
| FEAT-59141b0 | Test Cases: Authentication | specs/tests/auth-test-cases.md |
| FEAT-3abbd9b | Feature Specification Template | specs/templates/feature-template.md |
| FEAT-5c571bf | Real-Time Collaboration Technical Specification | specs/technical/real-time-collaboration.md |
| FEAT-b594885 | Error Handling Technical Specification | specs/technical/error-handling.md |
| FEAT-f341de3 | Authentication Technical Specification | specs/technical/authentication.md |
| FEAT-144b46d | Technical Architecture Specification | specs/technical/architecture.md |
| FEAT-28e8683 | ADR-004: Authentication Strategy | specs/technical/adrs/ADR-004-authentication-strategy.md |
| FEAT-871e5df | ADR-003: Database Schema Design | specs/technical/adrs/ADR-003-database-schema-design.md |
| FEAT-0a8cc4d | ADR-002: Real-time Collaboration Approach | specs/technical/adrs/ADR-002-real-time-collaboration-approach.md |
| FEAT-4b4c941 | ADR-001: Technology Stack Selection | specs/technical/adrs/ADR-001-technology-stack-selection.md |
| FEAT-0a38e5f | UX and Design Aesthetics | specs/product-overview/ux.md |
| FEAT-8d7c52c | Core Use Cases | specs/product-overview/use-cases.md |
| FEAT-343734a | Security Specification | specs/product-overview/security.md |
| FEAT-4e5ae5a | Database Schema (PostgreSQL) | specs/product-overview/db-schema.md |
| FEAT-c2babc7 | Data Model (Initial Draft) | specs/product-overview/data-model.md |
| FEAT-7cf1110 | Architecture & Technologies Overview | specs/product-overview/architecture.md |
| FEAT-0a987ce | API Routes | specs/product-overview/api-routes.md |
| FEAT-df2ffef | User Registration Feature | specs/features/user-registration.md |
| FEAT-ac55a96 | User Management Feature | specs/features/user-management.md |
| FEAT-94c0fe6 | project creation | specs/features/project-creation.md |
| FEAT-31db9e3 | Feature: Login Flow | specs/features/login-flow.md |
| FEAT-479a2d3 | Feature: Collaborative Spec Editing | specs/features/collaborative_editing.md |
| FEAT-e84cd12 | Collaboration Management Feature | specs/features/collaboration-management.md |

### Orphan Tests (not referenced by any feature) (0)
- None ✅

### Missing `depends_on` Targets (0)
- None ✅

## Dependencies (Mermaid)

- No dependencies found.
