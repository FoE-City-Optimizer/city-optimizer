// Disposable, local-only visual replay of the exact privacy-reviewed #24 artifact.
// Usage: node docs/research/issue-40-viewer.mjs --output <local-file.svg>
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixturePath = fileURLToPath(
  new URL(
    "../../tests/fixtures/issue-24-reference-replay.json",
    import.meta.url,
  ),
);
const reviewedHash =
  "f82c67f23b85bbf06dabb292d24b869d1a470a1d268d2fe9cc6f672538ca4dc1";
const types = new Set([
  "generic_building",
  "greatbuilding",
  "main_building",
  "military",
  "street",
]);
const colors = {
  generic_building: "#ae8bd7",
  greatbuilding: "#e9ad66",
  main_building: "#ffdb70",
  military: "#e57d83",
  street: "#58d4d0",
};
const own = (item, key) => Object.hasOwn(item, key);
const positioned = (item) => own(item, "x") && own(item, "y");
const key = (x, y) => `${x},${y}`;
const xml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
function exactKeys(item, keys, label) {
  assert.ok(item && typeof item === "object" && !Array.isArray(item), label);
  for (const field of Object.keys(item))
    assert.ok(keys.includes(field), `${label}: unexpected ${field}`);
}
function integer(item, field, label, required = false, positive = false) {
  if (!own(item, field)) {
    assert.ok(!required, `${label}: missing ${field}`);
    return;
  }
  assert.ok(
    Number.isSafeInteger(item[field]) && (!positive || item[field] > 0),
    `${label}: invalid ${field}`,
  );
}
function addCells(target, item, width, height) {
  assert.ok(positioned(item));
  for (let dx = 0; dx < width; dx++)
    for (let dy = 0; dy < height; dy++)
      target.add(key(item.x + dx, item.y + dy));
}

