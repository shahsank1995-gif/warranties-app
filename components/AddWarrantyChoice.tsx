import React from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';

interface AddWarrantyChoiceProps {
  onScan: () => void;
  onUpload: () => void;
  onManual: () => void;
}

export const AddWarrantyChoice: React.FC<AddWarrantyChoiceProps> = ({ onScan, onUpload, onManual }) => {

  const choiceButtonStyles = "flex flex-col items-center justify-center w-full p-6 text-off-white text-center focus:outline-none focus:ring-2 ring-offset-deep-graphite ring-brand-purple/80 clay-button-secondary";

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-semibold text-off-white">
          Add a New Warranty
        </h2>
        <p className="mt-2 text-muted-silver leading-relaxed">
          How would you like to add your warranty details?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={onScan} className={choiceButtonStyles}>
          <CameraIcon className="w-10 h-10 mb-4 text-soft-platinum" />
          <span className="font-semibold">Scan with Camera</span>
          <span className="text-sm text-muted-silver mt-1">Use your device's camera to scan a receipt.</span>
        </button>
        
        <button onClick={onUpload} className={choiceButtonStyles}>
          <UploadCloudIcon className="w-10 h-10 mb-4 text-soft-platinum" />
          <span className="font-semibold">Upload a File</span>
          <span className="text-sm text-muted-silver mt-1">Choose a receipt image from your device.</span>
        </button>

        <button onClick={onManual} className={choiceButtonStyles}>
          <PencilSquareIcon className="w-10 h-10 mb-4 text-soft-platinum" />
          <span className="font-semibold">Enter Manually</span>
          <span className="text-sm text-muted-silver mt-1">Type in the warranty details yourself.</span>
        </button>
      </div>
    </div>
  );
};