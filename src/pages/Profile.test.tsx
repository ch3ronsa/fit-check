import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Profile from './Profile';

const {
    withdrawEarnings,
    migrateFromLocalStorage,
    getAllFits,
    navigate,
} = vi.hoisted(() => ({
    withdrawEarnings: vi.fn(),
    migrateFromLocalStorage: vi.fn(),
    getAllFits: vi.fn(),
    navigate: vi.fn(),
}));

let creatorRewardsState = {
    isV2Enabled: true,
    earningsEth: '0.042',
    creatorShareBps: 5000,
    isWithdrawing: false,
    canWithdraw: true,
    withdrawEarnings,
};

vi.mock('../hooks/useCreatorRewards', () => ({
    useCreatorRewards: () => creatorRewardsState,
}));

vi.mock('../hooks/useUserIdentity', () => ({
    useUserIdentity: () => ({
        displayName: 'Test User',
        avatar: null,
        address: '0x1111111111111111111111111111111111111111',
        source: 'wallet',
    }),
}));

vi.mock('../lib/db', () => ({
    migrateFromLocalStorage,
    getAllFits,
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigate,
    };
});

describe('Profile', () => {
    beforeEach(() => {
        withdrawEarnings.mockReset();
        migrateFromLocalStorage.mockReset();
        getAllFits.mockReset();
        navigate.mockReset();
        migrateFromLocalStorage.mockResolvedValue(undefined);
        getAllFits.mockResolvedValue([]);
        creatorRewardsState = {
            isV2Enabled: true,
            earningsEth: '0.042',
            creatorShareBps: 5000,
            isWithdrawing: false,
            canWithdraw: true,
            withdrawEarnings,
        };
    });

    it('shows creator earnings and triggers withdrawal', async () => {
        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(migrateFromLocalStorage).toHaveBeenCalled();
        });

        expect(screen.getByText('Creator Earnings')).toBeInTheDocument();
        expect(screen.getByText('0.042 ETH')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Withdraw' }));
        expect(withdrawEarnings).toHaveBeenCalledTimes(1);
    });

    it('hides creator earnings when V2 is not enabled', async () => {
        creatorRewardsState = {
            ...creatorRewardsState,
            isV2Enabled: false,
        };

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>,
        );

        await waitFor(() => {
            expect(migrateFromLocalStorage).toHaveBeenCalled();
        });

        expect(screen.queryByText('Creator Earnings')).not.toBeInTheDocument();
    });
});
