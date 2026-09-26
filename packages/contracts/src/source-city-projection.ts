/** The #24 privacy-approved source projection is input to geometry derivation, not Snapshot v1. */
export type OrdinaryClass =
  | "generic_building"
  | "greatbuilding"
  | "main_building"
  | "military"
  | "street";

export interface SourceEntity {
  instance: string;
  entity: string;
  type: OrdinaryClass;
  x?: number;
  y?: number;
}

export interface SourceRectangle {
  x?: number;
  y?: number;
  width: number;
  length: number;
}

export interface SourcePosition {
  x?: number;
  y?: number;
}

export interface SourceDefinition {
  entity: string;
  width?: number;
  length?: number;
  sizeX?: number;
  sizeY?: number;
  legacyStreetLevel?: number;
  genericStreetLevel?: number;
}

export interface SourceCityProjection {
  format: "foe24-replay-draft";
  formatVersion: 2;
  entities: SourceEntity[];
  unlockedAreas: SourceRectangle[];
  blockedAreas: SourcePosition[];
  definitions: SourceDefinition[];
  sourceCounts: { placedEntities: number; placedDefinitions: number };
  excludedCounts: Record<ExcludedClass, number>;
  observation: {
    dateUtc: string;
    browser: string;
    assetFingerprint: string;
    sourcePaths: string[];
    coordinateSemantics: string;
    streetRequirementSemantics: string;
    blockedSemantics: string;
  };
}

export type ExcludedClass =
  "friends_tavern" | "hub_main" | "hub_part" | "off_grid" | "outpost_ship";

export type SourceProjectionErrorCode =
  | "VERSION_UNSUPPORTED"
  | "SOURCE_VARIANT_UNSUPPORTED"
  | "SOURCE_SHAPE_INVALID"
  | "SOURCE_COUNT_MISMATCH"
  | "SOURCE_AXIS_OMISSION_UNSUPPORTED"
  | "CLASS_UNSUPPORTED"
  | "DUPLICATE_ID"
  | "DEFINITION_UNKNOWN";

export class SourceProjectionError extends Error {
  constructor(readonly code: SourceProjectionErrorCode) {
    super(code);
    this.name = "SourceProjectionError";
  }
}

const excludedClasses: ExcludedClass[] = [
  "friends_tavern",
  "hub_main",
  "hub_part",
  "off_grid",
  "outpost_ship",
];
const ordinaryClasses: OrdinaryClass[] = [
  "generic_building",
  "greatbuilding",
  "main_building",
  "military",
  "street",
];
const sourcePaths = [
  "/game/json:StartupService.getData.responseData.city_map",
  "/game/json:StaticDataService.getMetadata.responseData:building_entity_lookup",
  "/start/metadata:placed entity definitions",
];

// Omission locations are part of the owner-reviewed #24 source variant. A new
// missing nonzero axis must not inherit the scoped zero rule.
const entityOmissions = new Map<number, string>([
  [19, "y"],
  [34, "x"],
  [38, "y"],
  [41, "x"],
  [62, "x"],
  [67, "y"],
  [69, "y"],
  [125, "y"],
  [135, "y"],
  [146, "x"],
  [181, "x"],
  [319, "y"],
  [320, "y"],
  [339, "y"],
  [349, "x"],
  [351, "x"],
  [353, "x"],
  [354, "y"],
  [356, "x"],
  [358, "y"],
  [365, "x"],
]);
const areaOmissions = new Map<number, string>([
  [0, "x"],
  [1, "x"],
  [2, "x"],
  [3, "x"],
  [4, "x"],
  [5, "x"],
  [6, "x"],
  [7, "x"],
  [8, "x"],
  [9, "x"],
  [43, "y"],
  [57, "y"],
  [71, "y"],
  [89, "y"],
  [107, "y"],
  [125, "y"],
  [143, "y"],
  [161, "y"],
  [179, "y"],
  [197, "y"],
  [215, "y"],
]);
const blockedOmissions = new Map<number, string>([
  [0, "xy"],
  [1, "y"],
  [2, "y"],
  [3, "y"],
  [4, "x"],
  [8, "x"],
  [10, "x"],
  [12, "x"],
  [14, "x"],
  [16, "x"],
  [17, "x"],
  [39, "y"],
  [40, "y"],
  [41, "y"],
]);

