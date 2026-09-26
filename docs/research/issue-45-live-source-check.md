# Issue #45 — current Chrome startup and change check

**Research status:** One owner-operated live observation and cleanup recorded; [Security & Privacy assessed the protocol deviation](../security/issue-45-live-run-assessment.md). **Observed:** 2026-09-26, Europe/Warsaw. This report concerns a diagnostic source check, not a complete city capture. The owner performed two building changes and restored them, exceeding the reviewed single-change procedure; no repeat run is proposed here.

## A. Research question

Does the exact, Security & Privacy-approved #40 probe still observe the selected startup source and one reversible owner-performed city change on the current `pl4` main city? Do its bounded counts still resemble the older #24 capture?

## B. Executive conclusion

**The selected source path still produced a startup summary and one observed move summary on the tested city, with high confidence in what the local panel displayed and limited confidence in the underlying page facts.** The startup aggregates exactly match #24's older capture: 419 entities, 124 roads, 234 unlocked-area records, 49 blocked records, and missing positions of 21/21/14. The observed action line reported a `partial update` with one entry and one position change. The owner reports moving two buildings and restoring both. The panel replaces its prior line, so this record cannot account for every action response or establish that the city layout is unchanged. The extension was removed and the game tab reloaded. The extra owner actions fall outside #44's single-change procedure; [the Security & Privacy assessment](../security/issue-45-live-run-assessment.md) permits use of these two lines only as narrow, untrusted source-continuity evidence.

## C. Project assumptions before research

