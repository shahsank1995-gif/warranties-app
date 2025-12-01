import React, { useEffect, useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinish, 500); // Wait for fade out
        }, 2500);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo Container with Spring Animation */}
                <div className="relative animate-spring-bounce">
                    {/* Glow Effect behind Logo */}
                    <div className="absolute inset-0 bg-brand-purple/20 blur-3xl rounded-full scale-150 animate-pulse"></div>

                    <LogoIcon className="w-24 h-24 text-white relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />

                    {/* Shimmer Overlay */}
                    <div className="absolute inset-0 z-20 overflow-hidden rounded-full">
                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                    </div>
                </div>

                {/* Text Animation */}
                <div className="mt-6 overflow-hidden">
                    <h1 className="text-4xl font-serif font-bold text-white tracking-widest animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        WARRANTO
                    </h1>
                </div>

                {/* Feature highlights - horizontal */}
                <div className="mt-4 flex gap-8 items-center justify-center animate-slide-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                    <div className="text-center">
                        <div className="text-2xl mb-1">📸</div>
                        <p className="text-xs text-muted-silver/80 whitespace-nowrap">Scan Receipts</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-1">🔔</div>
                        <p className="text-xs text-muted-silver/80 whitespace-nowrap">Get Alerts</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-1">📊</div>
                        <p className="text-xs text-muted-silver/80 whitespace-nowrap">Track All</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
