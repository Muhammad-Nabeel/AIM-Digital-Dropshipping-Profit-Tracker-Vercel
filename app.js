import {
  DEFAULT_FEE_RATE,
  DEFAULT_FIXED_FEE,
  IMPORT_HEADERS,
  calculateProduct,
  isPromising,
  isWebUrl,
  mapImportRow,
  normalizeRating,
  numberFrom
} from "./calc.js";

const STORAGE_KEY = "aim-digital-dropshipping-products-v1";
const TREND_IDEAS = [
  { id: "snow-cover", name: "Magnetic windshield snow cover", market: "US", category: "Auto", timing: "Q4 rising", score: 92, competition: "Medium", risk: "Low", price: 24.99, reason: "Cold-weather utility with a clear September–winter testing window.", keywords: "magnetic windshield snow cover car", source: "AliExpress" },
  { id: "seat-gap", name: "2-piece car seat gap organiser", market: "Both", category: "Auto", timing: "Evergreen", score: 89, competition: "Medium", risk: "Low", price: 22.99, reason: "Universal fit and an easy problem-solution listing angle.", keywords: "2 piece car seat gap organizer", source: "AliExpress" },
  { id: "trim-tools", name: "5-piece car trim removal tool kit", market: "Both", category: "Auto", timing: "Evergreen", score: 87, competition: "Medium", risk: "Low", price: 16.99, reason: "Low-cost, compact and suitable for bundle-led offers.", keywords: "5 piece car trim removal tool kit", source: "Amazon" },
  { id: "phone-mount", name: "Foldable magnetic car phone mount 2-pack", market: "US", category: "Auto", timing: "Evergreen", score: 84, competition: "High", risk: "Low", price: 19.99, reason: "Strong utility; a 2-pack and fast delivery can separate the offer.", keywords: "foldable magnetic car phone mount 2 pack", source: "AliExpress" },
  { id: "door-guard", name: "Universal car door edge guard trim", market: "AU", category: "Auto", timing: "Steady", score: 83, competition: "Medium", risk: "Low", price: 21.95, reason: "Generic fitment and a simple protection benefit for daily drivers.", keywords: "universal car door edge guard trim", source: "AliExpress" },
  { id: "sunshade", name: "Foldable car windshield sun shade umbrella", market: "AU", category: "Auto", timing: "Spring rising", score: 91, competition: "Medium", risk: "Low", price: 27.95, reason: "Australia's warmer season creates a timely comfort-led angle.", keywords: "car windshield sun shade umbrella", source: "Amazon" },
  { id: "mailbox-decal", name: "Personalised mailbox address number decal", market: "Both", category: "Decals", timing: "Evergreen", score: 94, competition: "Low", risk: "Low", price: 16.99, reason: "Customisation supports healthy pricing with low shipping weight.", keywords: "personalized mailbox address number vinyl decal", source: "Amazon" },
  { id: "boat-numbers", name: "Custom boat registration number vinyl decals", market: "AU", category: "Decals", timing: "Spring rising", score: 90, competition: "Low", risk: "Low", price: 24.95, reason: "A practical custom decal with strong local boating relevance.", keywords: "custom boat registration number vinyl decal", source: "Amazon" },
  { id: "pet-board", name: "Custom pet on board car window decal", market: "Both", category: "Decals", timing: "Giftable", score: 86, competition: "Medium", risk: "Low", price: 13.99, reason: "Personalisation and pet gifting create an emotional purchase angle.", keywords: "custom pet on board car window decal", source: "AliExpress" },
  { id: "christmas-window", name: "Reusable Christmas window decal set", market: "Both", category: "Seasonal", timing: "Q4 rising", score: 93, competition: "Medium", risk: "Low", price: 14.99, reason: "Lightweight seasonal stock with a clear October–December window.", keywords: "reusable christmas window decal set", source: "AliExpress" },
  { id: "gift-labels", name: "Personalised Christmas gift label stickers", market: "Both", category: "Seasonal", timing: "Q4 rising", score: 88, competition: "Medium", risk: "Low", price: 11.99, reason: "Repeat-order potential and easy themed bundle variations.", keywords: "personalized christmas gift label stickers", source: "Amazon" },
  { id: "pantry-labels", name: "Minimal pantry label sticker set", market: "Both", category: "Home", timing: "Evergreen", score: 82, competition: "Medium", risk: "Low", price: 15.99, reason: "Organisation content keeps this useful beyond seasonal peaks.", keywords: "minimal pantry label sticker set", source: "AliExpress" }
];
const Q4_PRODUCTS = [
  { id:"q4-blanket", name:"Custom photo fleece blanket", rank:1, supplierPrice:"Varies by size", shipping:"Live quote needed", stage:"Best first test", risk:"Low with customer-owned photos", privateLabel:"Excellent", evidence:"Exact competitor observed at $39.99 · 473 sold", exactEbay:true, aliexpress:"https://www.aliexpress.com/item/1005001555388349.html", ebay:"https://www.ebay.com/itm/265185036264", targetPrice:39.99 },
  { id:"q4-led", name:"Personalized acrylic LED night light", rank:2, supplierPrice:"About $19.74", shipping:"Live quote needed", stage:"High-AOV gift", risk:"Low with original designs", privateLabel:"Excellent", evidence:"Market search — verify current sold data", exactEbay:false, aliexpress:"https://www.aliexpress.com/item/1005010589031019.html", ebay:"https://www.ebay.com/sch/i.html?_nkw=personalized+photo+acrylic+LED+night+light&LH_Sold=1&LH_Complete=1", targetPrice:39.99 },
  { id:"q4-doormat", name:"Personalized family-name doormat", rank:3, supplierPrice:"About $19.43", shipping:"Live quote needed", stage:"Home personalization", risk:"Low with original typography", privateLabel:"Excellent", evidence:"Market search — verify current sold data", exactEbay:false, aliexpress:"https://www.aliexpress.com/item/32979944257.html", ebay:"https://www.ebay.com/sch/i.html?_nkw=personalized+family+name+doormat&LH_Sold=1&LH_Complete=1", targetPrice:39.99 },
  { id:"q4-stocking", name:"Personalized Christmas stocking", rank:4, supplierPrice:"Supplier check needed", shipping:"Live quote needed", stage:"Seasonal quick test", risk:"Low without characters or logos", privateLabel:"Good", evidence:"Exact competitor observed at $38 · 187 sold", exactEbay:true, aliexpress:"https://www.aliexpress.com/w/wholesale-personalized-christmas-stocking.html", ebay:"https://www.ebay.com/itm/295290667757", targetPrice:24.99 },
  { id:"q4-ornament", name:"Personalized photo ornament", rank:5, supplierPrice:"Supplier check needed", shipping:"Live quote needed", stage:"Lightweight priority", risk:"Low with original designs", privateLabel:"Excellent", evidence:"Market search — verify current sold data", exactEbay:false, aliexpress:"https://www.aliexpress.com/w/wholesale-personalized-photo-christmas-ornament.html", ebay:"https://www.ebay.com/sch/i.html?_nkw=personalized+photo+christmas+ornament&LH_Sold=1&LH_Complete=1", targetPrice:19.99 },
  { id:"q4-mug", name:"Custom photo mug", rank:6, supplierPrice:"Supplier check needed", shipping:"Live quote needed", stage:"Giftable evergreen", risk:"Low with customer-owned artwork", privateLabel:"Excellent", evidence:"Market search — verify current sold data", exactEbay:false, aliexpress:"https://www.aliexpress.com/w/wholesale-custom-photo-mug-dropshipping.html", ebay:"https://www.ebay.com/sch/i.html?_nkw=personalized+photo+mug&LH_Sold=1&LH_Complete=1", targetPrice:19.99 }
];
const els = Object.fromEntries([
  "productRows", "emptyState", "emptyTitle", "emptyCopy", "emptyAction", "marketFilter", "marginFilter",
  "marginValue", "soldFilter", "competitionFilter", "riskFilter", "searchInput", "metricProducts",
  "metricShortlisted", "metricMargin", "metricProfit", "metricProfitHint", "metricPromising", "allCount",
  "promisingCount", "shortlistCount", "resultCount", "productDialog", "productForm", "productDialogTitle",
  "formProfit", "formMargin", "formFormula", "importDialog", "fileInput", "dropzone", "importPreview",
  "previewRows", "previewTitle", "previewMeta", "confirmImportBtn", "filtersPanel", "toast"
].map(id => [id, document.getElementById(id)]));

