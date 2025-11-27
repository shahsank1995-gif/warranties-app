// Helper function to calculate warranty status (copied from frontend)
function calculateWarrantyStatus(item, alertThreshold = 30) {
    const { purchaseDate, warrantyPeriod, expiryDate: itemExpiryDate } = item;

    let expiryDate = null;

    if (itemExpiryDate) {
        expiryDate = new Date(itemExpiryDate);
        expiryDate.setMinutes(expiryDate.getMinutes() + expiryDate.getTimezoneOffset());
    } else {
        expiryDate = calculateExpiryDate(purchaseDate, warrantyPeriod);
    }

    if (!expiryDate) {
        return {
            expiryDate: null,
            daysRemaining: null,
            status: 'unknown',
            statusText: 'Unknown Warranty',
        };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining < 0) {
        return {
            expiryDate,
            daysRemaining,
            status: 'expired',
            statusText: `Expired`,
        };
    }

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
        statusText: `Active`,
    };
}

function calculateExpiryDate(purchaseDate, warrantyPeriod) {
    if (!purchaseDate || !warrantyPeriod || warrantyPeriod.toLowerCase() === 'not specified' || warrantyPeriod.toLowerCase() === 'not found') {
        return null;
    }

    const startDate = new Date(purchaseDate);
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

module.exports = {
    calculateWarrantyStatus,
    calculateExpiryDate
};
