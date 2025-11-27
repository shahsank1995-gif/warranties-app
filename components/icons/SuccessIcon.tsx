import React from 'react';

export const SuccessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
        <path
            d="M7 13l3 3 7-7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                strokeDasharray: 1,
                strokeDashoffset: 1,
            }}
            className="animate-draw-check"
        />
    </svg>
);