const state = {
  products: loadProducts(),
  view: "all",
  sort: { key: "margin", direction: "desc" },
  importRows: [],
  activeMenu: null
  , trendMarket: "all"
};

function marketSearchDomain(market) {
  return market === "AU" ? "ebay.com.au" : "ebay.com";
}

function searchUrl(site, keywords, market = "US") {
  const q = encodeURIComponent(keywords);
  if (site === "ebay") return `https://www.${marketSearchDomain(market)}/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1`;
  if (site === "aliexpress") return `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(keywords.trim().replace(/\s+/g, "-"))}.html`;
  return market === "AU" ? `https://www.amazon.com.au/s?k=${q}` : `https://www.amazon.com/s?k=${q}`;
}

function trendMarketForIdea(idea) {
  if (idea.market === "AU") return "AU";
  return "US";
}

function filteredTrends() {
  const category = document.getElementById("trendCategory").value;
  const search = document.getElementById("trendSearch").value.trim().toLowerCase();
  return TREND_IDEAS.filter(idea =>
    (state.trendMarket === "all" || idea.market === "Both" || idea.market === state.trendMarket) &&
    (category === "all" || idea.category === category) &&
    (!search || `${idea.name} ${idea.category} ${idea.timing} ${idea.reason}`.toLowerCase().includes(search))
  ).sort((a, b) => b.score - a.score);
}

