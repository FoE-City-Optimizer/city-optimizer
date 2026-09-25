# Forge of Empires City Optimizer
## Project Charter & Architecture Brief

**Status:** Foundation / Baseline  
**Version:** 0.1  
**Date:** 2026-09-23  
**Project model:** Open Source, AI-first development  
**Primary objective:** mathematically optimize the layout of an existing Forge of Empires city  
**Initial scope:** main city, currently placed buildings, single-tile roads, Google Chrome first; other Chromium browsers and Firefox deferred pending live verification

---

## 1. Executive summary

Forge of Empires City Optimizer is a planning and optimization system for the main city in Forge of Empires. The system will read the current city state through a read-only browser extension, convert it into a small canonical city snapshot, submit the optimization problem to a backend, and use a dedicated optimization worker to search for a city layout that minimizes the number of road tiles while preserving all hard game constraints.

The product is deliberately not an in-game automation tool. It will not click, move, sell, place, or purchase anything in Forge of Empires. Its output is a plan that a user can reproduce manually in the game.

The second optimization priority is the quality of unused space. Once the minimum road count has been achieved or fixed as the best proven value, remaining free tiles should be consolidated into large, useful regions rather than scattered holes. The goal is to preserve flexible space for future buildings.

The project will be maintained as a professional open-source software project with versioning, CI/CD, documented architecture, security controls, automated tests, architectural decision records, reproducible releases, and an AI-first engineering workflow. AI agents are expected to implement most tickets, but generated code must pass the same engineering gates as human-written code.

---

## 2. Accepted product decisions

The following decisions are considered baseline assumptions for the project unless superseded by an ADR:

| Area | Decision |
|---|---|
| System shape | Two-part user-facing system: read-only browser extension + separate planner/web application, backed by backend services |
| Optimization execution | Server-side, asynchronous, long-running jobs |
| Browser support | Google Chrome for initial delivery; other Chromium browsers and Firefox after separate live verification |
| Frontend language | TypeScript |
| Planner UI | React or equivalent modern component framework |
| Game integration | Strictly read-only; no gameplay automation |
| MVP input | Buildings currently present in the city |
| Inventory | Future scope, not MVP |
| Primary objective | Valid layout with all required connectivity, then minimize road tiles |
| Secondary objective | Consolidate free space into large, useful areas |
| Tertiary objective | Optionally minimize layout disruption / moved buildings |
| Optimization philosophy | Prefer provable or near-provable mathematical quality over short response time |
| Job duration | Minutes to hours are acceptable |
| Project model | Open source |
| Engineering model | AI-first with full professional quality gates |

---

## 3. Product vision

Forge of Empires City Optimizer should behave like an optimization system rather than a traditional drag-and-drop city planner.

The system will:

1. read the current city state,
2. construct a formal optimization model,
3. search for the best valid layout,
4. report whether the result is proven optimal or merely the best known feasible solution,
5. visualize the proposed city,
6. leave the actual reconstruction of the city to the player.

The primary measure of solution quality is road-space efficiency. The secondary measure is the usability of free space.

A successful system must make a clear distinction between:

- **OPTIMAL** - the solver has proven that no better solution exists under the model,
- **BEST KNOWN / FEASIBLE** - the solver found a valid solution but has not proven global optimality,
- **INFEASIBLE** - no valid solution exists under the supplied constraints,
- **UNKNOWN / TERMINATED** - the search ended without a proof or a usable result.

The product must never label an unproven best-known solution as mathematically optimal.

---

## 4. User problem

In an advanced Forge of Empires city, buildable area is one of the most constrained resources.

The city is represented by a discrete 1x1 grid. Main-city expansions are normally 4x4 areas that combine into an irregular overall city shape. Buildings occupy fixed rectangular footprints and cannot be freely rotated. Some buildings require road access; others do not.

A road tile consumes the same scarce city area that could otherwise hold a building. Therefore, every unnecessary road tile reduces city capacity.

The central problem is:

> For a fixed buildable city shape and a fixed finite set of currently placed buildings, find a valid placement of all buildings and roads such that every building that requires road access is connected through the road network to the Town Hall, while minimizing the total area occupied by roads. Among layouts with the same optimal road count, prefer layouts that create large, compact, reusable free-space regions.

This combines aspects of:

- rectangular packing,
- constraint satisfaction,
- integer/discrete optimization,
- connectivity and network design,
- graph reachability,
- free-space compaction.

