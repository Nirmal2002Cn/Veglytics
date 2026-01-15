import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Controls from "../components/Controls";
import KPI from "../components/KPI";
import MarketBarChart from "../components/MarketBarChart";
import TrendLineChart from "../components/TrendLineChart";
import PriceGrid from "../components/PriceGrid";
import { fetchPrices, fetchRecommend, fetchTrend7 } from "../utils/api";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [market, setMarket] = useState("Dambulla");
  const [search, setSearch] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("Tomato");
  const [loading, setLoading] = useState(true);

  const [recommend, setRecommend] = useState(null);
  const [trend7, setTrend7] = useState(null);

  // ✅ A) Fetch prices with market/search, store items
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPrices(market, search);
        setRows(data.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [market, search]);

  // ✅ B) Commodities list uses r.commodity
  const commodities = useMemo(() => {
    const set = new Set(rows.map((r) => r.commodity).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // ✅ C) Auto-select check uses commodity
  useEffect(() => {
    if (!rows.length) return;
    if (!commodities.includes(selectedCommodity)) {
      setSelectedCommodity(commodities[0] || "Tomato");
    }
  }, [commodities, rows, selectedCommodity]);

  // Fetch recommendation + 7-day trend when commodity changes
  useEffect(() => {
    if (!selectedCommodity) return;

    (async () => {
      try {
        const rec = await fetchRecommend(selectedCommodity);
        setRecommend(rec);

        const t7 = await fetchTrend7(selectedCommodity, market);
        setTrend7(t7);
      } catch {
        setTrend7(null);
      }
    })();
  }, [selectedCommodity, market]);

  // ✅ D) Market comparison simplified to current market only
  const marketCompare = useMemo(() => {
    const item = rows.find((r) => r.commodity === selectedCommodity);
    if (!item) return [];
    return [{ market, price: item.price_avg ?? 0 }];
  }, [rows, selectedCommodity, market]);

  // ✅ E) PriceGrid filter uses commodity
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => (r.commodity || "").toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Header />

        <div className="mt-4">
          <Controls
            market={market}
            setMarket={setMarket}
            search={search}
            setSearch={setSearch}
            commodities={commodities}
            selectedCommodity={selectedCommodity}
            setSelectedCommodity={setSelectedCommodity}
          />
        </div>

        {/* Main layout: Prices (left) + Insights (right) */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: Price cards */}
          <section className="lg:col-span-8">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Today’s prices
                </h2>
                <p className="text-sm text-slate-600">
                  Market: <span className="font-medium">{market}</span>
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Showing: <span className="font-medium">{filtered.length}</span>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                Loading prices…
              </div>
            ) : (
              // ✅ F) PriceGrid reads row.price_avg internally
              <PriceGrid
                rows={filtered}
                market={market}
                selectedCommodity={selectedCommodity}
                onSelectCommodity={setSelectedCommodity}
              />
            )}
          </section>

          {/* RIGHT: Insights panel */}
          <aside className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-6">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Insights
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Selected:{" "}
                  <span className="font-medium">{selectedCommodity}</span>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-1 gap-4">
                <KPI
                  title="Best market today"
                  value={recommend?.best_market || "—"}
                  sub={
                    recommend?.confidence
                      ? `Confidence: ${recommend.confidence}`
                      : ""
                  }
                  badge={recommend?.confidence || ""}
                />
                <KPI
                  title="Best price"
                  value={
                    recommend?.best_price != null
                      ? `Rs. ${recommend.best_price}`
                      : "—"
                  }
                  sub={recommend?.best_market ? `For ${selectedCommodity}` : ""}
                />
                <KPI
                  title="Price gap"
                  value={
                    recommend?.price_difference != null
                      ? `Rs. ${recommend.price_difference}`
                      : "—"
                  }
                  sub={
                    recommend?.worst_market
                      ? `vs ${recommend.worst_market}`
                      : ""
                  }
                />
                <KPI
                  title="7-day trend"
                  value={trend7?.trend || "—"}
                  sub={
                    trend7?.week_change_percent != null
                      ? `Week change: ${trend7.week_change_percent}%`
                      : ""
                  }
                  badge={trend7?.trend || ""}
                />
              </div>

              {/* Charts */}
              <MarketBarChart
                title={`Market comparison: ${selectedCommodity}`}
                data={marketCompare}
              />
              <TrendLineChart
                title={`7-day trend: ${selectedCommodity} (${market})`}
                commodity={selectedCommodity}
                market={market}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
