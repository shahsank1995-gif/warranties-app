import React, { useState, useEffect } from 'react';

const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute top-0 left-0 w-3 h-3" style={style}>
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.8284 10.1716L22 12L13.8284 13.8284L12 22L10.1716 13.8284L2 12L10.1716 10.1716L12 2Z" fill="#F4F4F5" />
        </svg>
    </div>
);


export const Sparkles: React.FC = () => {
    const [sparkles, setSparkles] = useState<React.CSSProperties[]>([]);

    useEffect(() => {
        const createSparkle = () => {
            return {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `sparkle 1s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
            };
        };

        const newSparkles = Array.from({ length: 15 }, createSparkle);
        setSparkles(newSparkles);

    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none">
            {sparkles.map((style, index) => (
                <Sparkle key={index} style={style} />
            ))}
        </div>
    );
};
