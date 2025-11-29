import React from 'react';

export const ProgressBar: React.FC = () => (
  <div className="relative w-full flex flex-col items-center justify-center py-4">
    {/* DBZ Energy Effect Container */}
    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-yellow-500/30">

      {/* Kamehameha Beam Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-900/20 to-transparent animate-pulse"></div>

      {/* Energy Ball (The Source) */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 animate-super-saiyan animate-shake-intense flex items-center justify-center">
        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
        <div className="w-8 h-8 bg-white rounded-full blur-md opacity-90"></div>
      </div>

      {/* Energy Beams shooting out */}
      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-full h-4 bg-gradient-to-r from-yellow-400 to-transparent animate-beam origin-left blur-sm opacity-80"></div>
      <div className="absolute right-1/2 top-1/2 -translate-y-1/2 w-full h-4 bg-gradient-to-l from-yellow-400 to-transparent animate-beam origin-right blur-sm opacity-80" style={{ animationDelay: '0.5s' }}></div>

      {/* Lightning Sparks (Pseudo-random placement) */}
      <div className="absolute top-2 left-1/4 w-1 h-8 bg-yellow-200 rotate-45 animate-pulse opacity-60"></div>
      <div className="absolute bottom-2 right-1/4 w-1 h-6 bg-yellow-200 -rotate-45 animate-pulse opacity-60" style={{ animationDelay: '0.3s' }}></div>
    </div>

    {/* DBZ Themed Text */}
    <div className="mt-4 text-center">
      <p className="text-lg font-bold text-yellow-400 tracking-wider animate-pulse uppercase drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
        Gathering Ki...
      </p>
      <p className="text-xs text-yellow-600/80 font-mono mt-1">Scanning Power Level</p>
    </div>
  </div>
);