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
    createdAt: string;
}

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

    const uploadFrame = async (
        image: string,
        name: string,
        creator: { address?: string; name: string; fid?: number },
    ) => {
        return uploadMutation.mutateAsync({ image, name, creator });
    };

    return {
        frames,
        isLoading,
        error: error?.message || null,
        uploadFrame,
        refresh: () => queryClient.invalidateQueries({ queryKey: ['community-frames'] }),
    };
}
