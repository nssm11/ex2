import { test } from "node:test";
import assert from "node:assert/strict";
import { isInStock, isLowStock, isOutOfStock, maxPurchasable, safeStock, stockLabel } from "./stock";

test("safeStock coerces nullish and invalid values to zero", () => {
  assert.equal(safeStock(null), 0);
  assert.equal(safeStock(undefined), 0);
  assert.equal(safeStock(NaN), 0);
  assert.equal(safeStock(-4), 0);
  assert.equal(safeStock(0), 0);
  assert.equal(safeStock("12"), 12);
  assert.equal(safeStock(7.9), 7);
});

test("a product with stock 0, null or undefined is out of stock", () => {
  assert.equal(isOutOfStock(0), true);
  assert.equal(isOutOfStock(null), true, "null stock must be treated as sold out, not available");
  assert.equal(isOutOfStock(undefined), true);
  assert.equal(isInStock(1), true);
});

test("low stock never applies to a sold-out product", () => {
  assert.equal(isLowStock(0, 5), false);
  assert.equal(isLowStock(null, 5), false);
  assert.equal(isLowStock(3, 5), true);
  assert.equal(isLowStock(9, 5), false);
  assert.equal(isLowStock(3, null), false, "a missing threshold must not claim 'last items'");
});

test("maxPurchasable is always a usable stepper bound", () => {
  assert.equal(maxPurchasable(0), 1);
  assert.equal(maxPurchasable(null), 1);
  assert.equal(maxPurchasable(3), 3);
  assert.equal(maxPurchasable(999), 20);
  assert.equal(maxPurchasable(undefined), 1);
});

test("stockLabel reads naturally in French", () => {
  assert.equal(stockLabel(0, 5), "Rupture de stock");
  assert.equal(stockLabel(null, 5), "Rupture de stock");
  assert.equal(stockLabel(3, 5), "Plus que 3 en stock");
  assert.equal(stockLabel(40, 5), "En stock");
});
