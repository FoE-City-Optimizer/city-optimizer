import {
  isCityGeometryDraft,
  parseSourceCityProjection,
  type SourcePosition,
  type CityGeometryDraft,
} from "@foe/contracts";

export type GeometryErrorCode =
  | "GEOMETRY_OVERLAP"
  | "OUTSIDE_UNLOCKED"
  | "ROAD_GEOMETRY_INVALID"
  | "MAIN_BUILDING_COUNT_MISMATCH"
  | "GEOMETRY_CENSUS_MISMATCH"
  | "OUTPUT_SCHEMA_INVALID";

export class GeometryError extends Error {
  constructor(readonly code: GeometryErrorCode) {
    super(code);
    this.name = "GeometryError";
  }
}

type Axis = "x" | "y";
const has = (item: object, axis: Axis): boolean => Object.hasOwn(item, axis);

function resolvedAxis(
  item: SourcePosition,
  axis: Axis,
): {
  value: number;
  presence: "explicit" | "omitted-zero";
} {
  return has(item, axis)
    ? { value: item[axis]!, presence: "explicit" }
    : { value: 0, presence: "omitted-zero" };
}

const cell = (x: number, y: number): string => `${x},${y}`;

function eachCell(
  x: number,
  y: number,
  width: number,
  height: number,
  visit: (cell: string) => void,
): void {
  for (let dx = 0; dx < width; dx++)
    for (let dy = 0; dy < height; dy++) visit(cell(x + dx, y + dy));
}

/** Derive geometry for the one owner-reviewed #24 source variant only. */
export function deriveCityGeometryDraft(input: unknown): CityGeometryDraft {
  const projection = parseSourceCityProjection(input);
  const definitions = new Map(
    projection.definitions.map((item) => [item.entity, item]),
  );
  const ordinaryInstances = projection.entities.map((item) => {
    const definition = definitions.get(item.entity)!;
    const width = definition.width ?? definition.sizeX!;
    const height = definition.length ?? definition.sizeY!;
    const x = resolvedAxis(item, "x");
    const y = resolvedAxis(item, "y");
    return {
      instance: item.instance,
      entity: item.entity,
      type: item.type,
      x: x.value,
      y: y.value,
      width,
      height,
      xPresence: x.presence,
      yPresence: y.presence,
    };
  });
  const unlockedRectangles = projection.unlockedAreas.map((item) => {
    const x = resolvedAxis(item, "x");
    const y = resolvedAxis(item, "y");
    return {
      x: x.value,
      y: y.value,
      width: item.width,
      length: item.length,
      xPresence: x.presence,
      yPresence: y.presence,
    };
  });
  const roads = ordinaryInstances.filter((item) => item.type === "street");
  if (
    roads.length !== 124 ||
    roads.some(
      (road) =>
        road.width !== 1 ||
        road.height !== 1 ||
        road.xPresence !== "explicit" ||
        road.yPresence !== "explicit",
    )
  )
    throw new GeometryError("ROAD_GEOMETRY_INVALID");
  if (
    ordinaryInstances.filter((item) => item.type === "main_building").length !==
    1
  )
    throw new GeometryError("MAIN_BUILDING_COUNT_MISMATCH");

  const available = new Set<string>();
  for (const area of unlockedRectangles)
    eachCell(area.x, area.y, area.width, area.length, (key) =>
      available.add(key),
    );
  const occupied = new Set<string>();
  for (const item of ordinaryInstances)
    eachCell(item.x, item.y, item.width, item.height, (key) => {
      if (occupied.has(key)) throw new GeometryError("GEOMETRY_OVERLAP");
      if (!available.has(key)) throw new GeometryError("OUTSIDE_UNLOCKED");
      occupied.add(key);
    });
  if (available.size !== 3984 || occupied.size !== 3970)
    throw new GeometryError("GEOMETRY_CENSUS_MISMATCH");

  // Blocked-position semantics have not been established. Preserve source
  // presence and values; do not convert them to unavailable grid cells.
  const blockedRecords = projection.blockedAreas.map((item) => ({
    xPresent: has(item, "x"),
    yPresent: has(item, "y"),
    ...(has(item, "x") ? { x: item.x } : {}),
    ...(has(item, "y") ? { y: item.y } : {}),
    meaning: "unresolved" as const,
  }));
  const output = {
    schemaVersion: "0.1",
    sourceVariant: "foe24-source-v2",
    axisConvention: {
      unit: "city-grid-cell",
      xIncreases: "east",
      yIncreases: "south",
    },
    ordinaryInstances,
    unlockedRectangles,
    blockedRecords,
    excludedCounts: projection.excludedCounts,
    counts: {
      sourceRecords: projection.sourceCounts.placedEntities,
      ordinaryInstances: ordinaryInstances.length,
      unlockedRectangles: unlockedRectangles.length,
      roads: roads.length,
      excludedRecords: Object.values(projection.excludedCounts).reduce(
        (a, b) => a + b,
        0,
      ),
      availableCells: available.size,
      occupiedCells: occupied.size,
      freeCells: available.size - occupied.size,
    },
    diagnostics: [
      "BLOCKED_MEANING_UNRESOLVED",
      "ROAD_DEMAND_UNRESOLVED",
      "SPECIAL_ELIGIBILITY_UNRESOLVED",
    ],
  };
  if (!isCityGeometryDraft(output))
    throw new GeometryError("OUTPUT_SCHEMA_INVALID");
  return output;
}
