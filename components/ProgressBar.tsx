```
import React from 'react';

export const ProgressBar: React.FC = () => (
  <div className="relative w-full">
    {/* Main Progress Bar */}
    <div className="relative w-full h-1.5 bg-onyx-gray overflow-hidden rounded-full">
      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-purple to-violet-400 w-full animate-progress rounded-full" />
    </div>
    
    {/* Simple text */}
    <div className="mt-3 text-center">
      <p className="text-sm text-muted-silver">Analyzing...</p>
    </div>
  </div>
);
```