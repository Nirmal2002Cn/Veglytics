import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList // <--- Imported this to show text on bars
} from 'recharts';

export default function MarketBarChart({ title, data, emptyText }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">{emptyText}</p>
      </div>
    );
  }

  // Find the max price to add some padding to the right for the labels
  const maxPrice = Math.max(...data.map(d => d.price));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ top: 5, right: 60, left: 10, bottom: 5 }} // Increased right margin for labels
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            
            {/* Force axis to start at 0 so bar length is accurate */}
            <XAxis type="number" hide domain={[0, maxPrice * 1.2]} />
            
            <YAxis 
              type="category" 
              dataKey="market" 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
              width={100}
              axisLine={false}
              tickLine={false}
            />
            
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [`Rs. ${value}`, "Price"]}
            />
            
           {/* Inside MarketBarChart.jsx */}

                  <Bar 
                    dataKey="price" 
                    radius={[0, 4, 4, 0]} 
                    barSize={32} 
                    fill="#10b981"  // ✅ FIX: This sets ALL bars to Emerald Green
                  >
                    <LabelList 
                      dataKey="price" 
                      position="right" 
                      formatter={(val) => `Rs. ${val}`}
                      style={{ fill: '#475569', fontSize: '12px', fontWeight: 'bold' }} 
                    />
                  </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}