function renderTrends() {
  const ideas = filteredTrends();
  const grid = document.getElementById("trendGrid");
  document.getElementById("trendResultCount").textContent = ideas.length;
  document.getElementById("trendEmpty").hidden = ideas.length > 0;
  grid.innerHTML = ideas.map(idea => {
    const market = idea.market === "Both" ? (state.trendMarket === "AU" ? "AU" : "US") : idea.market;
    const marketLabel = idea.market === "Both" ? "US + AU" : `eBay ${idea.market}`;
    return `<article class="trend-card" data-trend-id="${esc(idea.id)}">
      <div class="trend-card-head"><div><span class="market-tag ${idea.market === "AU" ? "au" : ""}">${marketLabel}</span><span class="trend-category">${esc(idea.category)}</span></div><div class="priority-score"><strong>${idea.score}</strong><small>priority</small></div></div>
      <h2>${esc(idea.name)}</h2>
      <p>${esc(idea.reason)}</p>
      <div class="trend-meta"><span><small>Timing</small><strong>${esc(idea.timing)}</strong></span><span><small>Competition</small><strong>${esc(idea.competition)}</strong></span><span><small>IP risk</small><strong class="risk-text">${esc(idea.risk)}</strong></span><span><small>Target price</small><strong>${formatMoney(idea.price, market)}</strong></span></div>
      <div class="source-links">
        <a href="${searchUrl("ebay", idea.keywords, market)}" target="_blank" rel="noopener">Check eBay sold</a>
        <a href="${searchUrl("aliexpress", idea.keywords, market)}" target="_blank" rel="noopener">AliExpress</a>
        <a href="${searchUrl("amazon", idea.keywords, market)}" target="_blank" rel="noopener">Amazon</a>
      </div>
      <button class="btn btn-soft full trend-add" data-trend-add="${esc(idea.id)}">Add to profit tracker <span>→</span></button>
    </article>`;
  }).join("");
}

function switchAppView(view) {
  const isTrends = view === "trends";
  const isQ4 = view === "q4";
  document.getElementById("trackerView").hidden = isTrends || isQ4;
  document.getElementById("trendsView").hidden = !isTrends;
  document.getElementById("q4View").hidden = !isQ4;
  document.querySelectorAll("[data-app-view]").forEach(button => {
    const active = button.dataset.appView === view;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
  });
  if (isTrends) renderTrends();
  if (isQ4) renderQ4();
}

function renderQ4() {
  document.getElementById("q4Count").textContent = Q4_PRODUCTS.length;
  document.getElementById("q4Grid").innerHTML = Q4_PRODUCTS.map(product => `<article class="q4-card">
    <div class="q4-card-top"><span class="q4-rank">#${product.rank}</span><span class="q4-stage">${esc(product.stage)}</span></div>
    <h2>${esc(product.name)}</h2><p class="q4-evidence ${product.exactEbay ? "exact" : ""}">${product.exactEbay ? "✓ Exact eBay listing" : "⌕ eBay sold-results search"}<small>${esc(product.evidence)}</small></p>
    <div class="q4-costs"><span><small>AliExpress item price</small><strong>${esc(product.supplierPrice)}</strong></span><span><small>US shipping</small><strong>${esc(product.shipping)}</strong></span><span class="landed"><small>Actual landed cost</small><strong>Pending live quote</strong></span></div>
    <div class="q4-notes"><p><strong>IP risk:</strong> ${esc(product.risk)}</p><p><strong>Private label potential:</strong> ${esc(product.privateLabel)}</p><p><strong>Target eBay price:</strong> $${product.targetPrice.toFixed(2)}</p></div>
    <div class="source-links q4-links"><a href="${product.aliexpress}" target="_blank" rel="noopener">AliExpress ${product.aliexpress.includes("/item/") ? "exact item" : "supplier search"}</a><a href="${product.ebay}" target="_blank" rel="noopener">eBay ${product.exactEbay ? "exact listing" : "sold search"}</a></div>
    <button class="btn btn-soft full" data-q4-add="${product.id}">Add quote to profit tracker <span>→</span></button>
  </article>`).join("");
}

