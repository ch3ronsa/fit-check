import { describe, it, expect } from 'vitest';
import { FRAMES } from './frames';

describe('FRAMES', () => {
    it('has "No Frame" as first option', () => {
        expect(FRAMES[0].id).toBe('none');
        expect(FRAMES[0].path).toBeNull();
        expect(FRAMES[0].name).toBe('No Frame');
    });

    it('has unique ids', () => {
        const ids = FRAMES.map(f => f.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all non-null paths start with /frames/', () => {
        FRAMES.filter(f => f.path !== null).forEach(frame => {
            expect(frame.path).toMatch(/^\/frames\/frame\d+\.png$/);
        });
    });

    it('has at least 20 frames', () => {
        expect(FRAMES.length).toBeGreaterThanOrEqual(20);
    });
});
