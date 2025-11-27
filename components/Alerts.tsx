import React from 'react';
import type { ExpiringWarranty } from '../types';
import { BellIcon } from './icons/BellIcon';
import { XIcon } from './icons/XIcon';

interface AlertsProps {
  expiringItems: ExpiringWarranty[];
  onDismiss: () => void;
  onOpenSettings: () => void;
  alertThreshold: number;
}

export const Alerts: React.FC<AlertsProps> = ({ expiringItems, onDismiss, onOpenSettings, alertThreshold }) => {
  if (expiringItems.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-8 p-5 bg-amber-gold/10 border-l-4 border-amber-gold rounded-r-xl">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-amber-gold/70 hover:bg-amber-gold/20 rounded-full transition-colors group"
          aria-label="Alert settings"
          title="Configure alert threshold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-amber-gold/70 hover:bg-amber-gold/20 rounded-full transition-colors"
          aria-label="Dismiss alerts"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex">
        <div className="flex-shrink-0 pt-0.5">
          <BellIcon className="h-6 w-6 text-amber-gold" aria-hidden="true" />
        </div>
        <div className="ml-4 pr-12">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-off-white">
              Expiring Soon
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-gold/20 text-amber-gold font-medium">
              {alertThreshold} day alert
            </span>
          </div>
          <div className="mt-2 text-sm text-amber-gold/80">
            <p className="mb-3">The following warranties require your attention:</p>
            <ul className="space-y-2 list-disc pl-5">
              {expiringItems.map(({ item, statusInfo }) => (
                <li key={item.id}>
                  <strong className="text-off-white">{item.productName}</strong> from {item.retailer || 'an unknown retailer'}{' '}
                  - <span className="font-medium">{statusInfo.statusText}</span>.
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};