Large real-world instances should be assumed computationally difficult until benchmarking demonstrates otherwise.

---

## 5. Project goals

### 5.1 Primary goal

Find a valid placement of every building in the selected city while minimizing the number of road tiles required to connect every road-dependent building to the Town Hall.

The project is not optimized for a five-second response time. A search that takes tens of minutes or hours is acceptable if it materially improves solution quality or proves optimality.

### 5.2 Secondary goal: useful free space

After the primary road objective has been fixed, the system should improve the geometry of unused space.

Desired behavior includes:

- grouping free cells together,
- avoiding isolated single-cell gaps,
- creating large rectangles where possible,
- minimizing fragmentation,
- preserving a flexible reserve area for future buildings.

### 5.3 Tertiary goal: layout stability

When primary and secondary objectives are equal, the system may prefer layouts requiring fewer building moves or shorter total movement from the current arrangement.

This objective must never worsen road optimality or the higher-priority free-space objective.

### 5.4 Future goals

The architecture should allow future support for:

- inventory scanning,
- ranking inventory buildings,
- comparing current-city buildings against inventory candidates,
- recommending building swaps,
- attack/defense optimization,
- production and supply optimization,
- set and chain optimization,
- double-lane road support,
- future expansion planning,
- player-defined optimization profiles,
- economic and military objective functions.

These are explicitly outside MVP.

---

## 6. Non-goals for MVP

The first version will not:

- click in the Forge of Empires UI,
- place or move buildings in the game,
- sell buildings,
- buy expansions,
- automate gameplay,
- optimize inventory,
- decide which buildings are economically superior,
- optimize production or military bonuses,
- guarantee instant results,
- require image recognition or screenshot parsing as its primary import mechanism.

The game integration is read-only.

---

## 7. Domain model and game constraints

The canonical domain model operates on an integer 2D grid. A cell `(x, y)` is the smallest unit of city space.

### 7.1 City area

The city is a set of usable cells.

Source data may represent the city as a union of rectangular unlocked areas. Before optimization, this should be normalized to a canonical availability mask:

```text
available(x, y) in {true, false}
```

The solver should not need to understand the Forge of Empires concept of an expansion.

### 7.2 Building instance

Each building instance should contain at least:

```text
instanceId
entityId
type
width
height
currentX
currentY
roadRequirement
isTownHall
```

Additional metadata may be preserved outside the solver model for UI purposes.

### 7.3 Rotation

Buildings are treated as having fixed orientation unless a future verified game mechanic proves otherwise for a specific entity class.

### 7.4 Road requirement

The domain model must attach road requirements to the specific building metadata rather than infer them from broad categories such as `military`.

Initial enum:

```text
NONE
SINGLE
DOUBLE
```

MVP is required to solve `NONE` and `SINGLE`. `DOUBLE` must exist in the domain contract but may initially be rejected by the MVP solver with a clear unsupported-feature status.

### 7.5 Town Hall

The Town Hall is the root of the road network.

Any road network used to satisfy a building's road requirement must belong to the component connected to the Town Hall.

### 7.6 Adjacency

Orthogonal adjacency is the default road/building connectivity model.

Diagonal contact does not count as road access.

### 7.7 Collision rules

- Buildings may not overlap.
- Roads may not overlap buildings.
- Every building footprint must remain entirely inside the usable city mask.
- Road cells must be buildable cells.

---

## 8. Domain risks requiring explicit validation

Before a production-ready v1, the project must investigate mechanics that may make a geometrically valid rearrangement functionally undesirable or invalid.

Priority topics:

- chain buildings,
- set buildings,
- adjacency-dependent bonuses,
- multi-part or linked entities,
- special map entities,
- blocked areas,
- unusual road requirements,
- building states that alter placement behavior.

Until each mechanic is modeled, the system should either preserve known critical relationships or mark the city/result as requiring manual review.

This policy must be formalized in an ADR before a production release.

---

## 9. High-level architecture

```text
Forge of Empires
       |
       v
Browser Extension
       |
       v
Canonical City Snapshot
       |
       v
Backend API / Job Orchestrator
       |
       v
Optimization Queue
       |
       v
Optimization Worker
       |
       v
Optimization Result
       |
       v
Planner Web Application
```

The codebase should be organized as a monorepo with clear module boundaries. Logical separation does not imply that every component must be deployed as an independent microservice from day one.

