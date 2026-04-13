import { describe, expect, it } from 'vitest';
import { hasWalletConnectProjectId } from './wagmi';

describe('wagmi wallet configuration', () => {
    it('detects when WalletConnect is not configured', () => {
        expect(hasWalletConnectProjectId('')).toBe(false);
    });

    it('detects when WalletConnect is configured', () => {
        expect(hasWalletConnectProjectId('test-project-id')).toBe(true);
    });
});
