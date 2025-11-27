import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { PlusIcon } from './icons/PlusIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
    onAddClick: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddClick, onLogout }) => {
  return (
    <header className="bg-charcoal-black/50 backdrop-blur-xl sticky top-0 z-20 border-b border-white/5">
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <LogoIcon className="w-8 h-8 text-off-white" />
          <h1 className="text-2xl font-serif font-semibold text-off-white tracking-wide">
            Warranto
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <button
            onClick={onAddClick}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold clay-button"
            >
            <PlusIcon className="w-5 h-5 -ml-1 mr-2" />
            Add Warranty
            </button>
            <button
                onClick={onLogout}
                className="p-2.5 rounded-xl text-muted-silver hover:bg-onyx-gray hover:text-soft-platinum focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-charcoal-black focus:ring-brand-purple"
                aria-label="Logout"
            >
                <LogoutIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </header>
  );
};