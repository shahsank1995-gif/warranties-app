import React from 'react';
import type { WarrantyItem } from '../types';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ConfirmDuplicateModalProps {
  item: WarrantyItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDuplicateModal: React.FC<ConfirmDuplicateModalProps> = ({ item, onConfirm, onCancel }) => {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-gold/10">
        <ExclamationTriangleIcon className="h-8 w-8 text-amber-gold" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-2xl font-serif font-semibold leading-6 text-off-white" id="modal-title">
        Duplicate Found
      </h3>
      <div className="mt-3">
        <p className="text-muted-silver leading-relaxed">
          A warranty for <strong className="text-off-white">{item.productName}</strong> with the same purchase date already exists.
        </p>
        <p className="mt-2 text-muted-silver leading-relaxed">
            Do you still want to add this one?
        </p>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-sm font-medium clay-button-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-2.5 text-sm font-semibold clay-button"
        >
          Add Anyway
        </button>
      </div>
    </div>
  );
};