import assert from "node:assert/strict";
import test from "node:test";

const components = ["apps/extension", "apps/web", "apps/api"];

test("all TypeScript component shells build and import", async () => {
  for (const path of components) {
    const mod = await import(`../${path}/dist/index.js`);
    assert.equal(mod.component, `@foe/${path.split("/")[1]}`);
  }
});

test("shared packages resolve through workspace names", async () => {
  for (const name of ["contracts", "domain", "config", "testing"]) {
    const mod = await import(`@foe/${name}`);
    assert.equal(mod.component, `@foe/${name}`);
  }
});
