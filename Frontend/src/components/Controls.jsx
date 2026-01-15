import React from 'react';

export default function Controls({ 
  market, 
  setMarket, 
  date, 
  setDate, 
  availableDates = [], 
  search, 
  setSearch,
  totalItems 
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      
      {/* 1. Status Badges Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-100 flex items-center gap-2">
          🌍 Market: <span className="font-bold">{market}</span>
        </div>
        <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-slate-200 flex items-center gap-2">
          📅 Latest date: <span className="font-bold text-slate-800">{availableDates[0] || '...'}</span>
        </div>
        <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-slate-200 flex items-center gap-2">
          📦 Items: <span className="font-bold text-slate-800">{totalItems}</span>
        </div>
      </div>

      {/* 2. Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Market</label>
          <div className="relative">
            <select 
              value={market} 
              onChange={(e) => setMarket(e.target.value)}
              // ✅ UPDATED: focus:border-emerald-500 focus:ring-emerald-500
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer"
            >
              <option value="Dambulla">Dambulla</option>
              <option value="Colombo">Colombo</option>
              <option value="Nuwara Eliya">Nuwara Eliya</option>
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Date Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Date</label>
          <div className="relative">
            <select 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              // ✅ UPDATED: focus:border-emerald-500 focus:ring-emerald-500
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium appearance-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer disabled:opacity-50"
              disabled={availableDates.length === 0}
            >
              {availableDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <p className="text-[10px] text-emerald-600/70 font-medium mt-1.5 ml-1">Last 7 available days</p>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Search</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search vegetable..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // ✅ UPDATED: focus:border-emerald-500
              className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
            />
            <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-slate-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}