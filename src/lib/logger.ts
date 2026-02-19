import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

function formatMessage(level: LogLevel, context: string, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 23);
    return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

export const logger = {
    debug(context: string, message: string, data?: unknown) {
        if (isDev) {
            console.debug(formatMessage('debug', context, message), data ?? '');
        }
    },

    info(context: string, message: string, data?: unknown) {
        if (isDev) {
            console.info(formatMessage('info', context, message), data ?? '');
        }
    },

    warn(context: string, message: string, data?: unknown) {
        console.warn(formatMessage('warn', context, message), data ?? '');
        Sentry.addBreadcrumb({
            category: context,
            message,
            level: 'warning',
            data: data ? { details: String(data) } : undefined,
        });
    },

    error(context: string, message: string, error?: unknown) {
        console.error(formatMessage('error', context, message), error ?? '');
        if (error instanceof Error) {
            Sentry.captureException(error, {
                tags: { context },
                extra: { message },
            });
        } else {
            Sentry.captureMessage(`[${context}] ${message}`, {
                level: 'error',
                extra: { error: String(error) },
            });
        }
    },
};