---

## 10. Browser extension

### 10.1 Responsibility

The browser extension is a data acquisition adapter only.

Its responsibilities are:

- detect an active Forge of Empires session,
- observe the relevant game traffic or client data structures,
- extract only the minimum data required by the optimizer,
- normalize raw game data to a versioned canonical snapshot,
- perform lightweight validation,
- securely hand the snapshot to the planner/backend.

It does not contain optimization logic.

### 10.2 Browser support

The initial delivery targets Google Chrome. Other Chromium browsers and Firefox remain future targets that require their own live acquisition and compatibility evidence before support is claimed. The 2026-09-25 [M1 evidence review](../backlog/m1-domain-data-feasibility.md) records the scope decision and its limits; the Firefox research access blocker is not an incompatibility finding.

A WebExtensions / Manifest V3-compatible architecture should be preferred where it does not weaken the verified Chrome path or read-only privacy boundary. The framework choice remains open under proposed ADR-013.

### 10.3 Data collection design

Do not design the integration around a large third-party export.

The extension should maintain a deliberately narrow **Game Data Adapter**. The game is an external dependency whose schema may change, therefore some normalization is unavoidable even with a custom extension.

The desired pipeline is:

```text
raw game response
      |
      v
Game Data Adapter
      |
      v
Canonical City Snapshot
```

The adapter should tolerate known schema variants only where verified. Unknown schema changes should fail closed with diagnostics rather than silently invent defaults for critical data.

### 10.4 Page-world boundary

A likely implementation is an early MAIN-world collector observing the communication mechanisms used by the game client, with a very small bridge into the isolated extension context.

Conceptual structure:

```text
MAIN-world collector
        |
        v
isolated content-script bridge
        |
        v
extension service worker
        |
        v
validation / upload
```

Code running in the page's MAIN world must contain no secrets or privileged business logic.

### 10.5 Data minimization

The extension must not intentionally transmit:

- session cookies,
- authentication tokens,
- raw request headers,
- full network payload archives,
- chat data,
- friends lists,
- guild/social information,
- unrelated account data,
- other unnecessary personal data.

Only data necessary to model the city should leave the browser.

---

## 11. Canonical City Snapshot

The snapshot is a versioned contract owned by this project and independent of the raw Forge of Empires schema.

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "capturedAt": "2026-09-23T00:00:00Z",
  "gameVersion": "optional",
  "map": {
    "areas": [],
    "blockedAreas": []
  },
  "buildings": [],
  "roads": []
}
```

The final schema should be formally defined using JSON Schema or OpenAPI-compatible schemas and validated at every trust boundary.

The canonical snapshot is not the solver input. A separate domain compilation step may transform it into optimized internal structures such as bitsets, legal-placement matrices, or adjacency tables.

---

## 12. Planner web application

Recommended starting stack:

- TypeScript,
- React,
- modern bundler/tooling,
- grid/canvas-based city visualization.

Responsibilities:

- receive or select a city snapshot,
- display current city state,
- submit optimization jobs,
- display job state and solver progress,
- display best-known intermediate solutions when useful,
- compare before/after road usage,
- display free-space metrics,
- visualize the final proposed layout,
- make manual reproduction in the game practical.

The UI must clearly distinguish job/result states including:

- running,
- optimal,
- best-known feasible,
- infeasible,
- cancelled,
- failed.

---

## 13. Backend API and job orchestration

The application/backend layer should initially use TypeScript on Node.js.

Candidate framework: Fastify or NestJS. The final choice should be recorded in an ADR after a small bootstrap comparison if necessary.

Expected infrastructure:

- PostgreSQL for persistent entities and job/result metadata,
- Redis or an equivalent queue/cache technology,
- containerized services,
- dedicated optimization workers.

Responsibilities:

- validate snapshots,
- persist jobs,
- enqueue optimization work,
- enforce quotas and resource limits,
- support cancellation,
- store incumbents and final results,
- expose progress and result APIs,
- retain solver/model version information.

Long optimization must not be represented by an hour-long synchronous HTTP request.

Recommended interaction:

```text
POST /optimization-jobs
        |
        v
202 Accepted + jobId
        |
        v
queue
        |
        v
