import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "foe-city-schema-"));
const output = join(directory, "city-geometry.generated.ts");
try {
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "json2ts",
      "--input",
      "packages/contracts/src/city-geometry.schema.json",
      "--output",
      output,
      "--ignoreMinAndMaxItems",
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
  // The generator adds a blanket directive, but this declaration currently
  // passes lint without it. Keep generated code under the ordinary lint gate.
  writeFileSync(
    output,
    readFileSync(output, "utf8").replace(/^\/\* eslint-disable \*\/\n/, ""),
  );
  const formatted = spawnSync("pnpm", ["exec", "prettier", "--write", output], {
    stdio: "ignore",
  });
  if (formatted.status !== 0) process.exit(formatted.status ?? 1);
  const committed = readFileSync(
    "packages/contracts/src/city-geometry.generated.ts",
    "utf8",
  );
  const actual = readFileSync(output, "utf8");
  if (committed !== actual)
    throw new Error("CITY_GEOMETRY_GENERATED_TYPE_DRIFT");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