function openQ4InTracker(product) {
  switchAppView("tracker");
  openProduct({ id:"", name:product.name, marketplace:"US", supplier:"AliExpress", supplierCost:0, shipping:0, marketplacePrice:product.targetPrice, soldCount:0, feeRate:DEFAULT_FEE_RATE, fixedFee:DEFAULT_FIXED_FEE, competition:"Medium", risk:"Low", supplierLink:product.aliexpress, ebayLink:product.ebay, notes:"Q4 candidate — enter the exact variant price and live US shipping quote before relying on profit or margin." });
}

function openTrendInTracker(idea) {
  const market = idea.market === "Both" ? (state.trendMarket === "AU" ? "AU" : "US") : idea.market;
  const supplierLink = searchUrl(idea.source === "Amazon" ? "amazon" : "aliexpress", idea.keywords, market);
  const ebayLink = searchUrl("ebay", idea.keywords, market);
  switchAppView("tracker");
  openProduct({
    id: "", name: idea.name, marketplace: market, supplier: idea.source,
    supplierCost: 0, shipping: 0, marketplacePrice: idea.price, soldCount: 0,
    feeRate: DEFAULT_FEE_RATE, fixedFee: DEFAULT_FIXED_FEE, competition: idea.competition,
    risk: idea.risk, supplierLink, ebayLink,
    notes: `${idea.timing} trend idea — verify sold count, landed cost and delivery time before listing.`
  });
}

function demoProducts() {
  const now = new Date().toISOString();
  return [
    { id: crypto.randomUUID(), name: "2-piece car seat gap organiser", marketplace: "US", supplier: "AliExpress", supplierCost: 6.80, shipping: 1.99, marketplacePrice: 22.99, feeRate: 13.25, fixedFee: .40, feeOverride: "", soldCount: 34, competition: "Medium", risk: "Low", supplierLink: "", ebayLink: "", notes: "Demo row — replace with verified research", shortlisted: true, createdAt: now },
    { id: crypto.randomUUID(), name: "Personalised mailbox address decal", marketplace: "AU", supplier: "Other", supplierCost: 3.10, shipping: 2.40, marketplacePrice: 17.95, feeRate: 13.25, fixedFee: .40, feeOverride: "", soldCount: 27, competition: "Low", risk: "Low", supplierLink: "", ebayLink: "", notes: "Demo row — replace with verified research", shortlisted: true, createdAt: now },
    { id: crypto.randomUUID(), name: "Universal magnetic phone holder", marketplace: "US", supplier: "CJdropshipping", supplierCost: 7.00, shipping: 3.20, marketplacePrice: 17.99, feeRate: 13.25, fixedFee: .40, feeOverride: "", soldCount: 16, competition: "High", risk: "Low", supplierLink: "", ebayLink: "", notes: "Demo row — replace with verified research", shortlisted: false, createdAt: now },
    { id: crypto.randomUUID(), name: "Car trim removal tool set", marketplace: "AU", supplier: "AliExpress", supplierCost: 4.35, shipping: 1.75, marketplacePrice: 18.90, feeRate: 13.25, fixedFee: .40, feeOverride: "", soldCount: 41, competition: "Medium", risk: "Low", supplierLink: "", ebayLink: "", notes: "Demo row — replace with verified research", shortlisted: false, createdAt: now },
    { id: crypto.randomUUID(), name: "Logo-style performance badge", marketplace: "US", supplier: "AliExpress", supplierCost: 2.70, shipping: 1.20, marketplacePrice: 12.99, feeRate: 13.25, fixedFee: .40, feeOverride: "", soldCount: 8, competition: "Medium", risk: "High", supplierLink: "", ebayLink: "", notes: "Demo row showing a higher IP-risk decision", shortlisted: false, createdAt: now }
  ];
}

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : demoProducts();
  } catch {
    return demoProducts();
  }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products)); }
  catch { showToast("Could not save locally. Export a CSV backup."); }
}

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function formatMoney(value, marketplace) {
  const amount = numberFrom(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: marketplace === "AU" ? "AUD" : "USD", maximumFractionDigits: 2
  }).format(amount);
}

function currentFilters() {
  return {
    marketplace: els.marketFilter.value,
    minMargin: numberFrom(els.marginFilter.value, -50),
    minSold: numberFrom(els.soldFilter.value, 0),
    competition: [...els.competitionFilter.querySelectorAll(".chip.active")].map(x => x.dataset.value),
    risk: [...els.riskFilter.querySelectorAll(".chip.active")].map(x => x.dataset.value),
    search: els.searchInput.value.trim().toLowerCase()
  };
}