optimization worker
```

Status updates may be exposed via polling, Server-Sent Events, or WebSocket depending on the later API ADR.

---

## 14. Optimization worker

The optimization engine should be a separate component with a language-independent contract.

TypeScript should not be forced onto the optimization core merely for stack uniformity.

The first serious solver spike should evaluate **Python + Google OR-Tools CP-SAT** because the problem is discrete and the product requirement explicitly values proof of optimality.

A solver abstraction should exist from the beginning:

```text
OptimizationEngine
  solve(problem, options)
  cancel(job)
  reportProgress()
```

This allows later experimentation with:

- CP-SAT,
- SCIP/MIP,
- commercial MIP solvers where appropriate,
- hybrid heuristics,
- custom Rust/C++ components.

A benchmarking spike must validate whether CP-SAT's encoding scales acceptably for representative cities before it becomes a permanent architectural dependency.

---

## 15. Initial mathematical model

### 15.1 Legal placement variables

For each building `b`, precompute the set of legal placements `P_b`.

For placement `p`:

```text
place[b,p] in {0,1}
```

Each building must be placed exactly once:

```text
sum(place[b,p] for p in P_b) = 1
```

Precomputing legal placements is preferred over allowing the solver to consider obviously invalid coordinates.

### 15.2 Occupancy constraints

For every city cell, the sum of selected building placements covering the cell plus the road decision for the cell must not exceed one.

### 15.3 Road variables

For each buildable cell:

```text
road[x,y] in {0,1}
```

A road may be selected only on an available, non-building cell.

### 15.4 Road connectivity

It is not enough for a building to touch any road. The road must be connected to the Town Hall road network.

Candidate formulations to benchmark:

- single-commodity flow from the Town Hall root,
- multi-commodity flow where necessary,
- reachability encoding,
- cut-generation / lazy connectivity approaches if supported by the chosen solver.

A dedicated solver spike should compare formulation strength and scaling.

### 15.5 Building-to-road requirement

For a road-dependent building, its chosen placement determines a perimeter set of adjacent candidate road cells.

At least one qualifying adjacent road cell must be active and connected to the Town Hall component.

---

## 16. Optimization objective hierarchy

A weighted all-in-one score is explicitly discouraged for the core product objective.

The project should use lexicographic or staged optimization so that lower-priority aesthetics can never buy an extra road tile.

### Phase 1 - road minimization

Minimize:

```text
number_of_road_tiles
```

This is the dominant objective.

### Phase 2 - free-space quality

After obtaining the optimal road value `R*`, constrain:

```text
number_of_road_tiles = R*
```

Then optimize free-space quality.

Candidate metrics:

- area of the largest empty rectangle,
- size of the largest connected empty region,
- number of disconnected empty components,
- perimeter/compactness of free space,
- count of common building footprints that can fit inside the reserve region.

The first preferred metric for experimentation is **Largest Reservable Rectangle**, potentially followed by fragmentation metrics.

### Phase 3 - layout stability

Only when phases 1 and 2 are equal, prefer:

- fewer moved buildings,
- lower total Manhattan displacement,
- preservation of selected manually locked buildings if that feature is later introduced.

---

## 17. Long-running optimization model

The system must be designed for asynchronous optimization lasting minutes or hours.

Each job should persist:

- latest best feasible solution,
- current objective values,
- solver status,
- timestamps,
- solver/model version,
- termination reason.

The user must be able to cancel a job.

If a resource/time limit is reached, the best known valid solution should be returned with an explicit non-optimal status unless optimality has been proven.

Where supported by the solver, a stored incumbent may be reused as a solution hint or warm start after worker restart.

The system must not claim full search-tree checkpoint/resume unless the selected solver actually supports it.

---

## 18. Open-source licensing

The current recommendation is **Apache License 2.0** because the project is intended to be open, reusable, and collaboration-friendly while benefiting from explicit patent provisions.

This is not yet an accepted architectural decision.

Before the first public release, ADR-009 must decide between at least:

- Apache-2.0,
- MIT,
- GPL/AGPL if reciprocal source-sharing is desired.

No AI agent should invent a final licensing decision without project-owner approval.

---

## 19. Repository and monorepo structure

Proposed structure:

```text
/
├── apps/
│   ├── extension/
│   ├── web/
│   └── api/
│
├── services/
│   └── solver/
│
├── packages/
│   ├── contracts/
│   ├── domain/
│   ├── config/
│   └── testing/
│
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── domain/
│   ├── development/
│   ├── backlog/
│   └── security/
│
├── tests/
│   ├── fixtures/
│   └── benchmarks/
│
├── infra/
│
├── .github/
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
└── README.md
```

TypeScript packages should use a single workspace package manager, with **pnpm** as the initial recommendation.

The Python solver should have an independent deterministic lockfile/environment.

TypeScript and Python representations of API contracts must be generated from, or validated against, a single authoritative schema. Do not manually maintain duplicate DTO definitions.

---

## 20. AI-first engineering model

AI-first development means that repository structure, tickets, tests, and documentation must make project intent explicit enough for agents to operate safely.

It does not mean relaxing engineering controls.

### 20.1 AGENTS.md

A root `AGENTS.md` should define:

- project architecture,
- repository boundaries,
- commands,
- coding conventions,
- testing requirements,
- security constraints,
- documentation rules,
- Definition of Done,
- what an agent may not change without an ADR or explicit ticket scope.

Large components may have scoped child `AGENTS.md` files.

### 20.2 Ticket as executable contract

Every implementation ticket intended for an AI agent should contain:

- Context,
- Problem,
- Goal,
- Scope,
- Out of Scope,
- Acceptance Criteria,
- Technical Constraints,
- Expected Tests,
- Documentation Impact,
- Security/Privacy Impact,
- Dependencies.

Ambiguous tickets such as "implement importer" are not acceptable.

### 20.3 Definition of Ready

A ticket is ready when:

- expected behavior is explicit,
- acceptance criteria are testable,
- dependencies are resolved or documented,
- required ADRs exist,
- contract changes are identified,
- scope boundaries are clear.

### 20.4 Definition of Done

A change is complete only when:

- implementation is complete,
- required tests exist,
- all quality gates pass,
- documentation is updated,
- no new unresolved critical security issues exist,
- acceptance criteria are demonstrably met,
- the PR explains architectural or operational impact.

### 20.5 AI cannot bypass governance

AI-generated changes must pass the same:

- pull-request process,
- reviews,
- CI checks,
- security scans,
- tests,
- architectural constraints

as any other contribution.

---

## 21. Git workflow

Default branch:

```text
main
```

Direct pushes to `main` should be disabled.

Normal change flow:

```text
Issue
  |
  v
