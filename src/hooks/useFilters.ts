import { useState } from 'react';

export type FilterType =
    | 'none'
    | 'grayscale'
    | 'vintage'
    | 'contrast'
    | 'cyberpunk'
    | 'golden_hour'
    | 'noir'
    | 'polaroid'
    | 'vivid'
    | 'fade'
    | 'cool_mint'
    | 'retro_90s'
    | 'warmth';

export interface Filter {
    id: FilterType;
    name: string;
    cssFilter: string;
    icon: string;
}

export const FILTERS: Filter[] = [
    // Original filters
    { id: 'none', name: 'Original', cssFilter: 'none', icon: '✨' },
    { id: 'grayscale', name: 'B&W', cssFilter: 'grayscale(100%)', icon: '⚫' },
    { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(60%) saturate(80%) brightness(90%) contrast(90%)', icon: '📷' },
    { id: 'contrast', name: 'Contrast', cssFilter: 'contrast(150%) saturate(120%)', icon: '🔆' },
    { id: 'cyberpunk', name: 'Cyber', cssFilter: 'hue-rotate(270deg) saturate(150%) brightness(90%)', icon: '💜' },

    // New compound filters
    {
        id: 'golden_hour',
        name: 'Golden',
        cssFilter: 'brightness(110%) sepia(30%) saturate(140%) contrast(95%)',
        icon: '🌅'
    },
    {
        id: 'noir',
        name: 'Noir',
        cssFilter: 'grayscale(100%) contrast(140%) brightness(85%)',
        icon: '🎬'
    },
    {
        id: 'polaroid',
        name: 'Polaroid',
        cssFilter: 'contrast(85%) sepia(20%) hue-rotate(-10deg) saturate(90%) brightness(105%)',
        icon: '🖼️'
    },
    {
        id: 'vivid',
        name: 'Vivid',
        cssFilter: 'saturate(180%) contrast(130%) brightness(105%)',
        icon: '🌈'
    },
    {
        id: 'fade',
        name: 'Fade',
        cssFilter: 'contrast(80%) brightness(115%) saturate(90%)',
        icon: '🌫️'
    },
    {
        id: 'cool_mint',
        name: 'Mint',
        cssFilter: 'hue-rotate(160deg) brightness(105%) saturate(85%)',
        icon: '🧊'
    },
    {
        id: 'retro_90s',
        name: "90's",
        cssFilter: 'saturate(70%) contrast(90%) brightness(95%) sepia(10%)',
        icon: '📺'
    },
    {
        id: 'warmth',
        name: 'Warm',
        cssFilter: 'sepia(40%) brightness(108%) saturate(110%) contrast(95%)',
        icon: '☕'
    },
];

export const useFilters = () => {
    const [activeFilter, setActiveFilter] = useState<FilterType>('none');

    const applyFilter = (filterId: FilterType) => {
        setActiveFilter(filterId);
    };

    const getFilterStyle = (): string => {
        const filter = FILTERS.find(f => f.id === activeFilter);
        return filter?.cssFilter || 'none';
    };

    return {
        activeFilter,
        applyFilter,
        getFilterStyle,
        filters: FILTERS,
    };
};