function filteredProducts() {
  const f = currentFilters();
  const ratingOrder = { Low: 1, Medium: 2, High: 3 };
  return state.products
    .filter(product => {
      const calc = calculateProduct(product);
      const matchesView = state.view === "all" || (state.view === "promising" && isPromising(product)) || (state.view === "shortlist" && product.shortlisted);
      const haystack = `${product.name} ${product.supplier} ${product.notes}`.toLowerCase();
      return matchesView &&
        (f.marketplace === "all" || product.marketplace === f.marketplace) &&
        calc.margin >= f.minMargin && numberFrom(product.soldCount) >= f.minSold &&
        f.competition.includes(product.competition) && f.risk.includes(product.risk) &&
        (!f.search || haystack.includes(f.search));
    })
    .sort((a, b) => {
      const calcA = calculateProduct(a); const calcB = calculateProduct(b);
      let av = a[state.sort.key] ?? calcA[state.sort.key];
      let bv = b[state.sort.key] ?? calcB[state.sort.key];
      if (["competition", "risk"].includes(state.sort.key)) { av = ratingOrder[av]; bv = ratingOrder[bv]; }
      if (typeof av === "string") return av.localeCompare(bv) * (state.sort.direction === "asc" ? 1 : -1);
      return (numberFrom(av) - numberFrom(bv)) * (state.sort.direction === "asc" ? 1 : -1);
    });
}

function render() {
  const products = filteredProducts();
  els.productRows.innerHTML = products.map(productRow).join("");
  const noRows = products.length === 0;
  els.emptyState.hidden = !noRows;
  if (noRows) {
    const isTrulyEmpty = state.products.length === 0;
    els.emptyTitle.textContent = isTrulyEmpty ? "Start your research shortlist" : "No products match this view";
    els.emptyCopy.textContent = isTrulyEmpty ? "Add a product manually or import an existing Excel or CSV research file." : "Clear or adjust the filters to bring more products into view.";
    els.emptyAction.textContent = isTrulyEmpty ? "Add first product" : "Clear filters";
  }
  renderMetrics(products);
  renderCounts(products.length);
  renderRange();
}

function productRow(product) {
  const calc = calculateProduct(product);
  const profitClass = calc.netProfit >= 0 ? "profit-positive" : "profit-negative";
  const supplierLink = isWebUrl(product.supplierLink)
    ? `<a class="link-btn" href="${esc(product.supplierLink)}" target="_blank" rel="noopener" title="Open ${esc(product.supplier)} supplier link">S</a>`
    : `<span class="link-btn disabled" title="No supplier link">S</span>`;
  const ebayLink = isWebUrl(product.ebayLink)
    ? `<a class="link-btn" href="${esc(product.ebayLink)}" target="_blank" rel="noopener" title="Open exact eBay listing">e</a>`
    : `<span class="link-btn disabled" title="No eBay listing link">e</span>`;
  return `<tr data-id="${esc(product.id)}">
    <td><button class="star-btn ${product.shortlisted ? "active" : ""}" data-action="shortlist" aria-label="${product.shortlisted ? "Remove from" : "Add to"} shortlist">★</button></td>
    <td class="product-cell"><strong>${esc(product.name)}</strong><small>${esc(product.supplier)}</small>${isPromising(product) ? '<span class="promising-badge">✦ Promising</span>' : ""}</td>
    <td><span class="market-tag ${product.marketplace === "AU" ? "au" : ""}">eBay ${esc(product.marketplace)}</span></td>
    <td class="money">${formatMoney(calc.cost, product.marketplace)}</td>
    <td class="money">${formatMoney(calc.shipping, product.marketplace)}</td>
    <td class="money"><strong>${formatMoney(calc.price, product.marketplace)}</strong></td>
    <td class="money" title="${product.feeOverride !== "" ? "Imported fee override" : `${calc.feeRate.toFixed(2)}% + ${formatMoney(calc.fixedFee, product.marketplace)}`}">${formatMoney(calc.ebayFees, product.marketplace)}</td>
    <td class="money ${profitClass}">${formatMoney(calc.netProfit, product.marketplace)}</td>
    <td><strong class="${profitClass}">${calc.margin.toFixed(1)}%</strong><div class="margin-bar"><span style="width:${Math.max(0, Math.min(100, calc.margin))}%"></span></div></td>
    <td><strong>${numberFrom(product.soldCount).toLocaleString()}</strong></td>
    <td><span class="badge ${product.competition.toLowerCase()}">${esc(product.competition)}</span></td>
    <td><span class="badge ${product.risk.toLowerCase()}">${esc(product.risk)}</span></td>
    <td><div class="links">${supplierLink}${ebayLink}</div></td>
    <td class="row-actions"><button class="row-menu" data-action="menu" aria-label="Product actions">⋯</button>${state.activeMenu === product.id ? `<div class="action-menu"><button data-action="edit">Edit product</button><button data-action="duplicate">Duplicate</button><button data-action="delete" class="danger">Delete</button></div>` : ""}</td>
  </tr>`;
}

