import React from 'react';

export const ProgressBar: React.FC = () => (
  <div className="relative w-full h-1.5 bg-onyx-gray overflow-hidden rounded-full">
    <div className="absolute top-0 left-0 h-full bg-soft-platinum w-full animate-progress rounded-full"></div>
  </div>
);