The [#24 reference capture](issue-24-real-city-fixture.md) observed 419 source entities, including 124 streets; 234 unlocked-area records; 49 blocked-area records; 21 entities, 21 unlocked areas, and 14 blocked records lacking at least one position axis. That capture was from 2026-09-25 and cannot establish today's source freshness. The [#40 report](issue-40-city-viewer.md) describes a partial replay and an uninstalled diagnostic probe. The [#44 decision](../security/issue-44-probe-decision.md) approves one owner-operated run of six exact files, not production collection or full geometry.

## D. Sources and evidence

| Type                   | Reference and date                                                                                                                                                | What it proves                                                               | Limitation                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope                  | [Issue #45](https://github.com/FoE-City-Optimizer/city-optimizer/issues/45), read 2026-09-26                                                                      | Required single startup/change check, exit evidence, prohibited collection   | Requirement, not live evidence                                                                                                                                                |
| Gate                   | [Issue #44](https://github.com/FoE-City-Optimizer/city-optimizer/issues/44) and [exact-file decision](../security/issue-44-probe-decision.md), checked 2026-09-26 | #44 is closed, decision attached, one bounded owner run approved             | Does not establish current game behavior                                                                                                                                      |
| Prior city             | [#24 report](issue-24-real-city-fixture.md) and [#40 viewer report](issue-40-city-viewer.md), 2026-09-25–26                                                       | Historical counts and explicit gaps                                          | One city, older capture; position semantics unresolved                                                                                                                        |
| Static verification    | Six SHA-256 hashes in #44 decision, checked locally 2026-09-26                                                                                                    | Checked-out probe and review files match the approved bytes                  | Does not prove installation or runtime behavior                                                                                                                               |
| Synthetic verification | `node docs/research/issue-40-chrome-probe/check-probe.mjs` and `node --check` on both scripts, run 2026-09-26                                                     | Synthetic selected startup/move handling passes; scripts parse               | Fake XHR environment, not live Chrome                                                                                                                                         |
| Live observation       | Owner-opened `pl4` main-city Chrome tab; panel accessibility text, 2026-09-26 04:52–04:53 Europe/Warsaw                                                           | Startup and one selected move signal reached the panel with the counts below | One session; page output is untrusted and panel messages can be forged; no raw response examined; owner performed more manual changes than the single-change protocol allowed |
| Cleanup                | Owner report plus Chrome extension-list and reloaded game-tab accessibility checks, 2026-09-26                                                                    | Temporary probe absent from the list and panel absent after game reload      | Does not prove no other copy exists on disk; the visible Desktop copy remains a local source folder                                                                           |

## E. Findings

**Verified fact:** The six checked-out files match every SHA-256 in the #44 decision. The probe synthetic check and both script syntax checks pass. #44's GitHub issue is closed with the decision linked in its comments.

**Verified diagnostic observation:** The panel displayed the startup line at 04:52:18 and action line at 04:53:32. Startup counts match the prior #24 aggregates exactly. The action line reports one update entry and one changed position. The reviewed source code maps these displayed lines to `startup`/`partial`/`definitions-unobserved` and `move`/`partial`/`partial-update`, respectively; the reason codes are inferred from the reviewed formatter rather than printed by the panel. The running Chrome version read from `chrome://version` after cleanup was 151.0.7922.138 (arm64). Separately, the on-disk Chrome executable returned 154.0.8037.57 from `--version`; the running version is the relevant version for this test. The owner reports two building changes and restoring both to their original places. Chrome's extension manager subsequently did not list the probe, and the reloaded game tab had no probe panel.

**Likely but unverified:** The selected source shape still resembles #24 for the listed aggregates. The city layout and individual source fields may differ even when counts match. The owner's restoration statement is not a tile-by-tile verification.

**Inference:** The selected startup and move service paths are fresh enough to produce this probe's expected signals in this one run. The `partial` signals are only selected aggregate diagnostics; the panel is forgeable and does not prove complete geometry, complete update coverage, or solver eligibility.

## F. Reproduction / experiment details

The permitted owner procedure is in the [#44 decision](../security/issue-44-probe-decision.md). The exact five probe files were copied to `~/Desktop/foe-issue-40-reviewed-probe` for the owner's Chrome file chooser; their hashes were verified equal to the approved source files after copying. The owner loaded the unpacked directory at `chrome://extensions` on their already authorized `pl4` main city and reloaded once. The agent read only the diagnostic panel's accessibility text, without capturing a game screenshot or raw response. The owner then performed manual building changes. The agent read one resulting panel line. The owner reports moving two buildings and restoring both, which is beyond the decision's one-change limit. Observation stopped; the owner removed the extension and reloaded the game tab. Chrome's extension list and the post-reload game tab confirmed cleanup. No agent gameplay action occurred. No missing/stale/unsupported signal or disruption was observed in the two retained panel lines.

The panel replaces its prior line after an event, so the startup line must be recorded before the change. Record local timestamps, Chrome version, an independently observed asset basename if safely available, action category, and only panel source/status/counts. Do not retain IDs, coordinates, screenshots, raw responses, headers, query values, credentials, session data, unrelated account/social fields, or a recognizable layout. The asset basename is a fingerprint, not a verified game build.

### Timestamped source/status matrix

| Local time (Europe/Warsaw) | Stage                             | Source          | State / reason                                                                 | Aggregate counts or diagnostic                                                                                      | Evidence status                       |
| -------------------------- | --------------------------------- | --------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 2026-09-26 04:52:18        | Startup after one reload          | `startup` XHR   | `partial`; `definitions-unobserved` per reviewed formatter                     | 419 entities; 124 roads; 234 area records; 49 blocked records; missing positions: 21 entities, 21 areas, 14 blocked | Panel accessibility text observed     |
| 2026-09-26 04:53:32        | Observed owner action response    | `move` response | `partial`; `partial-update` per reviewed formatter                             | 1 update entry; 1 position change; startup totals may now be stale                                                  | Panel accessibility text observed     |
| 2026-09-26, after 04:53:32 | Extension removal and game reload | N/A             | Probe absent from Chrome's extension list; panel absent from reloaded game tab | N/A                                                                                                                 | Owner report and accessibility checks |

### Environment and comparison

| Item                                                          | Result                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Chrome version used in live run                               | Running Chrome 151.0.7922.138 (arm64), read via `chrome://version` after cleanup                        |
| Game asset basename, if safely observed                       | Not observed in this run; no game build inferred                                                        |
| Owner action category                                         | Two buildings moved and restored, per owner report; only one move-response panel line retained          |
| Comparison with #24 aggregate counts and owner's current city | All seven listed startup aggregates match #24 exactly; individual layout resemblance remains unverified |

## G. Contradictions discovered

No count contradiction with #24 was observed. The action update explicitly warns that startup totals may now be stale; matching startup totals must not be described as a current-city inventory after the change. No `stale` or `unsupported` panel signal appeared in the two retained lines. The owner's two building changes and reversals exceeded the exact one-change operation approved in #44. The [Security & Privacy assessment](../security/issue-45-live-run-assessment.md) allows the two retained diagnostics to be used with the deviation disclosed; it does not retroactively authorize the extra actions or make this a compliant run. This run's `chrome://version` value, 151.0.7922.138, differs from #24's reported 154.0.8037.58 and the currently installed executable's 154.0.8037.57. The reason for the version difference was not investigated; this run establishes behavior only for the running Chrome 151 instance. No accepted ADR is contradicted.

## H. Remaining uncertainty

The probe cannot resolve omitted-coordinate semantics, blocked-area meaning, road demand, per-cell edge placement, complete update coverage, or production collector readiness. The current-city layout may differ from #24 despite matching counts. The single retained action line cannot account for each reported building change or reversal. No game asset fingerprint was observed. Any expanded field capture needs a separate narrow design and review.

## I. Project impact

The startup and move signals provide narrow M1 current-source freshness evidence for this tested city/source variant and show that #24's aggregate count case remains relevant. The procedure deviation reduces confidence in the run as a reviewed protocol execution, though the two retained panel lines remain observed diagnostics. They cannot change Snapshot v1 authority, accepted ADRs, domain rules, contracts, or solver eligibility. No security boundary beyond the approved one-run probe is established.

## J. Recommendation

Use the two observed lines only as a narrow selected-source continuity signal under the [Security & Privacy assessment](../security/issue-45-live-run-assessment.md); retain #24 as a historical fixture and keep full geometry and solver-validity claims gated on their separate research. Never represent this run as fully compliant with #44's one-change condition. Do not repeat or expand the observation without a new decision.

## K. Follow-up candidates

| Title                                     | Type     | Evidence                                                                                   | Why it matters                                                      | Impact if ignored                               | Suggested urgency             | Potential dependency                                         |
| ----------------------------------------- | -------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| Resolve current-city edge geometry        | research | 21 entities and 21 areas still lack an axis in the live startup diagnostic, matching #24   | A complete current-city grid needs evidence-backed positions        | A partial layout could be presented as complete | Before authoritative geometry | Existing #43/#48 work and owner visual comparison            |
| Establish update coverage beyond one move | research | Only one selected `move` response was observed; the panel says startup totals may be stale | A collector must know whether later actions preserve complete state | A stale city snapshot could be accepted         | Before production collector   | Architecture & Planning design and Security & Privacy review |

Backlog Refinement owns any ticket decision. No successor issue is created here.

## L. Handoff

**Next roles: Architecture & Planning and Backlog Refinement.** Security & Privacy completed the [specific deviation assessment](../security/issue-45-live-run-assessment.md). These roles should consume the narrow source freshness and gap report; Backlog Refinement owns any follow-up ticket decision. No production collector approval follows.
