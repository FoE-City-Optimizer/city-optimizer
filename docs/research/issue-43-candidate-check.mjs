// Research-only comparison for the exact reviewed #24 fixture. No source rule is accepted here.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { compileReplay, renderSvg } from "./issue-40-viewer.mjs";

const path = fileURLToPath(
  new URL(
    "../../tests/fixtures/issue-24-reference-replay.json",
    import.meta.url,
  ),
);
const source = readFileSync(path, "utf8");
const reviewedHash =
  "f82c67f23b85bbf06dabb292d24b869d1a470a1d268d2fe9cc6f672538ca4dc1";
assert.equal(
  createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex"),
  reviewedHash,
);
const fixture = JSON.parse(source);
const own = (item, axis) => Object.hasOwn(item, axis);
const missing = (item) => ["x", "y"].filter((axis) => !own(item, axis));
const omissionSignature = (data) =>
  JSON.stringify([
    data.entities
      .map((item, index) => [index, item.instance, missing(item)])
      .filter((row) => row[2].length),
    data.unlockedAreas
      .map((item, index) => [index, missing(item)])
      .filter((row) => row[1].length),
    data.blockedAreas
      .map((item, index) => [index, missing(item)])
      .filter((row) => row[1].length),
  ]);
const expectedSignature = omissionSignature(fixture);

function resolvedFixture(data, fallback) {
  assert.equal(
    data.observation.browser,
    "Google Chrome 154.0.8037.58",
    "source variant drift",
  );
  assert.equal(
    data.observation.assetFingerprint,
    "merged-game-c3b9b79d.js",
    "source variant drift",
  );
  assert.equal(
    omissionSignature(data),
    expectedSignature,
    "new or changed omitted axis",
  );
  const copy = structuredClone(data);
  for (const group of [copy.entities, copy.unlockedAreas, copy.blockedAreas])
    for (const item of group)
      for (const axis of missing(item)) item[axis] = fallback;
  return copy;
}

function evaluate(fallback) {
  const resolved = resolvedFixture(fixture, fallback);
  const model = compileReplay(resolved);
  const owners = new Map();
  const overlaps = [];
  const outside = [];
  const key = (x, y) => `${x},${y}`;
  for (const entity of model.entities) {
    for (let dx = 0; dx < entity.width; dx++)
      for (let dy = 0; dy < entity.height; dy++) {
        const cell = key(entity.x + dx, entity.y + dy);
        if (owners.has(cell))
          overlaps.push([cell, owners.get(cell), entity.instance]);
        else owners.set(cell, entity.instance);
        if (!model.available.has(cell)) outside.push([cell, entity.instance]);
      }
  }
  const blocked = new Set(
    resolved.blockedAreas.map((item) => key(item.x, item.y)),
  );
  return {
    model,
    summary: {
      fallback,
      ordinary: model.entities.length,
      unlockedAreas: resolved.unlockedAreas.length,
      roads: model.entities.filter((item) => item.type === "street").length,
      areaCells: model.available.size,
      occupiedCells: owners.size,
      freeCellsConditional: [...model.available].filter(
        (cell) => !owners.has(cell),
      ).length,
      overlapCount: overlaps.length,
      overlapPairExamples: overlaps
        .slice(0, 8)
        .map(([, first, second]) => [first, second]),
      outsideCount: outside.length,
      blockedUnique: blocked.size,
      blockedInside: [...blocked].filter((cell) => model.available.has(cell))
        .length,
    },
  };
}

const baseline = compileReplay(fixture);
const zero = evaluate(0);
const one = evaluate(1);
assert.equal(baseline.stats.positionedEntities, 378);
assert.equal(baseline.stats.positionedAreas, 213);
assert.deepEqual(
  [
    zero.summary.ordinary,
    zero.summary.unlockedAreas,
    zero.summary.roads,
    zero.summary.areaCells,
    zero.summary.occupiedCells,
    zero.summary.freeCellsConditional,
    zero.summary.overlapCount,
    zero.summary.outsideCount,
  ],
  [399, 234, 124, 3984, 3970, 14, 0, 0],
);
assert.equal(one.summary.overlapCount, 84);
assert.equal(one.summary.areaCells, 3900);
assert.equal(one.summary.occupiedCells, 3886);
assert.equal(one.summary.outsideCount, 0);

