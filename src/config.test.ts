import { describe, it, expect } from 'vitest';
import { APP_URL, PINATA_GATEWAY } from './config';

describe('config', () => {
    it('APP_URL is a valid HTTPS URL', () => {
        expect(APP_URL).toMatch(/^https:\/\//);
    });

    it('PINATA_GATEWAY is a valid HTTPS URL', () => {
        expect(PINATA_GATEWAY).toMatch(/^https:\/\//);
        expect(PINATA_GATEWAY).toContain('mypinata.cloud');
    });
});
