// Disposable issue #26 comparison. This is not a published snapshot contract.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { compile } from "json-schema-to-typescript";
import * as z from "zod";

const schema = JSON.parse(
  readFileSync(new URL("candidate.schema.json", import.meta.url)),
);
const cases = JSON.parse(readFileSync(new URL("cases.json", import.meta.url)));
const ajv = new Ajv2020({ strict: true, allErrors: true });
const schemaValidate = ajv.compile(schema);

const item = z.strictObject({
  id: z.string().min(1).max(16),
  x: z.int().min(0).max(63),
  y: z.int().min(0).max(63),
  width: z.int().min(1).max(8),
  height: z.int().min(1).max(8),
  roadRequirement: z.enum(["NONE", "SINGLE", "DOUBLE"]),
});
const tsFirst = z.strictObject({
  schemaVersion: z.literal("1.0"),
  instances: z.array(item).min(1).max(3),
});
const generatedFromTs = z.toJSONSchema(tsFirst);
writeFileSync(
  new URL("zod-generated.schema.json", import.meta.url),
  JSON.stringify(generatedFromTs, null, 2) + "\n",
);
const types = await compile(schema, "ExperimentalCityShape", {
  bannerComment: "",
});
assert.match(types, /roadRequirement: "NONE" \| "SINGLE" \| "DOUBLE"/);
assert.match(types, /schemaVersion: "1\.0"/);
writeFileSync(new URL("generated.d.ts", import.meta.url), types);

const keys = (value, expected) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).sort().join("|") === expected.slice().sort().join("|");
const integer = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;
const manual = (value) =>
  keys(value, ["schemaVersion", "instances"]) &&
  value.schemaVersion === "1.0" &&
  Array.isArray(value.instances) &&
  value.instances.length >= 1 &&
  value.instances.length <= 3 &&
  value.instances.every(
    (v) =>
      keys(v, ["id", "x", "y", "width", "height", "roadRequirement"]) &&
      typeof v.id === "string" &&
      v.id.length >= 1 &&
      v.id.length <= 16 &&
      integer(v.x, 0, 63) &&
      integer(v.y, 0, 63) &&
      integer(v.width, 1, 8) &&
      integer(v.height, 1, 8) &&
      ["NONE", "SINGLE", "DOUBLE"].includes(v.roadRequirement),
  );

for (const c of cases) {
  const results = {
    schemaFirstAjv: schemaValidate(c.value),
    tsFirstZod: tsFirst.safeParse(c.value).success,
    manualJs: manual(c.value),
  };
  assert.deepEqual(
    results,
    Object.fromEntries(Object.keys(results).map((k) => [k, c.valid])),
    c.name,
  );
  console.log(`${c.name}: ${JSON.stringify(results)}`);
}
console.log(`Generated TypeScript declaration: ${types.length} characters`);
