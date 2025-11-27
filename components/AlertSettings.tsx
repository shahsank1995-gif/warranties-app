import React, { useState } from 'react';
import { BellIcon } from './icons/BellIcon';

interface AlertSettingsProps {
    alertThreshold: number;
    onThresholdChange: (days: number) => void;
    onClose: () => void;
}

export const AlertSettings: React.FC<AlertSettingsProps> = ({
    alertThreshold,
    onThresholdChange,
    onClose,
}) => {
    const [customDays, setCustomDays] = useState(alertThreshold.toString());
    const [isCustom, setIsCustom] = useState(!([15, 30, 60].includes(alertThreshold)));

    const thresholdOptions = [
        { value: 15, label: '15 days', description: 'Get alerts 2 weeks before expiry' },
        { value: 30, label: '30 days', description: 'Get alerts 1 month before expiry' },
        { value: 60, label: '60 days', description: 'Get alerts 2 months before expiry' },
    ];

    const handlePresetClick = (days: number) => {
        setIsCustom(false);
        onThresholdChange(days);
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomDays(value);

        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue > 0 && numValue <= 365) {
            setIsCustom(true);
            onThresholdChange(numValue);
        }
    };

    return (
        <div className="bg-deep-graphite rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-gold/20">
                    <BellIcon className="w-5 h-5 text-amber-gold" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-off-white">Alert Settings</h3>
                    <p className="text-sm text-muted-silver">Choose when to get expiry notifications</p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Preset options */}
                {thresholdOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => handlePresetClick(option.value)}
                        className={`
              w-full text-left p-4 rounded-xl border-2 transition-all duration-300
              ${!isCustom && alertThreshold === option.value
                                ? 'border-amber-gold bg-amber-gold/10'
                                : 'border-white/10 hover:border-amber-gold/50 bg-onyx-gray/50'
                            }
            `}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`
                  font-semibold transition-colors
                  ${!isCustom && alertThreshold === option.value ? 'text-amber-gold' : 'text-off-white'}
                `}>
                                    {option.label}
                                </p>
                                <p className="text-sm text-muted-silver mt-1">
                                    {option.description}
                                </p>
                            </div>
                            {!isCustom && alertThreshold === option.value && (
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-amber-gold" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>
                ))}

                {/* Custom input option */}
                <div className={`
          p-4 rounded-xl border-2 transition-all duration-300
          ${isCustom
                        ? 'border-brand-purple bg-brand-purple/10'
                        : 'border-white/10 bg-onyx-gray/50'
                    }
        `}>
                    <div className="flex items-center justify-between mb-3">
                        <p className={`
              font-semibold transition-colors
              ${isCustom ? 'text-brand-purple' : 'text-off-white'}
            `}>
                            Custom
                        </p>
                        {isCustom && (
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-brand-purple" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            max="365"
                            value={customDays}
                            onChange={handleCustomChange}
                            onFocus={() => setIsCustom(true)}
                            className="flex-1 px-4 py-2 border-2 border-transparent text-off-white placeholder-muted-silver focus:outline-none focus:border-brand-purple transition-all duration-300 sm:text-sm clay-inset"
                            placeholder="Enter days"
                        />
                        <span className="text-sm text-muted-silver">days before expiry</span>
                    </div>
                    <p className="text-xs text-muted-silver mt-2">
                        Enter any value from 1 to 365 days
                    </p>
                </div>
            </div>

            <div className="mt-6 p-4 bg-onyx-gray/50 rounded-lg border border-white/5">
                <p className="text-xs text-muted-silver">
                    💡 <strong className="text-off-white">Tip:</strong> Warranties within your selected threshold will show as "Expiring Soon" in your dashboard and alerts.
                </p>
            </div>
        </div>
    );
};
