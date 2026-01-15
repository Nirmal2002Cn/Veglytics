import React from 'react';

export default function PredictionCard({ advice, reason }) {
  const styles = {
    'WAIT': { 
      bg: "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-200", 
      text: "text-blue-100", 
      icon: "⏳", 
      ring: "ring-blue-50",
      valueColor: "text-white"
    },
    'SELL NOW': { 
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200", 
      text: "text-emerald-50", 
      icon: "💰", 
      ring: "ring-emerald-50",
      valueColor: "text-white"
    },
    'SELL OR WAIT': { 
      bg: "bg-gradient-to-br from-slate-700 to-slate-800", 
      text: "text-slate-300", 
      icon: "⚖️", 
      ring: "ring-slate-100",
      valueColor: "text-white"
    },
    'default': { 
      bg: "bg-white border-slate-200", 
      text: "text-slate-400", 
      icon: "📊", 
      ring: "", 
      valueColor: "text-slate-800" 
    }
  };
  
  const s = styles[advice] || styles['default'];

  return (
    <div className={`relative p-5 rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg ring-4 ${s.bg} ${s.ring}`}>
      {/* Background Glow Effect */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white opacity-10 blur-2xl"></div>
      
      <div>
        <div className="flex justify-between items-start">
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${advice ? s.text : "text-slate-400"}`}>
            Prediction
          </h4>
          <span className="text-2xl drop-shadow-sm">{s.icon}</span>
        </div>
        
        <div className="mt-2">
          <span className={`text-2xl font-extrabold tracking-tight ${s.valueColor}`}>
            {advice || "Analyzing..."}
          </span>
        </div>
      </div>
      
      <div className={`text-xs font-medium mt-4 opacity-90 ${s.text}`}>
        {reason || "Check back with more data."}
      </div>
    </div>
  );
}