const changed = structuredClone(fixture);
const explicit = changed.entities.find(
  (item) => own(item, "x") && item.x !== 0 && item.type !== "street",
);
delete explicit.x;
assert.throws(() => resolvedFixture(changed, 0), /new or changed omitted axis/);
const unknown = structuredClone(fixture);
unknown.entities[0].type = "unknown_class";
assert.throws(
  () => compileReplay(resolvedFixture(unknown, 0)),
  /unknown entity class/,
);
const definition = structuredClone(fixture);
definition.definitions.pop();
assert.throws(
  () => compileReplay(resolvedFixture(definition, 0)),
  /missing footprint definition|placedDefinitions/,
);
const drift = structuredClone(fixture);
drift.observation.assetFingerprint = "changed-game.js";
assert.throws(() => resolvedFixture(drift, 0), /source variant drift/);
const conflict = structuredClone(fixture);
const first = conflict.entities.find(
  (item) => item.type !== "street" && own(item, "x") && own(item, "y"),
);
const second = conflict.entities.find(
  (item) =>
    item !== first &&
    item.type !== "street" &&
    own(item, "x") &&
    own(item, "y"),
);
second.x = first.x;
second.y = first.y;
const conflictModel = compileReplay(resolvedFixture(conflict, 0));
assert.ok(
  conflictModel.stats.overlapsAmongPositioned > 0,
  "conflicting overlap must be visible",
);

const [omittedEntities, omittedAreas, omittedBlocked] =
  JSON.parse(expectedSignature);
const report = {
  fixtureSha256: reviewedHash,
  source: fixture.observation,
  omissions: {
    entities: omittedEntities.map(([index, instance, axes]) => ({
      index,
      instance,
      axes,
    })),
    unlockedAreas: omittedAreas.map(([index, axes]) => ({ index, axes })),
    blockedAreas: omittedBlocked.map(([index, axes]) => ({ index, axes })),
  },
  baseline: baseline.stats,
  candidates: [zero.summary, one.summary],
  negativeCases: [
    "new missing nonzero axis rejected",
    "unknown class rejected",
    "unknown definition rejected",
    "source variant drift rejected",
    "conflicting overlap detected",
  ],
};
console.log(JSON.stringify(report, null, 2));

if (process.argv[2] === "--output") {
  assert.ok(
    process.argv[3] && process.argv.length === 4,
    "one local output path required",
  );
  const svg = renderSvg(zero.model)
    .replace(
      "Partial observed city layout from issue 24 fixture",
      "Owner-matched zero-axis candidate from issue 24 fixture",
    )
    .replace("Observed city geometry", "Zero-axis candidate (owner matched)")
    .replace(
      "Issue #40 · reviewed #24 replay",
      "Issue #43 · reviewed #24 replay",
    )
    .replace(
      "PARTIAL VIEW — missing coordinates leave 0 area records and 0 ordinary entities unplaced.",
      "CANDIDATE ONLY — omitted x/y provisionally set to 0 for this exact fixture.",
    )
    .replace(
      "Unshown records may change the city outline and apparent empty spaces. No omitted value is filled in.",
      "Source semantics and per-tile live comparison remain unverified. Not solver input.",
    )
    .replace("Confirmed area cells", "Candidate area cells")
    .replace("Confirmed unlocked cell", "Candidate unlocked cell")
    .replace(
      "Observed current layout, not an optimized plan.",
      "Owner-matched candidate layout, not an optimized plan.",
    );
  writeFileSync(process.argv[3], svg, { flag: "w" });
}
