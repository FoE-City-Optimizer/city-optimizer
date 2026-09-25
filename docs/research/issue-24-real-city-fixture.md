# Issue #24 — real-city reference fixture and observed schema

**Research status:** Issue #24 evidence complete; source-semantic unknowns are explicitly recorded for #25 and #26.

**Observation:** 2026-09-25, about 20:10 UTC.

**Scope:** [Issue #24](https://github.com/FoE-City-Optimizer/city-optimizer/issues/24), under [Epic #22](https://github.com/FoE-City-Optimizer/city-optimizer/issues/22). This report is research evidence, not Snapshot v1 or a production collector design.

## A. Research question

Can selected current Google Chrome main-city facts become a privacy-reviewed, repeatable real-city fixture and external-schema inventory without silently filling missing critical values?

## B. Executive conclusion

**Yes, with high confidence in selected-field replay and explicit limits on source semantics.** The privacy-reviewed intermediate fixture retains 399 ordinary on-grid instances and 135 definition joins, plus aggregate counts for 20 excluded special/off-grid instances from the 419-entry source. It replays twice with identical counts and contains no account, session, URL-query, request, or unrelated service fields under the strict allowlist. Omitted coordinates and street fields remain omissions. The full city view, a fresh startup count check, and conditional occupancy calculations found no observed contradiction; they do not prove every rendered tile or the semantics of missing fields. This is not a resolved city snapshot or Snapshot v1.

## C. Project assumptions before this pass

The [#3 observation](issue-3-main-city-data-sources.md) found 418 entries, 233 unlocked rectangles, 49 blocked positions, 154 distinct entity keys, 124 roads, and one Town Hall on one city/world. Interpreting omitted coordinates as zero yielded nonoverlapping ordinary footprints inside available cells, but that did not establish the serialization rule. [ADR-005](../adr/005-snapshot.md) requires a project-owned versioned snapshot, and [ADR-006](../adr/006-read-only.md) requires minimum read-only collection. The [M1 plan](../backlog/m1-domain-data-feasibility.md) makes a sanitized fixture a prerequisite to downstream #25 and #26 evidence work.

## D. Sources and evidence

| Type and reference                                                                                                            | Date/version                                                                               | What it supports                                                               | Limit                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [Issue #24](https://github.com/FoE-City-Optimizer/city-optimizer/issues/24), read through `gh issue view 24 --json ...`       | Read 2026-09-25                                                                            | Scope, boundaries, exit criteria                                               | Requirement, not game evidence                                                       |
| [#3 report](issue-3-main-city-data-sources.md)                                                                                | Observed 2026-09-23                                                                        | Prior field paths and one city/update comparison                               | One city/world; no retained fixture                                                  |
| [#23 report](issue-23-browser-observation-boundary.md)                                                                        | Observed 2026-09-25, Chrome 154                                                            | Narrow Chrome startup observation feasibility                                  | No complete collector or update coverage                                             |
| Project owner's confirmation in this research conversation                                                                    | 2026-09-25                                                                                 | The city changed in-game after the #3 observation                              | Does not identify which actions produced each count change                           |
| Owner-opened Chrome main city; selected `/game/json` startup response and placed `/start/metadata` definitions                | 2026-09-25; Google Chrome **154.0.8037.58** from `navigator.userAgentData.fullVersionList` | Counts, field presence, joins, selected shapes                                 | One city/world and one reload; no verified game build                                |
| Page script asset basename `merged-game-c3b9b79d.js`                                                                          | Observed 2026-09-25                                                                        | Revalidation fingerprint matching #3                                           | Asset fingerprint is **not** a game build                                            |
| [Pseudonymous replay fixture](../../tests/fixtures/issue-24-reference-replay.json) and [replay verifier](issue-24-replay.mjs) | Captured 2026-09-25                                                                        | Repeatable selected-field checks and conditional geometry                      | Does not resolve absent-field or special-mechanic semantics                          |
| [Fixture publication review](issue-24-privacy-review.md)                                                                      | Reviewed 2026-09-25                                                                        | Exact-artifact field, secret, minimization, and residual-risk decision         | Applies only to the recorded artifact hash                                           |
| Full live city view and fresh selected startup count check                                                                    | Rechecked 2026-09-25 about 20:27 UTC                                                       | Qualitative visible boundary/roads and same 419/124/1/234/49/155 source counts | Canvas art does not provide a tile-by-tile coordinate oracle; no screenshot retained |

## E. Findings and external-source inventory

These are observed source paths, not proposed canonical field names. `Absent` means no property was present. No absent value was written as zero or `NONE` in the fixture.

| Observed source field                                                                                            | Replay derivation                                               | Status and missing-data behavior                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StartupService.getData.responseData.city_map.entities[].id`                                                     | `instance`, deterministic within-capture pseudonym              | Observed present for 419 entries. Cross-session stability unknown; missing/duplicate rejects replay.                                                                  |
| `entities[].cityentity_id`                                                                                       | `entity`, deterministic pseudonym for retained ordinary entries | 155 distinct source keys all resolved; 135 retained in the fixture. Static keys were pseudonymized. Missing join rejects replay.                                      |
| `entities[].type`                                                                                                | `type`                                                          | Ten observed classes. Ordinary class membership is a research classification, not an eligibility rule for every city. Unknown class rejects the current capture rule. |
| `entities[].x`, `.y`                                                                                             | Copied only when own field exists                               | Omitted on 10 x and 11 y entries. Meaning unknown; omission remains visible. Critical geometry cannot be finalized without a rule.                                    |
| `city_map.unlocked_areas[].x`, `.y`, `.width`, `.length`                                                         | `unlockedAreas[]`, same field presence                          | 234 rectangles; x omitted 10 times and y 11 times. Positive extents observed; omission semantics unknown.                                                             |
| `city_map.blocked_areas[].x`, `.y`                                                                               | `blockedAreas[]`, same field presence                           | 49 entries; x omitted 8 times and y 7 times. Meaning and omission semantics unknown.                                                                                  |
| `StaticDataService.getMetadata.responseData` descriptor `building_entity_lookup`; descriptor `identifier`, `url` | Used in memory to select only placed definitions; URL excluded  | All 155 placed keys resolved through `/start/metadata`. Query values were neither printed nor retained. Missing descriptor is a capture failure.                      |
| Legacy definition `width`, `length`                                                                              | Same fields in `definitions[]`                                  | Both present for 47 placed keys; x/y orientation has a conditional geometry cross-check.                                                                              |
| Generic definition `components.AllAge.placement.size.x`, `.y`                                                    | `sizeX`, `sizeY`                                                | Both present for 108 placed keys; no top-level footprint used.                                                                                                        |
| Legacy `requirements.street_connection_level`                                                                    | `legacyStreetLevel` only when present                           | Explicit field on 27 definitions. Presence on a street definition is metadata, not a demand for another street. Omission is not `NONE`.                               |
| Generic `components.AllAge.streetConnectionRequirement.requiredLevel`                                            | `genericStreetLevel` only when present                          | Explicit field on 35 definitions. Omission semantics unknown.                                                                                                         |

**Verified facts from the selected projection:** The source held 419 distinct placed IDs and 155 distinct placed keys/definitions, including 124 streets and one `main_building`. The publishable replay keeps 399 ordinary entries and their 135 definition joins. The other 20 are represented only by aggregate class counts: two `hub_main`, five `hub_part`, one `friends_tavern`, ten `off_grid`, and two `outpost_ship`. `friends_tavern` is a map entity class, not friend-list data. The source definitions split into 47 legacy and 108 generic footprints; none lacked a footprint. Every retained road is 1×1 with explicit coordinates, and the one Town Hall candidate has an explicit position and 6×7 footprint. Under the diagnostic zero interpretation, all 20 excluded source footprints fall outside the unlocked-cell union; none contributes to ordinary on-grid occupancy. This is an observed exclusion, not a general eligibility rule.

**Conditional inference:** Setting omitted coordinates to zero _only inside the replay verifier's diagnostic calculation_ produces 3,984 available cells and 3,970 occupied ordinary cells, with zero ordinary overlaps, zero occupied cells outside the available union, 14 free cells, 49 unique blocked positions and no blocked position inside that union. This fit supports the hypothesis for this one city; it does not establish the source default. The `main_building` type is a Town Hall candidate, not an independently verified universal discriminator.

**Owner-confirmed context and remaining inference:** The owner confirms that the city changed in-game after #3. This pass observes one more generic placed entity and one more unlocked rectangle; the conditional available and occupied counts each increased by 16 while free cells stayed at 14. The precise actions and their mapping to those count differences were not observed, so a particular expansion or building addition is not established. The difference is not evidence of source-schema drift.

## F. Reproduction and privacy review

The [capture rule](issue-24-capture-safety.md) was committed before capture. In the owner-opened Chrome tab, CDP `Network.responseReceived` selected only an HTTP 200 XHR whose origin/path matched the game `/game/json` source. `Network.getResponseBody` was read into short-lived process memory for that one response, and only the two specified service entries and listed city fields were projected. The game-supplied lookup and 155 placed definitions were fetched in page memory; only selected footprint and explicit street-level fields crossed into the intermediate object. No request bodies, headers, full-session archive, cookie, token, chat, friend/guild list, unrelated service entry, or metadata query was written to disk or research output. Observation was stopped with `Network.disable`; in-memory raw/projection variables were cleared. A browser-generated **sanitized** JSON download was copied to the repository and the temporary download was removed. The temporary download's deletion was verified.

The artifact is intentionally `foe24-replay-draft` version 2. Raw instance IDs and static entity keys were sorted by the committed `localeCompare('en')` rule and mapped to sequential `instance-*` and `entity-*` identifiers within this capture; reverse maps were discarded. This preserves retained joins but loses persistent identity across captures and the public catalog-key mapping. Individual special/off-grid positions, pseudonyms, and definitions were removed after their aggregate census was recorded. Positions for retained entities preserve omitted fields because coordinate semantics were not established. The [exact-artifact privacy review](issue-24-privacy-review.md) approves publication with the stated residual risk that a distinctive layout could be recognized by someone already holding an identifiable image or map of this city. No exact coordinate list or screenshot appears in this narrative.

Reproduce the local replay and field review:

```text
node docs/research/issue-24-replay.mjs
```

The verifier parses the fixture twice and compares summaries. It rejects extra intermediate keys, unresolved/duplicate pseudonyms, invalid footprint shape, noninteger positions, nonpositive extents, URL queries, raw URL strings, and forbidden field names. It checks the exact source-count/exclusion relationship, all 124 road footprints, the one Town Hall candidate's footprint, and the conditional geometry values. A manual key review found only documented fields. The substring `friends` occurs solely in the aggregate `friends_tavern` class name; it is not social data. The review decision and artifact hash are recorded separately.

The live Chrome canvas was inspected first in a partial view and then in a full zoomed-out city view. The full view showed a dense built area with visible roads bounded by undeveloped terrain and water, plus structures outside the built area; no obvious boundary or road contradiction was seen. A fresh selected startup response after this view still had 419 entities, 124 streets, one `main_building`, 234 unlocked rectangles, 49 blocked positions, and 155 distinct placed keys, so the visual check was not being compared with a changed count set. Source/metadata reconciliation is exact for counts and joins; conditional available/blocked/ordinary footprint calculations report zero overlap and zero outside cells for ordinary entities. The Town Hall candidate is verified by the source type, unique count, and 6×7 metadata, while its game-art identity is not independently proven by the canvas. The canvas is not a tile-coordinate oracle, so this report does not claim per-tile visual verification. No screenshot or exact coordinate list was saved.

For refresh, record Chrome build, observation date, and asset fingerprint. Reapply the same allowlist to another owner-authorized city/build, create new per-capture pseudonyms, compare source path/type presence, omitted-field counts, class distribution, join coverage, and geometry invariants, and review the new artifact before publication. Unknown critical variants fail closed. A later capture must not silently gain fields or inherit the previous pseudonym map.

## G. Contradictions discovered

No accepted ADR is contradicted. The #3 counts are no longer current for this city, and the owner confirms intervening in-game changes: this pass has +1 generic entity, +1 unlocked rectangle, and +1 placed entity key; roads and blocked positions are unchanged. These differences do not by themselves indicate source-schema drift. The fixture itself contradicts treating every coordinate or street requirement as an explicitly present value. It does not prove those omissions' meanings.

## H. Remaining uncertainty

- Source serialization rule for omitted x/y on entities, areas, and blocked positions.
- Whether absent street-level metadata means no requirement for each definition format.
- Meaning of blocked positions and whether any require excluding otherwise unlocked cells.
- Which special/off-grid/linked classes may be rearranged safely, and whether `main_building` always identifies the road root.
- Verified game build, second city/world/schema variant, later source drift, and update-event coverage beyond #3's one move.
- A pixel-to-grid alignment of every rendered entity is unavailable from the canvas; this is a stated limit of the visual check, not a hidden default in the replay.

## I. Project impact

The fixture gives [#25](https://github.com/FoE-City-Optimizer/city-optimizer/issues/25) a real special-class and omission case, and gives [#26](https://github.com/FoE-City-Optimizer/city-optimizer/issues/26) concrete field-presence and conformance cases. Both gates remain open for critical semantics. ADR-005 and ADR-006 still stand; proposed ADR-011 is not decided by this capture. The fixture is not a solver-valid input and cannot justify calling any rearrangement valid or optimal. No production collector, API upload, or backend retention was introduced.

## J. Recommendation

Publish the reviewed replay and this report for #24. Use it for field-presence, join, exclusion, and conditional geometry tests. Obtain independent evidence for omission and blocked-area semantics in #25/#26, and do not promote the intermediate format to Snapshot v1 by implication.

## K. Follow-up candidates

**Title:** Resolve omitted-coordinate and blocked-area semantics

**Type:** research

**Evidence:** 10/11 entity, 10/11 unlocked-area, and 8/7 blocked x/y omissions; conditional zero interpretation fits one city.

**Why it matters:** Source facts cannot become final geometry without a verified rule.

**Impact if ignored:** A wrong mask or position could produce invalid plans.

**Suggested urgency:** High, before #26 contract acceptance.

**Potential dependency:** #3 and this fixture; independent source or another authorized city/build.

**Title:** Classify special/off-grid mechanics and eligibility

**Type:** research

**Evidence:** Twenty selected nonordinary entries have aggregate counts and, under the diagnostic zero interpretation, all lie outside the unlocked-cell union; individual records were removed from the published fixture for minimization.

**Why it matters:** Geometric fit alone does not prove game eligibility or functional validity.

**Impact if ignored:** Unsupported mechanics could be silently optimized.

**Suggested urgency:** High for #25, before solver modeling.

**Potential dependency:** Existing research #25 and additional authorized observation where needed.

## L. Handoff

Issue #24's fixture, observed-schema, privacy-review, replay, and reconciliation outputs are complete. Architecture & Planning and Backlog Refinement can consume this evidence for the existing #25 and #26 work; they own the separate source-semantic and contract decisions. No new ticket is created here.
