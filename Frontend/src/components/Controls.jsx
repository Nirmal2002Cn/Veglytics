import React from 'react';

export default function Controls({ 
  market, 
  setMarket, 
  date, 
  setDate, 
  availableDates = [], // Default to empty array to prevent crash
  search, 
  setSearch,
  totalItems 
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-100">
      
      {/* 1. Status Badges Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-sm font-medium border border-emerald-100 flex items-center gap-2">
          🌍 Market: <span className="font-bold">{market}</span>
        </div>
        <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-md text-sm font-medium border border-slate-200 flex items-center gap-2">
          📅 Latest date: <span className="font-bold">{availableDates[0] || 'Loading...'}</span>
        </div>
        <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-md text-sm font-medium border border-slate-200 flex items-center gap-2">
          📦 Items: <span className="font-bold">{totalItems}</span>
        </div>
      </div>

      {/* 2. Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Market</label>
          <select 
            value={market} 
            onChange={(e) => setMarket(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Dambulla">Dambulla</option>
            <option value="Colombo">Colombo</option>
            <option value="Nuwara Eliya">Nuwara Eliya</option>
          </select>
        </div>

        {/* Date Dropdown (New!) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Date</label>
          <select 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            disabled={availableDates.length === 0}
          >
            {availableDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1 ml-1">Last 7 available days</p>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Search</label>
          <input 
            type="text" 
            placeholder="Search vegetable..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}