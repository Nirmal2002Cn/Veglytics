const BASE = "http://localhost:8000";

// 1. Meta
export async function fetchMeta() {
  const res = await fetch(`${BASE}/api/meta`);
  if (!res.ok) throw new Error("Failed to load meta");
  return res.json();
}

// 2. Dates
export async function fetchDates(limit = 7) {
  const res = await fetch(`${BASE}/api/dates?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to load dates");
  return res.json();
}

// 3. Prices
export async function fetchPricesLatest(market = "Dambulla", search = "", date = "") {
  const url = new URL(`${BASE}/api/prices/latest`);
  url.searchParams.set("market", market);
  if (search) url.searchParams.set("search", search);
  if (date) url.searchParams.set("date", date);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load prices");
  return res.json();
}

// 4. Recommendations
export async function fetchRecommend(commodity) {
  const res = await fetch(
    `${BASE}/api/recommend?commodity=${encodeURIComponent(commodity)}`
  );
  if (!res.ok) throw new Error("Failed to load recommendation");
  return res.json();
}

// 5. Compare (✅ This is the one that was missing)
export async function fetchCompare(commodity, marketsArr) {
  const markets = marketsArr.join(",");
  const res = await fetch(
    `${BASE}/api/compare?commodity=${encodeURIComponent(commodity)}&markets=${encodeURIComponent(markets)}`
  );
  if (!res.ok) throw new Error("Failed to load compare");
  return res.json();
}

// 6. Trend
export async function fetchTrend(commodity, market, days = 7) {
  const res = await fetch(
    `${BASE}/api/trend?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}&days=${days}`
  );
  if (!res.ok) throw new Error("Failed to load trend");
  return res.json();
}

// 7. Volatility
export async function fetchVolatility(commodity, market) {
  const res = await fetch(
    `${BASE}/api/volatility?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`
  );
  if (!res.ok) throw new Error("Failed to load volatility");
  return res.json();
}