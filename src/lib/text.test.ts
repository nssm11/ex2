import { test } from "node:test";
import assert from "node:assert/strict";
import { foldText, likePattern, searchTokens } from "./text";

test("folding removes French accents and lowercases", () => {
  assert.equal(foldText("Sérum"), "serum");
  assert.equal(foldText("CRÈME"), "creme");
  assert.equal(foldText("Épuisé"), "epuise");
  assert.equal(foldText("Après-soleil"), "apres-soleil");
  assert.equal(foldText("Ça va"), "ca va");
});

test("the accented and folded tables stay the same length", async () => {
  const { ACCENTED, FOLDED } = await import("./text");
  assert.equal(
    [...ACCENTED].length,
    [...FOLDED].length,
    "translate() needs one replacement per accented character",
  );
});

test("searchTokens splits on punctuation and stays bounded", () => {
  assert.deepEqual(searchTokens("Crème Solaire SPF50"), ["creme", "solaire", "spf50"]);
  assert.deepEqual(searchTokens("  "), []);
  assert.equal(searchTokens("a b c d e f g h", 3).length, 3);
});

test("likePattern escapes LIKE wildcards coming from the customer", () => {
  assert.equal(likePattern("50%"), "%50\\%%");
  assert.equal(likePattern("a_b"), "%a\\_b%");
});
