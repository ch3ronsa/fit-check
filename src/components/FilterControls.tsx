import React from 'react';
import { FilterType, FILTERS } from '../hooks/useFilters';

interface FilterControlsProps {
    activeFilter: FilterType;
    onFilterChange: (filterId: FilterType) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="w-full">
            <h3 className="text-sm font-bold text-gray-400 mb-3">FILTERS</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="group" aria-label="Photo filters">
                {FILTERS.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        aria-label={`${filter.name} filter`}
                        aria-pressed={activeFilter === filter.id}
                        className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-w-[80px] ${activeFilter === filter.id
                                ? 'border-base-blue bg-base-blue/10 shadow-[0_0_15px_rgba(0,82,255,0.3)]'
                                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                            }`}
                    >
                        <span className="text-2xl mb-1">{filter.icon}</span>
                        <span className="text-xs font-medium">{filter.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterControls;
