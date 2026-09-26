# Issue #40 — disposable city viewer and Chrome observation path

**Research status:** fixture replay and local visual proof complete; live Chrome observation pending the issue's Security & Privacy review and owner installation. **Date:** 2026-09-26. **Confidence:** high for the exact reviewed replay's explicit fields and the local map arithmetic; low for a complete city outline, per-building road demand, and live update coverage. This report is research evidence, not a production viewer or solver input.

## A. Research question

Can the privacy-reviewed #24 replay show the owner's **actual observed city shape, building footprints/positions, and roads** with useful counts, while keeping omitted fields and unsupported mechanics visible? Can a narrow Chrome probe observe startup and an owner-performed change without collecting unrelated game data?

## B. Executive conclusion

The local SVG viewer renders **378 of 399** retained ordinary instances at explicit source positions and joined footprint sizes, including **all 124 observed 1×1 roads**. It paints the union of the **213 of 234** unlocked rectangles with complete coordinates: **3,648 confirmed available cells**. The map includes the observed irregular outline, Town Hall candidate, ordinary and great buildings, military building, roads, and aggregate statistics. It has hover text for each positioned instance, including the exact source street-level field when present. The 20 special/off-grid source entries remain aggregate counts only.

The view is necessarily **partial**: 21 ordinary entities and 21 unlocked rectangles lack at least one coordinate. No omitted axis is filled with zero or another default. The 49 positioned footprint cells outside the confirmed-area subset may be covered by the unpositioned rectangles; they are **not** proof of invalid placement. Apparent empty cells are not reported as actual free space. `blocked_areas` semantics remain unresolved, so its 35 fully positioned entries are shown as diagnostic markers only where they fall in the visible map; they are not subtracted from available area. Source street-level presence does not establish which buildings require road access. The map is the observed current arrangement at the #24 capture date, **not** an optimized plan or a complete game-valid reconstruction.

The uninstalled Chrome probe has synthetic checks for startup, one partial move response, unknown IDs, unknown classes, and a nonmatching path. It sends only bounded counts/status from MAIN to ISOLATED and labels output `partial`, `stale`, or `unsupported`. Live agreement with the replay and post-action changes are **unverified** until its exact design is reviewed and the owner installs it.

## C. Project assumptions before research

