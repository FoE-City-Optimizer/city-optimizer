import { Ajv2020 } from "ajv/dist/2020.js";
import schema from "./city-geometry.schema.json" with { type: "json" };
import type { CityGeometryDraft } from "./city-geometry.generated.js";

export type { CityGeometryDraft } from "./city-geometry.generated.js";

const ajv = new Ajv2020({ allErrors: false, strict: true });
ajv.validateSchema(schema);
const validate = ajv.compile<CityGeometryDraft>(schema);

/** Exact-version syntax check; domain invariants are checked separately. */
export function isCityGeometryDraft(
  value: unknown,
): value is CityGeometryDraft {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    (value as Record<string, unknown>).schemaVersion !== "0.1"
  )
    return false;
  return validate(value);
}
