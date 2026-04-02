import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import FrameMarketplace from './FrameMarketplace';

const trackFrameUse = vi.fn();
const refresh = vi.fn();
const navigate = vi.fn();

vi.mock('../hooks/useCommunityFrames', () => ({
    useCommunityFrames: () => ({
        frames: [
            {
                id: 'frame-1',
                name: 'Neon Frame',
                ipfsHash: 'frame-1',
                url: '/frame-1.png',
                creator: { name: 'Alice' },
                category: 'trending',
                uses: 12,
                installs: 5,
                mints: 7,
                createdAt: '2025-01-01T00:00:00.000Z',
            },
        ],
        isLoading: false,
        refresh,
        trackFrameUse,
        isTrackingUse: false,
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe('FrameMarketplace', () => {
    beforeEach(() => {
        localStorage.clear();
        trackFrameUse.mockReset();
        refresh.mockReset();
        navigate.mockReset();
    });

    it('tracks installs only when a community frame is newly installed', async () => {
        render(
            <MemoryRouter>
                <FrameMarketplace />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByLabelText('Install Neon Frame'));

        await waitFor(() => {
            expect(trackFrameUse).toHaveBeenCalledWith('frame-1', 'install');
        });

        expect(JSON.parse(localStorage.getItem('fitcheck_installed_frames') || '[]')).toContain('frame-1');

        fireEvent.click(screen.getByLabelText('Remove Neon Frame'));

        await waitFor(() => {
            expect(JSON.parse(localStorage.getItem('fitcheck_installed_frames') || '[]')).not.toContain('frame-1');
        });

        expect(trackFrameUse).toHaveBeenCalledTimes(1);
    });

    it('renders frame usage breakdown', () => {
        render(
            <MemoryRouter>
                <FrameMarketplace />
            </MemoryRouter>,
        );

        expect(screen.getByText('12 total uses / 5 installs / 7 mints')).toBeInTheDocument();
    });
});
