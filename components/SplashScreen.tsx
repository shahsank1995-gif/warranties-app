import React, { useEffect, useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [animationPhase, setAnimationPhase] = useState<'enter' | 'exit'>('enter');

    useEffect(() => {
        // Phase 1: Show logo (1.5s)
        const showTimer = setTimeout(() => {
            setAnimationPhase('exit');
        }, 1500);

        // Phase 2: Slide up and fade (0.8s)
        const exitTimer = setTimeout(() => {
            onFinish();
        }, 2300);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(exitTimer);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-800 ${animationPhase === 'exit' ? '-translate-y-1/3 opacity-0' : 'translate-y-0 opacity-100'
                }`}
        >
            <div className="relative flex flex-col items-center">
                {/* Logo with smooth scale animation */}
                <div className={`relative transition-all duration-700 ${animationPhase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                    {/* Subtle glow */}
                    <div className="absolute inset-0 bg-brand-purple/20 blur-2xl rounded-full scale-125 animate-pulse"></div>

                    <LogoIcon className="w-20 h-20 text-white relative z-10 drop-shadow-[0_0_20px_rgba(169,81,249,0.6)]" />
                </div>

                {/* Brand name - slides up with logo */}
                <div className="mt-6 overflow-hidden">
                    <h1
                        className={`text-3xl font-serif font-bold text-white tracking-[0.3em] transition-all duration-700 delay-300 ${animationPhase === 'enter' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
                            }`}
                    >
                        WARRANTO
                    </h1>
                </div>
            </div>
        </div>
    );
};
