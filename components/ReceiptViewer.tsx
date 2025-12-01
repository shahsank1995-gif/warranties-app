import React from 'react';

interface ReceiptViewerProps {
    imageUrl: string;
    productName: string;
    onClose: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ imageUrl, productName, onClose }) => {
    const isPdf = imageUrl.startsWith('data:application/pdf') || imageUrl.toLowerCase().endsWith('.pdf');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl w-full max-h-[90vh] bg-charcoal-gray rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-onyx-gray px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-semibold text-off-white">{productName} - Receipt</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-silver hover:text-off-white transition-colors p-2 rounded-lg hover:bg-white/5"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Container */}
                <div className="flex-grow overflow-auto p-6 bg-dark-smoke flex items-center justify-center">
                    {isPdf ? (
                        <iframe
                            src={imageUrl}
                            title={`Receipt for ${productName}`}
                            className="w-full h-[70vh] rounded-lg shadow-lg border-0"
                        />
                    ) : (
                        <img
                            src={imageUrl}
                            alt={`Receipt for ${productName}`}
                            className="max-w-full h-auto max-h-[70vh] rounded-lg shadow-lg object-contain"
                        />
                    )}
                </div>

                {/* Footer with Download Button */}
                <div className="bg-onyx-gray px-6 py-4 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
                    <a
                        href={imageUrl}
                        download={`${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_receipt${isPdf ? '.pdf' : '.png'}`}
                        className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </a>
                </div>
            </div>
        </div>
    );
};
