import React from 'react';
import { jsPDF } from 'jspdf';

interface ReceiptViewerProps {
    imageUrl: string;
    productName: string;
    onClose: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ imageUrl, productName, onClose }) => {
    const isPdf = imageUrl.startsWith('data:application/pdf') || imageUrl.toLowerCase().endsWith('.pdf');

    const handleDownloadPDF = async () => {
        try {
            if (isPdf) {
                // If it's already a PDF, just download it
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `warranty_${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Generate PDF from image
                const doc = new jsPDF();
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = imageUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const imgProps = doc.getImageProperties(img);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();

                const margin = 10;
                const availableWidth = pdfWidth - (margin * 2);
                const availableHeight = pdfHeight - (margin * 2);

                const widthRatio = availableWidth / imgProps.width;
                const heightRatio = availableHeight / imgProps.height;
                const ratio = Math.min(widthRatio, heightRatio);

                const w = imgProps.width * ratio;
                const h = imgProps.height * ratio;

                const x = (pdfWidth - w) / 2;
                const y = (pdfHeight - h) / 2;

                doc.addImage(img, 'JPEG', x, y, w, h);
                doc.save(`warranty_${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to download PDF. Please try again.");
        }
    };

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

                {/* Footer with Download Option */}
                <div className="bg-onyx-gray px-6 py-4 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
                    {!isPdf && (
                        <a
                            href={imageUrl}
                            download={`warranty_${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`}
                            className="px-6 py-2 bg-transparent border border-white/20 hover:bg-white/5 text-off-white rounded-lg transition-colors font-medium"
                        >
                            Download Image
                        </a>
                    )}
                    <button
                        onClick={handleDownloadPDF}
                        className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-lg transition-colors font-medium"
                    >
                        {isPdf ? 'Download PDF' : 'Save as PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};
