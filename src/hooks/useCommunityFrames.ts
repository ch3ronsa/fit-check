import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CommunityFrame {
    id: string;
    name: string;
    ipfsHash: string;
    url: string;
    creator: {
        address?: string;
        name: string;
        fid?: number;
    };
    category: 'community' | 'trending';
    uses: number;
    installs: number;
    mints: number;
    createdAt: string;
}

type UsageEventType = 'install' | 'mint';

async function fetchCommunityFrames(): Promise<CommunityFrame[]> {
    const response = await fetch('/api/frames');
    if (!response.ok) throw new Error('Failed to fetch frames');
    const data = await response.json();
    return data.frames || [];
}

async function uploadFrameToAPI(params: {
    image: string;
    name: string;
    creator: { address?: string; name: string; fid?: number };
}): Promise<CommunityFrame> {
    const response = await fetch('/api/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: params.image,
            name: params.name,
            creatorAddress: params.creator.address,
            creatorName: params.creator.name,
            creatorFid: params.creator.fid,
        }),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
    }

    const data = await response.json();
    return data.frame as CommunityFrame;
}

async function incrementFrameUsage(params: {
    ipfsHash: string;
    eventType: UsageEventType;
}): Promise<{ id: string; uses: number; installs: number; mints: number }> {
    const response = await fetch('/api/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'increment_usage',
            ipfsHash: params.ipfsHash,
            eventType: params.eventType,
        }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Usage tracking failed');
    }

    const data = await response.json();
    return data.frame;
}

export function useCommunityFrames() {
    const queryClient = useQueryClient();

    const { data: frames = [], isLoading, error } = useQuery({
        queryKey: ['community-frames'],
        queryFn: fetchCommunityFrames,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    const uploadMutation = useMutation({
        mutationFn: uploadFrameToAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community-frames'] });
        },
    });

    const usageMutation = useMutation({
        mutationFn: incrementFrameUsage,
        onSuccess: (updatedFrame) => {
            queryClient.setQueryData<CommunityFrame[]>(['community-frames'], (current = []) =>
                current.map((frame) =>
                    frame.id === updatedFrame.id
                        ? {
                            ...frame,
                            uses: updatedFrame.uses,
                            installs: updatedFrame.installs,
                            mints: updatedFrame.mints,
                            category: updatedFrame.uses >= 10 ? 'trending' : 'community',
                        }
                        : frame
                )
            );
        },
    });

    const uploadFrame = async (
        image: string,
        name: string,
        creator: { address?: string; name: string; fid?: number },
    ) => {
        return uploadMutation.mutateAsync({ image, name, creator });
    };

    const trackFrameUse = async (ipfsHash: string, eventType: UsageEventType) => {
        return usageMutation.mutateAsync({ ipfsHash, eventType });
    };

    return {
        frames,
        isLoading,
        error: error?.message || null,
        uploadFrame,
        trackFrameUse,
        isTrackingUse: usageMutation.isPending,
        refresh: () => queryClient.invalidateQueries({ queryKey: ['community-frames'] }),
    };
}
