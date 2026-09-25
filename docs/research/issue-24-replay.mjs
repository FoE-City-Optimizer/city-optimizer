// Research-only verifier for the pseudonymous Issue #24 replay fixture.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixturePath = fileURLToPath(
  new URL(
    "../../tests/fixtures/issue-24-reference-replay.json",
    import.meta.url,
  ),
);
const source = readFileSync(fixturePath, "utf8");
const reviewedHash =
  "f82c67f23b85bbf06dabb292d24b869d1a470a1d268d2fe9cc6f672538ca4dc1";
const normalizedSource = source.replace(/\r\n/g, "\n");
assert.equal(
  createHash("sha256").update(normalizedSource).digest("hex"),
  reviewedHash,
  "fixture differs from the reviewed artifact",
);
assert.ok(
  Buffer.byteLength(source) <= 1_000_000,
  "fixture exceeds research size limit",
);
const allowed = {
  root: new Set([
    "format",
    "formatVersion",
    "entities",
    "unlockedAreas",
    "blockedAreas",
    "definitions",
    "sourceCounts",
    "excludedCounts",
    "observation",
  ]),
  entity: new Set(["instance", "entity", "type", "x", "y"]),
  area: new Set(["x", "y", "width", "length"]),
  blocked: new Set(["x", "y"]),
  definition: new Set([
    "entity",
    "width",
    "length",
    "sizeX",
    "sizeY",
    "legacyStreetLevel",
    "genericStreetLevel",
  ]),
  observation: new Set([
    "dateUtc",
    "browser",
    "assetFingerprint",
    "sourcePaths",
    "coordinateSemantics",
    "streetRequirementSemantics",
    "blockedSemantics",
  ]),
};
const own = (object, key) => Object.hasOwn(object, key);
const checkKeys = (value, keys) => {
  assert.equal(typeof value, "object");
  assert.ok(value !== null && !Array.isArray(value));
  for (const key of Object.keys(value))
    assert.ok(keys.has(key), `unexpected field: ${key}`);
};

