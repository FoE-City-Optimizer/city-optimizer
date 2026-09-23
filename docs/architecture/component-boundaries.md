# Component boundaries

| Component | Owns                                            | Must not own                            |
| --------- | ----------------------------------------------- | --------------------------------------- |
| Extension | Minimal read-only acquisition and normalization | Gameplay actions, solver logic, secrets |
| Web       | Plan visualization and job interaction          | Raw game scraping, optimization         |
| API       | Validation, persistence, job orchestration      | Long synchronous solving                |
| Solver    | Mathematical optimization and proof status      | Game-session access, browser APIs       |
| Contracts | Versioned cross-boundary schemas                | Duplicate hand-maintained DTOs          |
| Domain    | Verified game-independent city rules            | Assumptions from unverified research    |

`apps/*` and `packages/*` are TypeScript workspace members; `services/solver` is an independent Python environment. Deployment topology remains a later decision. See [ADR-001](../adr/001-monorepo.md).
