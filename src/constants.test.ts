import { describe, it, expect } from 'vitest';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_V2_ABI } from './constants';

describe('contract constants', () => {
    it('V1 contract address is valid hex', () => {
        expect(CONTRACT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('V1 ABI has safeMint function', () => {
        const safeMint = CONTRACT_ABI.find(fn => fn.name === 'safeMint');
        expect(safeMint).toBeDefined();
        expect(safeMint!.inputs).toHaveLength(2);
        expect(safeMint!.inputs[0].type).toBe('address');
        expect(safeMint!.inputs[1].type).toBe('string');
    });

    it('V2 ABI has mintWithCreator function', () => {
        const mintWithCreator = CONTRACT_V2_ABI.find(fn => fn.name === 'mintWithCreator');
        expect(mintWithCreator).toBeDefined();
        expect(mintWithCreator!.inputs).toHaveLength(3);
        expect(mintWithCreator!.stateMutability).toBe('payable');
    });

    it('V2 ABI has creatorEarnings view function', () => {
        const earnings = CONTRACT_V2_ABI.find(fn => fn.name === 'creatorEarnings');
        expect(earnings).toBeDefined();
        expect(earnings!.stateMutability).toBe('view');
    });
});
