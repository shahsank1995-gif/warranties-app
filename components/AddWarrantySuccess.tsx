import React from 'react';
import { SuccessIcon } from './icons/SuccessIcon';
import { Sparkles } from './Sparkles';

interface AddWarrantySuccessProps {
    productName: string;
    onDone: () => void;
}

export const AddWarrantySuccess: React.FC<AddWarrantySuccessProps> = ({ productName, onDone }) => {
    return (
        <div className="text-center py-10 relative">
            <Sparkles />
            <SuccessIcon className="w-24 h-24 mx-auto text-fresh-green" />
            <h2 className="text-3xl font-serif font-semibold text-off-white mt-6">
                Success!
            </h2>
            <p className="mt-3 text-muted-silver max-w-sm mx-auto leading-relaxed">
                <span className="font-semibold text-off-white">{productName}</span> has been secured in your collection.
            </p>
            <div className="mt-10">
                <button
                    onClick={onDone}
                    className="w-full max-w-xs mx-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold clay-button"
                >
                    Done
                </button>
            </div>
        </div>
    );
};