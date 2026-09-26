import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { deriveCityGeometryDraft } from "@foe/domain";

const fixtureUrl = new URL(
  "./fixtures/issue-24-reference-replay.json",
  import.meta.url,
);
const source = readFileSync(fixtureUrl, "utf8");
const approvedFixtureHash =
  "f82c67f23b85bbf06dabb292d24b869d1a470a1d268d2fe9cc6f672538ca4dc1";
if (
  createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex") !==
  approvedFixtureHash
)
  throw new Error("APPROVED_FIXTURE_HASH_MISMATCH");

export const sourceProjection = JSON.parse(source);
export const cityGeometry = deriveCityGeometryDraft(sourceProjection);
const change = (mutate) => {
  const copy = structuredClone(cityGeometry);
  mutate(copy);
  return copy;
};

// One in-memory corpus is fed to both Ajv and Python jsonschema. It contains
// no new capture and is never written as an additional real-city fixture.
export const schemaCases = [
  { name: "full-current-city-geometry", valid: true, value: cityGeometry },
  {
    name: "explicit-zero-wire-shape",
    valid: true,
    value: change((v) => {
      const item = v.ordinaryInstances.find(
        (instance) => instance.xPresence === "omitted-zero",
      );
      item.xPresence = "explicit";
    }),
  },
  {
    name: "unknown-minor",
    valid: false,
    value: change((v) => {
      v.schemaVersion = "0.2";
    }),
  },
  {
    name: "unknown-major",
    valid: false,
    value: change((v) => {
      v.schemaVersion = "1.0";
    }),
  },
  {
    name: "missing-axis",
    valid: false,
    value: change((v) => {
      delete v.ordinaryInstances[0].x;
    }),
  },
  {
    name: "fractional-axis",
    valid: false,
    value: change((v) => {
      v.ordinaryInstances[0].x = 1.5;
    }),
  },
  {
    name: "negative-axis",
    valid: false,
    value: change((v) => {
      v.ordinaryInstances[0].x = -1;
    }),
  },
  {
    name: "zero-footprint",
    valid: false,
    value: change((v) => {
      v.ordinaryInstances[0].width = 0;
    }),
  },
  {
    name: "unknown-class",
    valid: false,
    value: change((v) => {
      v.ordinaryInstances[0].type = "hub_main";
    }),
  },
  {
    name: "unknown-field",
    valid: false,
    value: change((v) => {
      v.privateData = "not allowed";
    }),
  },
  {
    name: "missing-exclusion",
    valid: false,
    value: change((v) => {
      delete v.excludedCounts.off_grid;
    }),
  },
  {
    name: "invalid-road-count",
    valid: false,
    value: change((v) => {
      v.counts.roads = 123;
    }),
  },
  {
    name: "short-instance-list",
    valid: false,
    value: change((v) => {
      v.ordinaryInstances.pop();
    }),
  },
  {
    name: "missing-diagnostic",
    valid: false,
    value: change((v) => {
      v.diagnostics.pop();
    }),
  },
  {
    name: "omitted-axis-not-zero",
    valid: false,
    value: change((v) => {
      const item = v.ordinaryInstances.find(
        (instance) => instance.xPresence === "omitted-zero",
      );
      item.x = 1;
    }),
  },
  {
    name: "blocked-presence-conflict",
    valid: false,
    value: change((v) => {
      const item = v.blockedRecords.find((record) => !record.xPresent);
      item.x = 0;
    }),
  },
];

if (
  process.argv[1] &&
  new URL(`file://${process.argv[1]}`).href === import.meta.url
)
  process.stdout.write(JSON.stringify(schemaCases));
