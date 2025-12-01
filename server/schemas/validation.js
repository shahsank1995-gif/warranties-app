const { z } = require('zod');

// User validation schemas
const userSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required')
});

// Warranty validation schemas
const warrantySchema = z.object({
    productName: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
    purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    warrantyPeriod: z.string().max(50).optional(),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    retailer: z.string().max(200).optional(),
    receiptImage: z.string().optional()
});

const warrantyUpdateSchema = warrantySchema.partial();

// Notification settings validation
const notificationSettingsSchema = z.object({
    email_enabled: z.boolean().optional(),
    push_enabled: z.boolean().optional(),
    sms_enabled: z.boolean().optional(),
    alert_days: z.number().int().min(1).max(365).optional(),
    fcm_token: z.string().optional()
});

// Verification code validation
const verifyCodeSchema = z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric')
});

module.exports = {
    userSchema,
    loginSchema,
    warrantySchema,
    warrantyUpdateSchema,
    notificationSettingsSchema,
    verifyCodeSchema
};
