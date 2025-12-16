import React from 'react';
import { User, HelpCircle, Camera } from 'lucide-react';

interface BottomNavProps {
    currentView: 'home' | 'profile' | 'how-to';
    onNavigate: (view: 'home' | 'profile' | 'how-to') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
    const navItems = [
        { id: 'home' as const, label: 'Studio', icon: Camera },
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'how-to' as const, label: 'Help', icon: HelpCircle },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card-bg)] border-t border-gray-800/50 backdrop-blur-lg safe-area-bottom">
            <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
                {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-xl transition-all ${isActive
                                    ? 'text-base-blue bg-base-blue/10'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
