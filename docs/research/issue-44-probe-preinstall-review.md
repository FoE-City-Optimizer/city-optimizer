# Issue #44: pre-installation review of the exact #40 Chrome probe

**Date:** 2026-09-26. **Role:** Research. **Status:** evidence and recommendation for the Security & Privacy decision; this report is not that role's installation approval. No live game observation occurred.

## A. Research question

Do the exact files merged in PR #42 keep one owner-operated Chrome startup and reversible change within the project's read-only, minimized observation boundary? Which limitations or repairs must the Security & Privacy reviewer state before issue #45 can proceed?

## B. Executive conclusion

**High confidence from static inspection and local synthetic checks:** the submitted probe is scoped to one HTTPS world and the top-level `/game/` page; its code observes successful same-origin `/game/json` XHR, selects two service methods, and projects aggregate counts/status to a local panel. It contains no storage, upload, privileged extension API, credential/header access, gameplay request, or gameplay automation. The source IDs and coordinates used for move comparison stay in the MAIN script's page memory.

**Technical recommendation, not installation approval:** a short owner-operated diagnostic run is supportable if Security & Privacy accepts the residual page-forgery and performance risks, confirms authorization for this exact world, limits the run to one reload and one reversible owner action, and requires removal followed by a page reload. The owner has explicitly directed that the general game-rule ambiguity must not block further work. The [FoE Helper Chrome Web Store listing](https://chromewebstore.google.com/detail/foe-helper/bkagcmloachflbbkfmfiggipaelfamdf) provides a current precedent for a read-only helper, while its publisher's compatibility statement is not an InnoGames authorization of this probe. The panel remains untrusted and partial.

## C. Project assumptions before this review

- Accepted [ADR-006](../adr/006-read-only.md) requires minimal read-only acquisition; the [charter](../project/project-charter.md) forbids gameplay automation, secrets, unrelated account/social data, and raw network archives.
- The [#40 research report](issue-40-city-viewer.md) and [pre-review inventory](issue-40-privacy-review.md) identify this probe as uninstalled and untested on the live city. Its synthetic checks do not prove a complete map or current source behavior.
- The [M1 reconciliation plan](../backlog/m1-edge-layout-reconciliation.md) makes #45's live owner check dependent on #44's Security & Privacy review. The probe reports counts, not the missing edge coordinates.

## D. Sources and evidence

| Type | Reference and date/version | What it supports | Limit |
| --- | --- | --- | --- |
| Governing issue | [Issue #44](https://github.com/FoE-City-Optimizer/city-optimizer/issues/44), retrieved 2026-09-26 | Exact files, exit evidence, no-live-observation boundary | The issue requests a Security & Privacy decision; this Research role cannot confer it |
| Exact repository source | PR #42 commit `534901c8e0c3071796b5b4b0596fed6e9b351c9a`; [manifest](issue-40-chrome-probe/manifest.json), [MAIN script](issue-40-chrome-probe/main.js), [bridge](issue-40-chrome-probe/bridge.js), [check](issue-40-chrome-probe/check-probe.mjs), [instructions](issue-40-chrome-probe/README.md), and [inventory](issue-40-privacy-review.md) | Actual permissions, routing, fields, lifecycle and stated limits | Static source does not establish Chrome/game runtime compatibility |
| Local check | `node docs/research/issue-40-chrome-probe/check-probe.mjs` and `node --check` on both scripts, 2026-09-26 | Existing synthetic main-script cases and JavaScript syntax pass | The harness does not exercise the bridge, malicious page behavior, resource exhaustion, or live XHR |
| Official browser documentation | [Chrome content script manifest](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts), retrieved 2026-09-26 | Static match patterns; `all_frames` defaults to false | Browser documentation, not a live test of this game |
| Official browser documentation | [Chrome execution worlds](https://developer.chrome.com/docs/extensions/reference/api/scripting#type-ExecutionWorld) and [extension security guidance](https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure), retrieved 2026-09-26 | MAIN shares the page's JavaScript environment; the isolated script still interacts with page DOM | Does not authenticate data originating in the page |
| Web API documentation | [MDN `postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), retrieved 2026-09-26 | Meaning and limits of origin/source checks | General API behavior, not proof that a diagnostic event came from the collector |
| Game operator rule | [Forge of Empires Polish support rules, section 6 and 9.2](https://support.innogames.com/kb/ForgeOfEmpires/pl_PL/98), retrieved 2026-09-26; page says last rule change 2015-09-01 | Broad prohibition of bots/scripts and final Polish Community Management interpretation | The examples concern automation; the page does not expressly address passive observation extensions or this probe |
| Comparable extension listing | [FoE Helper, Chrome Web Store](https://chromewebstore.google.com/detail/foe-helper/bkagcmloachflbbkfmfiggipaelfamdf), retrieved 2026-09-26; listing version 4.8.2.0, updated 2026-09-07 | A current, widely used extension whose publisher describes passive reading without gameplay automation and asserts it is permitted | Chrome Web Store listing and publisher assertion do not establish game-operator endorsement or approval of this exact probe |

For exact-file identification, SHA-256 values are: `manifest.json` `92c45a22616c095125662f4e0c1ba8b1c9969ad8f55e5bc907b49dbeb9960c82`; `main.js` `71ef17ab5fc258da3978b4acd7798cb25d34e6e6e1517b8b5664e601571cc0b7`; `bridge.js` `f8f634de3dfcefac0eb1954f8536f66d199d2b6ab0b3b7f46d98b2faad5556ca`; `check-probe.mjs` `0e84bb16a71ca4db7672c2810a61d778092bb2c78fe17f07fb81ca5a6897460e`; `README.md` `c20f564daf7811897f190df7ec622b69139b7963ce43971cfcabe1f00ce382c8`; `issue-40-privacy-review.md` `347368ed4830b6a2d715e4b44ccf02e8fda32330faa05c0b8f66a9f4fc70f6f8`.

## E. Findings

### Verified from the exact source

- **Host and frame:** both manifest entries match only `https://pl4.forgeofempires.com/game/*`; Chrome's omitted `all_frames` defaults to false, and both scripts also reject a different origin/path or `window !== window.top`. There is no `permissions`, `host_permissions`, background worker, or web-accessible resource declaration.
- **Read boundary:** `main.js` wraps `XMLHttpRequest.open/send` and listens for `loadend` on XHRs whose URL resolves to the exact same-origin `/game/json` path. It processes status `200` only, then selects `StartupService.getData.responseData.city_map` and `CityMapService.moveEntities.responseData` from a response array. It does not intercept request bodies/headers, call `fetch`, or issue a game request.
- **Temporary fields:** startup validation reads entity `id`, `cityentity_id`, `type`, `x`, `y`; it counts roads; unlocked areas contribute `x`, `y`, `width`, `length`; blocked areas contribute position presence. A `Map` holds entity identifiers, class, static entity key and coordinates in page memory for subsequent move comparison. The bridge receives none of those IDs, keys, coordinates or dimensions.
- **Outgoing fields:** the only `postMessage` envelope has `type`, `version`, `source`, `state`, `reason`, `entities`, `roads`, `areas`, `blocked`, three missing-position counts, `updateEntries`, and `changedPositions`. The bridge accepts exactly those keys, enumerated text values, safe integer counts from 0 through 10,000, and at most 32 accepted events. It uses `textContent` in the panel. No code stores or uploads the envelope.
- **Lifecycle:** the documented owner procedure loads this unpacked directory, reloads the authorized city, performs the change manually, removes the extension, and reloads the tab to restore the native XHR methods and remove the panel. Hiding the panel alone does not remove the hook.

### Likely but unverified in the live environment

- The selected service paths may still be present in the owner's current game version, and the XHR wrapper may remain compatible through a real startup and move. The local harness proves neither.
- A one-reload, one-change run is unlikely to hit the processing bounds in ordinary use. No representative live response sizes or event rates were measured.

### Inferences and trust limits

- The page can send a schema-valid `foe40/summary` message from the same window and origin. The bridge's checks constrain shape and values, but cannot establish that the MAIN collector produced the event. A page script can also change the panel DOM. Forged events can consume the 32 accepted-event allowance. Treat all displayed counts as diagnostic observations, never authoritative city facts.
- The 32-event limit restricts messages, **not observation work**: the XHR hook continues parsing/iterating after `emitted` reaches 32. The 6,000,000-character guard applies only to text response parsing; `responseType === "json"` has no analogous local size cap, and the top-level response array has no entry cap. The three selected city arrays are capped at 10,000 entries each. These are bounded-run performance and noninterference risks, not evidence of exfiltration.
- The code initially reads or parses the containing `/game/json` response to find selected service entries. It does not persist or relay unrelated entries, but the phrase "selects only two services" does not mean unrelated entries are never transiently present in memory.
- A successful `partial` event proves only that the selected shapes passed this probe's checks. It does not authenticate game facts, prove all source entries were seen, establish complete geometry or blocked-area semantics, resolve omitted axes, join building definitions, classify street demand, or validate a solver input.
- The game operator's rule is broader than this project's read-only technical boundary. No gameplay automation is visible in this probe. The FoE Helper precedent and the owner's explicit direction support continuing the scoped technical review, while neither proves game-operator approval of these exact files.

## F. Reproduction and review method

From repository root:

```text
git show -s --format='%H %ci %s' 534901c8
git ls-files -s docs/research/issue-40-chrome-probe docs/research/issue-40-privacy-review.md
shasum -a 256 docs/research/issue-40-chrome-probe/* docs/research/issue-40-privacy-review.md
node docs/research/issue-40-chrome-probe/check-probe.mjs
node --check docs/research/issue-40-chrome-probe/main.js
node --check docs/research/issue-40-chrome-probe/bridge.js
```

All three Node checks passed in this workspace on 2026-09-26. The review traced every manifest key and script call that can read source responses, move fields across worlds, display data, persist data, send network traffic, or act on the game. It did not load the extension or touch a live game session.

## G. Contradictions discovered

- The existing [privacy inventory](issue-40-privacy-review.md) describes a 6 MB text cap and 32 diagnostics under "Resource and lifecycle." Those are real controls, but they do not cap JSON response size, top-level array iteration, or ongoing processing after the message cap. Its resource-bound implication is too broad.
- The probe's [README](issue-40-chrome-probe/README.md) says it selects two services; that is true of the output logic, while JSON parsing necessarily materializes a full text response before service selection. This is still transient local processing under the stated design, but should be explicit in approval limits.
- No accepted ADR or charter premise is contradicted by the inspected source. Live compatibility and noninterference remain unverified.
- The charter's read-only extension premise is not invalidated by the official Polish rule. The rule is broad, its examples focus on automation, and the current FoE Helper listing presents a passive-reading precedent. The precise game-operator interpretation remains unverified and should not be represented as official approval.

## H. Remaining uncertainty

Whether Polish Forge of Empires Community Management has explicitly approved this passive observer; current Chrome and game build; whether the live client uses selected XHRs or another transport; actual payload sizes and event rates; wrapper interaction with other scripts; and whether page-origin events are trustworthy enough for a qualitative freshness check. No live observation may answer these within issue #44.

## I. Project impact

The probe can inform #45's narrow current-source check after the issue's Security & Privacy technical decision; the owner has removed game-guideline clarification as an additional project gate. This Research report does not change an ADR or architecture. The probe cannot settle #43's omitted-coordinate rule, #48's full geometry derivation, Snapshot v1 authority, production collector design, solver eligibility, or any optimality claim. Security posture remains local read-only observation with untrusted page output; the owner must not publish a panel screenshot or a recognizable layout without separate review.

## J. Recommendation for the Security & Privacy decision

**Current recommendation: proceed with the technical Security & Privacy decision for these exact hashes.** The owner has accepted the research limits and explicitly directed that general rule ambiguity not block this work. If Security & Privacy accepts the bounded-run resource risk, its approval should permit only:

1. Host: `https://pl4.forgeofempires.com/game/*`, top frame, one already authorized owner-opened main city.
2. Operation: one owner-initiated page reload for startup, one reversible owner-performed city change, then immediate removal and page reload. No agent-driven gameplay action.
3. Fields: the temporary source fields and aggregate bridge envelope listed in section E; record only source/status and aggregate counts, Chrome version, separately observed asset fingerprint, and action category. Do not record IDs, coordinates, raw responses, request URLs/queries, headers, credentials, social/account data or screenshots.
4. Duration: only the active observation session; no background or repeated monitoring. The owner removes the unpacked extension in `chrome://extensions`, reloads the game tab, and checks that the panel does not reappear. A non-reappearing panel is a cleanup indicator, not proof that no other page code is active.
5. Interpretation: counts are page-origin, forgeable, partial and possibly stale. Stop on unexpected output, visible game disruption, or a different host/source shape. Re-review any changed probe bytes.

If the reviewer requires a **hard processing cap** before installation, the minimum repair is to stop inspecting XHR completions once the diagnostic budget is spent, cap the top-level response entries inspected, and document that an already parsed JSON response cannot be made byte-bounded by this script. Extend the synthetic harness to cover those limits and a forged valid bridge message. That repair changes exact files and must itself be reviewed. A stronger authenticity guarantee is outside this disposable probe's design and should not be represented as fixed by a nonce or origin check in page-owned code.

## K. Follow-up candidates

| Title | Type | Evidence | Why it matters / impact if ignored | Suggested urgency | Potential dependency |
| --- | --- | --- | --- | --- | --- |
| Decide exact-probe installation boundary | security | This review and issue #44 require a Security & Privacy decision | Without signoff, #45's owner check remains blocked; an implicit approval would bypass the stated gate | Before #45 | Security & Privacy review of these hashes |
| Bound disposable probe processing if required | research | Message cap does not stop work; JSON and top-level array paths lack local bounds | Repeated or unusually large responses could degrade the page during observation | Before installation if the reviewer rejects the current residual risk | Security & Privacy decision; changed-file review |
| Verify current source freshness | research | Probe has only synthetic data and #24 is a dated single-city fixture | A stale service path or different update shape could be mistaken for current coverage | After approval | #45 owner-operated live check |
| Track game-operator guidance for passive extensions | research | Official rules are broad; the FoE Helper publisher asserts passive reading is permitted | Avoid claiming an InnoGames endorsement that was not verified | Optional, outside #44's technical gate | Official support or Community Management statement if available |

## L. Handoff

**Research handoff completed:** Security & Privacy issued the separate [file-version-specific decision](../security/issue-44-probe-decision.md) after owner acceptance. #45 is the separate owner-operated Research pass. Backlog Refinement owns any later ticketing. The Chrome Web Store listing is precedent, not verified InnoGames endorsement.

## Issue #44 exit audit (2026-09-26)

| Criterion | Status | Evidence or gap |
| --- | --- | --- |
| Review exact PR #42 files and privacy inventory | Met as Research evidence | Commit and six file hashes in section D; findings in section E |
| Address host, services, parsing, IDs, bridge forgery, limits, XHR, storage/upload/action, and cleanup | Met as Research evidence | Sections E–J and passing local checks |
| Name permitted fields, host, operation, duration, owner instructions, and residual risks | Met as a proposed boundary | Section J; it is explicitly a recommendation |
| File-version-specific **Security & Privacy decision** approving or rejecting installation | Met | Separate [Security & Privacy decision](../security/issue-44-probe-decision.md) approves one bounded run for the six exact hashes |
| No live game observation in this issue | Met | The extension was not installed or run by this review |

The Research Agent's scope and the issue's Security & Privacy decision are complete. The probe itself is unchanged. No live check is part of this issue; #45 owns that observation.
