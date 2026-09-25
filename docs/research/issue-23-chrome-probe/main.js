"use strict";

(() => {
  const ORIGIN = "https://pl4.forgeofempires.com";
  if (
    location.origin !== ORIGIN ||
    !location.pathname.startsWith("/game/") ||
    window.top !== window
  ) {
    return;
  }

  const initialReadyState = document.readyState;
  let emitted = 0;
  const post = (value) => {
    if (emitted >= 128) return;
    emitted++;
    window.postMessage(value, ORIGIN);
  };
  const base = { type: "foe23/research", version: 1 };
  const event = { ...base, phase: "init", readyState: initialReadyState };
  let genericXhrSeen = false;
  let fetchSeen = false;

  function target(url) {
    try {
      const parsed = new URL(url, location.href);
      return parsed.origin === ORIGIN && parsed.pathname === "/game/json";
    } catch {
      return false;
    }
  }

  function summarize(response) {
    const rows = Array.isArray(response) ? response : [];
    let startup = false;
    let metadata = false;
    let move = false;
    for (const row of rows) {
      if (
        row?.requestClass === "StartupService" &&
        row.requestMethod === "getData"
      ) {
        startup ||= !!row.responseData?.city_map;
      }
      if (
        row?.requestClass === "StaticDataService" &&
        row.requestMethod === "getMetadata"
      ) {
        metadata = true;
      }
      if (
        row?.requestClass === "CityMapService" &&
        row.requestMethod === "moveEntities"
      ) {
        move = true;
      }
    }
    if (startup || metadata || move || !genericXhrSeen) {
      post({
        ...base,
        phase: "source",
        transport: "xhr",
        startup,
        metadata,
        move,
      });
    }
    genericXhrSeen = true;
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const matching = new WeakMap();
  XMLHttpRequest.prototype.open = function (...args) {
    matching.set(this, target(args[1]));
    return Reflect.apply(originalOpen, this, args);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    if (matching.get(this) === true) {
      this.addEventListener(
        "loadend",
        () => {
          if (this.status !== 200) {
            return;
          }
          try {
            if (this.responseType === "json") {
              summarize(this.response);
            } else if (
              this.responseType === "" ||
              this.responseType === "text"
            ) {
              if (this.responseText.length <= 6_000_000) {
                summarize(JSON.parse(this.responseText));
              }
            }
          } catch {
            // Unknown variants are not projected across the boundary.
          }
        },
        { once: true },
      );
    }
    return Reflect.apply(originalSend, this, args);
  };

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
    if (target(url) && !fetchSeen) {
      post({
        ...base,
        phase: "source",
        transport: "fetch",
        startup: false,
        metadata: false,
        move: false,
      });
      fetchSeen = true;
    }
    return Reflect.apply(originalFetch, this, args);
  };

  // These fixed diagnostics contain no game data. They exercise the bridge's rejection path.
  queueMicrotask(() => {
    post(event);
    post({ ...event, unexpected: true });
    post({ ...event, padding: "x".repeat(512) });
    window.dispatchEvent(
      new MessageEvent("message", {
        data: event,
        origin: "https://invalid.example",
        source: window,
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        data: event,
        origin: ORIGIN,
        source: null,
      }),
    );
  });
})();
