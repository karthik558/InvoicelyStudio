/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Invoice, AccessibilitySettings } from '../types';
import { 
  Search, 
  Plus, 
  Save, 
  Download, 
  Moon, 
  Sun, 
  FileText, 
  Eye, 
  Sliders, 
  X, 
  Keyboard, 
  Type, 
  Contrast, 
  Layers
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onSelectInvoice: (id: string) => void;
  onNewInvoice: () => void;
  onSaveInvoice: () => void;
  onLoadDemo: () => void;
  onToggleTheme: () => void;
  appTheme: 'light' | 'dark';
  a11y: AccessibilitySettings;
  onUpdateA11y: (updates: Partial<AccessibilitySettings>) => void;
  onExportBackup: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  invoices,
  onSelectInvoice,
  onNewInvoice,
  onSaveInvoice,
  onLoadDemo,
  onToggleTheme,
  appTheme,
  a11y,
  onUpdateA11y,
  onExportBackup
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter invoices matching query
  const matchingInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
    inv.receiver.name.toLowerCase().includes(query.toLowerCase()) ||
    inv.sender.name.toLowerCase().includes(query.toLowerCase())
  );

  // Static action commands
  const actions = [
    {
      id: 'action-new',
      title: 'Create New Invoice',
      category: 'Actions',
      icon: Plus,
      run: () => { onNewInvoice(); onClose(); }
    },
    {
      id: 'action-save',
      title: 'Save Current Invoice',
      category: 'Actions',
      icon: Save,
      shortcut: '⌘S',
      run: () => { onSaveInvoice(); onClose(); }
    },
    {
      id: 'action-theme',
      title: `Switch to ${appTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
      category: 'Preferences',
      icon: appTheme === 'dark' ? Sun : Moon,
      run: () => { onToggleTheme(); onClose(); }
    },
    {
      id: 'action-contrast',
      title: `Toggle High Contrast Mode (${a11y.highContrast ? 'Active' : 'Off'})`,
      category: 'Accessibility',
      icon: Contrast,
      run: () => { onUpdateA11y({ highContrast: !a11y.highContrast }); onClose(); }
    },
    {
      id: 'action-[#-scale]',
      title: `Cycle Font Size (${a11y.fontScale.toUpperCase()})`,
      category: 'Accessibility',
      icon: Type,
      run: () => {
        const nextScale = a11y.fontScale === 'normal' ? 'large' : a11y.fontScale === 'large' ? 'xlarge' : 'normal';
        onUpdateA11y({ fontScale: nextScale });
        onClose();
      }
    },
    {
      id: 'action-demo',
      title: 'Load Aesthetic Demo Samples',
      category: 'Templates',
      icon: Layers,
      run: () => { onLoadDemo(); onClose(); }
    },
    {
      id: 'action-export',
      title: 'Export Database JSON Backup',
      category: 'Data',
      icon: Download,
      run: () => { onExportBackup(); onClose(); }
    }
  ];

  const filteredActions = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const totalItems = matchingInvoices.length + filteredActions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < matchingInvoices.length) {
        const target = matchingInvoices[selectedIndex];
        if (target) {
          onSelectInvoice(target.id);
          onClose();
        }
      } else {
        const actionIdx = selectedIndex - matchingInvoices.length;
        const targetAction = filteredActions[actionIdx];
        if (targetAction) {
          targetAction.run();
        }
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-100 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div 
        className="w-full max-w-xl bg-[#0D2C2C] border border-[#1A3F3F] text-white rounded-2xl shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1A3F3F] bg-[#0A2323]">
          <Search className="w-5 h-5 text-[#C69A5D] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search invoices... (e.g. INV-2026, theme, font)"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none border-none focus:ring-0"
            aria-label="Command search input"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/5 no-scrollbar">
          {matchingInvoices.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-[#C69A5D]" />
                <span>Invoices ({matchingInvoices.length})</span>
              </div>
              {matchingInvoices.map((inv, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={inv.id}
                    onClick={() => { onSelectInvoice(inv.id); onClose(); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected ? 'bg-[#C69A5D] text-[#0D2C2C] font-semibold' : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-mono font-bold">{inv.invoiceNumber}</span>
                      <span className="ml-2 opacity-80 truncate">{inv.receiver.name || 'Draft Client'}</span>
                    </div>
                    <span className="text-[10px] opacity-75 shrink-0 uppercase font-mono">{inv.status}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredActions.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-[#C69A5D]" />
                <span>Actions & Commands</span>
              </div>
              {filteredActions.map((action, index) => {
                const itemGlobalIdx = matchingInvoices.length + index;
                const isSelected = itemGlobalIdx === selectedIndex;
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => action.run()}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected ? 'bg-[#C69A5D] text-[#0D2C2C] font-semibold' : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#0D2C2C]' : 'text-[#C69A5D]'}`} />
                      <span className="truncate">{action.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {action.shortcut && (
                        <kbd className={isSelected ? 'bg-[#0D2C2C]/20 border-[#0D2C2C]/30 text-[#0D2C2C]' : ''}>
                          {action.shortcut}
                        </kbd>
                      )}
                      <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#0D2C2C]/15 text-[#0D2C2C]' : 'bg-white/5 text-slate-400'
                      }`}>
                        {action.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {totalItems === 0 && (
            <div className="py-10 text-center text-slate-400 text-xs">
              No matching commands or invoices found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#1A3F3F] bg-[#0A2323] flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
          <div className="flex items-center space-x-1">
            <Keyboard className="w-3 h-3 text-[#C69A5D]" />
            <span>Version 3.0 Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};
