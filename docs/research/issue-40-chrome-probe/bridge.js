"use strict";

(() => {
  const ORIGIN = "https://pl4.forgeofempires.com";
  if (
    location.origin !== ORIGIN ||
    !location.pathname.startsWith("/game/") ||
    window !== window.top
  )
    return;
  const keys = [
    "type",
    "version",
    "source",
    "state",
    "reason",
    "entities",
    "roads",
    "areas",
    "blocked",
    "missingEntityPosition",
    "missingAreaPosition",
    "missingBlockedPosition",
    "updateEntries",
    "changedPositions",
  ];
  const sources = new Set(["startup", "move", "xhr"]);
  const states = new Set(["partial", "stale", "unsupported"]);
  const reasons = new Set([
    "definitions-unobserved",
    "partial-update",
    "no-startup",
    "unknown-id",
    "shape",
    "entity",
    "area",
    "blocked",
    "parse",
  ]);
  let received = 0;
  let panel;
  let text;
  let last =
    "Waiting for startup source. Reload the owner-opened main city if needed.";

  function show() {
    if (!document.documentElement || panel) return;
    panel = document.createElement("aside");
    panel.setAttribute("aria-label", "Issue 40 research diagnostic");
    panel.style.cssText =
      "position:fixed;z-index:2147483647;right:12px;bottom:12px;width:290px;max-height:240px;overflow:auto;padding:12px;background:#10212df2;color:#eef9f9;border:2px solid #58d4d0;border-radius:8px;font:12px/1.45 Arial,sans-serif;box-shadow:0 4px 16px #0009;";
    const title = document.createElement("strong");
    title.textContent = "Issue #40 · local city probe";
    panel.append(title);
    text = document.createElement("div");
    text.style.marginTop = "7px";
    text.textContent = last;
    panel.append(text);
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Hide";
    close.style.cssText = "margin-top:8px;padding:3px 9px;";
    close.addEventListener(
      "click",
      () => {
        panel.remove();
        panel = null;
        text = null;
      },
      { once: true },
    );
    panel.append(close);
    document.documentElement.append(panel);
  }
  function valid(event) {
    if (
      !event ||
      typeof event !== "object" ||
      Array.isArray(event) ||
      Object.keys(event).length !== keys.length ||
      !keys.every((key) => Object.hasOwn(event, key)) ||
      event.type !== "foe40/summary" ||
      event.version !== 1 ||
      !sources.has(event.source) ||
      !states.has(event.state) ||
      !reasons.has(event.reason)
    )
      return false;
    return keys
      .slice(5)
      .every(
        (key) =>
          Number.isSafeInteger(event[key]) &&
          event[key] >= 0 &&
          event[key] <= 10000,
      );
  }
  window.addEventListener("message", (message) => {
    if (message.data?.type !== "foe40/summary") return;
    if (
      message.source !== window ||
      message.origin !== ORIGIN ||
      received >= 32 ||
      !valid(message.data)
    )
      return;
    received++;
    const event = message.data;
    const time = new Date().toLocaleTimeString();
    if (event.source === "startup" && event.state === "partial") {
      last = `${time} · startup XHR · partial: ${event.entities} entities, ${event.roads} roads, ${event.areas} area records, ${event.blocked} blocked records. Missing position: ${event.missingEntityPosition} entities, ${event.missingAreaPosition} areas, ${event.missingBlockedPosition} blocked. Footprints and source street requirements unobserved by this probe.`;
    } else if (event.source === "move" && event.state === "partial") {
      last = `${time} · owner action response · partial update: ${event.updateEntries} entries, ${event.changedPositions} position changes. Earlier startup totals may now be stale.`;
    } else {
      last = `${time} · ${event.source} · ${event.state} (${event.reason}). No complete city claim.`;
    }
    show();
    if (text) text.textContent = last;
  });
  document.addEventListener("DOMContentLoaded", show, { once: true });
  setTimeout(() => {
    if (received === 0) {
      last =
        "No selected startup source observed. State: stale. Reload the owner-opened main city if needed.";
      show();
      if (text) text.textContent = last;
    }
  }, 20000);
})();
