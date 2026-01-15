import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

import Header from "../components/Header";
import KPI from "../components/KPI";
import MarketBarChart from "../components/MarketBarChart";
import TrendLineChart from "../components/TrendLineChart";
import { getVegImage } from "../assets/veggieImages"; 
import { fetchRecommend, fetchCompare, fetchTrend, fetchVolatility } from "../utils/api";

export default function CommodityPage() {
  const { name, market } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMarket = searchParams.get("market") || market || "Dambulla";

  const commodity = decodeURIComponent(name);

  const [recommend, setRecommend] = useState(null);
  const [compare, setCompare] = useState(null);
  const [trend, setTrend] = useState(null);
  const [volatility, setVolatility] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [rec, cmp, trn, vol] = await Promise.all([
          fetchRecommend(commodity),
          fetchCompare(commodity, ["Colombo", "Dambulla", "Nuwara Eliya"]),
          fetchTrend(commodity, currentMarket, 7),
          fetchVolatility(commodity, currentMarket)
        ]);

        setRecommend(rec);
        setCompare(cmp);
        setTrend(trn);
        setVolatility(vol);
      } catch (e) {
        console.error("Error loading insights:", e);
      }
    })();
  }, [commodity, currentMarket]);

  const marketCompareData = useMemo(() => {
    const list = compare?.markets || [];
    return list
      .map((x) => ({
        market: x.market,
        price: Number(x.price_avg) || 0,
      }))
      .filter((x) => x.price > 0);
  }, [compare]);

  const img = getVegImage(commodity);

  const getRiskColor = (level) => {
    if (level === "LOW") return "bg-emerald-100 text-emerald-800";
    if (level === "MEDIUM") return "bg-yellow-100 text-yellow-800";
    return "bg-rose-100 text-rose-800";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-6 py-6">
        <Header
          subtitle="Commodity insights — trends, changes, and best-market recommendation"
          right={
            <Link
              to="/"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              ← Back to prices
            </Link>
          }
        />

        {/* Commodity Hero */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[160px_1fr]">
            <div className="h-32 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-36">
              <img
                src={img}
                alt={commodity}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Commodity Analysis
                </div>
                <div className="mt-1 text-3xl font-bold text-slate-900">
                  {commodity}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600">
                    Analyzing Market:
                  </span>
                  <select
                    value={currentMarket}
                    onChange={(e) => setSearchParams({ market: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Dambulla">Dambulla</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI
            title="Best market today"
            value={recommend?.best_market || "—"}
            sub={recommend?.confidence ? `Confidence: ${recommend.confidence}` : ""}
            badge={recommend?.confidence || ""}
          />
          <KPI
            title="Best price"
            value={
              recommend?.best_price != null ? `Rs. ${recommend.best_price}` : "—"
            }
            sub={recommend?.best_market ? `For ${commodity}` : ""}
          />
          <KPI
            title="Price gap"
            value={
              recommend?.price_difference != null
                ? `Rs. ${recommend.price_difference}`
                : "—"
            }
            sub={recommend?.worst_market ? `vs ${recommend.worst_market}` : ""}
          />

          {/* NEW: Best Time to Sell KPI */}
          <div
            className={`p-5 rounded-xl shadow-sm border flex flex-col justify-between ${
              recommend?.advice === "WAIT"
                ? "bg-blue-50 border-blue-100"
                : recommend?.advice === "SELL NOW"
                ? "bg-emerald-50 border-emerald-100"
                : "bg-white border-slate-100"
            }`}
          >
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Prediction
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-2xl font-bold ${
                    recommend?.advice === "WAIT"
                      ? "text-blue-700"
                      : recommend?.advice === "SELL NOW"
                      ? "text-emerald-700"
                      : "text-slate-800"
                  }`}
                >
                  {recommend?.advice || "—"}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-3 font-medium">
              {recommend?.advice_reason || "Analyzing trends..."}
            </div>
          </div>

          {/* Volatility/Risk KPI */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Market Risk
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-800">
                  {volatility?.risk_level || "—"}
                </span>
                {volatility?.risk_level && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${getRiskColor(
                      volatility.risk_level
                    )}`}
                  >
                    {volatility.volatility_percent}% VOL
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-3">
              Based on 7-day stability
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MarketBarChart
            title={`Market comparison: ${commodity}`}
            data={marketCompareData}
            emptyText="Not enough market data to compare"
          />
          <TrendLineChart
            title={`7-day trend: ${commodity} (${currentMarket})`}
            points={trend?.points || []}
            emptyText="Not enough trend data to draw chart"
          />
        </div>
      </div>
    </div>
  );
}
