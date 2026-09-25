"use strict";

const ORIGIN = "https://pl4.forgeofempires.com";
const KEYS = ["schema", "event"];

function hasExactKeys(value, keys) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

function validEvent(event) {
  if (event === null || typeof event !== "object" || Array.isArray(event)) {
    return false;
  }
  if (event.type !== "foe23/research" || event.version !== 1) {
    return false;
  }
  if (event.phase === "init") {
    return (
      hasExactKeys(event, ["type", "version", "phase", "readyState"]) &&
      ["loading", "interactive", "complete"].includes(event.readyState)
    );
  }
  return (
    event.phase === "source" &&
    hasExactKeys(event, [
      "type",
      "version",
      "phase",
      "transport",
      "startup",
      "metadata",
      "move",
    ]) &&
    ["xhr", "fetch"].includes(event.transport) &&
    typeof event.startup === "boolean" &&
    typeof event.metadata === "boolean" &&
    typeof event.move === "boolean"
  );
}

function validSender(sender) {
  try {
    const url = new URL(sender.url);
    return (
      sender.id === chrome.runtime.id &&
      sender.frameId === 0 &&
      Number.isInteger(sender.tab?.id) &&
      url.origin === ORIGIN &&
      url.pathname.startsWith("/game/")
    );
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!validSender(sender)) {
    sendResponse({ ok: false, code: "sender" });
    return false;
  }
  let valid = false;
  try {
    valid =
      hasExactKeys(message, KEYS) &&
      message.schema === 1 &&
      JSON.stringify(message).length <= 256 &&
      validEvent(message.event);
  } catch {
    valid = false;
  }
  if (!valid) {
    sendResponse({ ok: false, code: "schema" });
    return false;
  }
  sendResponse({ ok: true, code: "accepted" });
  return false;
});
