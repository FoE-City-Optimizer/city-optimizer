# Issue #45 — Security & Privacy assessment of the live probe run

**Decision, 2026-09-26:** The observed diagnostic lines may be used as **narrow, untrusted source-continuity evidence**, with the protocol deviation disclosed. The run must not be called a clean execution of [#44's one-change approval](issue-44-probe-decision.md), and it grants no permission for another run or a production collector. No evidence available to this review indicates storage, upload, secret access, or agent gameplay action. This is a retrospective risk assessment, not retroactive authorization of the extra owner actions.

## Scope and evidence

The [#45 research report](../research/issue-45-live-source-check.md) records two local panel lines: startup at 04:52:18 and one `move` response at 04:53:32, Europe/Warsaw. The owner reported moving two buildings and restoring both to their original places. That exceeds #44's approved one reversible city change. The research agent retained only the startup and one move aggregate line; the panel overwrites its prior line, so neither the number nor contents of other responses are known. The owner removed the unpacked extension, and the agent verified its absence from Chrome's extension list and the panel's absence after a game-tab reload. The observed startup-to-cleanup sequence was shorter than 15 minutes; exact installation and removal timestamps were not recorded, so the full loaded duration is not proven.

The six reviewed source/review files matched #44's recorded SHA-256 hashes before the run. Five probe files copied to a visible Desktop folder matched their source hashes after copying. There was no probe code change. The only live inspection used the Chrome accessibility tree for the aggregate panel and cleanup checks; no game screenshot, raw response, request header/body, cookie, token, identity, coordinate, or recognizable layout was retained. The on-disk Desktop copy remains a local source folder, not an installed extension.

## Boundary assessment

| Boundary               | Finding                                                                                                                                                                              | Residual limit                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Host and operation     | The exact #44 files retain their one-world, top-frame, same-origin `/game/json` selection. The owner, not the agent, performed the changes.                                          | The extra manual actions breached the approved operation count. Do not describe the procedure as compliant.                                                                                |
| Data minimization      | The observed and retained output is source/status/counts, Chrome version, action category, and cleanup. The unchanged probe has no storage or upload path under #44's static review. | Each additional matching XHR could have caused transient parsing and in-memory selected-ID/position processing. Unretained events cannot be audited afterward.                             |
| Trust                  | The panel displayed plausible startup and move summaries.                                                                                                                            | Page scripts can forge valid messages or alter the panel. Count agreement with #24 is a diagnostic comparison, not authenticated city data.                                                |
| Resource and lifecycle | The owner removed the extension and reloaded the game tab; the probe and its panel were absent afterward. No disruption was reported or observed in the retained checks.             | The XHR hook continued for the extra actions until removal. The probe has no hard top-level JSON size cap and no self-enforced timer; absence of reported lag is not a resource benchmark. |
| Game and account data  | The agent did not click, move, or automate in the game. No prohibited data was intentionally recorded.                                                                               | The assessment cannot prove that no unobserved browser or page behavior occurred.                                                                                                          |

## Risk disposition

The extra actions increased the number of opportunities for the same fixed probe to inspect selected responses. They did not widen its host match, selected fields, bridge message schema, or network privileges. The supervised session and verified removal constrain the exposure. On this evidence, there is **no basis to treat the reported deviation as a data disclosure or to discard the two aggregate lines**. There is also no basis to claim complete observation of every reported building move or reversal, runtime noninterference, or a validated city state. The security conclusion is limited to what the unchanged code and recorded cleanup support.

The report may be published with this deviation and uncertainty visible. No raw city fixture, image, coordinate list, or new data source is approved. The Desktop source copy should not be mistaken for a remaining installed extension; removing that local copy is ordinary workspace cleanup and not a condition of this evidence decision.

## Checks and unresolved decisions

- Confirmed #44's file-specific approval and permitted fields, host, operation, and duration.
- Confirmed all six local SHA-256 hashes and the five copied probe-file hashes matched the approved values.
- Ran the unchanged probe's synthetic check and both JavaScript syntax checks; all passed.
- Read only the panel's aggregate accessibility text, the running `chrome://version` value, Chrome's post-removal extension list, and the reloaded game's absence of the panel.
- Did not independently verify the owner's exact game placements, every update response, or the running page's internal provenance. No separately observed asset fingerprint was recorded.

No change to [#44's historical pre-installation decision](issue-44-probe-decision.md) or the accepted ADRs follows. A repeated or broader observation needs a separately scoped Security & Privacy review, including processing limits and a plan for update coverage. This assessment does not decide Snapshot v1 or solver eligibility.

**Handoff:** Research may finalize #45 with the two bounded diagnostic lines and this explicit deviation. Architecture & Planning and Backlog Refinement may use the source-continuity observation only within these limits. Security & Privacy has no further action for this one run unless new evidence of disruption or data retention appears.
