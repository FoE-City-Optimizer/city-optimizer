import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";

const script = readFileSync(
  fileURLToPath(new URL("./main.js", import.meta.url)),
  "utf8",
);
function probe() {
  const messages = [];
  class Xhr {
    responseType = "json";
    status = 200;
    open() {}
    send() {}
    addEventListener(name, callback) {
      if (name === "loadend") this.onLoadEnd = callback;
    }
    deliver(rows) {
      this.response = rows;
      this.onLoadEnd?.();
    }
  }
  const origin = "https://pl4.forgeofempires.com";
  const window = {
    postMessage: (event, target) => {
      assert.equal(target, origin);
      messages.push(event);
    },
  };
  window.top = window;
  runInNewContext(script, {
    window,
    location: { origin, pathname: "/game/index", href: `${origin}/game/index` },
    XMLHttpRequest: Xhr,
    URL,
  });
  return {
    messages,
    deliver(rows, path = "/game/json") {
      const xhr = new Xhr();
      xhr.open("POST", path);
      xhr.send();
      xhr.deliver(rows);
    },
  };
}
const city = {
  entities: [
    { id: 1, cityentity_id: "a", type: "generic_building", x: 3, y: 4 },
    { id: 2, cityentity_id: "b", type: "street", x: 5, y: 4 },
    { id: 3, cityentity_id: "c", type: "generic_building", y: 7 },
  ],
  unlocked_areas: [
    { x: 2, y: 2, width: 4, length: 4 },
    { y: 6, width: 4, length: 4 },
  ],
  blocked_areas: [{ x: 9, y: 9 }],
};
const startup = (data) => [
  {
    requestClass: "StartupService",
    requestMethod: "getData",
    responseData: { city_map: data },
  },
];
const move = (data) => [
  {
    requestClass: "CityMapService",
    requestMethod: "moveEntities",
    responseData: data,
  },
];
const observed = probe();
observed.deliver(startup(city));
assert.deepEqual(
  {
    entities: observed.messages[0].entities,
    roads: observed.messages[0].roads,
    areas: observed.messages[0].areas,
    missingEntityPosition: observed.messages[0].missingEntityPosition,
    missingAreaPosition: observed.messages[0].missingAreaPosition,
    state: observed.messages[0].state,
  },
  {
    entities: 3,
    roads: 1,
    areas: 2,
    missingEntityPosition: 1,
    missingAreaPosition: 1,
    state: "partial",
  },
);
observed.deliver(
  move([{ id: 2, cityentity_id: "b", type: "street", x: 6, y: 4 }]),
);
assert.equal(observed.messages[1].changedPositions, 1);
assert.equal(observed.messages[1].updateEntries, 1);
observed.deliver(
  move([{ id: 2, cityentity_id: "b", type: "street", x: 6, y: 4 }]),
);
assert.equal(observed.messages[2].changedPositions, 0);
observed.deliver(
  move([{ id: 999, cityentity_id: "b", type: "street", x: 6, y: 4 }]),
);
assert.equal(observed.messages[3].state, "stale");
const bad = probe();
bad.deliver(
  startup({ ...city, entities: [{ ...city.entities[0], type: "unknown" }] }),
);
assert.equal(bad.messages[0].state, "unsupported");
bad.deliver(
  move([{ id: 1, cityentity_id: "a", type: "generic_building", x: 4, y: 4 }]),
);
assert.equal(bad.messages[1].state, "stale");
const malformedId = probe();
malformedId.deliver(
  startup({
    ...city,
    entities: [{ ...city.entities[0], id: { nested: true } }],
  }),
);
assert.equal(malformedId.messages[0].state, "unsupported");
const unrelated = probe();
unrelated.deliver(startup(city), "/other/path");
assert.equal(unrelated.messages.length, 0);
console.log("Issue #40 Chrome probe synthetic checks passed");
