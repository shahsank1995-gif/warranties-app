import React from 'react';
import { SuccessIcon } from './icons/SuccessIcon';
import { Sparkles } from './Sparkles';

interface AddWarrantySuccessProps {
    productName: string;
    onDone: () => void;
}

export const AddWarrantySuccess: React.FC<AddWarrantySuccessProps> = ({ productName, onDone }) => {
    return (
        <div className="text-center py-10 relative overflow-hidden">
            {/* Power-Up Burst Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 bg-gradient-radial from-fresh-green/30 via-brand-purple/20 to-transparent rounded-full animate-power-up"></div>
            </div>

            {/* Energy Aura Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute w-32 h-32 border-2 border-brand-purple/40 rounded-full animate-energy-pulse"></div>
                <div className="absolute w-48 h-48 border-2 border-fresh-green/30 rounded-full animate-energy-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute w-64 h-64 border border-brand-purple/20 rounded-full animate-energy-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>

            {/* Ki Energy Particles */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-brand-purple rounded-full animate-ki-charge blur-sm"></div>
            <div className="absolute top-20 right-16 w-2 h-2 bg-fresh-green rounded-full animate-ki-charge blur-sm" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-brand-purple rounded-full animate-ki-charge blur-sm" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute bottom-16 right-12 w-2 h-2 bg-fresh-green rounded-full animate-ki-charge blur-sm" style={{ animationDelay: '1s' }}></div>

            <Sparkles />

            {/* Success Icon with Aura */}
            <div className="relative z-10 animate-aura-glow">
                <SuccessIcon className="w-24 h-24 mx-auto text-fresh-green drop-shadow-[0_0_20px_rgba(76,175,80,0.6)]" />
            </div>

            <h2 className="text-3xl font-serif font-semibold text-off-white mt-6 relative z-10 animate-aura-glow">
                Success! ⚡
            </h2>
            <p className="mt-3 text-muted-silver max-w-sm mx-auto leading-relaxed relative z-10">
                <span className="font-semibold text-off-white">{productName}</span> has been secured in your collection.
            </p>
            <div className="mt-10 relative z-10">
                <button
                    onClick={onDone}
                    className="w-full max-w-xs mx-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold clay-button hover:animate-energy-pulse"
                >
                    Done
                </button>
            </div>
        </div>
    );
};