function record(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new SourceProjectionError("SOURCE_SHAPE_INVALID");
  const object = value as Record<string, unknown>;
  if (Object.keys(object).some((key) => !keys.includes(key)))
    throw new SourceProjectionError("SOURCE_SHAPE_INVALID");
  return object;
}

function integer(value: unknown, minimum = 0, maximum = 255): number {
  if (
    !Number.isSafeInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  )
    throw new SourceProjectionError("SOURCE_SHAPE_INVALID");
  return value as number;
}

function text(value: unknown, pattern: RegExp): string {
  if (typeof value !== "string" || !pattern.test(value))
    throw new SourceProjectionError("SOURCE_SHAPE_INVALID");
  return value;
}

function axis(
  object: Record<string, unknown>,
  name: "x" | "y",
): number | undefined {
  return Object.hasOwn(object, name) ? integer(object[name]) : undefined;
}

function omissionSignature(object: { x?: number; y?: number }): string {
  return `${Object.hasOwn(object, "x") ? "" : "x"}${Object.hasOwn(object, "y") ? "" : "y"}`;
}

function assertOmissions<T extends { x?: number; y?: number }>(
  rows: T[],
  expected: Map<number, string>,
): void {
  rows.forEach((row, index) => {
    if (omissionSignature(row) !== (expected.get(index) ?? ""))
      throw new SourceProjectionError("SOURCE_AXIS_OMISSION_UNSUPPORTED");
  });
}

