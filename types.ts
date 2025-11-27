
export interface WarrantyItem {
  id: string;
  productName: string;
  purchaseDate: string;
  warrantyPeriod: string;
  retailer?: string;
  expiryDate?: string; // YYYY-MM-DD
  receiptImage?: string; // base64 data URL
  receiptMimeType?: string;
}

export interface ExtractedData {
  productName: string;
  purchaseDate: string; // YYYY-MM-DD
  warrantyPeriod: string; // e.g., "1 year", "90 days"
  retailer?: string;
  expiryDate?: string; // YYYY-MM-DD
  receiptImage?: string; // base64 data URL
  receiptMimeType?: string;
}

export interface WarrantyStatus {
  expiryDate: Date | null;
  daysRemaining: number | null;
  status: 'active' | 'expiring-soon' | 'expired' | 'unknown';
  statusText: string;
}

export interface ExpiringWarranty {
  item: WarrantyItem;
  statusInfo: WarrantyStatus;
}