export function compileReplay(fixture) {
  exactKeys(
    fixture,
    [
      "format",
      "formatVersion",
      "entities",
      "definitions",
      "unlockedAreas",
      "blockedAreas",
      "sourceCounts",
      "excludedCounts",
      "observation",
    ],
    "fixture",
  );
  assert.equal(fixture.format, "foe24-replay-draft");
  assert.equal(fixture.formatVersion, 2);
  for (const field of [
    "entities",
    "definitions",
    "unlockedAreas",
    "blockedAreas",
  ])
    assert.ok(Array.isArray(fixture[field]), `missing ${field}`);
  const definitions = new Map();
  for (const definition of fixture.definitions) {
    exactKeys(
      definition,
      [
        "entity",
        "width",
        "length",
        "sizeX",
        "sizeY",
        "legacyStreetLevel",
        "genericStreetLevel",
      ],
      "definition",
    );
    assert.match(definition.entity, /^entity-\d{6}$/);
    assert.ok(!definitions.has(definition.entity), "duplicate definition");
    const legacy = own(definition, "width") && own(definition, "length");
    const generic = own(definition, "sizeX") && own(definition, "sizeY");
    assert.ok(legacy !== generic, "unknown or ambiguous footprint");
    for (const field of ["width", "length", "sizeX", "sizeY"])
      integer(definition, field, "definition", false, true);
    for (const field of ["legacyStreetLevel", "genericStreetLevel"])
      integer(definition, field, "definition");
    definitions.set(definition.entity, definition);
  }
  const instances = new Set();
  const entities = fixture.entities.map((entity) => {
    exactKeys(entity, ["instance", "entity", "type", "x", "y"], "entity");
    assert.match(entity.instance, /^instance-\d{6}$/);
    assert.ok(!instances.has(entity.instance), "duplicate instance");
    instances.add(entity.instance);
    assert.ok(types.has(entity.type), "unknown entity class");
    integer(entity, "x", "entity");
    integer(entity, "y", "entity");
    const definition = definitions.get(entity.entity);
    assert.ok(definition, "missing footprint definition");
    const width = definition.width ?? definition.sizeX;
    const height = definition.length ?? definition.sizeY;
    if (entity.type === "street") {
      assert.ok(positioned(entity), "street position missing");
      assert.equal(width, 1, "changed street width");
      assert.equal(height, 1, "changed street height");
    }
    return { ...entity, width, height, definition };
  });
  for (const area of fixture.unlockedAreas) {
    exactKeys(area, ["x", "y", "width", "length"], "area");
    integer(area, "x", "area");
    integer(area, "y", "area");
    integer(area, "width", "area", true, true);
    integer(area, "length", "area", true, true);
  }
  for (const blocked of fixture.blockedAreas) {
    exactKeys(blocked, ["x", "y"], "blocked position");
    integer(blocked, "x", "blocked position");
    integer(blocked, "y", "blocked position");
  }
  exactKeys(
    fixture.sourceCounts,
    ["placedEntities", "placedDefinitions"],
    "source counts",
  );
  exactKeys(
    fixture.excludedCounts,
    ["friends_tavern", "hub_main", "hub_part", "off_grid", "outpost_ship"],
    "excluded counts",
  );
  const excluded = Object.values(fixture.excludedCounts).reduce(
    (sum, count) => {
      assert.ok(
        Number.isSafeInteger(count) && count >= 0,
        "invalid excluded count",
      );
      return sum + count;
    },
    0,
  );
  assert.equal(fixture.sourceCounts.placedEntities, entities.length + excluded);
  assert.equal(fixture.sourceCounts.placedDefinitions, definitions.size + 20);
  const available = new Set();
  for (const area of fixture.unlockedAreas.filter(positioned))
    addCells(available, area, area.width, area.length);
  const occupied = new Set();
  const unconfirmedArea = new Set();
  let overlapCells = 0;
  for (const entity of entities.filter(positioned)) {
    const footprint = new Set();
    addCells(footprint, entity, entity.width, entity.height);
    for (const cell of footprint) {
      if (occupied.has(cell)) overlapCells++;
      occupied.add(cell);
      if (!available.has(cell)) unconfirmedArea.add(cell);
    }
  }
  const stats = {
    sourceEntities: fixture.sourceCounts.placedEntities,
    ordinaryEntities: entities.length,
    positionedEntities: entities.filter(positioned).length,
    unpositionedEntities: entities.filter((item) => !positioned(item)).length,
    roads: entities.filter((item) => item.type === "street").length,
    areaRecords: fixture.unlockedAreas.length,
    positionedAreas: fixture.unlockedAreas.filter(positioned).length,
    unpositionedAreas: fixture.unlockedAreas.filter((item) => !positioned(item))
      .length,
    confirmedAvailableCells: available.size,
    positionedOccupiedCells: occupied.size,
    occupiedCellsWithoutConfirmedArea: unconfirmedArea.size,
    overlapsAmongPositioned: overlapCells,
    blockedRecords: fixture.blockedAreas.length,
    positionedBlocked: fixture.blockedAreas.filter(positioned).length,
    excluded,
    explicitStreetLevelEntities: entities.filter(
      (item) =>
        own(item.definition, "legacyStreetLevel") ||
        own(item.definition, "genericStreetLevel"),
    ).length,
  };
  return { fixture, entities, available, occupied, stats };
}

