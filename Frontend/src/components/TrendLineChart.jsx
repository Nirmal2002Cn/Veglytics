import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function TrendLineChart({ title, points, emptyText }) {
  if (!points || points.length < 2) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">{emptyText}</p>
      </div>
    );
  }

  // Reverse points so chart reads left-to-right (Oldest -> Newest)
  const data = [...points].reverse();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      
      {/* ✅ FIX: Added wrapper with explicit height (h-64) and min-width */}
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              tickFormatter={(val) => val.substring(0, 5)} // Show DD-MM only
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="price_avg" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}