import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const ACCOUNT_ADDRESS = '0x1111111111111111111111111111111111111111';
const CREATOR_ADDRESS = '0x2222222222222222222222222222222222222222';
const V1_ADDRESS = '0x3333333333333333333333333333333333333333';
const V2_ADDRESS = '0x4444444444444444444444444444444444444444';

async function loadUseMintModule(options: {
    isV2Enabled: boolean;
    mintFee?: bigint;
}) {
    vi.resetModules();

    const writeContractAsync = vi.fn().mockResolvedValue('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    const uploadToIPFS = vi.fn().mockResolvedValue({ success: true, ipfsHash: 'QmHash123' });
    const generateImageBlob = vi.fn().mockResolvedValue(new Blob(['fit'], { type: 'image/png' }));
    const saveToHistory = vi.fn().mockResolvedValue(undefined);
    const playSuccessSound = vi.fn();
    const showBrowserNotification = vi.fn();
    const toast = {
        warning: vi.fn(),
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn(),
    };

    vi.doMock('wagmi', () => ({
        useAccount: () => ({ isConnected: true, address: ACCOUNT_ADDRESS }),
        useWriteContract: () => ({ writeContractAsync }),
        useReadContract: () => ({ data: options.mintFee ?? 123n }),
    }));

    vi.doMock('../constants', () => ({
        CONTRACT_ADDRESS: V1_ADDRESS,
        CONTRACT_ABI: [{ name: 'safeMint' }],
        CONTRACT_V2_ADDRESS: V2_ADDRESS,
        CONTRACT_V2_ABI: [{ name: 'safeMint' }, { name: 'mintWithCreator' }, { name: 'mintFee' }],
        DEFAULT_V2_MINT_FEE_WEI: 100n,
        IS_CONTRACT_V2_ENABLED: options.isV2Enabled,
    }));

    vi.doMock('../lib/pinata', () => ({
        uploadToIPFS,
    }));

    vi.doMock('./useFitHistory', () => ({
        generateImageBlob,
        saveToHistory,
    }));

    vi.doMock('../lib/utils', () => ({
        playSuccessSound,
    }));

    vi.doMock('../lib/notifications', () => ({
        showBrowserNotification,
    }));

    vi.doMock('sonner', () => ({
        toast,
    }));

    const module = await import('./useMint');

    return {
        useMint: module.useMint,
        writeContractAsync,
        saveToHistory,
        toast,
    };
}

describe('useMint', () => {
    it('uses V2 creator mint path when enabled and frame creator exists', async () => {
        const { useMint, writeContractAsync } = await loadUseMintModule({
            isV2Enabled: true,
            mintFee: 555n,
        });

        const { result } = renderHook(() => useMint());

        await act(async () => {
            await result.current.handleMint(91, 'Based fit', {
                frameCreatorAddress: CREATOR_ADDRESS,
            });
        });

        expect(writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
            address: V2_ADDRESS,
            functionName: 'mintWithCreator',
            args: [ACCOUNT_ADDRESS, 'ipfs://QmHash123', CREATOR_ADDRESS],
            value: 555n,
        }));
    });

    it('falls back to V1 safeMint when V2 is disabled', async () => {
        const { useMint, writeContractAsync } = await loadUseMintModule({
            isV2Enabled: false,
        });

        const { result } = renderHook(() => useMint());

        await act(async () => {
            await result.current.handleMint(84, 'Fallback fit');
        });

        expect(writeContractAsync).toHaveBeenCalledWith(expect.objectContaining({
            address: V1_ADDRESS,
            functionName: 'safeMint',
            args: [ACCOUNT_ADDRESS, 'ipfs://QmHash123'],
        }));
    });
});
