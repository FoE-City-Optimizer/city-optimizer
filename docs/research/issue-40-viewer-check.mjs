import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compileReplay, renderSvg } from "./issue-40-viewer.mjs";

const fixture = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL(
        "../../tests/fixtures/issue-24-reference-replay.json",
        import.meta.url,
      ),
    ),
    "utf8",
  ),
);
const model = compileReplay(fixture);
assert.equal(model.stats.sourceEntities, 419);
assert.equal(model.stats.ordinaryEntities, 399);
assert.equal(model.stats.positionedEntities, 378);
assert.equal(model.stats.unpositionedEntities, 21);
assert.equal(model.stats.roads, 124);
assert.equal(model.stats.confirmedAvailableCells, 3648);
assert.equal(model.stats.positionedOccupiedCells, 3623);
assert.equal(model.stats.occupiedCellsWithoutConfirmedArea, 49);
assert.equal(model.stats.overlapsAmongPositioned, 0);
const svg = renderSvg(model);
assert.ok(svg.includes("PARTIAL VIEW"));
assert.ok(
  svg.includes(
    "missing coordinates leave 21 area records and 21 ordinary entities unplaced",
  ),
);
assert.equal((svg.match(/<title>instance-/g) ?? []).length, 378);
assert.equal((svg.match(/· street · 1×1/g) ?? []).length, 124);
assert.equal(
  (svg.match(/Source blocked position candidate/g) ?? []).length <= 35,
  true,
);

function rejects(mutator, reason) {
  const copy = structuredClone(fixture);
  mutator(copy);
  assert.throws(() => compileReplay(copy), reason);
}
rejects(
  (copy) => (copy.entities[0].rawPayload = "unexpected"),
  /unexpected rawPayload/,
);
rejects((copy) => (copy.entities[0].type = "unknown"), /unknown entity class/);
rejects(
  (copy) => (copy.entities[1].instance = copy.entities[0].instance),
  /duplicate instance/,
);
rejects((copy) => (copy.definitions[0].width = 0), /invalid width/);
rejects(
  (copy) => copy.definitions.pop(),
  /missing footprint definition|placedDefinitions/,
);
rejects((copy) => {
  const road = copy.entities.find((entity) => entity.type === "street");
  delete road.x;
}, /street position missing/);

const missing = structuredClone(fixture);
const visible = missing.entities.find(
  (entity) =>
    entity.type === "generic_building" &&
    Object.hasOwn(entity, "x") &&
    Object.hasOwn(entity, "y"),
);
delete visible.x;
const missingModel = compileReplay(missing);
assert.equal(missingModel.stats.positionedEntities, 377);
assert.equal(missingModel.stats.unpositionedEntities, 22);
assert.ok(renderSvg(missingModel).includes("22 ordinary entities unplaced"));
console.log("Issue #40 replay and omission checks passed");
