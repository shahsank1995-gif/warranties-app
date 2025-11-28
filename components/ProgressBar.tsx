import React from 'react';

export const ProgressBar: React.FC = () => (
  <div className="relative w-full">
    {/* Energy Aura Effect */}
    <div className="absolute -inset-2 bg-gradient-to-r from-brand-purple/20 via-brand-purple/40 to-brand-purple/20 rounded-full blur-xl animate-energy-pulse"></div>

    {/* Main Progress Bar */}
    <div className="relative w-full h-1.5 bg-onyx-gray overflow-hidden rounded-full">
      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-purple via-violet-400 to-brand-purple w-full animate-progress rounded-full shadow-lg shadow-brand-purple/50" />

      {/* Ki Energy Particles */}
      <div className="absolute top-0 left-0 h-full w-2 bg-white/80 rounded-full blur-sm animate-ki-charge" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-0 left-1/4 h-full w-2 bg-white/80 rounded-full blur-sm animate-ki-charge" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute top-0 left-2/4 h-full w-2 bg-white/80 rounded-full blur-sm animate-ki-charge" style={{ animationDelay: '0.6s' }}></div>
      <div className="absolute top-0 left-3/4 h-full w-2 bg-white/80 rounded-full blur-sm animate-ki-charge" style={{ animationDelay: '0.9s' }}></div>
    </div>

    {/* Electricity/Lightning Effect Text */}
    <div className="mt-3 text-center">
      <p className="text-sm text-brand-purple animate-aura-glow font-semibold">⚡ Analyzing... ⚡</p>
    </div>
  </div>
);