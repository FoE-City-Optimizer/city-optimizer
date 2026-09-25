import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

let listener;
const chrome = {
  runtime: {
    id: "temporary-probe",
    onMessage: { addListener: (callback) => (listener = callback) },
  },
};
runInNewContext(
  readFileSync(new URL("./runtime.js", import.meta.url), "utf8"),
  { chrome, URL },
);

const sender = {
  id: "temporary-probe",
  frameId: 0,
  tab: { id: 7 },
  url: "https://pl4.forgeofempires.com/game/index",
};
const event = {
  type: "foe23/research",
  version: 1,
  phase: "init",
  readyState: "loading",
};
const envelope = { schema: 1, event };

function reply(message, from = sender) {
  let result;
  listener(message, from, (value) => (result = value));
  return JSON.parse(JSON.stringify(result));
}

assert.deepEqual(reply(envelope), { ok: true, code: "accepted" });
assert.deepEqual(reply({ ...envelope, extra: true }), {
  ok: false,
  code: "schema",
});
assert.deepEqual(reply({ schema: 1, event: { ...event, extra: true } }), {
  ok: false,
  code: "schema",
});
assert.deepEqual(
  reply({ schema: 1, event: { ...event, padding: "x".repeat(512) } }),
  {
    ok: false,
    code: "schema",
  },
);
assert.deepEqual(
  reply(envelope, { ...sender, url: "https://evil.invalid/game/index" }),
  {
    ok: false,
    code: "sender",
  },
);
assert.deepEqual(reply(envelope, { ...sender, frameId: 1 }), {
  ok: false,
  code: "sender",
});
assert.deepEqual(reply(envelope, { ...sender, id: "another-extension" }), {
  ok: false,
  code: "sender",
});
assert.deepEqual(reply(envelope, { ...sender, tab: undefined }), {
  ok: false,
  code: "sender",
});

console.log("Issue #23 runtime boundary cases passed.");