function renderMetrics(products) {
  const margins = products.map(p => calculateProduct(p).margin);
  const avg = margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : 0;
  const shortlist = state.products.filter(p => p.shortlisted).length;
  const market = els.marketFilter.value;
  els.metricProducts.textContent = products.length.toLocaleString();
  els.metricShortlisted.textContent = `${shortlist} shortlisted`;
  els.metricMargin.textContent = `${avg.toFixed(1)}%`;
  els.metricPromising.textContent = products.filter(isPromising).length.toLocaleString();
  if (market === "all") {
    const us = products.filter(p => p.marketplace === "US").reduce((sum, p) => sum + calculateProduct(p).netProfit, 0);
    const au = products.filter(p => p.marketplace === "AU").reduce((sum, p) => sum + calculateProduct(p).netProfit, 0);
    els.metricProfit.textContent = products.length ? `${formatMoney(us, "US")} · ${formatMoney(au, "AU")}` : "—";
    els.metricProfitHint.textContent = "US total · AU total, kept separate";
  } else {
    const total = products.reduce((sum, p) => sum + calculateProduct(p).netProfit, 0);
    els.metricProfit.textContent = formatMoney(total, market);
    els.metricProfitHint.textContent = `Combined ${market === "AU" ? "AUD" : "USD"} per-order profit`;
  }
}

function renderCounts(resultCount) {
  els.allCount.textContent = state.products.length;
  els.promisingCount.textContent = state.products.filter(isPromising).length;
  els.shortlistCount.textContent = state.products.filter(p => p.shortlisted).length;
  els.resultCount.textContent = `${resultCount} ${resultCount === 1 ? "product" : "products"}`;
}

function renderRange() {
  const value = numberFrom(els.marginFilter.value, -50);
  els.marginValue.textContent = value <= -50 ? "Any" : `${value}%`;
  const pct = ((value + 50) / 120) * 100;
  els.marginFilter.style.background = `linear-gradient(90deg, var(--sage) ${pct}%, var(--beige) ${pct}%)`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function clearFilters() {
  els.marketFilter.value = "all";
  els.marginFilter.value = -50;
  els.soldFilter.value = "";
  els.searchInput.value = "";
  document.querySelectorAll(".chip").forEach(chip => chip.classList.add("active"));
  state.view = "all";
  document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.view === "all"));
  render();
}

function openProduct(product = null) {
  els.productForm.reset();
  els.productForm.elements.feeRate.value = DEFAULT_FEE_RATE;
  els.productForm.elements.fixedFee.value = DEFAULT_FIXED_FEE.toFixed(2);
  els.productDialogTitle.textContent = product ? "Edit product" : "Add product";
  els.productForm.elements.editId.value = product?.id ?? "";
  if (product) {
    for (const [key, value] of Object.entries(product)) {
      if (els.productForm.elements[key]) els.productForm.elements[key].value = value ?? "";
    }
  }
  updateFormCalc();
  els.productDialog.showModal();
  setTimeout(() => els.productForm.elements.name.focus(), 20);
}

function productFromForm(form) {
  const data = new FormData(form);
  return {
    id: data.get("editId") || crypto.randomUUID(),
    name: data.get("name").trim(), marketplace: data.get("marketplace"), supplier: data.get("supplier"),
    supplierCost: numberFrom(data.get("supplierCost")), shipping: numberFrom(data.get("shipping")),
    marketplacePrice: numberFrom(data.get("marketplacePrice")), soldCount: Math.max(0, Math.round(numberFrom(data.get("soldCount")))),
    feeRate: numberFrom(data.get("feeRate"), DEFAULT_FEE_RATE), fixedFee: numberFrom(data.get("fixedFee"), DEFAULT_FIXED_FEE), feeOverride: "",
    competition: normalizeRating(data.get("competition")), risk: normalizeRating(data.get("risk")),
    supplierLink: data.get("supplierLink").trim(), ebayLink: data.get("ebayLink").trim(), notes: data.get("notes").trim(),
    shortlisted: state.products.find(x => x.id === data.get("editId"))?.shortlisted ?? false,
    createdAt: state.products.find(x => x.id === data.get("editId"))?.createdAt ?? new Date().toISOString()
  };
}

function updateFormCalc() {
  const product = productFromForm(els.productForm);
  const calc = calculateProduct(product);
  if (!product.marketplacePrice) {
    els.formProfit.textContent = "—"; els.formMargin.textContent = "—"; return;
  }
  els.formProfit.textContent = formatMoney(calc.netProfit, product.marketplace);
  els.formProfit.style.color = calc.netProfit >= 0 ? "var(--green)" : "var(--red)";
  els.formMargin.textContent = `${calc.margin.toFixed(1)}%`;
  els.formMargin.style.color = calc.margin >= 0 ? "var(--green)" : "var(--red)";
  els.formFormula.textContent = `${formatMoney(calc.price, product.marketplace)} − ${formatMoney(calc.cost, product.marketplace)} − ${formatMoney(calc.shipping, product.marketplace)} − ${formatMoney(calc.ebayFees, product.marketplace)}`;
}