/** Validate only the selected fields and approved source variant of #24. */
export function parseSourceCityProjection(
  input: unknown,
): SourceCityProjection {
  const root = record(input, [
    "format",
    "formatVersion",
    "entities",
    "unlockedAreas",
    "blockedAreas",
    "definitions",
    "sourceCounts",
    "excludedCounts",
    "observation",
  ]);
  if (root.format !== "foe24-replay-draft" || root.formatVersion !== 2)
    throw new SourceProjectionError("VERSION_UNSUPPORTED");
  const counts = record(root.sourceCounts, [
    "placedEntities",
    "placedDefinitions",
  ]);
  const excluded = record(root.excludedCounts, excludedClasses);
  const observation = record(root.observation, [
    "dateUtc",
    "browser",
    "assetFingerprint",
    "sourcePaths",
    "coordinateSemantics",
    "streetRequirementSemantics",
    "blockedSemantics",
  ]);
  if (
    observation.dateUtc !== "2026-09-25T20:10:41.056Z" ||
    observation.browser !== "Google Chrome 154.0.8037.58" ||
    observation.assetFingerprint !== "merged-game-c3b9b79d.js" ||
    !Array.isArray(observation.sourcePaths) ||
    observation.sourcePaths.length !== sourcePaths.length ||
    observation.sourcePaths.some(
      (path, index) => path !== sourcePaths[index],
    ) ||
    observation.coordinateSemantics !==
      "source fields preserved; omitted values absent; zero default unverified" ||
    observation.streetRequirementSemantics !==
      "explicit numeric fields preserved; omission unverified" ||
    observation.blockedSemantics !== "unknown"
  )
    throw new SourceProjectionError("SOURCE_VARIANT_UNSUPPORTED");
  if (
    !Array.isArray(root.entities) ||
    root.entities.length !== 399 ||
    !Array.isArray(root.unlockedAreas) ||
    root.unlockedAreas.length !== 234 ||
    !Array.isArray(root.blockedAreas) ||
    root.blockedAreas.length !== 49 ||
    !Array.isArray(root.definitions) ||
    root.definitions.length !== 135
  )
    throw new SourceProjectionError("SOURCE_COUNT_MISMATCH");

  const entities: SourceEntity[] = [];
  const instances = new Set<string>();
  for (const value of root.entities) {
    const item = record(value, ["instance", "entity", "type", "x", "y"]);
    const instance = text(item.instance, /^instance-\d{6}$/);
    const entity = text(item.entity, /^entity-\d{6}$/);
    if (instances.has(instance))
      throw new SourceProjectionError("DUPLICATE_ID");
    instances.add(instance);
    if (!ordinaryClasses.includes(item.type as OrdinaryClass))
      throw new SourceProjectionError("CLASS_UNSUPPORTED");
    const x = axis(item, "x");
    const y = axis(item, "y");
    entities.push({
      instance,
      entity,
      type: item.type as OrdinaryClass,
      ...(x === undefined ? {} : { x }),
      ...(y === undefined ? {} : { y }),
    });
  }
  assertOmissions(entities, entityOmissions);

  const unlockedAreas: SourceRectangle[] = root.unlockedAreas.map((value) => {
    const item = record(value, ["x", "y", "width", "length"]);
    const x = axis(item, "x");
    const y = axis(item, "y");
    return {
      ...(x === undefined ? {} : { x }),
      ...(y === undefined ? {} : { y }),
      width: integer(item.width, 1),
      length: integer(item.length, 1),
    };
  });
  assertOmissions(unlockedAreas, areaOmissions);

  const blockedAreas: SourcePosition[] = root.blockedAreas.map((value) => {
    const item = record(value, ["x", "y"]);
    const x = axis(item, "x");
    const y = axis(item, "y");
    return {
      ...(x === undefined ? {} : { x }),
      ...(y === undefined ? {} : { y }),
    };
  });
  assertOmissions(blockedAreas, blockedOmissions);
  const definitions: SourceDefinition[] = [];
  const definitionIds = new Set<string>();
  for (const value of root.definitions) {
    const item = record(value, [
      "entity",
      "width",
      "length",
      "sizeX",
      "sizeY",
      "legacyStreetLevel",
      "genericStreetLevel",
    ]);
    const entity = text(item.entity, /^entity-\d{6}$/);
    if (definitionIds.has(entity))
      throw new SourceProjectionError("DUPLICATE_ID");
    definitionIds.add(entity);
    const legacy =
      Object.hasOwn(item, "width") && Object.hasOwn(item, "length");
    const generic =
      Object.hasOwn(item, "sizeX") && Object.hasOwn(item, "sizeY");
    if (
      legacy === generic ||
      (legacy &&
        (Object.hasOwn(item, "sizeX") || Object.hasOwn(item, "sizeY"))) ||
      (generic &&
        (Object.hasOwn(item, "width") || Object.hasOwn(item, "length")))
    )
      throw new SourceProjectionError("SOURCE_SHAPE_INVALID");
    const definition: SourceDefinition = { entity };
    for (const key of ["width", "length", "sizeX", "sizeY"] as const)
      if (Object.hasOwn(item, key)) definition[key] = integer(item[key], 1);
    for (const key of ["legacyStreetLevel", "genericStreetLevel"] as const)
      if (Object.hasOwn(item, key)) definition[key] = integer(item[key]);
    definitions.push(definition);
  }
  if (
    entities.some((item) => !definitionIds.has(item.entity)) ||
    definitionIds.size !== new Set(entities.map((item) => item.entity)).size
  )
    throw new SourceProjectionError("DEFINITION_UNKNOWN");

  const excludedCounts = {} as Record<ExcludedClass, number>;
  for (const kind of excludedClasses)
    excludedCounts[kind] = integer(excluded[kind]);
  const excludedTotal = Object.values(excludedCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (
    integer(counts.placedEntities, 0, 1000) !==
      entities.length + excludedTotal ||
    integer(counts.placedDefinitions, 0, 1000) !== definitions.length + 20 ||
    excludedTotal !== 20
  )
    throw new SourceProjectionError("SOURCE_COUNT_MISMATCH");
  return {
    format: "foe24-replay-draft",
    formatVersion: 2,
    entities,
    unlockedAreas,
    blockedAreas,
    definitions,
    sourceCounts: { placedEntities: 419, placedDefinitions: 155 },
    excludedCounts,
    observation: {
      dateUtc: observation.dateUtc as string,
      browser: observation.browser as string,
      assetFingerprint: observation.assetFingerprint as string,
      sourcePaths: sourcePaths.slice(),
      coordinateSemantics: observation.coordinateSemantics as string,
      streetRequirementSemantics:
        observation.streetRequirementSemantics as string,
      blockedSemantics: observation.blockedSemantics as string,
    },
  };
}
