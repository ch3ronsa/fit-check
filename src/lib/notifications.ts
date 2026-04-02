import sdk from '@farcaster/frame-sdk';
import { APP_URL } from '../config';

export type NotificationType = 'streak_reminder' | 'mint_success' | 'new_feature';

interface NotificationPayload {
    title: string;
    body: string;
    targetUrl?: string;
}

const NOTIFICATIONS: Record<NotificationType, NotificationPayload> = {
    streak_reminder: {
        title: "Don't break your streak! 🔥",
        body: "You haven't done a fit check today. Keep the fire alive!",
        targetUrl: APP_URL,
    },
    mint_success: {
        title: 'NFT Minted! 🎉',
        body: 'Your fit is now immortalized on Base blockchain.',
        targetUrl: APP_URL,
    },
    new_feature: {
        title: 'New frames available! 🖼️',
        body: 'Check out fresh styles to frame your fits.',
        targetUrl: APP_URL,
    },
};

export const checkNotificationStatus = async (): Promise<boolean> => {
    try {
        const context = await sdk.context;
        return !!context?.client?.notificationDetails;
    } catch {
        return false;
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    try {
        const result = await sdk.actions.addFrame();
        if (result?.notificationDetails) {
            localStorage.setItem('fitcheck_notifications_enabled', 'true');
            return true;
        }
        return false;
    } catch (err) {
        console.warn('Notification permission not granted:', err);
        return false;
    }
};

export const sendNotification = async (type: NotificationType): Promise<void> => {
    localStorage.setItem(`fitcheck_last_${type}`, Date.now().toString());
};

export const shouldSendStreakReminder = (): boolean => {
    const lastCheck = localStorage.getItem('fitcheck_last_activity');
    const lastReminder = localStorage.getItem('fitcheck_last_streak_reminder');

    if (!lastCheck) return false;

    const lastCheckTime = parseInt(lastCheck);
    const now = Date.now();
    const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);

    if (hoursSinceLastCheck > 20) {
        if (!lastReminder) return true;

        const lastReminderTime = parseInt(lastReminder);
        const hoursSinceReminder = (now - lastReminderTime) / (1000 * 60 * 60);

        return hoursSinceReminder > 24;
    }

    return false;
};

export const updateLastActivity = (): void => {
    localStorage.setItem('fitcheck_last_activity', Date.now().toString());
};

export const showBrowserNotification = (type: NotificationType): void => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        const payload = NOTIFICATIONS[type];
        new Notification(payload.title, {
            body: payload.body,
            icon: '/icon.png',
        });
    }
};

export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') return true;

    const result = await Notification.requestPermission();
    return result === 'granted';
};
