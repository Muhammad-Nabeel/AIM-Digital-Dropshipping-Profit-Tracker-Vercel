import test from "node:test";
import assert from "node:assert/strict";
import { calculateProduct, isPromising, mapImportRow } from "../calc.js";

test("calculates eBay fees, net profit, and margin", () => {
  const result = calculateProduct({ marketplacePrice: 20, supplierCost: 5, shipping: 2, feeRate: 13.25, fixedFee: 0.4 });
  assert.equal(result.ebayFees, 3.05);
  assert.equal(result.netProfit, 9.95);
  assert.equal(result.margin, 49.75);
});

test("uses an imported fee override when provided", () => {
  const result = calculateProduct({ marketplacePrice: 20, supplierCost: 5, shipping: 2, feeRate: 13.25, fixedFee: 0.4, feeOverride: 4 });
  assert.equal(result.ebayFees, 4);
  assert.equal(result.netProfit, 9);
});

test("maps common spreadsheet headers", () => {
  const { product, issues } = mapImportRow({
    "Product Name": "Car storage hook", Marketplace: "eBay AU", "CJ Cost": "A$4.25",
    Shipping: "2.00", "eBay Price": "19.99", Sold: 18, Competition: "low", "IP Risk": "low"
  });
  assert.equal(product.marketplace, "AU");
  assert.equal(product.supplierCost, 4.25);
  assert.equal(product.soldCount, 18);
  assert.deepEqual(issues, []);
});

test("promising rule requires margin, demand, manageable competition, and low risk", () => {
  const product = { marketplacePrice: 20, supplierCost: 5, shipping: 2, feeRate: 13.25, fixedFee: 0.4, soldCount: 12, competition: "Medium", risk: "Low" };
  assert.equal(isPromising(product), true);
  assert.equal(isPromising({ ...product, risk: "High" }), false);
});
