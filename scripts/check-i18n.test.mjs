import assert from "node:assert/strict";
import { test } from "node:test";
import { checkIcuSyntax, flattenKeys } from "./check-i18n.mjs";

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
