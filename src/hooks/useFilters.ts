import { useState } from 'react';

export type FilterType = 'none' | 'grayscale' | 'vintage' | 'contrast' | 'cyberpunk';

export interface Filter {
    id: FilterType;
    name: string;
    cssFilter: string;
    icon: string;
}

export const FILTERS: Filter[] = [
    { id: 'none', name: 'Original', cssFilter: 'none', icon: '✨' },
    { id: 'grayscale', name: 'Grayscale', cssFilter: 'grayscale(100%)', icon: '⚫' },
    { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(60%) saturate(80%) brightness(90%) contrast(90%)', icon: '📷' },
    { id: 'contrast', name: 'High Contrast', cssFilter: 'contrast(150%) saturate(120%)', icon: '🔆' },
    { id: 'cyberpunk', name: 'Cyberpunk', cssFilter: 'hue-rotate(270deg) saturate(150%) brightness(90%)', icon: '💜' },
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
