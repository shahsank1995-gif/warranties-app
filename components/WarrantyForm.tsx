import React, { useState, useEffect, useMemo } from 'react';
import type { ExtractedData, WarrantyItem } from '../types';
import { calculateExpiryDate, formatDateForInput } from '../utils/dateUtils';
import { XIcon } from './icons/XIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface WarrantyFormProps {
  initialData: ExtractedData;
  onSave: (item: WarrantyItem) => void;
  onCancel: () => void;
}

const AUTOSAVE_KEY = 'autosavedWarrantyForm';

export const WarrantyForm: React.FC<WarrantyFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<WarrantyItem>({
    ...initialData,
    id: initialData.productName ? Date.now().toString() : ''
  });

  const [isExpiryManuallySet, setIsExpiryManuallySet] = useState(!!initialData.expiryDate);
  const [autosavedData, setAutosavedData] = useState<WarrantyItem | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const isManualAdd = useMemo(() => !initialData.productName && !initialData.retailer && !initialData.receiptImage, [initialData]);

  useEffect(() => {
    if (isManualAdd) {
      try {
        const savedDataString = localStorage.getItem(AUTOSAVE_KEY);
        if (savedDataString) {
          const savedData = JSON.parse(savedDataString);
          if (savedData.productName || savedData.retailer || savedData.purchaseDate) {
            setAutosavedData(savedData);
          }
        }
      } catch (e) {
        console.error("Failed to read autosaved data", e);
        localStorage.removeItem(AUTOSAVE_KEY);
      }
    }
  }, [isManualAdd]);

  useEffect(() => {
    if (isManualAdd) {
      const timer = setTimeout(() => {
        if (formData.productName || formData.retailer || formData.warrantyPeriod) {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData, isManualAdd]);


  useEffect(() => {
    if (!isExpiryManuallySet) {
      const calculatedExpiry = calculateExpiryDate(formData.purchaseDate, formData.warrantyPeriod);
      if (calculatedExpiry) {
        setFormData(prev => ({ ...prev, expiryDate: formatDateForInput(calculatedExpiry) }));
      } else {
        setFormData(prev => ({ ...prev, expiryDate: '' }));
      }
    }
  }, [formData.purchaseDate, formData.warrantyPeriod, isExpiryManuallySet]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'purchaseDate' || name === 'warrantyPeriod') {
      setIsExpiryManuallySet(false);
    } else if (name === 'expiryDate') {
      setIsExpiryManuallySet(true);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem(AUTOSAVE_KEY);
    onSave(formData);
  };

  const handleCancelAndClear = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    onCancel();
  };

  const handleLoadAutosaved = () => {
    if (autosavedData) {
      setFormData(autosavedData);
      setAutosavedData(null);
      setIsExpiryManuallySet(!!autosavedData.expiryDate);
    }
  };

  const handleDismissAutosaved = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setAutosavedData(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowReceipt(false);
      }
    };
    if (showReceipt) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showReceipt]);


  const inputStyles = "mt-1 block w-full px-4 py-2.5 border-transparent text-off-white placeholder-muted-silver focus:outline-none focus:ring-2 focus:ring-brand-purple/50 sm:text-sm transition-all clay-inset";

  return (
    <div>
      <h2 className="text-3xl font-serif font-semibold text-off-white mb-2">
        {isManualAdd ? 'Add New Warranty' : 'Confirm Details'}
      </h2>
      <p className="text-muted-silver mb-8 leading-relaxed">
        {isManualAdd
          ? 'Fill in the details for your product warranty below.'
          : 'Review the details extracted by AI and make any necessary corrections.'}
      </p>

      {autosavedData && (
        <div className="mb-6 p-4 bg-amber-gold/10 border border-amber-gold/20 rounded-xl flex items-center justify-between animate-fade-in-stagger">
          <div className='flex items-center'>
            <InformationCircleIcon className="w-6 h-6 mr-3 text-amber-gold flex-shrink-0" />
            <div>
              <p className="font-semibold text-off-white">Unsaved Work Found</p>
              <p className="text-sm text-muted-silver">Do you want to restore your progress?</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleLoadAutosaved}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-soft-platinum text-charcoal-black hover:bg-opacity-90 transform hover:scale-105 transition-transform animate-pulse"
              style={{ animationIterationCount: 3 }}
            >
              Restore
            </button>
            <button type="button" onClick={handleDismissAutosaved} className="p-1.5 text-muted-silver hover:bg-onyx-gray rounded-full">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {!isManualAdd && initialData.receiptImage && (
        <div className="mb-6">
          <h3 className="block text-sm font-medium text-muted-silver mb-2">Attached Document</h3>
          <div className="p-3 bg-deep-graphite border border-white/5 rounded-xl">
            {initialData.receiptMimeType?.startsWith('image/') ? (
              <img
                src={initialData.receiptImage}
                alt="Receipt thumbnail"
                className="max-h-32 w-auto rounded-lg cursor-pointer mx-auto"
                onClick={() => setShowReceipt(true)}
              />
            ) : (
              <a
                href={initialData.receiptImage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-off-white hover:underline p-2"
              >
                <DocumentTextIcon className="w-6 h-6 mr-3 text-muted-silver" />
                <span>View Attached PDF</span>
              </a>
            )}
          </div>
        </div>
      )}

      {showReceipt && initialData.receiptImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowReceipt(false)}
        >
          <img src={initialData.receiptImage} alt="Receipt full view" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-muted-silver">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            id="productName"
            value={formData.productName}
            onChange={handleChange}
            className={inputStyles}
            required
          />
        </div>

        <div>
          <label htmlFor="retailer" className="block text-sm font-medium text-muted-silver">
            Retailer
          </label>
          <input
            type="text"
            name="retailer"
            id="retailer"
            value={formData.retailer || ''}
            onChange={handleChange}
            className={inputStyles}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-muted-silver">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              id="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className={inputStyles}
              required
            />
          </div>
          <div>
            <label htmlFor="warrantyPeriod" className="block text-sm font-medium text-muted-silver">
              Warranty Period
            </label>
            <input
              type="text"
              name="warrantyPeriod"
              id="warrantyPeriod"
              value={formData.warrantyPeriod}
              onChange={handleChange}
              placeholder="e.g., 1 year, 90 days"
              className={inputStyles}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <label htmlFor="expiryDate" className="block text-sm font-medium text-muted-silver">
            Expiry Date (Auto-calculated)
          </label>
          <input
            type="date"
            name="expiryDate"
            id="expiryDate"
            value={formData.expiryDate || ''}
            onChange={handleChange}
            className={inputStyles}
            required
          />
          <p className="mt-1.5 text-xs text-dark-smoke">This is calculated automatically. You can override it if needed.</p>
        </div>


        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancelAndClear}
            className="px-6 py-2.5 text-sm font-semibold clay-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold clay-button"
          >
            Save Warranty
          </button>
        </div>
      </form>
    </div>
  );
};