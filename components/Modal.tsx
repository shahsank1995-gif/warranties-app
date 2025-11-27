import React, { useEffect, useCallback } from 'react';
import { XIcon } from './icons/XIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);
  
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-80" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className={`relative bg-deep-graphite w-full max-w-2xl p-6 md:p-8 rounded-2xl shadow-2xl z-10 border border-onyx-gray transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-silver hover:bg-onyx-gray rounded-full transition-colors"
          aria-label="Close"
        >
          <XIcon className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
};