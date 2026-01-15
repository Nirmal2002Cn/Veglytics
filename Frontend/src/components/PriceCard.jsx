import React from 'react';
import { getVegImage } from '../assets/veggieImages';
import { useNavigate } from 'react-router-dom';

export default function PriceCard({ item, market }) {
  const navigate = useNavigate();

  if (!item) return null;

  const isUp = item.direction === 'up';
  const isStable = item.direction === 'same';
  const percent = item.change_pct ? Math.abs(item.change_pct).toFixed(2) : '0.00';

  return (
    <div 
      onClick={() => navigate(`/commodity/${item.commodity}/${market}`)}
      className="relative group overflow-hidden rounded-2xl bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 h-64 w-full cursor-pointer"
    >
      
      {/* Background Image - FIX: Removed opacity-80 so it's fully bright */}
      <img 
        src={getVegImage(item.commodity)} 
        alt={item.commodity}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      
      {/* Gradient Overlay - FIX: Made it lighter. 
          It only gets dark at the very bottom (from-slate-950) to read the text.
          The top 60% of the image is now clear (to-transparent). */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent opacity-90"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        
        {/* Trend Badge */}
        <div className="mb-2">
          {isStable ? (
             <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-sm">
               STABLE
             </span>
          ) : (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm ${isUp ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
              {isUp ? 'UP' : 'DOWN'} {percent}%
            </span>
          )}
        </div>

        {/* Title with Text Shadow for extra readability */}
        <h3 className="text-xl font-bold leading-tight mb-0.5 drop-shadow-md">{item.commodity}</h3>
        <p className="text-xs text-slate-300 mb-3 drop-shadow-sm">{market}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2 drop-shadow-md">
          <span className="text-lg font-semibold">Rs. {item.price_min} - {item.price_max}</span>
          <span className="text-sm text-slate-300">/ kg</span>
        </div>

        {/* Action Link */}
        <div className="flex items-center text-xs text-emerald-400 font-medium group-hover:translate-x-1 transition-transform drop-shadow-sm">
          Tap to view insights <span className="ml-1">→</span>
        </div>
      </div>
    </div>
  );
}