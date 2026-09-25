// Research-only candidate rules. This does not define source semantics.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(
  new URL(
    "../../tests/fixtures/issue-24-reference-replay.json",
    import.meta.url,
  ),
);
const fixture = JSON.parse(readFileSync(path, "utf8"));
const own = (value, key) => Object.hasOwn(value, key);
const definitions = new Map(
  fixture.definitions.map((item) => [item.entity, item]),
);
const point = (item, fallback) => [
  own(item, "x") ? item.x : fallback,
  own(item, "y") ? item.y : fallback,
];
const key = (x, y) => `${x},${y}`;
function rectangle(item, width, height, fallback) {
  const [x, y] = point(item, fallback);
  const cells = [];
  for (let dx = 0; dx < width; dx++)
    for (let dy = 0; dy < height; dy++) cells.push(key(x + dx, y + dy));
  return cells;
}
function candidate(fallback) {
  const available = new Set(
    fixture.unlockedAreas.flatMap((item) =>
      rectangle(item, item.width, item.length, fallback),
    ),
  );
  const occupied = new Set();
  let overlap = 0;
  let outside = 0;
  for (const item of fixture.entities) {
    const definition = definitions.get(item.entity);
    const width = own(definition, "width")
      ? definition.width
      : definition.sizeX;
    const height = own(definition, "length")
      ? definition.length
      : definition.sizeY;
    for (const cell of rectangle(item, width, height, fallback)) {
      if (occupied.has(cell)) overlap++;
      occupied.add(cell);
      if (!available.has(cell)) outside++;
    }
  }
  const blocked = new Set(
    fixture.blockedAreas.map((item) => {
      const [x, y] = point(item, fallback);
      return key(x, y);
    }),
  );
  return {
    fallback,
    available: available.size,
    occupied: occupied.size,
    overlap,
    outside,
    blockedUnique: blocked.size,
    blockedInside: [...blocked].filter((cell) => available.has(cell)).length,
  };
}
const count = (items, axis) => ({
  absent: items.filter((item) => !own(item, axis)).length,
  explicitZero: items.filter((item) => own(item, axis) && item[axis] === 0)
    .length,
});
console.log(
  JSON.stringify(
    {
      coordinates: Object.fromEntries(
        [
          ["entities", fixture.entities],
          ["unlockedAreas", fixture.unlockedAreas],
          ["blockedAreas", fixture.blockedAreas],
        ].map(([name, items]) => [
          name,
          { x: count(items, "x"), y: count(items, "y") },
        ]),
      ),
      candidates: [candidate(0), candidate(1)],
      streetFields: {
        legacyExplicit: fixture.definitions.filter((item) =>
          own(item, "legacyStreetLevel"),
        ).length,
        genericExplicit: fixture.definitions.filter((item) =>
          own(item, "genericStreetLevel"),
        ).length,
        genericAbsent: fixture.definitions.filter(
          (item) => own(item, "sizeX") && !own(item, "genericStreetLevel"),
        ).length,
        explicitValues: [
          ...new Set(
            fixture.definitions.flatMap((item) =>
              [item.legacyStreetLevel, item.genericStreetLevel].filter(
                (value) => value !== undefined,
              ),
            ),
          ),
        ].sort(),
      },
    },
    null,
    2,
  ),
);
