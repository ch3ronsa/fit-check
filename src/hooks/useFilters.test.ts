import { describe, it, expect } from 'vitest';
import { FILTERS } from './useFilters';

describe('FILTERS', () => {
    it('has "none" as first filter (Original)', () => {
        expect(FILTERS[0].id).toBe('none');
        expect(FILTERS[0].name).toBe('Original');
    });

    it('has unique ids', () => {
        const ids = FILTERS.map(f => f.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all filters have valid CSS filter strings', () => {
        FILTERS.forEach(filter => {
            expect(typeof filter.cssFilter).toBe('string');
            expect(filter.cssFilter.length).toBeGreaterThan(0);
        });
    });

    it('all filters have icons', () => {
        FILTERS.forEach(filter => {
            expect(filter.icon.length).toBeGreaterThan(0);
        });
    });

    it('has at least 5 filters', () => {
        expect(FILTERS.length).toBeGreaterThanOrEqual(5);
    });
});
