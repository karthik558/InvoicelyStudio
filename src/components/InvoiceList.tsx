/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { Invoice, InvoiceStatus, getCurrencyFormatter } from '../types';
import { CustomSelect } from './CustomSelect';
import { 
  Search, 
  ArrowUpDown, 
  Clock, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  FileText,
  DollarSign,
  Share2,
  Database
} from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  selectedInvoiceId: string;
  onSelectInvoice: (id: string) => void;
  onNewInvoice: () => void;
  onDeleteInvoice: (id: string, e: React.MouseEvent) => void;
  onImportBackup: (importedInvoices: Invoice[]) => void;
  onClearAll: () => void;
  onAlert?: (title: string, message: string) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'num-asc' | 'total-desc';
type StatusFilter = 'all' | InvoiceStatus;

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  selectedInvoiceId,
  onSelectInvoice,
  onNewInvoice,
  onDeleteInvoice,
  onImportBackup,
  onClearAll,
  onAlert,
}) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerLocalAlert = (title: string, message: string) => {
    if (onAlert) {
      onAlert(title, message);
    } else {
      alert(`${title}: ${message}`);
    }
  };

  // Calculate invoice totals
  const getInvoiceTotal = (inv: Invoice) => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discount = inv.discountType === 'flat' ? inv.discountRate : subtotal * (inv.discountRate / 100);
    const gstEnabled = !!inv.gstEnabled;
    const tax = gstEnabled ? 0 : (subtotal - discount) * (inv.taxRate / 100);
    const gst = gstEnabled ? (subtotal - discount) * ((inv.gstRate || 0) / 100) : 0;
    return subtotal - discount + tax + gst + inv.shippingFee;
  };

  // Filter & Sort Invoices with useMemo optimization
  const sortedInvoices = useMemo(() => {
    const filtered = invoices.filter((inv) => {
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.receiver.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.sender.name.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        case 'num-asc':
          return a.invoiceNumber.localeCompare(b.invoiceNumber);
        case 'total-desc':
          return getInvoiceTotal(b) - getInvoiceTotal(a);
        case 'date-desc':
        default:
          return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
    });
  }, [invoices, search, sortBy, filterStatus]);

  // Export Backups
  const exportAllInvoices = () => {
    const dataStr = JSON.stringify(invoices, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `InvoicelyStudio_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Backups
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].invoiceNumber) {
            onImportBackup(parsed);
            triggerLocalAlert('Backup Restored', `Backup restored successfully! Loaded ${parsed.length} invoices.`);
          } else {
            triggerLocalAlert('Import Error', 'Invalid backup file. Must be a JSON array of invoices.');
          }
        } catch (error) {
          triggerLocalAlert('Parsing Error', 'Failed to parse backup file. Check file integrity.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Status badge colors
  const getBadgeStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200/60';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200/60';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200/60';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 text-slate-700 select-none">
      
      {/* Title Header with Counter */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#0D2C2C] flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#C69A5D]" />
            <span>Invoice Registry</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{invoices.length} total saved invoices</p>
        </div>
        
        <button
          onClick={onNewInvoice}
          className="p-1.5 rounded bg-[#F0F7F7] hover:bg-[#0D2C2C] text-[#0D2C2C] hover:text-white border border-[#0D2C2C]/10 transition-colors cursor-pointer"
          title="New Blank Invoice"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Sort Panel */}
      <div className="p-4 space-y-3 border-b border-gray-200/80 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C]/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 outline-none transition-all focus:bg-white focus:ring-1 focus:ring-[#0D2C2C]"
            placeholder="Search invoices, clients..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center space-x-1.5 w-full">
            <ArrowUpDown className="w-3 h-3 text-gray-400 shrink-0" />
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
              className="flex-1 min-w-0"
              options={[
                { value: 'date-desc', label: 'Recently Updated' },
                { value: 'date-asc', label: 'Oldest First' },
                { value: 'num-asc', label: 'Number A-Z' },
                { value: 'total-desc', label: 'Highest Total' }
              ]}
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full">
            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
            <CustomSelect
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as StatusFilter)}
              className="flex-1 min-w-0"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'paid', label: 'Paid Only' },
                { value: 'pending', label: 'Pending' },
                { value: 'overdue', label: 'Overdue' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Invoice Cards Scroll List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar bg-gray-50/20">
        {sortedInvoices.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-gray-400 font-medium">No matching invoices</p>
            <button 
              onClick={() => { setSearch(''); setFilterStatus('all'); }} 
              className="text-[10px] text-[#C69A5D] hover:underline mt-1.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          sortedInvoices.map((inv) => {
            const isSelected = inv.id === selectedInvoiceId;
            const total = getInvoiceTotal(inv);
            
            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv.id)}
                className={`
                  p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group select-none
                  ${isSelected
                    ? 'bg-gradient-to-r from-emerald-50/20 to-[#F0F7F7] border-[#0D2C2C] shadow-md shadow-[#0D2C2C]/5 translate-x-[2px]'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Visual Accent Bar for Selected Items */}
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#0D2C2C] rounded-r-md"></div>
                )}

                <div className="flex justify-between items-start pl-1.5">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className={`text-xs font-bold font-mono transition-colors truncate ${
                      isSelected ? 'text-[#0D2C2C]' : 'text-gray-800 group-hover:text-[#0D2C2C]'
                    }`}>
                      {inv.invoiceNumber}
                    </h4>
                    <p className={`text-[11px] truncate mt-0.5 font-semibold ${
                      isSelected ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {inv.receiver.name || 'Draft Client'}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold font-mono ${
                      isSelected ? 'text-[#0D2C2C]' : 'text-gray-900'
                    }`}>
                      {getCurrencyFormatter(inv.currency).format(total)}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">{inv.issueDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 pl-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getBadgeStyle(inv.status)}`}>
                    <span className={`w-1 h-1 rounded-full mr-1.5 ${
                      inv.status === 'paid' ? 'bg-green-500' : inv.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {inv.status}
                  </span>
                  
                  <button
                    onClick={(e) => onDeleteInvoice(inv.id, e)}
                    className="p-1 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-rose-50 cursor-pointer shrink-0"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backup Utility Buttons (Bottom rail) */}
      <div className="p-4 border-t border-gray-200/80 bg-gradient-to-b from-white to-gray-50 text-xs">
        <div className="bg-gray-100/50 border border-gray-200/60 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider px-0.5">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-[#C69A5D]" /> Storage Engine
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={exportAllInvoices}
              className="flex items-center justify-center space-x-1 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-lg cursor-pointer transition-all shadow-sm font-bold text-[9px] uppercase tracking-wider"
              title="Download full backup file"
            >
              <Download className="w-3 h-3 text-[#C69A5D]" />
              <span>Export</span>
            </button>
            
            <button
              onClick={handleImportClick}
              className="flex items-center justify-center space-x-1 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded-lg cursor-pointer transition-all shadow-sm font-bold text-[9px] uppercase tracking-wider"
              title="Restore from JSON backup file"
            >
              <Upload className="w-3 h-3 text-[#0D2C2C]" />
              <span>Import</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={onClearAll}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-rose-50 hover:bg-rose-100/80 active:bg-rose-200/70 border border-rose-100 text-rose-600 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer text-center"
          >
            <Trash2 className="w-3 h-3 text-rose-500" />
            <span>Wipe Database & Reset</span>
          </button>


        </div>
      </div>

    </div>
  );
};
