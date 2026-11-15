/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { Invoice, InvoiceStatus, calculateInvoiceTotals, getCurrencyFormatter } from '../types';
import { CustomSelect } from './CustomSelect';
import { 
  Search, 
  Trash2, 
  Plus, 
  Download, 
  Upload
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
  const getInvoiceTotal = (inv: Invoice) => calculateInvoiceTotals(inv).total;

  // Filter & Sort Invoices with useMemo optimization
  const sortedInvoices = useMemo(() => {
    const filtered = invoices.filter((inv) => {
      const matchesSearch = 
        (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.receiver?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.sender?.name || '').toLowerCase().includes(search.toLowerCase());
      
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

  const statusFilters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'paid', label: 'Paid' },
    { id: 'advance_paid', label: 'Advance' },
    { id: 'overdue', label: 'Overdue' },
  ];

  const statusLabel = (status: InvoiceStatus) => {
    if (status === 'advance_paid') return 'Advance';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getBadgeStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'advance_paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'overdue':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    }
  };

  const formatListDate = (value?: string) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--line)] text-[var(--ink)] select-none">
      
      <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between gap-3 bg-[var(--surface)]">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Invoices</h2>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            {invoices.length} saved
          </p>
        </div>
        <button
          onClick={onNewInvoice}
          className="flex items-center gap-1 h-9 px-3 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-semibold cursor-pointer shrink-0"
          title="New blank invoice"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      <div className="px-4 py-3 space-y-3 border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-[var(--surface-muted)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg pl-9 pr-3 text-xs text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition-all focus:bg-[var(--surface)] focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="Search invoices or clients"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((filter) => {
            const active = filterStatus === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setFilterStatus(filter.id)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold cursor-pointer border transition-colors ${
                  active
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--on-accent)]'
                    : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--accent-soft)]'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <CustomSelect
          value={sortBy}
          onChange={(val) => setSortBy(val as SortOption)}
          options={[
            { value: 'date-desc', label: 'Recently updated' },
            { value: 'date-asc', label: 'Oldest first' },
            { value: 'num-asc', label: 'Invoice number' },
            { value: 'total-desc', label: 'Highest total' }
          ]}
        />
      </div>

      {/* Invoice Cards Scroll List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--canvas)]">
        {sortedInvoices.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-[var(--muted)] font-medium">No matching invoices</p>
            <button 
              onClick={() => { setSearch(''); setFilterStatus('all'); }} 
              className="text-[11px] text-[var(--accent-text)] hover:underline mt-1.5 cursor-pointer"
            >
              Clear search and filters
            </button>
          </div>
        ) : (
          sortedInvoices.map((inv) => {
            const isSelected = inv.id === selectedInvoiceId;
            const total = getInvoiceTotal(inv);
            const clientName = inv.receiver?.name?.trim() || 'Draft client';
            
            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv.id)}
                className={`
                  p-3 rounded-lg border text-left cursor-pointer transition-colors
                  ${isSelected
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                    : 'bg-[var(--surface)] border-[var(--line)] hover:bg-[var(--surface-muted)]'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-semibold text-[var(--ink)] truncate">
                      {clientName}
                    </h4>
                    <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                      {inv.invoiceNumber} · {formatListDate(inv.issueDate)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold font-mono text-[var(--ink)] shrink-0">
                    {getCurrencyFormatter(inv.currency).format(total)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2.5">
                  <span className={`inline-flex items-center h-6 px-2 rounded-lg text-[10px] font-semibold ${getBadgeStyle(inv.status)}`}>
                    {statusLabel(inv.status)}
                  </span>
                  <button
                    onClick={(e) => onDeleteInvoice(inv.id, e)}
                    className="h-7 w-7 inline-flex items-center justify-center text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                    title="Delete invoice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-3 border-t border-[var(--line)] bg-[var(--surface)] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={exportAllInvoices}
            className="flex items-center justify-center gap-1.5 h-9 bg-[var(--surface)] hover:bg-[var(--accent-soft)] border border-[var(--line)] text-[var(--ink)] rounded-lg cursor-pointer text-xs font-semibold"
            title="Download a JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-text)]" />
            <span>Export</span>
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-1.5 h-9 bg-[var(--surface)] hover:bg-[var(--accent-soft)] border border-[var(--line)] text-[var(--ink)] rounded-lg cursor-pointer text-xs font-semibold"
            title="Restore a JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent-text)]" />
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
          className="w-full h-8 text-[11px] font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
        >
          Clear all invoices
        </button>
      </div>

    </div>
  );
};
