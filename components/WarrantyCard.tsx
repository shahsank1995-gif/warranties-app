import React, { useState } from 'react';
import type { WarrantyItem } from '../types';
import { calculateWarrantyStatus, formatDateForDisplay } from '../utils/dateUtils';
import { API_URL } from '../services/api';
import { CalendarIcon } from './icons/CalendarIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { StoreIcon } from './icons/StoreIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ReceiptViewer } from './ReceiptViewer';

interface WarrantyCardProps {
  item: WarrantyItem;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export const WarrantyCard: React.FC<WarrantyCardProps> = ({ item, onDelete, style }) => {
  const { status, statusText } = calculateWarrantyStatus(item);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);

  const statusStyles = {
    active: {
      dot: 'bg-fresh-green',
      text: 'text-green-300',
    },
    'expiring-soon': {
      dot: 'bg-amber-gold',
      text: 'text-amber-300',
    },
    expired: {
      dot: 'bg-alert-red',
      text: 'text-red-300',
    },
    unknown: {
      dot: 'bg-dark-smoke',
      text: 'text-muted-silver',
    },
  };

  const currentStyles = statusStyles[status];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const hasReceipt = !!item.receiptImage;
  const purchaseDate = new Date(item.purchaseDate);
  purchaseDate.setMinutes(purchaseDate.getMinutes() + purchaseDate.getTimezoneOffset());


  return (
    <div
      className={`group bg-onyx-gray rounded-2xl p-6 flex flex-col relative transition-all duration-300 opacity-0 animate-fade-in-stagger border border-white/5`}
      style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '-8px -8px 16px rgba(255, 255, 255, 0.03), 8px 8px 16px rgba(0, 0, 0, 0.5)' }}
      role="article"
    >
      <div
        className="transition-transform duration-500 ease-out group-hover:transform group-hover:[transform:translateZ(20px)_rotateX(-5deg)]"
      >
        <div className={`flex items-center mb-4`}>
          <div className={`h-2 w-2 rounded-full mr-2.5 ${currentStyles.dot}`}></div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${currentStyles.text}`}>
            {status.replace('-', ' ')}
          </p>
        </div>

        <div className="flex justify-between items-start gap-4 mb-5">
          <h3 className="flex-grow text-xl font-serif font-semibold text-off-white leading-tight">{item.productName}</h3>
          <div className="flex-shrink-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {hasReceipt && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowReceiptViewer(true); }}
                className="text-muted-silver hover:text-off-white p-1.5 rounded-full"
                aria-label="View receipt"
                title="View Receipt"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            <button onClick={handleDeleteClick} className="text-muted-silver hover:text-off-white p-1.5 rounded-full" aria-label="Delete warranty">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-grow">
          <div className="space-y-4 text-sm text-muted-silver">
            {item.retailer && (
              <div className="flex items-center opacity-80">
                <StoreIcon className="w-5 h-5 mr-3 text-dark-smoke flex-shrink-0" />
                <span>{item.retailer}</span>
              </div>
            )}
            <div className="flex items-center opacity-80">
              <CalendarIcon className="w-5 h-5 mr-3 text-dark-smoke flex-shrink-0" />
              <span>Purchased: {formatDateForDisplay(purchaseDate)}</span>
            </div>
            <div className="flex items-center opacity-80">
              <ShieldCheckIcon className="w-5 h-5 mr-3 text-dark-smoke flex-shrink-0" />
              <span>Warranty: {item.warrantyPeriod}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10">
          <p className="text-sm font-medium text-off-white">{statusText}</p>
        </div>
      </div>

      {/* Receipt Viewer Modal */}
      {showReceiptViewer && item.receiptImage && (
        <ReceiptViewer
          imageUrl={item.receiptImage}
          productName={item.productName}
          onClose={() => setShowReceiptViewer(false)}
        />
      )}
    </div>
  );
};