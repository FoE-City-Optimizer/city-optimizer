# Issue #40 temporary Chrome observation probe

**Status:** uninstalled research prototype. A Security & Privacy review of this exact directory is required before owner installation. It is not a production collector, canonical snapshot, or city map.

The manifest matches only the previously scoped `https://pl4.forgeofempires.com/game/*` world and top frame. The MAIN script observes successful same-origin `/game/json` XHR completions without pausing or changing responses. It selects `StartupService.getData.responseData.city_map` and `CityMapService.moveEntities.responseData` only. It retains source IDs and selected coordinates in page memory to count changes, then sends **counts and status codes only** to the isolated script. The isolated script displays an on-page diagnostic panel. No runtime service worker, extension permissions, file write, storage, upload, telemetry, or game action is used.

The diagnostic is intentionally partial: it does not load metadata definitions, infer omitted coordinates, interpret street requirements, or produce a complete live map. `partial` means selected source fields were observed but geometry/requirements remain incomplete. `stale` means the startup source was missed or a move references an unknown identity. `unsupported` means a selected field shape or class changed. A page script can forge the page-message event; this is a controlled observation aid, not an authenticity boundary.

## Local checks

```text
node docs/research/issue-40-chrome-probe/check-probe.mjs
node --check docs/research/issue-40-chrome-probe/main.js
node --check docs/research/issue-40-chrome-probe/bridge.js
```

## Conditional owner installation and cleanup

After Security & Privacy approves the exact files, the owner may open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this directory. The owner opens the already authorized main city and reloads it once. The owner performs any representative move; the probe only observes. Record only the panel's aggregate counts, source/status, Chrome version, asset fingerprint if separately observed, and action category in a research report. Do not save game screenshots, request payloads, page URLs, or a full response. The panel's **Hide** button hides it for the current page only.

After observation, the owner removes **FoE Issue 40 Read-only City Probe (Temporary)** from `chrome://extensions` and reloads the game tab. That reload restores native `XMLHttpRequest` methods and removes the panel. Verify the panel does not reappear. Any change to these files requires another design review before installation.
