/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Invoice, getCurrencyFormatter } from '../types';
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
  const getInvoiceTotal = (inv: Invoice) => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discount = inv.discountType === 'flat' ? inv.discountRate : subtotal * (inv.discountRate / 100);
    const gstEnabled = !!inv.gstEnabled;
    const tax = gstEnabled ? 0 : (subtotal - discount) * (inv.taxRate / 100);
    const gst = gstEnabled ? (subtotal - discount) * ((inv.gstRate || 0) / 100) : 0;
    return subtotal - discount + tax + gst + (inv.shippingFee || 0);
  };

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

  const totalInvoiced = invoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + getInvoiceCollected(inv), 0);
  const totalPending = invoices.reduce((sum, inv) => sum + getInvoicePending(inv), 0);
  const totalOverdue = invoices.reduce((sum, inv) => sum + getInvoiceOverdue(inv), 0);

  const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
  const pendingInvoicesCount = invoices.filter(i => i.status === 'pending' || i.status === 'advance_paid' || i.status === 'draft').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'overdue').length;

  const defaultCurrency = invoices[0]?.currency || 'USD';
  const formatter = getCurrencyFormatter(defaultCurrency);

  if (!isOpen) return null;

  return (
    <div className="bg-[#0A2323] border-b border-[#1A3F3F] text-white px-3 sm:px-6 py-2.5 transition-all animate-fadeIn no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="p-1.5 sm:p-2 bg-[#C69A5D]/10 rounded-xl border border-[#C69A5D]/20">
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C69A5D]" />
          </div>
          <div>
            <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">Financial Dashboard Summary</h3>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Live metrics across {invoices.length} invoices</p>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-4xl">
          {/* Total Billed */}
          <div 
            onClick={() => onFilterStatus?.('all')}
            className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider truncate">Total Billed</span>
              <TrendingUp className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-white mt-1 truncate">
              {formatter.format(totalInvoiced)}
            </div>
            <span className="text-[8px] sm:text-[9px] text-slate-400 block mt-0.5">{invoices.length} invoices</span>
          </div>

          {/* Paid / Collected */}
          <div 
            onClick={() => onFilterStatus?.('paid')}
            className="p-2.5 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/20 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[10px] text-emerald-400">
              <span className="font-semibold uppercase tracking-wider">Collected</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-bold font-mono text-emerald-300 mt-1">
              {formatter.format(totalCollected)}
            </div>
            <span className="text-[9px] text-emerald-400/80 block mt-0.5">{paidInvoicesCount} fully paid</span>
          </div>

          {/* Pending */}
          <div 
            onClick={() => onFilterStatus?.('pending')}
            className="p-2.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[10px] text-amber-400">
              <span className="font-semibold uppercase tracking-wider">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-1">
              {formatter.format(totalPending)}
            </div>
            <span className="text-[9px] text-amber-400/80 block mt-0.5">{pendingInvoicesCount} pending</span>
          </div>

          {/* Overdue */}
          <div 
            onClick={() => onFilterStatus?.('overdue')}
            className="p-2.5 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/20 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center text-[10px] text-rose-400">
              <span className="font-semibold uppercase tracking-wider">Overdue</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
            </div>
            <div className="text-sm font-bold font-mono text-rose-300 mt-1">
              {formatter.format(totalOverdue)}
            </div>
            <span className="text-[9px] text-rose-400/80 block mt-0.5">{overdueInvoicesCount} overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};
