import { describe, it, expect } from 'vitest';
import { cn, parseFitDate } from './utils';

describe('cn', () => {
    it('merges class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });

    it('merges tailwind conflicts', () => {
        expect(cn('px-4', 'px-6')).toBe('px-6');
    });
});

describe('parseFitDate', () => {
    it('handles ISO date strings', () => {
        const fit = { id: '1700000000000', date: '2024-01-15T10:30:00.000Z' };
        const result = parseFitDate(fit);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0); // January
        expect(result.getDate()).toBe(15);
    });

    it('handles old locale format with slashes (falls back to id timestamp)', () => {
        const fit = { id: '1700000000000', date: '11/14/2023, 3:33:20 PM' };
        const result = parseFitDate(fit);
        // Should use the id as timestamp
        expect(result.getTime()).toBe(1700000000000);
    });

    it('returns valid date for ISO format without slashes', () => {
        const fit = { id: '123', date: '2025-06-01' };
        const result = parseFitDate(fit);
        expect(result instanceof Date).toBe(true);
        expect(isNaN(result.getTime())).toBe(false);
    });
});
