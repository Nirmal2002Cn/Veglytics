import React from 'react';
import PriceCard from './PriceCard';

export default function PriceGrid({ items, market }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        No prices found for this date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items
        .filter(item => item && item.commodity) // ✅ FIX: Remove null items before mapping
        .map((item) => (
        <PriceCard 
            key={`${market}-${item.commodity}`} 
            item={item} 
            market={market} 
        />
      ))}
    </div>
  );
}