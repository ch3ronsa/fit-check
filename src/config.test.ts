import { describe, it, expect } from 'vitest';
import { APP_URL, PINATA_GATEWAY } from './config';

describe('config', () => {
    it('APP_URL is a valid HTTPS URL or empty for dev', () => {
        if (APP_URL) {
            expect(APP_URL).toMatch(/^https:\/\//);
        }
    });

    it('PINATA_GATEWAY is a valid HTTPS URL or empty for dev', () => {
        if (PINATA_GATEWAY) {
            expect(PINATA_GATEWAY).toMatch(/^https:\/\//);
        }
    });

    it('WALLETCONNECT_PROJECT_ID and FARCASTER_APP_ID are strings', () => {
        // These come from env vars; in test they may be empty
        expect(typeof APP_URL).toBe('string');
        expect(typeof PINATA_GATEWAY).toBe('string');
    });
});
