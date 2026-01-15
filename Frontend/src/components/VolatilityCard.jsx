import React from 'react';

export default function VolatilityCard({ data }) {
  const getColor = (level) => {
    if (level === "LOW") return "bg-emerald-100 text-emerald-800";
    if (level === "MEDIUM") return "bg-yellow-100 text-yellow-800";
    return "bg-rose-100 text-rose-800";
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Market Risk
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl font-bold text-slate-800">
            {data?.risk_level || "—"}
          </span>
          {data?.risk_level && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getColor(data.risk_level)}`}>
              {data.volatility_percent}% VOL
            </span>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-3">
        Based on 7-day stability
      </div>
    </div>
  );
}