function saveProduct(event) {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  if (!els.productForm.reportValidity()) return;
  const product = productFromForm(els.productForm);
  const existing = state.products.findIndex(x => x.id === product.id);
  if (existing >= 0) state.products.splice(existing, 1, product); else state.products.unshift(product);
  persist(); render(); els.productDialog.close();
  showToast(existing >= 0 ? "Product updated" : "Product added to research");
}

function handleRowAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const row = button.closest("tr");
  const product = state.products.find(x => x.id === row?.dataset.id);
  if (!product) return;
  const action = button.dataset.action;
  if (action === "menu") { state.activeMenu = state.activeMenu === product.id ? null : product.id; render(); return; }
  if (action === "shortlist") { product.shortlisted = !product.shortlisted; persist(); render(); showToast(product.shortlisted ? "Added to shortlist" : "Removed from shortlist"); return; }
  if (action === "edit") openProduct(product);
  if (action === "duplicate") {
    state.activeMenu = null;
    state.products.unshift({ ...product, id: crypto.randomUUID(), name: `${product.name} (copy)`, shortlisted: false, createdAt: new Date().toISOString() });
    persist(); render(); showToast("Product duplicated");
  }
  if (action === "delete") {
    state.activeMenu = null;
    state.products = state.products.filter(x => x.id !== product.id);
    persist(); render(); showToast("Product deleted");
  }
  state.activeMenu = null;
}

