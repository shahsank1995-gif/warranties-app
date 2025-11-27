const cron = require('node-cron');
const db = require('./database');
const { sendExpiryNotificationEmail } = require('./emailService');
const { calculateWarrantyStatus } = require('./utils/dateUtils');
const { sendWarrantyExpiryNotification } = require('./fcmService');

/**
 * Check for expiring warranties and send notifications
 */
async function checkAndNotify() {
    console.log('[Scheduler] Checking for expiring warranties...');

    try {
        // Get all users with email notifications enabled
        const users = await new Promise((resolve, reject) => {
            db.all(`
        SELECT u.id, u.email, ns.alert_threshold, ns.email_enabled
        FROM users u
        LEFT JOIN notification_settings ns ON u.id = ns.user_id
        WHERE u.email IS NOT NULL 
          AND ns.email_enabled = 1
      `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        console.log(`[Scheduler] Found ${users.length} users with email notifications enabled`);

        for (const user of users) {
            try {
                // Get all warranties for this user
                const warranties = await new Promise((resolve, reject) => {
                    db.all('SELECT * FROM warranties', (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });

                // Filter expiring warranties based on user's alert threshold
                const expiringWarranties = warranties
                    .map(w => {
                        const status = calculateWarrantyStatus(w, user.alert_threshold);
                        return {
                            ...w,
                            daysRemaining: status.daysRemaining,
                            status: status.status,
                            expiryDate: status.expiryDate
                        };
                    })
                    .filter(w => w.status === 'expiring-soon' && w.daysRemaining !== null)
                    .sort((a, b) => a.daysRemaining - b.daysRemaining);

                if (expiringWarranties.length > 0) {
                    console.log(`[Scheduler] Found ${expiringWarranties.length} expiring warranties for user ${user.email}`);

                    // Send notification email (if email enabled)
                    if (user.email) {
                        const emailResult = await sendExpiryNotificationEmail(
                            user.email,
                            expiringWarranties,
                            user.alert_threshold
                        );

                        if (emailResult.success) {
                            console.log(`[Scheduler] ✅ Email sent to ${user.email}`);
                        } else {
                            console.error(`[Scheduler] ❌ Failed to send email to ${user.email}:`, emailResult.message);
                        }
                    }

                    // Send push notifications
                    try {
                        // Get user's device tokens
                        const tokens = await new Promise((resolve, reject) => {
                            db.all(
                                'SELECT token FROM device_tokens WHERE user_id = ? ORDER BY last_used DESC',
                                [user.id],
                                (err, rows) => {
                                    if (err) reject(err);
                                    else resolve(rows.map(r => r.token));
                                }
                            );
                        });

                        if (tokens.length > 0) {
                            console.log(`[Scheduler] Sending push notifications to ${tokens.length} device(s)`);

                            // Send a push for each expiring warranty
                            for (const warranty of expiringWarranties.slice(0, 3)) { // Limit to 3 to avoid spam
                                const pushResult = await sendWarrantyExpiryNotification(
                                    tokens,
                                    warranty,
                                    warranty.daysRemaining
                                );

                                if (pushResult.success) {
                                    console.log(`[Scheduler] ✅ Push sent for ${warranty.productName}`);
                                } else {
                                    console.log(`[Scheduler] ⚠️ Push notification skipped: ${pushResult.message}`);
                                }
                            }
                        } else {
                            console.log(`[Scheduler] No device tokens found for user ${user.id}`);
                        }
                    } catch (pushError) {
                        console.error(`[Scheduler] Error sending push notifications:`, pushError);
                    }

                    // Update last notification sent timestamp
                    db.run(
                        'UPDATE notification_settings SET last_notification_sent = CURRENT_TIMESTAMP WHERE user_id = ?',
                        [user.id],
                        (err) => {
                            if (err) console.error('[Scheduler] Error updating last notification timestamp:', err);
                        }
                    );
                } else {
                    console.log(`[Scheduler] No expiring warranties for user ${user.email}`);
                }
            } catch (error) {
                console.error(`[Scheduler] Error processing user ${user.email}:`, error);
            }
        }

        console.log('[Scheduler] Notification check completed');
    } catch (error) {
        console.error('[Scheduler] Error in checkAndNotify:', error);
    }
}

/**
 * Start the notification scheduler
 * Runs daily at 9:00 AM by default
 */
function startScheduler() {
    const notificationTime = process.env.NOTIFICATION_TIME || '09:00';
    const [hour, minute] = notificationTime.split(':');

    // Create cron schedule: minute hour * * * (daily at specified time)
    const cronSchedule = `${minute} ${hour} * * *`;

    console.log(`[Scheduler] Starting notification scheduler (runs daily at ${notificationTime})`);

    cron.schedule(cronSchedule, () => {
        console.log(`[Scheduler] Triggered at ${new Date().toLocaleString()}`);
        checkAndNotify();
    });

    console.log('[Scheduler] ✅ Scheduler started successfully');
}

/**
 * Manually trigger notification check (for testing)
 */
async function triggerManualCheck() {
    console.log('[Scheduler] Manual notification check triggered');
    await checkAndNotify();
}

module.exports = {
    startScheduler,
    triggerManualCheck,
    checkAndNotify
};
