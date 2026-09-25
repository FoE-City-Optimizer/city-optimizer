# M1 — Domain & Data Feasibility

**Status:** In progress. The five research issues are closed, but all three outcome Epics and the milestone remain open. The [2026-09-25 exit review](m1-exit-review-2026-09-25.md) and [M2 kickoff](m2-kickoff-2026-09-25.md) are the current sequencing decisions; the evidence review below records the earlier #3/#23 state. **Planning date:** 2026-09-23.

## Earlier evidence review and browser scope (2026-09-25, before #24–#26 merged)

The merged [#3 report](../research/issue-3-main-city-data-sources.md) and [#23 report](../research/issue-23-browser-observation-boundary.md) are the current evidence. #3 observed one authorized main city on one world: a `/game/json` startup city map, a metadata lookup covering all 154 distinct placed entity keys, 418 placed entries, 124 street entries, one Town Hall, and a 25-entry partial refresh after an owner-performed road move and reversal. The game asset name was recorded, but the game build was not established. Omitted coordinates, absent street requirements, blocked-area meaning, special/off-grid entities, other update classes, and a second city or build remain unverified. The response-stage research filter briefly stalled loading and is not a production mechanism.

#23 observed, on one authorized Google Chrome 154 reload, static `document_start` MAIN and ISOLATED scripts running while the document was loading. A bounded `/game/json` startup/metadata presence marker crossed MAIN → isolated → runtime; fixed malformed messages were rejected and the game rendered. This proves a narrow Chrome observation path, not exact city-field projection, all update classes, source authenticity, long-running noninterference, or production security. The Firefox 156 live test was blocked by the approved inspection tool before the game could be inspected. That is no evidence of Firefox incompatibility.

**Planning decision:** The initial extension and M1 browser feasibility gate target **Google Chrome**. Other Chromium browsers and Firefox are deferred pending separate live evidence. This follows the owner's Chrome-first request recorded in the #23 handoff; it does not change ADR-006's read-only requirement or accept proposed ADR-013's framework choice. Production collector refinement still requires a source-completeness and loss-recovery design, exact-field projection, and a design-specific Security & Privacy review.

| M1 gate                                         | Current assessment                                                                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Current source and field inventory              | Partially met by #3 for one city/world and one move; build and important semantics remain unknown.                                             |
| Browser boundary                                | Narrow Chrome startup proof met by #23; complete updates, fetch/variant handling, and production trust boundary remain open. Firefox deferred. |
| Sanitized real-city fixture and observed schema | Open; #24 is next. No raw or private response is a fixture.                                                                                    |
| Domain mechanics and safe treatment             | Open; #25 follows #24's sanitized case and may start with #3's gaps.                                                                           |
| Snapshot v1 and cross-language validation       | Open; #26 depends on fixture and domain evidence.                                                                                              |

M1 is **not complete**. The next research batch is #24 and #25. #23 remains open for its narrowed Chrome coverage and trust-boundary handoff; it should not be closed on the one-reload proof alone.

## Goal and boundary

Establish, from current main-city observations, that a narrowly scoped read-only extension can reconstruct a player's existing city and that a project-owned Canonical City Snapshot v1 can express the verified geometry and road-access facts. M1 produces evidence, a sanitized fixture, a contract and validation strategy, and explicit unsupported-mechanic policy. It does not deliver the production collector, solver, API jobs, or planner UI. The tiny oracle and CP-SAT benchmark previously grouped under M1 are solver feasibility work for M2; they depend on M1's verified domain rules and fixture format.

## Exit criteria

1. Current main-city startup and change/update sources are observed in an authorized live session, with date, game build, browser versions, request/response family, field paths, sample values, and failure/absence cases recorded. Historical FoE Helper names are checked, not treated as a current API.
2. A field-level inventory identifies how to obtain placed entities, entity metadata, unlocked and blocked geometry, current roads, Town Hall identity, footprint, and street requirements, plus fields explicitly unnecessary or prohibited.
3. A narrow, read-only collection path is demonstrated feasible in Google Chrome for required startup and change facts, with explicit detection and recovery for missing source data. The proof covers observed XHR transport, any fetch path required by current evidence, startup timing, relevant change events, MAIN-to-isolated-to-runtime message validation, and minimum permissions. A research spike may use disposable instrumentation; no production collector is an M1 deliverable. Firefox and other Chromium browsers require later live verification before a support claim.
4. At least one real main-city example is converted to a sanitized, reviewable fixture using an approved sanitization rule. Any temporary raw observation stays local, access limited, and is deleted after extraction/verification. No secret, session credential, unrelated account/social content, or full-session dump enters the repository.
5. The observed external schema and its known variants are documented separately from Canonical City Snapshot v1. A field-to-field derivation table identifies critical missing-data behavior; unknown critical fields fail closed.
6. Snapshot v1 is formally specified as a project-owned versioned contract, with coordinate convention, capture/source metadata, city cells or area geometry, blocked cells, building instances and fixed footprints, roads, Town Hall, per-entity road requirements, and bounded diagnostic/unsupported metadata. It does not mirror raw game responses.
7. Schema validation, version evolution, TypeScript/Python contract generation or conformance, and trust-boundary ownership are decided through an ADR amendment or a new accepted ADR backed by evidence. The extension validates before handoff; the API revalidates and bounds input; the solver receives a separately compiled domain input.
8. Domain rules are classified as confirmed, uncertain, unsupported, or deferred. A policy prevents a geometrically plausible plan from being called fully valid when unmodeled mechanics matter. M1 documents the evidence and treatment for two-lane roads, chains, sets, adjacency bonuses, special entities, blocked areas, unusual placement, and entities with no normal street requirement.
9. Fixture parse/replay, negative schema cases, TypeScript/Python compatibility, and domain invariant checks are specified with concrete expected outcomes. Production collector work is eligible for refinement only after source, privacy, contract, and browser decisions are explicit.

## Current evidence and assumptions

| Known from project decisions or M0                                                                                                                                                  | Requires current evidence                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ADR-001 separates TypeScript workspaces and Python worker; contracts belong in `packages/contracts`, domain rules in `packages/domain`.                                             | Exact live data source and field paths for every required fact.                                                                 |
| ADR-005 requires a versioned, project-owned snapshot and trust-boundary validation.                                                                                                 | Snapshot v1 shape, coordinate semantics, versioning, and cross-language authority.                                              |
| ADR-006 requires minimal read-only integration without gameplay automation.                                                                                                         | Whether an own passive extension can observe complete startup and change data in both target browsers with minimal permissions. |
| Charter's initial model uses integer cells, fixed rectangular footprints, Town Hall-rooted orthogonal roads, and `NONE`/`SINGLE`/`DOUBLE` requirements; MVP supports the first two. | Whether those rules correctly describe observed current entities and special mechanics.                                         |
| Historical research mentions `CityMapData`, `UnlockedAreas`, `CityEntities` and metadata variants.                                                                                  | Whether these names, payload locations, and semantics still exist in the current game.                                          |

## Epics and dependency order

### 1. Read-only main-city source feasibility ([Epic #2](https://github.com/FoE-City-Optimizer/city-optimizer/issues/2))

- **Context:** The extension direction in the charter is a hypothesis about an external game client, not an observed current protocol.
- **Outcome:** A timestamped source inventory and browser feasibility report show exactly how the minimum city facts can be acquired, including startup and subsequent changes.
- **Non-goals:** Production extension, persistent raw capture, FoE Helper-derived implementation, network archives, gameplay actions.
- **Exit:** At least one controlled live session maps each required fact to a source or identifies a gap; the required Chrome startup and change paths and their loss behavior are tested; MAIN-world access, isolated bridge, runtime boundary, permissions, and failure behavior are documented; data minimization and the proposed production boundary receive Security & Privacy review. Firefox and other Chromium browsers are deferred.
- **Dependencies:** Authorized test city; ADR-006 baseline. Its evidence gates the other two Epics.
- **Risks:** Protocol changes, missing metadata, browser differences, store policy, accidental access to unrelated traffic.

### 2. Canonical City Snapshot v1 ([Epic #21](https://github.com/FoE-City-Optimizer/city-optimizer/issues/21))

- **Context:** ADR-005 commits to a versioned independent contract, but the exact schema and cross-language authority are undecided.
- **Outcome:** A reviewable v1 schema and transformation specification cover verified city facts and unsupported-feature signaling without raw FoE payloads.
- **Non-goals:** Solver internal representation, broad game metadata mirror, API/job implementation.
- **Exit:** Required and optional fields, units, coordinate convention, identity stability, `NONE`/`SINGLE`/`DOUBLE`, Town Hall, geometry and roads are specified; invalid/missing critical values have explicit errors; versioning and TS/Python strategy are decided; boundary validation cases are listed.
- **Dependencies:** Source inventory and at least one sanitized real-city fixture; ADR-005 amendment or follow-on decision record.
- **Risks:** Overfitting one city, false defaults, unstable IDs, schema changes, incompatible generated consumers.

### 3. Domain evidence and sanitized fixture corpus ([Epic #22](https://github.com/FoE-City-Optimizer/city-optimizer/issues/22))

- **Context:** A schema alone cannot show whether road and placement rules are correct or whether fixtures are safe to commit.
- **Outcome:** A sanitized reference case, external-schema notes, and a confirmed/uncertain/unsupported mechanics register that can anchor later contract and solver tests.
- **Non-goals:** Exhaustive building catalog, feature support for every special mechanic, solver benchmark.
- **Exit:** Sanitization is reviewed before fixture commit; at least one real city parses repeatedly with no sensitive/unrelated fields; geometry, IDs, footprints, roads, and Town Hall are reconciled with the visible city; every listed special mechanic has an evidence status and safe treatment; regression expectations and fixture refresh process are documented.
- **Dependencies:** Source feasibility; parallel feedback into snapshot design; ADR-011 policy review.
- **Risks:** Privacy leakage, unrepresentative city, special building semantics, evidence gaps.

```text
Read-only source feasibility (#2, research #3)
       ├──> sanitized real-city fixture + observed schema ──> domain evidence/policy
       │                                      └──────────────> Snapshot v1
       └──> browser collection decision ────────────────────> Snapshot v1
Domain evidence/policy + Snapshot v1 + browser decision
       └──> contract validation evidence ──> production collector eligible for refinement
       └──> M2 solver feasibility research (#4) eligible to start
```

## First research queue and refinement gates

1. **[#3](https://github.com/FoE-City-Optimizer/city-optimizer/issues/3), current main-city data sources** — research can begin once an authorized test city is available. Record startup/main-city responses, placed entities, building metadata, unlocked/blocked areas, roads, Town Hall, dimensions, street requirements, and update events. Record both present and absent evidence, rather than infer absence from one session.
2. **[#23](https://github.com/FoE-City-Optimizer/city-optimizer/issues/23), browser boundary spike** — the early Google Chrome startup and bounded message path have one live proof. Complete relevant change coverage, source-loss behavior, exact-field projection, and design-specific permission/trust review remain open. Firefox and other Chromium browsers are deferred. No reusable production integration code.
3. **[#24](https://github.com/FoE-City-Optimizer/city-optimizer/issues/24), privacy-safe fixture and observed schema** — define sanitization and a reviewer checklist before committing data. Capture only selected necessary fields; replace player/world identifiers and stable instance IDs consistently when needed; preserve only correlation required within the fixture. Document version/date and sample coverage. Keep raw observations ephemeral and local.
4. **[#25](https://github.com/FoE-City-Optimizer/city-optimizer/issues/25), special-mechanic classification** — after ordinary entities are mapped, assess two-lane roads, chains, sets, adjacency-sensitive bonuses, special map entities, blocked areas, unusual placement and entities without normal street requirements. Supported claims require observed behavior or authoritative current evidence.
5. **[#26](https://github.com/FoE-City-Optimizer/city-optimizer/issues/26), Snapshot v1 decision and conformance design** — Needs Refinement until source and fixture evidence exists. Decide schema authority (e.g. JSON Schema with generated consumers versus language-native schemas plus parity tests), evolution rules, size limits, and failure semantics.

No production implementation ticket is Ready at planning time. Research #3 is the first executable work item, subject to authorized game access. Backlog Refinement should prepare the next small batch only after each evidence gate, and keep unresolved design work in Needs Refinement.

## Acquisition and privacy boundary

The candidate flow is game page → minimal MAIN-world passive observation → validated, allowlisted message → isolated extension bridge → extension runtime → canonical snapshot. The page and raw game payload are untrusted. The MAIN-world component must have no secrets or privileged business logic. Message type, origin/source, shape, byte size, and expected field set require validation at each transition; the API must validate again. A permitted event must contain only selected city fields, not a raw response object. Collection must be limited to the user's main city and authorized session; no automatic gameplay action is allowed.

Never put cookies, credentials, session tokens, authentication/request headers, chat, guild communications, friends lists, unrelated account metadata, raw full network responses, or full-session dumps in the canonical snapshot or committed fixtures. Source/build version and capture time may be retained only if useful for compatibility; avoid player identity. Research raw data, if unavoidable for field discovery, must remain local, access-limited, short-lived, and deleted after sanitized extraction. Ordinary logs should carry error codes and schema versions, not city payloads. Retention for future product snapshots needs a later explicit decision; M1 assumes no server retention.

## Snapshot v1 design questions and validation strategy

The contract should make cell coordinates and units explicit; normalize unlocked geometry into resolvable cells while preserving the distinction between unusable and blocked cells; represent current roads independently of future planned roads; identify exactly one Town Hall where applicable; and encode each placed entity's stable-within-snapshot instance ID, entity ID, current position, positive fixed footprint, and explicit road requirement. `DOUBLE` may be accepted by the contract and marked unsupported for initial solving; an unknown value must not silently become `NONE`. Source version/adapter revision and bounded unsupported/diagnostic codes help explain failures without raw payloads.

Planned checks: repeated parse of the sanitized fixture; malformed/missing field rejection; bounded size and coordinates; positive footprints; no duplicate instance IDs; exactly one Town Hall in a normal main-city snapshot; no building/road occupancy outside available cells; no overlaps; valid blocked-area resolution; known road requirement enum; current-road and building correlation; TS/Python round-trip or shared conformance fixtures. A fixture from a later game build should reveal adapter drift through source-field assertions and explicit failure, never invented defaults. These checks specify M1 outputs; implementation belongs to subsequent bounded issues.

## ADR work

| Decision                                                                                                                 | Why now                                                                  | Evidence and alternatives                                                                                                       | Consequence                                                        |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Amend ADR-005 or add a focused snapshot v1 ADR: schema authority, versioning, TS/Python generation, validation ownership | Contract work otherwise makes implicit cross-language choices            | Compare JSON Schema-first generation with TypeScript-first and hand-maintained conformance; test one fixture and negative cases | One authority; explicit compatibility and failure policy           |
| Amend ADR-006 or add browser collection ADR: passive observation mechanism and permissions                               | Production collector cannot start with unverified XHR/fetch assumptions  | Controlled Chrome/Firefox spike; compare MAIN-world bridge, extension APIs, and narrower alternatives                           | Least-privilege integration or documented unsupported browser path |
| Refine proposed ADR-011: treatment of chains, sets and other special mechanics                                           | Geometric correctness can misrepresent functional validity               | Observed examples, preservation feasibility, manual-review versus reject policy                                                 | No unsupported case is silently claimed valid                      |
| Resolve proposed ADR-013 only after browser spike                                                                        | Framework choice may affect MAIN-world injection and Firefox MV3 support | Raw WebExtensions versus framework prototype and packaging constraints                                                          | Decision gates later collector implementation                      |
| Fixture sanitization/retention ADR candidate                                                                             | Real-city test data may expose identifiers                               | Review field inventory, deterministic pseudonyms, local raw-data deletion and fixture policy                                    | Safe reproducible corpus without secrets                           |

None of these candidates is accepted by this plan. ADR-001, -005, -006 and -012 remain governing accepted decisions; ADR-011 and -013 remain proposed.

## GitHub planning representation

Use the existing organization Project #1, its existing Epic and Research Issue types and fields, and a repository milestone named **M1 — Domain & Data Feasibility** without a due date. Set the three Epics to Backlog, research to Needs Refinement or Ready only when the research method and authorized access are concrete. Native sub-issues express Epic membership; native blocked-by relationships express evidence gates. Existing #4 CP-SAT research belongs under M2 #5 and should not carry the M1 milestone. Avoid creating an artificial Ready implementation queue.

## M1 risk register

See [M1 risk register](m1-risk-register.md). Risk owners are roles, not assigned individuals.