async function parseFile(file) {
  if (!window.XLSX) throw new Error("Spreadsheet reader is unavailable");
  const data = await file.arrayBuffer();
  const workbook = window.XLSX.read(data, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return window.XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

async function previewFile(file) {
  if (!file) return;
  const extension = file.name.split(".").pop().toLowerCase();
  if (!["csv", "xlsx", "xls"].includes(extension)) { showToast("Choose a .xlsx, .xls or .csv file"); return; }
  try {
    const rows = await parseFile(file);
    if (!rows.length) throw new Error("No data rows found");
    state.importRows = rows.map((row, index) => mapImportRow(row, index));
    const valid = state.importRows.filter(x => x.issues.length === 0).length;
    els.previewTitle.textContent = file.name;
    els.previewMeta.textContent = `${rows.length} rows found · ${valid} ready · ${rows.length - valid} need attention`;
    els.previewRows.innerHTML = state.importRows.slice(0, 100).map(({ product, issues }) => {
      const calc = calculateProduct(product);
      return `<tr><td class="${issues.length ? "status-error" : "status-ok"}">${issues.length ? "Needs fix" : "Ready"}</td><td>${esc(product.name || "—")}</td><td>${esc(product.marketplace)}</td><td>${formatMoney(product.supplierCost, product.marketplace)}</td><td>${formatMoney(product.marketplacePrice, product.marketplace)}</td><td>${calc.margin.toFixed(1)}%</td><td>${esc(issues.join("; ") || "—")}</td></tr>`;
    }).join("");
    els.dropzone.hidden = true;
    document.querySelector(".import-guidance").hidden = true;
    els.importPreview.hidden = false;
    els.confirmImportBtn.disabled = valid === 0;
    els.confirmImportBtn.textContent = `Import ${valid} valid ${valid === 1 ? "row" : "rows"}`;
  } catch (error) {
    showToast(`Import failed: ${error.message}`);
  }
}

function resetImport() {
  state.importRows = [];
  els.fileInput.value = "";
  els.dropzone.hidden = false;
  document.querySelector(".import-guidance").hidden = false;
  els.importPreview.hidden = true;
}

function confirmImport() {
  const valid = state.importRows.filter(x => x.issues.length === 0).map(x => x.product);
  state.products = [...valid, ...state.products];
  persist(); render(); els.importDialog.close(); resetImport();
  showToast(`${valid.length} ${valid.length === 1 ? "product" : "products"} imported`);
}

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

function download(name, content, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function exportCsv() {
  const headers = [...IMPORT_HEADERS, "Calculated eBay Fees", "Estimated Net Profit", "Margin %", "Shortlisted"];
  const rows = filteredProducts().map(p => {
    const c = calculateProduct(p);
    return [p.name, p.marketplace, p.supplier, p.supplierCost, p.shipping, p.marketplacePrice, p.feeRate, p.fixedFee, p.soldCount, p.competition, p.risk, p.supplierLink, p.ebayLink, p.notes, c.ebayFees.toFixed(2), c.netProfit.toFixed(2), c.margin.toFixed(2), p.shortlisted ? "Yes" : "No"];
  });
  download(`aim-digital-product-research-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\n"));
  showToast(`${rows.length} visible ${rows.length === 1 ? "row" : "rows"} exported`);
}

function downloadTemplate() {
  const example = ["Example product", "US", "AliExpress", "5.00", "2.00", "19.99", "13.25", "0.40", "12", "Medium", "Low", "https://www.aliexpress.com/item/example", "https://www.ebay.com/itm/example", "Replace this example with verified research"];
  download("aim-digital-import-template.csv", [IMPORT_HEADERS, example].map(row => row.map(csvCell).join(",")).join("\n"));
}

function shortlistPromising() {
  const matches = filteredProducts().filter(isPromising);
  matches.forEach(product => product.shortlisted = true);
  persist(); render(); showToast(`${matches.length} promising ${matches.length === 1 ? "product" : "products"} shortlisted`);
}

document.getElementById("addBtn").addEventListener("click", () => openProduct());
document.getElementById("importBtn").addEventListener("click", () => { resetImport(); els.importDialog.showModal(); });
document.getElementById("downloadTemplateBtn").addEventListener("click", downloadTemplate);
document.getElementById("exportBtn").addEventListener("click", exportCsv);
document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
document.getElementById("shortlistPromisingBtn").addEventListener("click", shortlistPromising);
document.getElementById("mobileFilterBtn").addEventListener("click", () => els.filtersPanel.classList.toggle("open"));
els.emptyAction.addEventListener("click", () => state.products.length ? clearFilters() : openProduct());
els.productForm.addEventListener("submit", saveProduct);
els.productForm.addEventListener("input", updateFormCalc);
els.productRows.addEventListener("click", handleRowAction);

[els.marketFilter, els.marginFilter, els.soldFilter, els.searchInput].forEach(input => input.addEventListener("input", render));
[els.competitionFilter, els.riskFilter].forEach(group => group.addEventListener("click", event => {
  const chip = event.target.closest(".chip"); if (!chip) return; chip.classList.toggle("active"); render();
}));

document.querySelector(".tabs").addEventListener("click", event => {
  const tab = event.target.closest(".tab"); if (!tab) return;
  state.view = tab.dataset.view;
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === tab));
  render();
});

document.querySelector("thead").addEventListener("click", event => {
  const button = event.target.closest("[data-sort]"); if (!button) return;
  const key = button.dataset.sort;
  state.sort = { key, direction: state.sort.key === key && state.sort.direction === "desc" ? "asc" : "desc" };
  render();
});

els.fileInput.addEventListener("change", event => previewFile(event.target.files[0]));
for (const name of ["dragenter", "dragover"]) els.dropzone.addEventListener(name, event => { event.preventDefault(); els.dropzone.classList.add("dragover"); });
for (const name of ["dragleave", "drop"]) els.dropzone.addEventListener(name, event => { event.preventDefault(); els.dropzone.classList.remove("dragover"); });
els.dropzone.addEventListener("drop", event => previewFile(event.dataTransfer.files[0]));
document.getElementById("closeImportBtn").addEventListener("click", () => els.importDialog.close());
document.getElementById("cancelImportBtn").addEventListener("click", () => els.importDialog.close());
document.getElementById("chooseAnotherBtn").addEventListener("click", resetImport);
els.confirmImportBtn.addEventListener("click", confirmImport);
document.addEventListener("click", event => {
  if (state.activeMenu && !event.target.closest(".row-actions")) { state.activeMenu = null; render(); }
  if (window.innerWidth <= 820 && els.filtersPanel.classList.contains("open") && !event.target.closest("#filtersPanel") && !event.target.closest("#mobileFilterBtn")) els.filtersPanel.classList.remove("open");
});

document.querySelectorAll("[data-app-view]").forEach(button => button.addEventListener("click", () => switchAppView(button.dataset.appView)));
document.querySelectorAll("[data-trend-market]").forEach(button => button.addEventListener("click", () => {
  state.trendMarket = button.dataset.trendMarket;
  document.querySelectorAll("[data-trend-market]").forEach(item => item.classList.toggle("active", item === button));
  renderTrends();
}));
document.getElementById("trendCategory").addEventListener("change", renderTrends);
document.getElementById("trendSearch").addEventListener("input", renderTrends);
document.getElementById("trendGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-trend-add]");
  if (!button) return;
  const idea = TREND_IDEAS.find(item => item.id === button.dataset.trendAdd);
  if (idea) openTrendInTracker(idea);
});
document.getElementById("q4Grid").addEventListener("click", event => {
  const button = event.target.closest("[data-q4-add]");
  if (!button) return;
  const product = Q4_PRODUCTS.find(item => item.id === button.dataset.q4Add);
  if (product) openQ4InTracker(product);
});

render();
renderTrends();
renderQ4();
