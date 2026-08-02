/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LineItem, ITEM_CATALOG_PRESETS, ItemPreset, getCurrencyFormatter } from '../types';
import { Plus, X, Search, Check, Layers } from 'lucide-react';

interface ItemPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: LineItem) => void;
  currency?: string;
}

export const ItemPresetsModal: React.FC<ItemPresetsModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  currency = 'USD'
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedItemTitles, setAddedItemTitles] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(ITEM_CATALOG_PRESETS.map(p => p.category)))];

  const filteredPresets = ITEM_CATALOG_PRESETS.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectPreset = (preset: ItemPreset) => {
    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: `${preset.title} - ${preset.description}`,
      quantity: 1,
      rate: preset.defaultRate,
      amount: preset.defaultRate
    };
    onAddItem(newItem);
    setAddedItemTitles(prev => ({ ...prev, [preset.title]: true }));
    setTimeout(() => {
      setAddedItemTitles(prev => ({ ...prev, [preset.title]: false }));
    }, 1200);
  };

  const formatter = getCurrencyFormatter(currency);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn no-print"
      onClick={onClose}
      role="dialog"
      aria-label="Preset Catalog Library"
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#0B1B1B] border border-gray-200 dark:border-[#1A3F3F] text-slate-800 dark:text-white rounded-2xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#1A3F3F] bg-gray-50/50 dark:bg-[#0A2323] shrink-0">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#C69A5D]" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Service Item Presets Catalog</h3>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">Click any preset to instantly append it to your active invoice</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-[#1A3F3F] space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service templates..."
              className="w-full bg-gray-50 dark:bg-[#0A2323] border border-gray-200 dark:border-[#1A3F3F] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-[#0D2C2C] dark:focus:border-[#C69A5D]"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0D2C2C] dark:bg-[#C69A5D] text-white dark:text-[#0D2C2C]'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 no-scrollbar">
          {filteredPresets.map((preset, idx) => {
            const isJustAdded = !!addedItemTitles[preset.title];
            return (
              <div
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-[#1A3F3F] bg-white dark:bg-[#0B1B1B] hover:border-[#0D2C2C] dark:hover:border-[#C69A5D] hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#0D2C2C] dark:group-hover:text-[#C69A5D] transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400 font-mono">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1">{preset.description}</p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-xs font-bold font-mono text-[#0D2C2C] dark:text-[#C69A5D]">
                    {formatter.format(preset.defaultRate)}
                  </span>
                  <button
                    type="button"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      isJustAdded 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#F0F7F7] dark:bg-white/10 text-[#0D2C2C] dark:text-white group-hover:bg-[#0D2C2C] dark:group-hover:bg-[#C69A5D] group-hover:text-white dark:group-hover:text-[#0D2C2C]'
                    }`}
                  >
                    {isJustAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-gray-100 dark:border-[#1A3F3F] bg-gray-50 dark:bg-[#0A2323] text-center text-[10px] text-gray-400">
          Items will be added to your current invoice line items list with 1x quantity.
        </div>
      </div>
    </div>
  );
};