export function renderSvg(model) {
  const { fixture, entities, available, stats } = model;
  const visible = [
    ...fixture.unlockedAreas
      .filter(positioned)
      .map((area) => [area.x, area.y, area.width, area.length]),
    ...entities
      .filter(positioned)
      .map((entity) => [entity.x, entity.y, entity.width, entity.height]),
  ];
  const minX = Math.min(...visible.map(([x]) => x));
  const minY = Math.min(...visible.map(([, y]) => y));
  const maxX = Math.max(...visible.map(([x, , width]) => x + width));
  const maxY = Math.max(...visible.map(([, y, , height]) => y + height));
  const tile = 14;
  const left = 44;
  const top = 170;
  const mapWidth = (maxX - minX) * tile;
  const mapHeight = (maxY - minY) * tile;
  const panelX = left + mapWidth + 38;
  const width = panelX + 360;
  const height = Math.max(top + mapHeight + 74, 1020);
  const px = (x) => left + (x - minX) * tile;
  const py = (y) => top + (y - minY) * tile;
  const blocks = [];
  blocks.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Partial observed city layout from issue 24 fixture">`,
  );
  blocks.push(
    `<style>text{font-family:Arial,Helvetica,sans-serif;fill:#e8edf4}.muted{fill:#a8b5c5}.head{font-size:30px;font-weight:700}.sub{font-size:16px}.stat{font-size:18px;font-weight:700}.note{font-size:15px}.small{font-size:12px}.tiny{font-size:9px}</style>`,
  );
  blocks.push(`<rect width="100%" height="100%" fill="#0e1723"/>`);
  blocks.push(`<text x="44" y="50" class="head">Observed city geometry</text>`);
  blocks.push(
    `<text x="44" y="78" class="sub muted">Issue #40 · reviewed #24 replay · selected source fields · ${xml(fixture.observation.dateUtc.slice(0, 10))}</text>`,
  );
  blocks.push(
    `<rect x="44" y="96" width="${width - 88}" height="49" rx="8" fill="#263342"/>`,
  );
  blocks.push(
    `<text x="58" y="117" class="note">PARTIAL VIEW — missing coordinates leave ${stats.unpositionedAreas} area records and ${stats.unpositionedEntities} ordinary entities unplaced.</text>`,
  );
  blocks.push(
    `<text x="58" y="136" class="small muted">Unshown records may change the city outline and apparent empty spaces. No omitted value is filled in.</text>`,
  );
  blocks.push(
    `<rect x="${left}" y="${top}" width="${mapWidth}" height="${mapHeight}" fill="#111e2a" stroke="#4e6072"/>`,
  );
  for (const cell of available) {
    const [x, y] = cell.split(",").map(Number);
    blocks.push(
      `<rect x="${px(x)}" y="${py(y)}" width="${tile}" height="${tile}" fill="#264a4b" stroke="#3d6462" stroke-width=".45"/>`,
    );
  }
  const drawOrder = [
    "generic_building",
    "greatbuilding",
    "military",
    "main_building",
    "street",
  ];
  const roads = new Set(
    entities
      .filter((item) => item.type === "street")
      .map((item) => key(item.x, item.y)),
  );
  for (const type of drawOrder)
    for (const entity of entities.filter(
      (item) => item.type === type && positioned(item),
    )) {
      const x = px(entity.x);
      const y = py(entity.y);
      const w = entity.width * tile;
      const h = entity.height * tile;
      const demand = own(entity.definition, "legacyStreetLevel")
        ? `legacy source street level ${entity.definition.legacyStreetLevel}`
        : own(entity.definition, "genericStreetLevel")
          ? `generic source street level ${entity.definition.genericStreetLevel}`
          : "source street level absent";
      const tooltip = `${entity.instance} · ${type} · ${entity.width}×${entity.height} · x=${entity.x}, y=${entity.y} · ${demand}; requirement meaning unverified`;
      blocks.push(
        `<g><title>${xml(tooltip)}</title><rect x="${x + 0.9}" y="${y + 0.9}" width="${w - 1.8}" height="${h - 1.8}" rx="${type === "street" ? 1 : 2}" fill="${colors[type]}" stroke="#10202b" stroke-width="1.5"/>`,
      );
      if (type === "street") {
        const neighbor = [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ];
        for (const [dx, dy] of neighbor)
          if (roads.has(key(entity.x + dx, entity.y + dy)))
            blocks.push(
              `<line x1="${x + tile / 2}" y1="${y + tile / 2}" x2="${x + tile / 2 + (dx * tile) / 2}" y2="${y + tile / 2 + (dy * tile) / 2}" stroke="#176965" stroke-width="3"/>`,
            );
        blocks.push(
          `<circle cx="${x + tile / 2}" cy="${y + tile / 2}" r="1.7" fill="#176965"/>`,
        );
      } else if (w >= 35 && h >= 24) {
        blocks.push(
          `<text x="${x + w / 2}" y="${y + h / 2 + 3}" text-anchor="middle" class="tiny" fill="#14202a">${xml(entity.instance.slice(-3))}</text>`,
        );
      }
      blocks.push(`</g>`);
    }
  for (const blocked of fixture.blockedAreas.filter(positioned)) {
    if (
      blocked.x < minX ||
      blocked.x >= maxX ||
      blocked.y < minY ||
      blocked.y >= maxY
    )
      continue;
    blocks.push(
      `<g><title>Source blocked position candidate x=${blocked.x}, y=${blocked.y}; meaning unverified</title><rect x="${px(blocked.x) + 3}" y="${py(blocked.y) + 3}" width="${tile - 6}" height="${tile - 6}" fill="none" stroke="#f18c6a" stroke-width="1.4" stroke-dasharray="2 2"/></g>`,
    );
  }
  blocks.push(
    `<text x="${left}" y="${top + mapHeight + 28}" class="small muted">Grid units: 1 source cell. Building rectangles use joined source footprints. Hover in an SVG viewer for exact details.</text>`,
  );
  blocks.push(
    `<text x="${left}" y="${top + mapHeight + 48}" class="small muted">Dashed orange markers are blocked-position candidates; they are not subtracted from the area.</text>`,
  );
  const line = (y, label, value) => {
    blocks.push(
      `<text x="${panelX}" y="${y}" class="note muted">${xml(label)}</text><text x="${panelX + 324}" y="${y}" text-anchor="end" class="stat">${xml(value)}</text>`,
    );
  };
  blocks.push(
    `<text x="${panelX}" y="190" class="stat">Replay statistics</text>`,
  );
  line(226, "Source entities", stats.sourceEntities);
  line(256, "Ordinary retained", stats.ordinaryEntities);
  line(286, "Placed on map", stats.positionedEntities);
  line(316, "Unplaced ordinary", stats.unpositionedEntities);
  line(346, "Road tiles (1×1)", stats.roads);
  line(376, "Unlocked rectangles", stats.areaRecords);
  line(406, "Rectangles on map", stats.positionedAreas);
  line(436, "Unplaced rectangles", stats.unpositionedAreas);
  line(466, "Confirmed area cells", stats.confirmedAvailableCells);
  line(496, "Placed footprint cells", stats.positionedOccupiedCells);
  line(
    526,
    "Positioned blocked markers",
    `${stats.positionedBlocked}/${stats.blockedRecords}`,
  );
  line(
    556,
    "Cells outside known area",
    stats.occupiedCellsWithoutConfirmedArea,
  );
  line(586, "Special class aggregates", stats.excluded);
  blocks.push(
    `<line x1="${panelX}" y1="608" x2="${panelX + 324}" y2="608" stroke="#526171"/>`,
  );
  blocks.push(`<text x="${panelX}" y="642" class="stat">Legend</text>`);
  const legend = [
    ["Confirmed unlocked cell", "#264a4b"],
    ["Generic building", colors.generic_building],
    ["Great building", colors.greatbuilding],
    ["Town Hall candidate", colors.main_building],
    ["Military", colors.military],
    ["Road tile", colors.street],
  ];
  legend.forEach(([label, color], index) => {
    const y = 670 + index * 28;
    blocks.push(
      `<rect x="${panelX}" y="${y - 13}" width="16" height="16" fill="${color}"/>`,
    );
    blocks.push(
      `<text x="${panelX + 27}" y="${y}" class="note">${xml(label)}</text>`,
    );
  });
  blocks.push(`<text x="${panelX}" y="840" class="stat">Road access</text>`);
  blocks.push(
    `<text x="${panelX}" y="868" class="note">${stats.explicitStreetLevelEntities} entities have an explicit source level.</text>`,
  );
  blocks.push(
    `<text x="${panelX}" y="891" class="note">${stats.ordinaryEntities - stats.explicitStreetLevelEntities} have no source level.</text>`,
  );
  blocks.push(
    `<text x="${panelX}" y="917" class="small muted">The level’s meaning and absent-field meaning</text>`,
  );
  blocks.push(
    `<text x="${panelX}" y="934" class="small muted">are unverified; no access claim is made.</text>`,
  );
  blocks.push(
    `<text x="${panelX}" y="978" class="small muted">Observed current layout, not an optimized plan.</text>`,
  );
  blocks.push(`</svg>`);
  return blocks.join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  assert.equal(
    process.argv[2],
    "--output",
    "usage: node issue-40-viewer.mjs --output <local-file.svg>",
  );
  assert.ok(
    process.argv[3] && process.argv.length === 4,
    "one output path required",
  );
  const source = readFileSync(fixturePath, "utf8");
  assert.ok(Buffer.byteLength(source) <= 1_000_000, "fixture exceeds 1 MB");
  assert.equal(
    createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex"),
    reviewedHash,
    "fixture differs from reviewed bytes",
  );
  const model = compileReplay(JSON.parse(source));
  writeFileSync(process.argv[3], renderSvg(model), { flag: "w" });
  console.log(
    JSON.stringify({ output: process.argv[3], ...model.stats }, null, 2),
  );
}
