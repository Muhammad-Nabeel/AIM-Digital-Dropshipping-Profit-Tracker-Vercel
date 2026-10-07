export const DEFAULT_FEE_RATE = 13.25;
export const DEFAULT_FIXED_FEE = 0.40;

export function numberFrom(value, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (value === null || value === undefined || value === "") return fallback;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function feeRateFrom(value, fallback = DEFAULT_FEE_RATE) {
  const parsed = numberFrom(value, fallback);
  return parsed > 0 && parsed < 1 ? parsed * 100 : parsed;
}

export function calculateProduct(product) {
  const price = Math.max(0, numberFrom(product.marketplacePrice));
  const cost = Math.max(0, numberFrom(product.supplierCost));
  const shipping = Math.max(0, numberFrom(product.shipping));
  const feeRate = Math.max(0, feeRateFrom(product.feeRate));
  const fixedFee = Math.max(0, numberFrom(product.fixedFee, DEFAULT_FIXED_FEE));
  const importedFee = numberFrom(product.feeOverride, NaN);
  const rawFees = Number.isFinite(importedFee)
    ? Math.max(0, importedFee)
    : price * (feeRate / 100) + fixedFee;
  const ebayFees = Math.round((rawFees + Number.EPSILON) * 100) / 100;
  const netProfit = Math.round((price - cost - shipping - ebayFees + Number.EPSILON) * 100) / 100;
  const rawMargin = price > 0 ? (netProfit / price) * 100 : 0;
  const margin = Math.round((rawMargin + Number.EPSILON) * 10000) / 10000;
  return { price, cost, shipping, feeRate, fixedFee, ebayFees, netProfit, margin };
}

export function normalizeMarketplace(value) {
  const text = String(value ?? "").trim().toUpperCase();
  if (["AU", "AUS", "AUSTRALIA", "EBAY AU", "EBAY.COM.AU"].includes(text)) return "AU";
  return "US";
}

export function normalizeRating(value, fallback = "Medium") {
  const text = String(value ?? "").trim().toLowerCase();
  if (["low", "l", "1"].includes(text)) return "Low";
  if (["high", "h", "3"].includes(text)) return "High";
  if (["medium", "med", "m", "2"].includes(text)) return "Medium";
  return fallback;
}

export function isWebUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isPromising(product) {
  const { margin } = calculateProduct(product);
  return margin >= 25 && numberFrom(product.soldCount) >= 10 && product.competition !== "High" && product.risk === "Low";
}

const aliases = {
  name: ["product", "product name", "name", "title", "item"],
  marketplace: ["marketplace", "market", "country", "ebay marketplace"],
  supplier: ["supplier", "source", "supplier platform", "platform"],
  supplierCost: ["supplier cost", "product cost", "item cost", "cost", "source price", "aliexpress cost", "cj cost"],
  shipping: ["shipping", "shipping cost", "delivery cost", "postage"],
  marketplacePrice: ["marketplace price", "ebay price", "selling price", "sale price", "price", "revenue"],
  feeRate: ["ebay fee %", "fee rate", "fee %", "ebay fee rate"],
  fixedFee: ["fixed fee", "order fee", "transaction fee"],
  feeOverride: ["ebay fees", "ebay fee", "total fees", "fees"],
  soldCount: ["sold count", "sold", "sales", "items sold"],
  competition: ["competition", "competition rating", "competition level"],
  risk: ["ip risk", "ip-risk rating", "risk", "risk rating", "ip risk rating"],
  supplierLink: ["supplier link", "supplier url", "aliexpress link", "cj link", "source link"],
  ebayLink: ["ebay link", "ebay listing link", "listing link", "listing url", "exact ebay listing link"],
  notes: ["notes", "comments", "reason"]
};

function cleanHeader(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

export function mapImportRow(row, index = 0) {
  const clean = {};
  for (const [header, value] of Object.entries(row)) clean[cleanHeader(header)] = value;
  const read = (field) => {
    for (const alias of aliases[field]) {
      if (Object.prototype.hasOwnProperty.call(clean, alias)) return clean[alias];
    }
    return undefined;
  };
  const product = {
    id: `import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(read("name") ?? "").trim(),
    marketplace: normalizeMarketplace(read("marketplace")),
    supplier: String(read("supplier") ?? "AliExpress").trim() || "AliExpress",
    supplierCost: numberFrom(read("supplierCost")),
    shipping: numberFrom(read("shipping")),
    marketplacePrice: numberFrom(read("marketplacePrice")),
    feeRate: feeRateFrom(read("feeRate")),
    fixedFee: numberFrom(read("fixedFee"), DEFAULT_FIXED_FEE),
    feeOverride: read("feeOverride") === undefined || read("feeOverride") === "" ? "" : numberFrom(read("feeOverride")),
    soldCount: Math.max(0, Math.round(numberFrom(read("soldCount")))),
    competition: normalizeRating(read("competition")),
    risk: normalizeRating(read("risk")),
    supplierLink: String(read("supplierLink") ?? "").trim(),
    ebayLink: String(read("ebayLink") ?? "").trim(),
    notes: String(read("notes") ?? "").trim(),
    shortlisted: false,
    createdAt: new Date().toISOString()
  };
  const issues = [];
  if (!product.name) issues.push("Missing product name");
  if (product.marketplacePrice <= 0) issues.push("Marketplace price must be above 0");
  if (product.supplierCost < 0 || product.shipping < 0) issues.push("Costs cannot be negative");
  if (product.supplierLink && !isWebUrl(product.supplierLink)) issues.push("Supplier link is not a valid URL");
  if (product.ebayLink && !isWebUrl(product.ebayLink)) issues.push("eBay link is not a valid URL");
  return { product, issues };
}

export const IMPORT_HEADERS = [
  "Product Name", "Marketplace", "Supplier", "Supplier Cost", "Shipping Cost",
  "Marketplace Price", "eBay Fee %", "Fixed Fee", "Sold Count", "Competition",
  "IP Risk", "Supplier Link", "Exact eBay Listing Link", "Notes"
];
