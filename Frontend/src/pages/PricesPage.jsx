import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Controls from "../components/Controls";
import PriceGrid from "../components/PriceGrid";
import { fetchPricesLatest, fetchDates, fetchMeta } from "../utils/api";

export default function PricesPage() {
  const [market, setMarket] = useState("Dambulla");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // State for Date Filtering
  const [date, setDate] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [metaLatest, setMetaLatest] = useState("");

  // 1. Initial Load: Get Meta + Dates
  useEffect(() => {
    (async () => {
      try {
        const [metaData, dateData] = await Promise.all([fetchMeta(), fetchDates(7)]);
        setMetaLatest(metaData.latest_date || "");
        
        const dates = dateData.dates || [];
        setAvailableDates(dates);

        // Default to the most recent available date
        if (dates.length > 0) {
          setDate(dates[0]);
        } else if (metaData.latest_date) {
          setDate(metaData.latest_date);
        }
      } catch (e) {
        console.error("Initialization error:", e);
      }
    })();
  }, []);

  // 2. Fetch Prices when Market, Date, or Search changes
  useEffect(() => {
    // If we have dates loaded but no date is selected yet, wait.
    if (availableDates.length > 0 && !date) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchPricesLatest(market, search, date);
        setItems(res.items || []);
      } catch (e) {
        console.error("Fetch prices error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [market, search, date, availableDates]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* ✅ FIX: Removed 'max-w-7xl' and added 'w-full'. 
          This forces the layout to stretch to the edges. 
          I kept 'px-6' so it doesn't touch the absolute edge of the monitor. */}
      <main className="w-full px-6 py-6">
        
        <Header 
          subtitle={`Latest bulletin: ${metaLatest} • Viewing: ${date || 'Loading...'}`}
        />

        {/* Controls Section */}
        <Controls 
          market={market} 
          setMarket={setMarket}
          date={date} 
          setDate={setDate} 
          availableDates={availableDates} 
          search={search} 
          setSearch={setSearch}
          totalItems={items.length} 
        />

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading market data...</p>
          </div>
        ) : (
          <PriceGrid items={items} market={market} />
        )}
      </main>
    </div>
  );
}