The [charter](../project/project-charter.md) expects a grid/canvas plan view and fixed rectangular building footprints. [ADR-005](../adr/005-snapshot.md) requires a project-owned snapshot; [ADR-006](../adr/006-read-only.md) requires minimal, read-only browser integration. The [#24 report](issue-24-real-city-fixture.md) and [#25 mechanics research](issue-25-city-mechanics.md) already warned that missing coordinate/street fields cannot be defaulted. The [#26 snapshot research](issue-26-snapshot-authority.md) treats the reviewed replay as a source-shape case, not a complete canonical city. Issue #40 requests a disposable visible replay and a separate narrow live observation path.

## D. Sources and evidence

| Category and reference                                                                                                                                                                                                                   | Date/version                                                                                                             | Supports                                                                                                             | Limit                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Scope authority: [Issue #40](https://github.com/FoE-City-Optimizer/city-optimizer/issues/40), read with `gh issue view 40 --json ...`                                                                                                    | Read 2026-09-25                                                                                                          | Required fixture viewer, counts, unknowns, optional live observation and safety boundary                             | Requirement, not game-behavior proof                                                       |
| Verified local artifact: [#24 replay fixture](../../tests/fixtures/issue-24-reference-replay.json), [verifier](issue-24-replay.mjs), [exact-artifact privacy review](issue-24-privacy-review.md)                                         | Captured 2026-09-25; Chrome 154.0.8037.58; LF SHA-256 `f82c67f23b85bbf06dabb292d24b869d1a470a1d268d2fe9cc6f672538ca4dc1` | Selected field presence, 399 retained instances, definition joins, 124 road tiles, source counts                     | One city/world; omitted axes and source semantics unresolved; recognizable relative layout |
| Verified local experiment: [viewer](issue-40-viewer.mjs) and [checks](issue-40-viewer-check.mjs)                                                                                                                                         | Run 2026-09-26 with Node 24.19.0                                                                                         | Explicit-position map, 3,648 known area cells, 3,623 positioned footprint cells, omissions and fail-closed mutations | Does not establish positions for omitted axes or validity of game mechanics                |
| Verified local experiment: [temporary Chrome probe](issue-40-chrome-probe/README.md), [synthetic checks](issue-40-chrome-probe/check-probe.mjs)                                                                                          | Built 2026-09-26; not installed                                                                                          | Exact host/path filtering and selected-count behavior in a fake XHR environment                                      | No live game test, metadata join, source authenticity or update completeness               |
| Vendor documentation: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [manifest script worlds](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts) | Retrieved 2026-09-26; MV3                                                                                                | Static `document_start` MAIN/ISOLATED scripts and their documented execution worlds                                  | API capability, not proof of this probe's live timing or field coverage                    |
| Prior live evidence: [#23 browser boundary](issue-23-browser-observation-boundary.md), [#3 source inventory](issue-3-main-city-data-sources.md)                                                                                          | Owner-scoped Chrome observations 2026-09-23/25                                                                           | One actual startup marker, source paths, and one past road-move partial refresh                                      | Does not validate the new #40 probe or complete update handling                            |

## E. Findings

**Verified from the reviewed artifact and local replay:** 419 source entities; 399 retained ordinary instances; 20 excluded special-class aggregates; 135 joined retained definitions; 124 streets with explicit positions and 1×1 footprints; one explicit-position 6×7 `main_building` candidate; 234 unlocked rectangles; 49 blocked-position records. The new map places 378 ordinary instances and 213 unlocked rectangles. Their area union has 3,648 cells; positioned footprints occupy 3,623 unique cells without overlap. Forty-nine of those footprint cells lack coverage in the positioned-area subset. Twenty-one ordinary instances, 21 areas, and 14 blocked records have an omitted x or y. Of the 399 retained instances, 198 reference a definition with an explicit source street-level field and 201 do not; this is **field presence**, not a demand classification.

**Likely but unverified:** Earlier #24/#25 zero-axis diagnostic yields a visually more complete, overlap-free arrangement and 3,984 conditional area cells. That consistency makes zero omission plausible for this one capture, but no independent serializer rule was found. The #40 viewer deliberately does not apply it.

**Inference:** A local viewer can accurately show the explicit-position subset of this real city, including every observed road tile, without pretending that the partial area union or apparent free cells are the full map. A complete and game-valid layout requires source-semantic evidence still missing under #25/#26.

## F. Reproduction and experiment

```text
node docs/research/issue-24-replay.mjs
node docs/research/issue-40-viewer-check.mjs
node docs/research/issue-40-viewer.mjs --output <local-file.svg>
node docs/research/issue-40-chrome-probe/check-probe.mjs
```

The viewer refuses a fixture whose normalized LF SHA-256 differs from the reviewed #24 artifact. It uses only its documented intermediate keys, joins each retained instance to a positive footprint, rejects duplicate/unknown instances and classes, and puts an entity on the SVG only if both x and y exist. Roads have an additional exact 1×1 and positioned check. The tests mutate a copy in memory to exercise extra keys, unknown class, duplicate instance, invalid/missing footprint, and missing road position; a missing ordinary position increments the visible unknown count. The SVG contains source positions, so keep generated output local to the owner unless the derivative receives publication review.

The Chrome probe's fake XHR test covers selected startup counts, one moved road, an unchanged repeated update, an unknown ID, an unknown class, and an unrelated path. It has **not** been installed. Its [README](issue-40-chrome-probe/README.md) includes conditional installation and removal instructions; the [review inventory](issue-40-privacy-review.md) identifies the exact pre-installation gate. No live action was performed by the agent.

## G. Contradictions discovered

The requested full actual city outline cannot be established solely from #24 because 21 unlocked rectangles have unresolved positions. The implicit idea that every building can receive an authoritative road-required flag is contradicted by 201 retained instances whose definition lacks the selected field and by the unverified meaning of explicit levels. No Accepted ADR is contradicted. Issue #40 references `docs/backlog/m2-kickoff-2026-09-25.md`, which is absent in this checkout; the issue's own scope and the relevant M1 documents still provide the research boundary.

## H. Remaining uncertainty

- Source omission rules for coordinates; `blocked_areas` meaning; street-level presence/absence meaning; Town Hall universality; special/linked building relationships.
- Whether the current city still matches the #24 capture; whether the new probe sees startup and selected updates on the owner's current Chrome build; whether other owner-performed actions produce different source families.
- A full count of actual free cells, all road-required buildings, functional road connectivity, and optimization validity.
- Whether the page message remains trustworthy under hostile or changed page code; it is not an authenticated source.

## I. Project impact

The map provides an M1 visual regression aid and a precise UX example of unknown-value handling. It does not change `packages/contracts`, `packages/domain`, the API, extension shell, solver, accepted ADRs, or production architecture. It supports Architecture & Planning and Backlog Refinement with a concrete geometry preview and identifies the remaining source-semantic gates for Snapshot v1 and later optimization. Security posture remains local and read-only: no raw responses, secret/session/account/social fields, uploads, backend retention, or gameplay automation are added. Publication of the generated SVG/PNG outside this owner-local task would need review because the layout is recognizable.

## J. Recommendation

Use the SVG viewer as a **partial observed-layout preview** for the reviewed fixture. Keep the full-city cell total, true free-space count, road-demand classification, connectivity and optimality labels unavailable until their source meanings are verified. Have Security & Privacy review the exact Chrome probe, then let the owner install it for one bounded startup and representative action if approved. Architecture & Planning should consume the resulting gap list; no production collector decision follows from this spike.

## K. Follow-up candidates

| Title                                              | Type     | Evidence                                                                                | Why it matters                                                        | Impact if ignored                                 | Suggested urgency                   | Potential dependency                               |
| -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| Verify omitted-coordinate serialization            | research | 21 entities and 21 area records cannot be placed without a default                      | Complete exact outline and occupancy require resolved coordinates     | False full-city map or incorrect free-space count | Before canonical geometry           | Owner-authorized narrow experiment, privacy review |
| Verify road-demand and blocked-area semantics      | research | 201 instances lack selected street-level field; 49 blocked records have unknown meaning | Road access and available-cell claims depend on semantics             | Invalid plan labeled functional                   | Before M2 solver input              | #25/#26 research, accepted policy                  |
| Review and run temporary Chrome probe              | security | Exact host-scoped prototype passes synthetic checks but has no live result              | Tests startup/update source continuity on current owner city          | Stale fixture treated as current                  | Before live installation            | Security & Privacy review, owner action            |
| Refine a production city viewer after source gates | feature  | Partial SVG proves a useful shape/road presentation                                     | The owner wants an interactive, complete observed and proposed layout | Product cannot show a trustworthy full plan       | After source and contract decisions | Architecture & Planning, Backlog Refinement        |

## L. Handoff

**Next role: Security & Privacy** for the exact Chrome probe before owner installation. A later **Research** pass should record live source/status diagnostics from one owner-authorized startup and representative action. **Architecture & Planning** should consume the semantics gaps and decide the later product claim boundary; **Backlog Refinement** owns implementation tickets after those decisions. This report does not accept an ADR or create a successor ticket.