feature/fix branch
  |
  v
Pull Request
  |
  v
CI + review
  |
  v
merge
```

Recommended branch prefixes:

- `feat/`
- `fix/`
- `refactor/`
- `docs/`
- `chore/`
- `spike/`

Commits should follow Conventional Commits.

Every material PR should reference an issue. Architecture-changing PRs must reference an accepted or proposed ADR.

---

## 22. Quality gates

Every relevant pull request should run, as applicable:

- formatting checks,
- linting,
- TypeScript type checking,
- Python formatting/static analysis,
- unit tests,
- contract tests,
- integration tests,
- extension build for Chrome/Chromium,
- extension build for Firefox,
- web build,
- API build,
- solver correctness tests,
- dependency checks,
- code/security scanning.

The `main` branch should require successful status checks.

Recommended GitHub security tooling:

- CodeQL,
- Dependabot,
- Dependency Review,
- secret scanning,
- push protection where available.

GitHub Actions must use least-privilege token permissions. Workflows triggered from untrusted pull-request code must not receive unnecessary write permissions or repository secrets.

---

## 23. Testing strategy

### 23.1 Unit tests

Cover:

- domain types,
- game-data adapter parsing,
- snapshot validation,
- footprint handling,
- adjacency,
- legal placement generation,
- objective utility functions.

### 23.2 Contract tests

Verify compatibility across:

```text
extension -> API -> solver
```

Schema changes must fail loudly when incompatible.

### 23.3 Brute-force oracle tests

For tiny maps, build an intentionally slow exhaustive solver.

For a large collection of tiny generated instances:

```text
production solver optimum == brute-force optimum
```

This is a critical correctness tool and should be considered part of the solver's safety net.

### 23.4 Property-based tests

Randomly generate small legal/illegal city instances and validate invariants:

- no overlaps,
- all footprints inside available area,
- all required buildings have qualifying road access,
- qualifying roads are connected to Town Hall,
- building multiset before and after optimization is identical.

### 23.5 Golden fixtures

Store anonymized canonical snapshots representing regression cases.

Fixtures should never contain authentication/session information.

### 23.6 Benchmark corpus

Maintain representative larger cities and record:

- time to first feasible solution,
- time to best solution,
- time to proof of optimality,
- final road count,
- optimality gap where applicable,
- peak memory,
- CPU time,
- free-space objective values.

Heavy benchmarks should run nightly and before release rather than block every small PR.

---

## 24. Security and privacy requirements

The browser extension executes in the context of a logged-in game and therefore represents a high-trust boundary.

Mandatory principles:

1. minimum host permissions,
2. no collection of credentials or cookies,
3. no raw network dumps in normal logs,
4. data minimization before upload,
5. strict snapshot validation,
6. payload size limits,
7. API rate limiting,
8. solver CPU/memory/runtime limits,
9. HTTPS transport,
10. no backend secrets embedded in the extension,
11. snapshot treated as untrusted input,
12. no player name required unless a future user-facing feature has a justified need.

Telemetry, if introduced, must be minimal, documented, and privacy-conscious.

A formal threat model should be created before public beta.

---

## 25. Observability

For every optimization job the system should be able to report or reconstruct:

- job ID,
- snapshot schema version,
- solver version,
- optimization model version,
- start/end timestamps,
- job status,
- incumbent objective values,
- number/timestamps of incumbent improvements,
- final objective,
- optimality/proof status,
- termination reason,
- peak memory,
- CPU/runtime metrics.

Application logs should be structured.

Raw city snapshots should not be emitted into ordinary application logs.

---

## 26. Versioning and releases

The public product should use Semantic Versioning.

Early releases may use a synchronized project/product version across components for operational simplicity.

A release should generate or reference:

- Git tag,
- GitHub Release,
- changelog/release notes,
- Chrome extension artifact,
- Firefox extension artifact,
- web/API image or deployment version,
- solver image/version.

Snapshot schema versions and solver/model versions are independently important and must be retained in stored results.

---

## 27. Documentation set

The repository should eventually contain at least:

### README.md
Project purpose, status, architecture overview, quick start.

### CONTRIBUTING.md
Development workflow, branch strategy, PR rules, local checks.

### AGENTS.md
Operational instructions and constraints for AI agents.

### docs/architecture/
System architecture and component boundaries.

### docs/domain/
Verified Forge of Empires domain rules used by the optimizer.

### docs/adr/
Architectural Decision Records.

### docs/security/
Threat model, data-flow/privacy model, secure-development rules.

### docs/development/
Environment setup, commands, testing and release processes.

### docs/backlog/
Backlog snapshot and roadmap when GitHub Issues are not the only source of planning truth.

### API documentation
Generated OpenAPI where applicable.

### Snapshot schema
Machine-readable and human-readable contract documentation.

### Solver model
Variables, constraints, objective hierarchy and known modeling limitations.

Documentation should live in the same repository and evolve in the same PR as the relevant code whenever possible.

---

## 28. Initial ADR backlog

The following ADRs should be created during repository bootstrap. They may begin in `Proposed` state.

1. ADR-001 - Monorepo architecture
2. ADR-002 - TypeScript for web/application layer
3. ADR-003 - Python optimization worker
4. ADR-004 - CP-SAT as the first optimization-engine spike
5. ADR-005 - Versioned Canonical City Snapshot
6. ADR-006 - Read-only browser integration
7. ADR-007 - Asynchronous long-running optimization jobs
8. ADR-008 - Persistence and queue infrastructure
9. ADR-009 - Open-source license
10. ADR-010 - Lexicographic objective hierarchy
11. ADR-011 - Policy for chains, sets and adjacency-sensitive buildings
12. ADR-012 - AI-first engineering workflow
13. ADR-013 - Browser extension framework / raw WebExtensions choice
14. ADR-014 - Backend framework choice
15. ADR-015 - API progress transport: polling vs SSE vs WebSocket

---

## 29. Roadmap

### Phase 0 - Domain and data feasibility (M1)

Goal: verify current read-only main-city data acquisition and define a safe, project-owned city representation before production integration work. The [M1 plan](../backlog/m1-domain-data-feasibility.md) sets the evidence gates.

Deliverables:

- current live main-city source and browser-feasibility evidence,
- one or more sanitized real-city fixtures and observed external schema notes,
- Canonical City Snapshot v1 contract and cross-language validation strategy,
- verified and explicitly unsupported domain rules,
- privacy, fixture and production-collector prerequisite decisions.

### Phase 1 - Solver foundation (M2)

Deliverables:

- tiny brute-force oracle solver and CP-SAT feasibility spike,
- first benchmark report based on verified M1 constraints,
- legal placement generation,
- collision constraints,
- road decision variables,
- Town Hall root,
- connectivity model,
- primary road-minimization objective,
- proof/status reporting,
- exhaustive-oracle regression tests.

### Phase 2 - End-to-end vertical slice

Target flow:

```text
FoE -> extension -> API -> solver -> web visualization
```

This is the first complete usable system.

### Phase 3 - Production-quality v1

Add:

- durable queue,
- persistence,
- long-running job management,
- cancellation,
- resource limits,
- security hardening,
- monitoring,
- benchmark automation,
- reproducible release pipeline.

### Phase 4 - Smart free space

Add secondary objective experiments:

- largest reservable rectangle,
- fragmentation score,
- connected-free-space score,
- footprint-fit flexibility score.

### Phase 5 - Extended game mechanics

Add verified support for:

- double roads,
- chains,
- sets,
- adjacency-sensitive bonuses,
- special map mechanics.

### Phase 6 - Inventory intelligence

Add:

- inventory collection,
- building valuation,
- swap recommendations,
- military/economic optimization profiles,
- multi-objective city composition planning.

---

## 30. MVP definition

MVP is complete when a user can:

1. install the Google Chrome extension,
2. open their own main city in Forge of Empires,
3. obtain a valid city snapshot without manually entering every building,
4. open the planner,
5. submit an optimization job,
6. allow that job to run asynchronously,
7. inspect the best valid result,
8. see whether optimality is proven,
9. compare road usage before and after,
10. inspect a graphical proposed layout,
11. manually reproduce the layout in the game.

MVP does not require inventory analysis or recommendations about which buildings are better.

---

## 31. Project success criteria

The project is technically successful when:

- the data adapter is narrow and resilient to verified schema variants,
- no authentication/session data is intentionally sent to the backend,
- every accepted solver output satisfies all hard constraints,
- the production solver agrees with brute force on the complete tiny-instance oracle suite,
- the system clearly distinguishes proven optimum from best-known feasible results,
- long-running jobs do not block API processes,
- solver-quality regressions are measurable and automatically detectable,
- AI agents can make changes reproducibly from tickets and repository guidance,
- releases are reproducible from versioned source and lockfiles,
- architectural decisions are documented rather than implicitly buried in code.

---

## 32. Engineering principle

The most important property of the system is not feature velocity. It is the ability to trust its result.

If the product says that a layout is valid, validity must follow from formal constraints and independent validation.

If the product says that a road count is minimal, the solver must have proven that fact under the current model.

If proof is unavailable, the product must say that the result is the best known solution rather than an optimum.

This distinction is a permanent project principle.

---

## 33. Recommended immediate next step

Do not begin feature implementation directly from this charter.

The next project action should be **Repository Bootstrap**, executed as a dedicated engineering ticket/agent task whose output is the controlled environment in which all later work will happen.

That bootstrap should create:

- the monorepo skeleton,
- root governance files,
- `AGENTS.md`,
- initial ADRs,
- GitHub contribution templates,
- CI/security workflow skeletons,
- local quality commands,
- initial roadmap and backlog,
- a reproducible developer setup,
- no substantive city-optimization implementation beyond minimal compile/test scaffolding.

After bootstrap, the first implementation epic should be **Phase 0 - Domain & Feasibility**, not the complete product.

---

## 34. Source references consulted for the baseline

The project should continue to verify live game mechanics and integration assumptions as implementation progresses. Initial research used, among others:

- InnoGames Forge of Empires Support - building placement and city mechanics: https://support.innogames.com/
- Forge of Empires community reference - roads and expansion mechanics: https://forgeofempires.fandom.com/
- FoE Helper open-source extension repository: https://github.com/mainIine/foe-helfer-extension
- MDN WebExtensions documentation: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
- Google OR-Tools CP-SAT documentation: https://developers.google.com/optimization/cp/cp_solver
- Google OR-Tools MIP documentation: https://developers.google.com/optimization/mip
- GitHub CodeQL documentation: https://docs.github.com/en/code-security/code-scanning
- GitHub Actions secure-use documentation: https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions

Game mechanics and external APIs are dependencies, not assumptions. Material rules should be captured in project-owned domain documentation and supported by reproducible fixtures/tests wherever practical.

