const admin = require('firebase-admin');

// Initialize Firebase Admin (will use service account when available)
let firebaseInitialized = false;

function initializeFirebase() {
    if (firebaseInitialized) {
        return true;
    }

    try {
        // Try to load service account file
        const serviceAccount = require('./firebase-service-account.json');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseInitialized = true;
        console.log('[FCM] Firebase Admin initialized successfully');
        return true;
    } catch (error) {
        console.warn('[FCM] Firebase service account not found. Push notifications will not work until configured.');
        console.warn('[FCM] Please add firebase-service-account.json to enable push notifications');
        return false;
    }
}

/**
 * Send push notification to a device
 * @param {string} token - Device FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
async function sendPushNotification(token, title, body, data = {}) {
    if (!initializeFirebase()) {
        return {
            success: false,
            message: 'Firebase not configured. Add firebase-service-account.json to enable push notifications.'
        };
    }

    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                timestamp: new Date().toISOString(),
            },
            token: token,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'warranty_alerts',
                    priority: 'high',
                },
            },
        };

        const response = await admin.messaging().send(message);

        console.log('[FCM] Push notification sent successfully:', response);
        return {
            success: true,
            messageId: response,
        };
    } catch (error) {
        console.error('[FCM] Error sending push notification:', error);
        return {
            success: false,
            message: error.message,
            code: error.code,
        };
    }
}

/**
 * Send push notification to multiple devices
 * @param {Array<string>} tokens - Array of device FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
async function sendMulticastNotification(tokens, title, body, data = {}) {
    if (!initializeFirebase()) {
        return {
            success: false,
            message: 'Firebase not configured'
        };
    }

    if (!tokens || tokens.length === 0) {
        return {
            success: false,
            message: 'No device tokens provided'
        };
    }

    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                timestamp: new Date().toISOString(),
            },
            tokens: tokens,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'warranty_alerts',
                    priority: 'high',
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`[FCM] Multicast sent: ${response.successCount} successful, ${response.failureCount} failed`);

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses,
        };
    } catch (error) {
        console.error('[FCM] Error sending multicast notification:', error);
        return {
            success: false,
            message: error.message,
        };
    }
}

/**
 * Send warranty expiry notification
 * @param {Array<string>} tokens - Device tokens
 * @param {object} warranty - Warranty object with details
 * @param {number} daysRemaining - Days until expiry
 */
async function sendWarrantyExpiryNotification(tokens, warranty, daysRemaining) {
    const title = '⚠️ Warranty Expiring Soon';
    const body = `${warranty.productName} warranty expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;

    const data = {
        type: 'warranty_expiry',
        warrantyId: warranty.id,
        productName: warranty.productName,
        daysRemaining: daysRemaining.toString(),
        expiryDate: warranty.expiryDate,
    };

    if (tokens.length === 1) {
        return await sendPushNotification(tokens[0], title, body, data);
    } else {
        return await sendMulticastNotification(tokens, title, body, data);
    }
}

module.exports = {
    initializeFirebase,
    sendPushNotification,
    sendMulticastNotification,
    sendWarrantyExpiryNotification,
};