function replay(text) {
  const fixture = JSON.parse(text);
  checkKeys(fixture, allowed.root);
  assert.equal(fixture.format, "foe24-replay-draft");
  assert.equal(fixture.formatVersion, 2);
  checkKeys(
    fixture.sourceCounts,
    new Set(["placedEntities", "placedDefinitions"]),
  );
  checkKeys(
    fixture.excludedCounts,
    new Set([
      "friends_tavern",
      "hub_main",
      "hub_part",
      "off_grid",
      "outpost_ship",
    ]),
  );
  for (const value of Object.values(fixture.excludedCounts))
    assert.ok(Number.isInteger(value) && value >= 0);
  const excludedTotal = Object.values(fixture.excludedCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  assert.equal(
    fixture.sourceCounts.placedEntities,
    fixture.entities.length + excludedTotal,
  );
  assert.ok(
    fixture.sourceCounts.placedDefinitions >= fixture.definitions.length,
  );
  checkKeys(fixture.observation, allowed.observation);
  assert.match(
    fixture.observation.dateUtc,
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/,
  );
  assert.equal(fixture.observation.browser, "Google Chrome 154.0.8037.58");
  assert.equal(fixture.observation.assetFingerprint, "merged-game-c3b9b79d.js");
  assert.deepEqual(fixture.observation.sourcePaths, [
    "/game/json:StartupService.getData.responseData.city_map",
    "/game/json:StaticDataService.getMetadata.responseData:building_entity_lookup",
    "/start/metadata:placed entity definitions",
  ]);

  const ids = new Set();
  const entityKeys = new Set();
  const typeCounts = {};
  const knownTypes = new Set([
    "main_building",
    "generic_building",
    "greatbuilding",
    "street",
    "military",
  ]);
  for (const item of fixture.entities) {
    checkKeys(item, allowed.entity);
    assert.ok(knownTypes.has(item.type), "unknown entity class");
    assert.match(item.instance, /^instance-\d{6}$/);
    assert.match(item.entity, /^entity-\d{6}$/);
    assert.ok(!ids.has(item.instance), "duplicate instance");
    ids.add(item.instance);
    entityKeys.add(item.entity);
    typeCounts[item.type] = (typeCounts[item.type] ?? 0) + 1;
    for (const axis of ["x", "y"])
      if (own(item, axis)) assert.ok(Number.isInteger(item[axis]));
  }
  const definitions = new Map();
  for (const item of fixture.definitions) {
    checkKeys(item, allowed.definition);
    assert.match(item.entity, /^entity-\d{6}$/);
    assert.ok(!definitions.has(item.entity), "duplicate definition");
    definitions.set(item.entity, item);
    const legacy = own(item, "width") && own(item, "length");
    const generic = own(item, "sizeX") && own(item, "sizeY");
    assert.ok(legacy !== generic, "unknown or ambiguous footprint shape");
    for (const key of ["width", "length", "sizeX", "sizeY"])
      if (own(item, key))
        assert.ok(Number.isInteger(item[key]) && item[key] > 0);
    for (const key of ["legacyStreetLevel", "genericStreetLevel"])
      if (own(item, key))
        assert.ok(Number.isInteger(item[key]) && item[key] >= 0);
  }
  for (const entity of entityKeys)
    assert.ok(definitions.has(entity), "unresolved placed key");
  assert.equal(
    entityKeys.size,
    definitions.size,
    "unplaced definition retained",
  );
  const streets = fixture.entities.filter((item) => item.type === "street");
  for (const item of streets) {
    const def = definitions.get(item.entity);
    assert.equal(def.width, 1);
    assert.equal(def.length, 1);
    assert.ok(own(item, "x") && own(item, "y"));
  }
  const townHalls = fixture.entities.filter(
    (item) => item.type === "main_building",
  );
  assert.equal(townHalls.length, 1);
  const townHallDefinition = definitions.get(townHalls[0].entity);
  assert.equal(townHallDefinition.width, 6);
  assert.equal(townHallDefinition.length, 7);
  assert.ok(own(townHalls[0], "x") && own(townHalls[0], "y"));
  for (const item of fixture.unlockedAreas) {
    checkKeys(item, allowed.area);
    for (const axis of ["x", "y"])
      if (own(item, axis)) assert.ok(Number.isInteger(item[axis]));
    assert.ok(Number.isInteger(item.width) && item.width > 0);
    assert.ok(Number.isInteger(item.length) && item.length > 0);
  }
  for (const item of fixture.blockedAreas) {
    checkKeys(item, allowed.blocked);
    for (const axis of ["x", "y"])
      if (own(item, axis)) assert.ok(Number.isInteger(item[axis]));
  }

  // This computes a conditional consistency check, not a source semantic default.
  const cells = (item, width, height) => {
    const x = own(item, "x") ? item.x : 0;
    const y = own(item, "y") ? item.y : 0;
    const result = [];
    for (let dx = 0; dx < width; dx++)
      for (let dy = 0; dy < height; dy++) result.push(`${x + dx},${y + dy}`);
    return result;
  };
  const available = new Set(
    fixture.unlockedAreas.flatMap((item) =>
      cells(item, item.width, item.length),
    ),
  );
  const ordinary = new Set([
    "generic_building",
    "greatbuilding",
    "street",
    "main_building",
    "military",
  ]);
  const occupied = new Set();
  let overlaps = 0;
  let outside = 0;
  for (const item of fixture.entities.filter((item) =>
    ordinary.has(item.type),
  )) {
    const def = definitions.get(item.entity);
    const width = own(def, "width") ? def.width : def.sizeX;
    const height = own(def, "length") ? def.length : def.sizeY;
    for (const cell of cells(item, width, height)) {
      if (occupied.has(cell)) overlaps++;
      occupied.add(cell);
      if (!available.has(cell)) outside++;
    }
  }
  const blocked = new Set(
    fixture.blockedAreas.map((item) => cells(item, 1, 1)[0]),
  );
  return {
    sourceEntities: fixture.sourceCounts.placedEntities,
    sourceDefinitions: fixture.sourceCounts.placedDefinitions,
    entities: fixture.entities.length,
    definitions: fixture.definitions.length,
    excludedEntities: excludedTotal,
    excludedCounts: fixture.excludedCounts,
    roads: streets.length,
    townHalls: townHalls.length,
    unlockedAreas: fixture.unlockedAreas.length,
    blockedAreas: fixture.blockedAreas.length,
    availableCellsConditional: available.size,
    occupiedCellsConditional: occupied.size,
    blockedCellsConditional: blocked.size,
    blockedInAvailableConditional: [...blocked].filter((cell) =>
      available.has(cell),
    ).length,
    overlapsConditional: overlaps,
    outsideConditional: outside,
    omittedEntityX: fixture.entities.filter((item) => !own(item, "x")).length,
    omittedEntityY: fixture.entities.filter((item) => !own(item, "y")).length,
    omittedAreaX: fixture.unlockedAreas.filter((item) => !own(item, "x"))
      .length,
    omittedAreaY: fixture.unlockedAreas.filter((item) => !own(item, "y"))
      .length,
    omittedBlockedX: fixture.blockedAreas.filter((item) => !own(item, "x"))
      .length,
    omittedBlockedY: fixture.blockedAreas.filter((item) => !own(item, "y"))
      .length,
    types: typeCounts,
  };
}

// Check keys rather than substrings: `friends_tavern` is a placed building class,
// not a friend-list or social-data field.
assert.ok(
  !/"(?:player_id|playerName|world|cookie|token|session|authorization|headers|chat|guild|friends)"\s*:/i.test(
    source,
  ),
);
assert.ok(!/https?:\/\//i.test(source));
const first = replay(source);
const second = replay(source);
assert.deepEqual(second, first);
assert.equal(first.sourceEntities, 419);
assert.equal(first.sourceDefinitions, 155);
assert.equal(first.entities, 399);
assert.equal(first.definitions, 135);
assert.equal(first.excludedEntities, 20);
assert.equal(first.roads, 124);
assert.equal(first.townHalls, 1);
assert.equal(first.availableCellsConditional, 3984);
assert.equal(first.occupiedCellsConditional, 3970);
assert.equal(first.blockedCellsConditional, 49);
assert.equal(first.blockedInAvailableConditional, 0);
assert.equal(first.overlapsConditional, 0);
assert.equal(first.outsideConditional, 0);
console.log(JSON.stringify(first, null, 2));
