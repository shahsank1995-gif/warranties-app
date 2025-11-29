import React from 'react';

export const ProgressBar: React.FC = () => (
  <div className="relative w-full flex flex-col items-center justify-center py-6">
    {/* Premium AI Scanning Container */}
    <div className="relative w-full h-1 bg-onyx-gray/30 rounded-full overflow-hidden">

      {/* Background Track */}
      <div className="absolute inset-0 bg-white/5"></div>

      {/* Thin Glowing Scanning Line */}
      <div className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-brand-purple to-transparent animate-shimmer-slide blur-[1px]"></div>

      {/* Intense Center Light */}
      <div className="absolute top-0 bottom-0 w-1/6 bg-white/80 animate-shimmer-slide blur-[2px]" style={{ animationDelay: '0.05s' }}></div>

    </div>

    {/* AI Analysis Text */}
    <div className="mt-4 flex flex-col items-center space-y-1">
      <div className="flex items-center space-x-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></div>
        <p className="text-sm font-medium text-off-white tracking-wide uppercase">
          AI Analysis in Progress
        </p>
      </div>
      <p className="text-xs text-muted-silver font-mono">Extracting merchant & warranty details</p>
    </div>
  </div>
);