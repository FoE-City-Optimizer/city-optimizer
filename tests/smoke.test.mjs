import assert from "node:assert/strict";
import test from "node:test";

const components = [
  "apps/extension",
  "apps/web",
  "apps/api",
  "packages/contracts",
  "packages/domain",
  "packages/config",
  "packages/testing",
];

test("all TypeScript component shells build and import", async () => {
  for (const path of components) {
    const mod = await import(`../${path}/dist/index.js`);
    assert.equal(mod.component, `@foe/${path.split("/")[1]}`);
  }
});
