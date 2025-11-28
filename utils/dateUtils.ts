import type { WarrantyItem, WarrantyStatus } from '../types';

export function calculateExpiryDate(purchaseDate: string, warrantyPeriod: string): Date | null {
  if (!purchaseDate || !warrantyPeriod || warrantyPeriod.toLowerCase() === 'not specified' || warrantyPeriod.toLowerCase() === 'not found') {
    return null;
  }

  const startDate = new Date(purchaseDate);
  // Adjust for timezone issues where new Date('YYYY-MM-DD') can be the previous day
  startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());

  if (isNaN(startDate.getTime())) {
    return null;
  }

  const expiryDate = new Date(startDate);
  const periodParts = warrantyPeriod.toLowerCase().trim().split(' ');
  const value = parseInt(periodParts[0], 10);
  let unit = periodParts[1];

  if (isNaN(value)) {
    return null;
  }

  if (!unit) {
    // If only a number is provided, assume it's in years.
    unit = 'year';
  }

  if (unit.startsWith('day')) {
    expiryDate.setDate(expiryDate.getDate() + value);
  } else if (unit.startsWith('week')) {
    expiryDate.setDate(expiryDate.getDate() + value * 7);
  } else if (unit.startsWith('month')) {
    expiryDate.setMonth(expiryDate.getMonth() + value);
  } else if (unit.startsWith('year')) {
    expiryDate.setFullYear(expiryDate.getFullYear() + value);
  } else {
    return null;
  }

  return expiryDate;
}

export function formatDateForInput(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

export function formatDateForDisplay(date: Date): string {
  if (!date || isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}


export function calculateWarrantyStatus(item: WarrantyItem, alertThreshold: number = 30): WarrantyStatus {
  const { purchaseDate, warrantyPeriod, expiryDate: itemExpiryDate } = item;

  let expiryDate: Date | null = null;

  if (itemExpiryDate) {
    expiryDate = new Date(itemExpiryDate);
    // Adjust for timezone issues where new Date('YYYY-MM-DD') can be the previous day
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryDate.getTimezoneOffset());
  } else {
    expiryDate = calculateExpiryDate(purchaseDate, warrantyPeriod);
  }

  if (!expiryDate) {
    if (!purchaseDate || !warrantyPeriod || warrantyPeriod.toLowerCase() === 'not specified' || warrantyPeriod.toLowerCase() === 'not found') {
      return {
        expiryDate: null,
        daysRemaining: null,
        status: 'unknown',
        statusText: 'Unknown Warranty',
      };
    }
    const startDate = new Date(purchaseDate);
    if (isNaN(startDate.getTime())) {
      return {
        expiryDate: null,
        daysRemaining: null,
        status: 'unknown',
        statusText: 'Invalid Purchase Date',
      };
    }
    return {
      expiryDate: null,
      daysRemaining: null,
      status: 'unknown',
      statusText: 'Invalid Warranty Period',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  expiryDate.setHours(0, 0, 0, 0); // Normalize to start of day

  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysRemaining < 0) {
    return {
      expiryDate,
      daysRemaining,
      status: 'expired',
      statusText: `Expired on ${formatDateForDisplay(expiryDate)}`,
    };
  }

  // Use customizable alert threshold instead of hardcoded 30
  if (daysRemaining <= alertThreshold) {
    return {
      expiryDate,
      daysRemaining,
      status: 'expiring-soon',
      statusText: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
    };
  }

  return {
    expiryDate,
    daysRemaining,
    status: 'active',
    statusText: `Expires on ${formatDateForDisplay(expiryDate)}`,
  };
}