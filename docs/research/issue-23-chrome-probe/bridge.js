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

  const state = {
    bridgeReadyState: document.readyState,
    accepted: 0,
    rejected: 0,
    runtimeAccepted: 0,
    runtimeRejected: 0,
    startup: false,
    metadata: false,
    move: false,
    xhr: false,
    fetch: false,
    mainReadyState: null,
  };

  function publish() {
    if (document.documentElement) {
      document.documentElement.setAttribute(
        "data-foe23-probe",
        JSON.stringify(state),
      );
    }
  }

  function hasExactKeys(value, keys) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === keys.length &&
      keys.every((key) => Object.hasOwn(value, key))
    );
  }

  function project(value) {
    if (value?.type !== "foe23/research" || value.version !== 1) {
      return null;
    }
    if (JSON.stringify(value).length > 256) {
      return null;
    }
    if (value.phase === "init") {
      if (
        !hasExactKeys(value, ["type", "version", "phase", "readyState"]) ||
        !["loading", "interactive", "complete"].includes(value.readyState)
      ) {
        return null;
      }
      return {
        type: "foe23/research",
        version: 1,
        phase: "init",
        readyState: value.readyState,
      };
    }
    if (
      value.phase !== "source" ||
      !hasExactKeys(value, [
        "type",
        "version",
        "phase",
        "transport",
        "startup",
        "metadata",
        "move",
      ]) ||
      !["xhr", "fetch"].includes(value.transport) ||
      typeof value.startup !== "boolean" ||
      typeof value.metadata !== "boolean" ||
      typeof value.move !== "boolean"
    ) {
      return null;
    }
    return {
      type: "foe23/research",
      version: 1,
      phase: "source",
      transport: value.transport,
      startup: value.startup,
      metadata: value.metadata,
      move: value.move,
    };
  }

  function sendToRuntime(event) {
    chrome.runtime.sendMessage({ schema: 1, event }, (reply) => {
      if (
        chrome.runtime.lastError ||
        !reply ||
        reply.ok !== true ||
        reply.code !== "accepted"
      ) {
        state.runtimeRejected++;
      } else {
        state.runtimeAccepted++;
        if (event.phase === "init") {
          state.mainReadyState = event.readyState;
        } else {
          state[event.transport] = true;
          state.startup ||= event.startup;
          state.metadata ||= event.metadata;
          state.move ||= event.move;
        }
      }
      publish();
    });
  }

  window.addEventListener("message", (message) => {
    try {
      if (message.data?.type !== "foe23/research") {
        return;
      }
      if (message.source !== window || message.origin !== ORIGIN) {
        state.rejected++;
        publish();
        return;
      }
      const event = project(message.data);
      if (!event) {
        state.rejected++;
        publish();
        return;
      }
      if (state.accepted >= 128) {
        return;
      }
      state.accepted++;
      publish();
      sendToRuntime(event);
    } catch {
      state.rejected++;
      publish();
    }
  });

  // This deliberately invalid internal message tests runtime schema rejection.
  chrome.runtime.sendMessage(
    { schema: 1, event: { type: "invalid" } },
    (reply) => {
      if (chrome.runtime.lastError || reply?.ok === false) {
        state.runtimeRejected++;
      }
      publish();
    },
  );
  document.addEventListener("DOMContentLoaded", publish, { once: true });
  publish();
})();
