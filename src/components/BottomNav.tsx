import React from 'react';
import { User, HelpCircle, Camera, Sparkles, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Studio', icon: Camera },
    { path: '/frames', label: 'Frames', icon: LayoutGrid },
    { path: '/frens', label: 'Frens', icon: Sparkles },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/help', label: 'Help', icon: HelpCircle },
];

const BottomNav: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card-bg)] border-t border-gray-800/50 backdrop-blur-lg safe-area-bottom">
            <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
                {navItems.map((item) => {
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all ${isActive
                                    ? 'text-base-blue bg-base-blue/10'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
