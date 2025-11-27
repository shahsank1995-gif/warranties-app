import React, { useState, useEffect } from 'react';
import type { WarrantyItem } from '../types';
import { calculateWarrantyStatus } from '../utils/dateUtils';

interface DashboardStatsProps {
    warranties: WarrantyItem[];
    onFilterChange?: (filter: 'all' | 'active' | 'expiring-soon' | 'expired') => void;
    activeFilter?: 'all' | 'active' | 'expiring-soon' | 'expired';
    onOpenSettings?: () => void;
    alertThreshold: number;
}

interface StatCardProps {
    label: string;
    value: number;
    filterType: 'all' | 'active' | 'expiring-soon' | 'expired';
    isActive: boolean;
    onClick: () => void;
    colorScheme: {
        bg: string;
        border: string;
        text: string;
        dot: string;
        glow: string;
    };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, filterType, isActive, onClick, colorScheme }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const duration = 1000;
        const incrementTime = Math.max(10, Math.floor(duration / end));

        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <button
            onClick={onClick}
            className={`
                group relative bg-onyx-gray p-6 rounded-2xl border-2 flex-1 text-left
                transition-all duration-300 ease-out
                hover:scale-105 hover:-translate-y-1
                ${isActive
                    ? `${colorScheme.border} shadow-lg ${colorScheme.glow}`
                    : 'border-white/5 hover:border-white/20'
                }
                cursor-pointer transform
            `}
        >
            {/* Animated gradient overlay on hover */}
            <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300
                ${colorScheme.bg}
            `} />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <p className={`
                        text-sm font-semibold transition-colors duration-300
                        ${isActive ? colorScheme.text : 'text-muted-silver group-hover:text-off-white'}
                    `}>
                        {label}
                    </p>
                    <div className={`
                        h-2 w-2 rounded-full transition-all duration-300
                        ${isActive ? `${colorScheme.dot} animate-pulse` : 'bg-dark-smoke group-hover:bg-muted-silver'}
                    `} />
                </div>
                <div className="flex items-baseline gap-2">
                    <p className={`
                        text-5xl font-bold font-serif transition-all duration-300
                        ${isActive ? colorScheme.text : 'text-off-white'}
                        group-hover:scale-110 origin-left
                    `}>
                        {count}
                    </p>
                    {isActive && (
                        <span className="text-xs text-muted-silver animate-fade-in">filtered</span>
                    )}
                </div>
            </div>

            {/* Click indicator */}
            <div className="absolute bottom-3 right-3 text-muted-silver opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
            </div>
        </button>
    )
}


export const DashboardStats: React.FC<DashboardStatsProps> = ({
    warranties,
    onFilterChange,
    activeFilter = 'all',
    onOpenSettings,
    alertThreshold
}) => {
    const stats = React.useMemo(() => {
        let active = 0;
        let expiringSoon = 0;
        let expired = 0;

        warranties.forEach(item => {
            const { status } = calculateWarrantyStatus(item, alertThreshold);
            if (status === 'active') active++;
            else if (status === 'expiring-soon') expiringSoon++;
            else if (status === 'expired') expired++;
        });

        return {
            total: warranties.length,
            active,
            expiringSoon,
            expired,
        }
    }, [warranties, alertThreshold]);

    const handleFilterClick = (filter: 'all' | 'active' | 'expiring-soon' | 'expired') => {
        onFilterChange?.(filter);
    };

    return (
        <div className="opacity-0 animate-fade-in-stagger">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-muted-silver">Collection Overview</h3>
                <div className="flex items-center gap-3">
                    {onOpenSettings && (
                        <button
                            onClick={onOpenSettings}
                            className="group relative overflow-hidden flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-900 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50 animate-pulse-slow"
                            title="Configure alert notifications"
                            style={{
                                boxShadow: '0 4px 14px 0 rgba(251, 191, 36, 0.39), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            {/* Bell icon with continuous ringing animation */}
                            <svg className="w-4 h-4 relative z-10 animate-ring" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>

                            {/* Text with drop shadow */}
                            <span className="relative z-10 drop-shadow-sm">
                                {alertThreshold}d alerts
                            </span>

                            {/* Glow pulse effect */}
                            <div className="absolute inset-0 rounded-lg bg-amber-400/20 blur-md group-hover:bg-amber-400/40 transition-colors duration-300" />
                        </button>
                    )}
                    {activeFilter !== 'all' && (
                        <button
                            onClick={() => handleFilterClick('all')}
                            className="text-sm text-brand-purple hover:text-brand-purple/80 transition-colors"
                        >
                            Clear filter
                        </button>
                    )}
                </div>
            </div>

            {/* Add custom animations */}
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.95; }
                }
                @keyframes ring {
                    0% { transform: rotate(0deg); }
                    5% { transform: rotate(20deg); }
                    10% { transform: rotate(-16deg); }
                    15% { transform: rotate(20deg); }
                    20% { transform: rotate(-16deg); }
                    25% { transform: rotate(16deg); }
                    30% { transform: rotate(-12deg); }
                    35% { transform: rotate(12deg); }
                    40% { transform: rotate(-8deg); }
                    45% { transform: rotate(8deg); }
                    50% { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animate-ring {
                    animation: ring 2s ease-in-out infinite;
                    transform-origin: top center;
                }
            `}</style>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Items"
                    value={stats.total}
                    filterType="all"
                    isActive={activeFilter === 'all'}
                    onClick={() => handleFilterClick('all')}
                    colorScheme={{
                        bg: 'bg-gradient-to-br from-brand-purple/20 to-deep-graphite',
                        border: 'border-brand-purple',
                        text: 'text-brand-purple',
                        dot: 'bg-brand-purple',
                        glow: 'shadow-brand-purple/20'
                    }}
                />
                <StatCard
                    label="Active"
                    value={stats.active}
                    filterType="active"
                    isActive={activeFilter === 'active'}
                    onClick={() => handleFilterClick('active')}
                    colorScheme={{
                        bg: 'bg-gradient-to-br from-fresh-green/20 to-deep-graphite',
                        border: 'border-fresh-green',
                        text: 'text-fresh-green',
                        dot: 'bg-fresh-green',
                        glow: 'shadow-fresh-green/20'
                    }}
                />
                <StatCard
                    label="Expiring Soon"
                    value={stats.expiringSoon}
                    filterType="expiring-soon"
                    isActive={activeFilter === 'expiring-soon'}
                    onClick={() => handleFilterClick('expiring-soon')}
                    colorScheme={{
                        bg: 'bg-gradient-to-br from-amber-gold/20 to-deep-graphite',
                        border: 'border-amber-gold',
                        text: 'text-amber-gold',
                        dot: 'bg-amber-gold',
                        glow: 'shadow-amber-gold/20'
                    }}
                />
                <StatCard
                    label="Expired"
                    value={stats.expired}
                    filterType="expired"
                    isActive={activeFilter === 'expired'}
                    onClick={() => handleFilterClick('expired')}
                    colorScheme={{
                        bg: 'bg-gradient-to-br from-alert-red/20 to-deep-graphite',
                        border: 'border-alert-red',
                        text: 'text-alert-red',
                        dot: 'bg-alert-red',
                        glow: 'shadow-alert-red/20'
                    }}
                />
            </div>
        </div>
    )
}