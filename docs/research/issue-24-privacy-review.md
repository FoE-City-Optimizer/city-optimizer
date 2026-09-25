# Issue #24 — fixture publication review

**Review date:** 2026-09-25

**Reviewer:** Research Agent, applying the [Security & Privacy Agent checklist](../ai/prompts/security-privacy.md) to this bounded research artifact.

**Reviewed artifact:** `tests/fixtures/issue-24-reference-replay.json`, SHA-256 `f82c67f23b85bbf06dabb292d24b869d1a470a1d268d2fe9cc6f672538ca4dc1` (90,324 LF bytes). The verifier normalizes Windows CRLF checkout bytes to LF before checking this reviewed hash.

**Decision:** Approved for publication as a sanitized research fixture. Review again if any fixture byte changes.

## Data flow and scope

One authorized, owner-opened Chrome main-city startup response was projected in process memory through the committed [capture rule](issue-24-capture-safety.md). The fixture contains only five ordinary on-grid classes and their definition joins, unlocked rectangles, blocked positions, aggregate source counts, aggregate excluded-class counts, and bounded observation metadata. It contains no raw response, request body or header, URL query, cookie, credential, session token, account/social/chat field, player or world identifier, display name, or metadata URL. No backend upload, telemetry, or retention was introduced. The temporary sanitized browser download was deleted after copying and verification.

## Artifact checks

| Check                          | Evidence                                                                                                                                                                                                                                                        | Result |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Strict keys and value types    | `node docs/research/issue-24-replay.mjs` checks every nested object against an allowlist, fixed observation strings/paths, pseudonym patterns, enum classes, numeric geometry, positive footprints, and a 1 MB cap.                                             | Pass   |
| Direct identifiers and secrets | Raw IDs and static keys are replaced by within-capture pseudonyms. A forbidden-key and URL scan, case-insensitive targeted search, and manual review of the allowed schema found no player/world, credential, token, header, query, account, or social payload. | Pass   |
| Special/off-grid minimization  | The 20 selected nonordinary entries are reduced to five class counts; their individual positions, instance pseudonyms, and definitions are absent. The 399 retained entries include 124 roads and one Town Hall candidate.                                      | Pass   |
| Correlation and utility        | Each retained instance references one pseudonymous definition; all 135 retained placed keys resolve. Road and Town Hall footprint checks and the conditional geometry replay pass. No reverse map or cross-capture key is published.                            | Pass   |
| Raw-data lifecycle             | The single selected raw response was held in process memory for projection, never written as a file or emitted in tool output. Observation was disabled, in-memory variables were cleared, and the temporary sanitized download's removal was verified.         | Pass   |

## Residual risk and decision rationale

The relative city outline and ordinary building placement remain distinctive. Someone who already possesses an identifiable image or map of this same city might recognize the layout. This is the irreducible cost of a real-city geometric regression case; arbitrary shape or placement changes would invalidate the evidence this issue requests. The fixture removes direct account/world links and all nonessential special-entity positions. It is a single captured state, and pseudonyms are regenerated on refresh. The remaining game-layout disclosure is accepted for this research fixture under the owner's instruction to complete the ticket. It is **not** approval to collect, upload, or retain future users' city snapshots by default.

This review does not settle source semantics. Missing coordinates and street fields remain absent in the fixture, blocked positions remain uninterpreted, and the `main_building` type remains a candidate Town Hall discriminator outside this one case. Those uncertainties are recorded in the [research report](issue-24-real-city-fixture.md) for #25 and #26. They do not require adding private fields to this artifact.
