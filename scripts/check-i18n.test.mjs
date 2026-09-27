import assert from "node:assert/strict";
import { test } from "node:test";
import { checkIcuSyntax, findNamespaceOverlap, flattenKeys } from "./check-i18n.mjs";

test("flattenKeys flattens nested objects into dot notation", () => {
  const input = {
    a: {
      b: "hello",
      c: {
        d: "world",
      },
    },
    top: "value",
  };
  const flat = flattenKeys(input);
  assert.deepEqual(flat, {
    "a.b": "hello",
    "a.c.d": "world",
    top: "value",
  });
});

test("checkIcuSyntax catches unbalanced curly braces", () => {
  assert.equal(checkIcuSyntax("{count, plural, one {#} other {#}}"), null);
  assert.notEqual(checkIcuSyntax("{unclosed"), null);
  assert.notEqual(checkIcuSyntax("unopened}"), null);
});

test("findNamespaceOverlap reports top level keys present in both files", async () => {
  const { mkdtempSync, writeFileSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "i18n-"));
  const web = join(dir, "web.json");
  const shared = join(dir, "shared.json");
  writeFileSync(web, JSON.stringify({ common: {}, notifications: {} }));
  writeFileSync(shared, JSON.stringify({ notifications: {}, email: {} }));
  const errors = findNamespaceOverlap(web, shared);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /"notifications"/);
});
