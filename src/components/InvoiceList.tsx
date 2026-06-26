/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Invoice, InvoiceStatus } from '../types';
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
  Share2
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
    const discount = subtotal * (inv.discountRate / 100);
    const tax = (subtotal - discount) * (inv.taxRate / 100);
    return subtotal - discount + tax + inv.shippingFee;
  };

  // Filter & Sort Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.receiver.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.sender.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      case 'num-asc':
        return a.invoiceNumber.localeCompare(b.invoiceNumber);
      case 'total-desc':
        return getInvoiceTotal(b) - getInvoiceTotal(a);
      case 'date-desc':
      default:
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    }
  });

  // Export Backups
  const exportAllInvoices = () => {
    const dataStr = JSON.stringify(invoices, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `InvoiceStudio_Backup_${new Date().toISOString().split('T')[0]}.json`;
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
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3 h-3 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-gray-50 border border-gray-200 text-gray-600 rounded px-2 py-1 outline-none cursor-pointer flex-1"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="num-asc">Number A-Z</option>
              <option value="total-desc">Highest Total</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Clock className="w-3 h-3 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className="bg-gray-50 border border-gray-200 text-gray-600 rounded px-2 py-1 outline-none cursor-pointer flex-1"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
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
                  p-3 rounded-lg border text-left cursor-pointer transition-all relative group
                  ${isSelected
                    ? 'bg-[#F0F7F7] border-l-4 border-[#0D2C2C] border-y-gray-200 border-r-gray-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`text-xs font-bold font-mono transition-colors ${
                      isSelected ? 'text-[#0D2C2C]' : 'text-gray-700 group-hover:text-[#0D2C2C]'
                    }`}>
                      {inv.invoiceNumber}
                    </h4>
                    <p className={`text-[11px] truncate max-w-[140px] mt-0.5 font-medium ${
                      isSelected ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {inv.receiver.name || 'Draft Client'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xs font-bold font-mono ${
                      isSelected ? 'text-[#0D2C2C]' : 'text-gray-900'
                    }`}>
                      ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">{inv.issueDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getBadgeStyle(inv.status)}`}>
                    {inv.status}
                  </span>
                  
                  <button
                    onClick={(e) => onDeleteInvoice(inv.id, e)}
                    className="p-1 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-rose-50 cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backup Utility Buttons (Bottom rail) */}
      <div className="p-4 border-t border-gray-200/80 bg-slate-50 text-xs">
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button
            onClick={exportAllInvoices}
            className="flex items-center justify-center space-x-1.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg cursor-pointer transition-all shadow-sm font-semibold text-[10px] uppercase tracking-wider"
            title="Download full backup file"
          >
            <Download className="w-3.5 h-3.5 text-[#C69A5D]" />
            <span>Export Backup</span>
          </button>
          
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center space-x-1.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg cursor-pointer transition-all shadow-sm font-semibold text-[10px] uppercase tracking-wider"
            title="Restore from JSON backup file"
          >
            <Upload className="w-3.5 h-3.5 text-[#0D2C2C]" />
            <span>Import Backup</span>
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
          className="w-full py-2 hover:bg-rose-50 hover:text-rose-600 text-rose-500 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer border border-dashed border-rose-200 hover:border-rose-300 text-center block"
        >
          Wipe Database & Reset
        </button>
      </div>

    </div>
  );
};
