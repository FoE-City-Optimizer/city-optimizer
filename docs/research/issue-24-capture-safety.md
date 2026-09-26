# Issue #24: capture rule and privacy review checklist

**Status:** pre-capture research rule, 2026-09-25. This is not a production collector or Snapshot v1 contract.

## Scope and allowlist

Observe only an owner-opened **main city** in Google Chrome. Match the response by origin plus path `/game/json`, select only `StartupService.getData.responseData.city_map` and `StaticDataService.getMetadata.responseData`'s `building_entity_lookup` descriptor, then resolve definitions for **placed** entity keys only. The metadata URL is a fetch instruction in memory; never print or store its query, and store only the path family `/start/metadata` in research notes. No request body, request/response header, or other service response is examined or saved. A later update observation, if needed, selects only `CityMapService.moveEntities.responseData[]`.

Allowed source fields, copied one by one into a local intermediate object:

| Source                                               | Fields                                                                                                    | Purpose                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `city_map.entities[]`                                | `id`, `cityentity_id`, `type`, `x`, `y`                                                                   | Instance join, eligible class, position, roads, Town Hall candidate |
| `city_map.unlocked_areas[]`                          | `x`, `y`, `width`, `length`                                                                               | Available-area candidates                                           |
| `city_map.blocked_areas[]`                           | `x`, `y`                                                                                                  | Blocked-position candidates; semantics remain unknown               |
| `building_entity_lookup` descriptors for placed keys | `identifier`, `url` **in memory only**                                                                    | Resolve required definitions; URL and query excluded from artifacts |
| Selected legacy definition                           | `width`, `length`, `requirements.street_connection_level`                                                 | Footprint and explicit street level                                 |
| Selected generic definition                          | `components.AllAge.placement.size.x`, `.y`, `components.AllAge.streetConnectionRequirement.requiredLevel` | Footprint and explicit street level                                 |

The projector must use own-property checks so omitted values remain explicitly `absent`, including zero-valued coordinates. It must reject unexpected object types, duplicate IDs, unknown entity classes, unrecognized definition shapes, oversize input, and any field outside the intermediate format. It must not infer absent coordinates or street requirements. The fixture is a replay of selected observed facts; it is not an accepted canonical snapshot.

Only `generic_building`, `greatbuilding`, `street`, `main_building`, and `military` instances and their placed definitions enter the replay fixture. For `hub_main`, `hub_part`, `friends_tavern`, `off_grid`, and `outpost_ship`, retain only per-class aggregate counts in `excludedCounts`; discard their instance pseudonyms, positions, and definitions before publication. Record total selected source counts in `sourceCounts` so the omission is explicit. This is an observed-fixture minimization rule, not a general game eligibility decision.

## Pseudonymization and minimization

Do not record player ID/name, account, world, request URLs or queries, state, bonus, connected status, display names, art, production, social data, or other game services. Do not preserve raw response objects in files, logs, messages, issue comments, or the fixture. In memory, sort distinct numeric/string `id` values by `String(a).localeCompare(String(b), 'en')` in the capture's JavaScript runtime and map them to `instance-000001`, `instance-000002`, etc. The same input ID must map to the same pseudonym within one capture, including selected updates. Rebuild the map on a later capture; there is no cross-fixture identity promise or cross-runtime ordering guarantee. Static `cityentity_id` may be retained only if review finds it to be a public catalog key, not an account/world identifier; otherwise sort and map distinct static keys to `entity-000001`, etc. Keep a within-fixture pseudonymous key so entity-to-definition joins survive. Never publish the reverse map.

Normalize integer positions by subtracting the minimum observed unlocked-area `x` and `y` only after the source coordinate semantics are established. This preserves relative geometry but does **not** remove the city's unique shape. Treat the fixture as potentially identifying and require a reviewer to approve the exact projected artifact before commit. No screenshot or exact coordinate list goes in the narrative. Where omission semantics remain unknown, preserve an `absent` marker and mark reconciliation as conditional; do not make the fixture look fully resolved.

## Temporary raw data and deletion

Prefer projection inside the browser page memory. If a raw response must be read for field discovery, keep it only in process memory, scoped to a single selected response, and discard it immediately after allowlisted projection. Never write a HAR, full response, URL query, reverse ID map, browser storage dump, or full-session log. Do not persist the temporary raw object through a tool transcript. Stop observation after the bounded capture. Any temporary raw file created unexpectedly must be removed locally before commit, with its path and deletion outcome recorded privately; a failure blocks fixture publication.

## Review before fixture publication

- [ ] Owner-operated, authorized main-city session; observation time and Chrome version recorded. A game asset name is labeled a fingerprint, not a verified build.
- [ ] Only the selected startup and placed-definition paths were read; no gameplay action was automated.
- [ ] Fixture top-level and nested keys exactly match the documented intermediate format. Reject extras.
- [ ] No player/world identity, persistent instance ID, reverse mapping, URL/query, credentials, cookie, token, headers, chat, social/account data, or unrelated game response survives.
- [ ] Static keys, special/off-grid entries, and relative city geometry were reviewed for possible reidentification; publication decision and residual risk recorded.
- [ ] All absent source fields remain absent, not silently defaulted to zero or `NONE`.
- [ ] Town Hall, roads, footprints, unlocked/blocked candidates, ordinary/special exclusions, and visible-city reconciliation have counts and mismatch notes.
- [ ] Parse/replay twice from fixture alone gives identical counts; a forbidden-field scan and human inspection both pass.
- [ ] Raw in-memory values and any accidental temporary files are discarded before commit.

## Refresh and drift rule

For another game asset fingerprint or city, rerun the same allowlist and privacy review. Compare source path presence, types, omitted-field counts, class distribution, definition join coverage, and geometry invariants. Fail closed and record a new research gap when a critical path changes; do not extend the allowlist or invent defaults during capture. A new fixture needs its own within-fixture pseudonyms and publication review.
