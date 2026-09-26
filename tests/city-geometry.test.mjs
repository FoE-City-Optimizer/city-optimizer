import assert from "node:assert/strict";
import test from "node:test";
import { isCityGeometryDraft, SourceProjectionError } from "@foe/contracts";
import { deriveCityGeometryDraft, GeometryError } from "@foe/domain";
import {
  cityGeometry,
  schemaCases,
  sourceProjection,
} from "./city-geometry-cases.mjs";

const mutate = (change) => {
  const copy = structuredClone(sourceProjection);
  change(copy);
  return copy;
};
const reject = (change, code) =>
  assert.throws(
    () => deriveCityGeometryDraft(mutate(change)),
    (error) =>
      (error instanceof SourceProjectionError ||
        error instanceof GeometryError) &&
      error.code === code,
  );

test("approved source produces the complete ordinary grid with preserved field presence", () => {
  assert.deepEqual(cityGeometry.counts, {
    sourceRecords: 419,
    ordinaryInstances: 399,
    unlockedRectangles: 234,
    roads: 124,
    excludedRecords: 20,
    availableCells: 3984,
    occupiedCells: 3970,
    freeCells: 14,
  });
  assert.deepEqual(cityGeometry.excludedCounts, {
    friends_tavern: 1,
    hub_main: 2,
    hub_part: 5,
    off_grid: 10,
    outpost_ship: 2,
  });
  assert.equal(
    cityGeometry.ordinaryInstances.filter((v) => v.xPresence === "omitted-zero")
      .length,
    10,
  );
  assert.equal(
    cityGeometry.ordinaryInstances.filter((v) => v.yPresence === "omitted-zero")
      .length,
    11,
  );
  assert.equal(
    cityGeometry.unlockedRectangles.filter(
      (v) => v.xPresence === "omitted-zero",
    ).length,
    10,
  );
  assert.equal(
    cityGeometry.unlockedRectangles.filter(
      (v) => v.yPresence === "omitted-zero",
    ).length,
    11,
  );
  for (const item of [
    ...cityGeometry.ordinaryInstances,
    ...cityGeometry.unlockedRectangles,
  ]) {
    if (item.xPresence === "omitted-zero") assert.equal(item.x, 0);
    if (item.yPresence === "omitted-zero") assert.equal(item.y, 0);
  }
  assert.equal(
    cityGeometry.ordinaryInstances.filter((v) => v.type === "street").length,
    124,
  );
  assert.equal(cityGeometry.blockedRecords.length, 49);
  assert.ok(
    cityGeometry.blockedRecords.every((v) => v.meaning === "unresolved"),
  );
  assert.deepEqual(cityGeometry.diagnostics, [
    "BLOCKED_MEANING_UNRESOLVED",
    "ROAD_DEMAND_UNRESOLVED",
    "SPECIAL_ELIGIBILITY_UNRESOLVED",
  ]);
  assert.equal(Object.hasOwn(sourceProjection.entities[34], "x"), false);
});

test("new missing axes, invalid axes and variant drift fail closed", () => {
  reject((v) => {
    delete v.entities[1].x;
  }, "SOURCE_AXIS_OMISSION_UNSUPPORTED");
  reject((v) => {
    delete v.unlockedAreas[10].y;
  }, "SOURCE_AXIS_OMISSION_UNSUPPORTED");
  reject((v) => {
    delete v.blockedAreas[5].x;
  }, "SOURCE_AXIS_OMISSION_UNSUPPORTED");
  reject((v) => {
    v.entities[1].x = null;
  }, "SOURCE_SHAPE_INVALID");
  reject((v) => {
    v.entities[1].x = 1.5;
  }, "SOURCE_SHAPE_INVALID");
  reject((v) => {
    v.entities[1].x = -1;
  }, "SOURCE_SHAPE_INVALID");
  reject((v) => {
    v.formatVersion = 3;
  }, "VERSION_UNSUPPORTED");
  reject((v) => {
    v.observation.assetFingerprint = "changed.js";
  }, "SOURCE_VARIANT_UNSUPPORTED");
});

test("source identity, class and definition errors fail closed", () => {
  reject((v) => {
    v.entities[1].instance = v.entities[0].instance;
  }, "DUPLICATE_ID");
  reject((v) => {
    v.entities[1].type = "hub_main";
  }, "CLASS_UNSUPPORTED");
  reject((v) => {
    v.entities[0].cookie = "unexpected";
  }, "SOURCE_SHAPE_INVALID");
  reject((v) => {
    v.definitions.pop();
    v.definitions.push({ ...v.definitions[0], entity: "entity-999999" });
  }, "DEFINITION_UNKNOWN");
  reject((v) => {
    v.excludedCounts.off_grid = 9;
  }, "SOURCE_COUNT_MISMATCH");
});

test("conflicting placement, outside placement and changed roads fail closed", () => {
  reject((v) => {
    v.entities[1].x = v.entities[0].x;
    v.entities[1].y = v.entities[0].y;
  }, "GEOMETRY_OVERLAP");
  reject((v) => {
    v.entities[1].x = 250;
  }, "OUTSIDE_UNLOCKED");
  reject((v) => {
    const road = v.entities.find((item) => item.type === "street");
    road.type = "military";
  }, "ROAD_GEOMETRY_INVALID");
});

test("the shared wire corpus has the expected TypeScript acceptance", () => {
  for (const item of schemaCases)
    assert.equal(isCityGeometryDraft(item.value), item.valid, item.name);
});
