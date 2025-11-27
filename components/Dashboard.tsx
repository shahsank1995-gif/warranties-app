import React, { useState, useMemo } from 'react';
import type { WarrantyItem } from '../types';
import { WarrantyCard } from './WarrantyCard';
import { FolderIcon } from './icons/FolderIcon';
import { SearchIcon } from './icons/SearchIcon';
import { DashboardStats } from './DashboardStats';
import { PlusIcon } from './icons/PlusIcon';
import { calculateWarrantyStatus } from '../utils/dateUtils';

interface DashboardProps {
  warranties: WarrantyItem[];
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onOpenSettings?: () => void;
  alertThreshold: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ warranties, onDelete, onAddClick, onOpenSettings, alertThreshold }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expiring-soon' | 'expired'>('all');

  const filteredWarranties = useMemo(() => {
    const sorted = [...warranties].sort((a, b) => {
      const dateA = new Date(a.purchaseDate);
      const dateB = new Date(b.purchaseDate);
      return dateB.getTime() - dateA.getTime();
    });

    let filtered = sorted;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const { status } = calculateWarrantyStatus(item);
        return status === statusFilter;
      });
    }

    // Apply search filter
    if (!searchQuery.trim()) {
      return filtered;
    }

    return filtered.filter(item =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.retailer && item.retailer.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [warranties, searchQuery, statusFilter]);

  return (
    <div className="mt-8">
      {warranties.length > 0 && (
        <DashboardStats
          warranties={warranties}
          onFilterChange={setStatusFilter}
          activeFilter={statusFilter}
          onOpenSettings={onOpenSettings}
          alertThreshold={alertThreshold}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-6 mt-12">
        <h2 className="text-5xl font-serif font-semibold text-off-white flex-shrink-0">My Collection</h2>
        {warranties.length > 0 && (
          <div className="flex-grow flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon className="h-5 w-5 text-muted-silver" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full border-transparent py-3 pl-11 pr-4 text-off-white placeholder:text-muted-silver focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-purple/50 sm:text-sm clay-inset"
                placeholder="Search your collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={onAddClick}
              className="inline-flex w-full sm:w-auto items-center justify-center flex-shrink-0 px-5 py-2.5 text-sm font-semibold clay-button"
            >
              <PlusIcon className="w-5 h-5 -ml-1 mr-2" />
              Add Warranty
            </button>
          </div>
        )}
      </div>

      {warranties.length === 0 ? (
        <div className="text-center py-20 px-6 bg-deep-graphite/50 rounded-2xl border border-white/5">
          <FolderIcon className="mx-auto h-12 w-12 text-dark-smoke" />
          <h3 className="mt-4 text-xl font-medium text-off-white">Begin your collection</h3>
          <p className="mt-2 text-muted-silver leading-relaxed">Add your first warranty to get started.</p>
          <div className="mt-6">
            <button
              onClick={onAddClick}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold clay-button"
            >
              <PlusIcon className="w-5 h-5 -ml-1 mr-2" />
              Add First Warranty
            </button>
          </div>
        </div>
      ) : filteredWarranties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWarranties.map((item, index) => (
            <WarrantyCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-deep-graphite/50 rounded-2xl">
          <SearchIcon className="mx-auto h-12 w-12 text-dark-smoke" />
          <h3 className="mt-4 text-xl font-medium text-off-white">No results found</h3>
          <p className="mt-2 text-muted-silver">Your search for "{searchQuery}" did not match any warranties.</p>
        </div>
      )}
    </div>
  );
};