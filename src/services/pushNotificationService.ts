import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export class PushNotificationService {
    private static instance: PushNotificationService;
    private deviceToken: string | null = null;

    private constructor() { }

    static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService();
        }
        return PushNotificationService.instance;
    }

    /**
     * Initialize push notifications
     * Request permissions and register for notifications
     */
    async initialize(): Promise<void> {
        // Only works on mobile platforms
        if (!Capacitor.isNativePlatform()) {
            console.log('[Push] Not a native platform, skipping push notification setup');
            return;
        }

        try {
            console.log('[Push] Initializing push notifications...');

            // Request permission
            const permission = await PushNotifications.requestPermissions();

            if (permission.receive === 'granted') {
                console.log('[Push] Permission granted');

                // Register for push notifications
                await PushNotifications.register();

                // Add listeners
                this.addListeners();
            } else {
                console.log('[Push] Permission denied');
            }
        } catch (error) {
            console.error('[Push] Error initializing:', error);
        }
    }

    /**
     * Add event listeners for push notifications
     */
    private addListeners(): void {
        // Registration success - get device token
        PushNotifications.addListener('registration', (token) => {
            console.log('[Push] Registration success, token:', token.value);
            this.deviceToken = token.value;

            // Send token to backend
            this.sendTokenToBackend(token.value);
        });

        // Registration failed
        PushNotifications.addListener('registrationError', (error) => {
            console.error('[Push] Registration error:', error);
        });

        // Notification received while app is in foreground
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[Push] Notification received:', notification);

            // Show in-app notification or alert
            this.handleForegroundNotification(notification);
        });

        // Notification clicked/tapped
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('[Push] Notification action performed:', action);

            // Navigate to relevant screen
            this.handleNotificationTap(action);
        });
    }

    /**
     * Send device token to backend
     */
    private async sendTokenToBackend(token: string): Promise<void> {
        try {
            const response = await fetch('/api/device-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    platform: Capacitor.getPlatform(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send token to backend');
            }

            console.log('[Push] Token sent to backend successfully');
        } catch (error) {
            console.error('[Push] Error sending token to backend:', error);
        }
    }

    /**
     * Handle notification received while app is open
     */
    private handleForegroundNotification(notification: any): void {
        // You can show a toast, alert, or update UI
        console.log('[Push] Foreground notification:', notification.title, notification.body);

        // Example: Show browser notification (for testing on web)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title || 'Warranty Alert', {
                body: notification.body,
                icon: '/icon.png',
            });
        }
    }

    /**
     * Handle notification tap/click
     */
    private handleNotificationTap(action: any): void {
        console.log('[Push] User tapped notification');

        // You can navigate to specific screen based on notification data
        // For now, just log it
        const data = action.notification.data;
        console.log('[Push] Notification data:', data);
    }

    /**
     * Get current device token
     */
    getDeviceToken(): string | null {
        return this.deviceToken;
    }

    /**
     * Check if push notifications are supported
     */
    isSupported(): boolean {
        return Capacitor.isNativePlatform();
    }
}

export const pushNotificationService = PushNotificationService.getInstance();
