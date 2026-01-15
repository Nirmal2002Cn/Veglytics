import React from 'react';
import headerBg from '../assets/bg.jpg'
export default function Header({ title, subtitle, right }) {
  return (
    <div className="relative w-full h-[280px] overflow-hidden rounded-3xl bg-slate-900 shadow-xl mb-8 group">
      
      {/* 1. Background Image (Flipped & Positioned) */}
      <div className="absolute inset-0">
        <img 
          src={headerBg} 
          alt="Vegetable Market" 
          // scale-x-[-1] flips the image so the cornucopia moves to the Right
          // object-cover ensures it fills the box
          className="h-full w-full object-cover object-center opacity-70 scale-x-[-1] group-hover:scale-x-[-1] group-hover:scale-105 transition-transform duration-700" 
        />
        {/* Gradient: Darker on left for text readability, transparent on right for image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent"></div>
      </div>

      {/* 2. Content Area */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12">
        
        <div className="flex flex-col md:flex-row md:items-end md:justify-between w-full gap-6">
          
          {/* Left Side: Text */}
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🥬</span>
              <span className="font-bold text-emerald-400 tracking-wide text-xs uppercase bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-500/20">
                Veglytics Dashboard
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl drop-shadow-lg leading-tight">
              {title || "Sri Lanka Vegetable Price Dashboard"}
            </h1>
            
            <p className="mt-3 text-sm md:text-base text-slate-300 max-w-lg leading-relaxed font-medium">
              {subtitle || "Daily market insights (HARTI bulletin) — trends, changes, and best-market recommendations."}
            </p>
          </div>

          {/* Right Side: Buttons (Pushed to bottom right) */}
          <div className="flex items-center gap-3">
            {right ? (
              right
            ) : (
              <>
                <button className="hidden md:inline-flex rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/10 border border-white/10 transition-all">
                  Live BI View
                </button>
                
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}