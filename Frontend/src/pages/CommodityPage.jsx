import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

// Components
import Header from "../components/Header";
import KPI from "../components/KPI";
import MarketBarChart from "../components/MarketBarChart";
import TrendLineChart from "../components/TrendLineChart";
import VolatilityCard from "../components/VolatilityCard"; 
import PredictionCard from "../components/PredictionCard"; 

// Utils
import { getVegImage } from "../assets/veggieImages"; 
import { fetchRecommend, fetchCompare, fetchTrend, fetchVolatility } from "../utils/api";

export default function CommodityPage() {
  const { name, market } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMarket = searchParams.get("market") || market || "Dambulla";
  const commodity = decodeURIComponent(name);

  // Consolidated State
  const [data, setData] = useState({ 
    recommend: null, 
    compare: null, 
    trend: null, 
    volatility: null 
  });

  useEffect(() => {
    (async () => {
      try {
        const [recommend, compare, trend, volatility] = await Promise.all([
          fetchRecommend(commodity),
          fetchCompare(commodity, ["Colombo", "Dambulla", "Nuwara Eliya"]),
          fetchTrend(commodity, currentMarket, 7),
          fetchVolatility(commodity, currentMarket)
        ]);
        setData({ recommend, compare, trend, volatility });
      } catch (e) { console.error(e); }
    })();
  }, [commodity, currentMarket]);

  // Safe chart data
  const marketData = useMemo(() => 
    (data.compare?.markets || [])
      .map(x => ({ market: x.market, price: Number(x.price_avg) || 0 }))
      .filter(x => x.price > 0), 
  [data.compare]);

  return (
    <div className="min-h-screen bg-slate-50 w-full px-6 py-6">
      <Header 
        subtitle="Commodity insights — trends, changes, and best-market recommendation" 
        right={
          <Link to="/" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            ← Back to prices
          </Link>
        } 
      />

      {/* Hero Section */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 grid grid-cols-1 sm:grid-cols-[160px_1fr] p-4 gap-4">
        <img 
          src={getVegImage(commodity)} 
          alt={commodity} 
          className="h-32 w-full overflow-hidden rounded-xl object-cover bg-slate-100" 
        />
        <div className="flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400">Commodity Analysis</div>
            <div className="text-3xl font-bold text-slate-900 mt-1">{commodity}</div>
            
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Analyzing Market:</span>
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

      {/* KPI & Prediction Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI 
          title="Best market today" 
          value={data.recommend?.best_market || "—"} 
          sub={data.recommend?.confidence ? `Confidence: ${data.recommend.confidence}` : ""} 
          badge={data.recommend?.confidence} 
        />
        <KPI 
          title="Best price" 
          value={data.recommend?.best_price ? `Rs. ${data.recommend.best_price}` : "—"} 
          sub={data.recommend?.best_market ? `For ${commodity}` : ""} 
        />
        
        {/* ✅ Using New Components */}
        <VolatilityCard data={data.volatility} />
        <PredictionCard advice={data.recommend?.advice} reason={data.recommend?.advice_reason} />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarketBarChart 
          title={`Market comparison: ${commodity}`} 
          data={marketData} 
          emptyText="Not enough market data" 
        />
        <TrendLineChart 
          title={`7-day trend: ${commodity} (${currentMarket})`} 
          points={data.trend?.points || []} 
          emptyText="Not enough trend data" 
        />
      </div>
    </div>
  );
}