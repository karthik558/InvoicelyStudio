/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Invoice, calculateInvoiceTotals, getCurrencyFormatter } from '../types';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  DollarSign, 
  PieChart 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  invoices: Invoice[];
  isOpen: boolean;
  onToggle: () => void;
  onFilterStatus?: (status: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  invoices,
  isOpen,
  onToggle,
  onFilterStatus
}) => {
  // Compute analytics taking advance payments into account
  const currencies = Array.from(new Set(invoices.map((inv) => inv.currency || 'USD'))) as string[];
  const primaryCurrency = currencies[0] || 'USD';
  const scopedInvoices = currencies.length > 1
    ? invoices.filter((inv) => (inv.currency || 'USD') === primaryCurrency)
    : invoices;
  const excludedCount = invoices.length - scopedInvoices.length;

  const getInvoiceTotal = (inv: Invoice) => calculateInvoiceTotals(inv).total;

  const getInvoiceCollected = (inv: Invoice) => {
    const total = getInvoiceTotal(inv);
    if (inv.status === 'paid') return total;
    const advance = Math.min(Math.max(0, inv.advanceAmount || 0), total);
    return advance;
  };

  const getInvoicePending = (inv: Invoice) => {
    const total = getInvoiceTotal(inv);
    const collected = getInvoiceCollected(inv);
    if (inv.status === 'paid' || inv.status === 'overdue') return 0;
    return Math.max(0, total - collected);
  };

  const getInvoiceOverdue = (inv: Invoice) => {
    if (inv.status !== 'overdue') return 0;
    const total = getInvoiceTotal(inv);
    const collected = getInvoiceCollected(inv);
    return Math.max(0, total - collected);
  };

  const totalInvoiced = scopedInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const totalCollected = scopedInvoices.reduce((sum, inv) => sum + getInvoiceCollected(inv), 0);
  const totalPending = scopedInvoices.reduce((sum, inv) => sum + getInvoicePending(inv), 0);
  const totalOverdue = scopedInvoices.reduce((sum, inv) => sum + getInvoiceOverdue(inv), 0);

  const paidInvoicesCount = scopedInvoices.filter(i => i.status === 'paid').length;
  const pendingInvoicesCount = scopedInvoices.filter(i => i.status === 'pending' || i.status === 'advance_paid').length;
  const overdueInvoicesCount = scopedInvoices.filter(i => i.status === 'overdue').length;

  const formatter = getCurrencyFormatter(primaryCurrency);

  if (!isOpen) return null;

  return (
    <div className="bg-[var(--chrome)] border-b border-[var(--line)] text-[var(--ink)] px-3 sm:px-6 py-3 transition-all animate-fadeIn no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="p-1.5 sm:p-2 bg-[var(--accent-soft)] rounded-xl border border-[var(--accent)]/20">
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-text)]" />
          </div>
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--ink)]">Financial Dashboard Summary</h3>
            <p className="text-[9px] sm:text-[10px] text-[var(--muted)]">
              {excludedCount > 0
                ? `${primaryCurrency} totals. ${excludedCount} invoice${excludedCount === 1 ? '' : 's'} in other currencies are left out so the figures are not mixed.`
                : `Live metrics across ${scopedInvoices.length} invoices`}
            </p>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-4xl">
          {/* Total Billed */}
          <div 
            onClick={() => onFilterStatus?.('all')}
            className="p-2 sm:p-2.5 bg-[var(--surface)] hover:bg-[var(--accent-soft)] border border-[var(--line)] rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider truncate">Total Billed</span>
              <TrendingUp className="w-3 h-3 text-[var(--gold)] group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-[var(--ink)] mt-1 truncate">
              {formatter.format(totalInvoiced)}
            </div>
            <span className="text-[8px] sm:text-[9px] text-slate-400 block mt-0.5">{scopedInvoices.length} invoices</span>
          </div>

          {/* Paid / Collected */}
          <div 
            onClick={() => onFilterStatus?.('paid')}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[10px] text-emerald-400">
              <span className="font-semibold uppercase tracking-wider">Collected</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-bold font-mono text-emerald-800 mt-1">
              {formatter.format(totalCollected)}
            </div>
            <span className="text-[9px] text-emerald-400/80 block mt-0.5">{paidInvoicesCount} fully paid</span>
          </div>

          {/* Pending */}
          <div 
            onClick={() => onFilterStatus?.('pending')}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[10px] text-amber-400">
              <span className="font-semibold uppercase tracking-wider">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-bold font-mono text-amber-800 mt-1">
              {formatter.format(totalPending)}
            </div>
            <span className="text-[9px] text-amber-400/80 block mt-0.5">{pendingInvoicesCount} pending</span>
          </div>

          {/* Overdue */}
          <div 
            onClick={() => onFilterStatus?.('overdue')}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[10px] text-rose-400">
              <span className="font-semibold uppercase tracking-wider">Overdue</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <div className="text-sm font-bold font-mono text-rose-800 mt-1">
              {formatter.format(totalOverdue)}
            </div>
            <span className="text-[9px] text-rose-400/80 block mt-0.5">{overdueInvoicesCount} overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
