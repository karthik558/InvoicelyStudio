/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Invoice } from '../types';

const getAlphaColor = (hex: string, alpha: number): string => {
  if (!hex || typeof hex !== 'string') return `rgba(15, 118, 110, ${alpha})`;
  let cleanHex = hex.trim().replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  if (cleanHex.length !== 6) {
    return `rgba(15, 118, 110, ${alpha})`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface InvoicePreviewProps {
  invoice: Invoice;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const {
    invoiceNumber,
    issueDate,
    dueDate,
    status,
    sender,
    receiver,
    items,
    taxRate,
    discountRate,
    shippingFee,
    notes,
    terms,
    theme,
  } = invoice;

  const [zoom, setZoom] = useState<number>(100); // default 100% to fit exactly
  const outerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(500); // stable default
  const [printAreaHeight, setPrintAreaHeight] = useState<number>(1122);

  useEffect(() => {
    if (!outerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(outerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!printAreaRef.current) return;
    // Set a small delay to ensure rendering of any changes is complete
    const updateHeight = () => {
      if (printAreaRef.current) {
        setPrintAreaHeight(printAreaRef.current.scrollHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(printAreaRef.current);
    return () => observer.disconnect();
  }, [invoice, items]);

  // Compute values
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + taxAmount + shippingFee;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Get active font class or style
  const getFontFamilyStyle = () => {
    if (theme.fontFamily === 'custom') {
      return { fontFamily: theme.customFontName || 'custom' };
    }
    switch (theme.fontFamily) {
      case 'Space Grotesk':
        return { fontFamily: '"Space Grotesk", sans-serif' };
      case 'Playfair Display':
        return { fontFamily: '"Playfair Display", serif' };
      case 'JetBrains Mono':
        return { fontFamily: '"JetBrains Mono", monospace' };
      case 'Inter':
      default:
        return { fontFamily: '"Inter", sans-serif' };
    }
  };

  // Get status color tag classes
  const getStatusClasses = () => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Inline custom style for custom base64 font if uploaded
  const customFontStyles = theme.fontFamily === 'custom' && theme.customFontUrl ? (
    <style dangerouslySetInnerHTML={{ __html: `
      @font-face {
        font-family: '${theme.customFontName || 'custom'}';
        src: url(${theme.customFontUrl}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `}} />
  ) : null;

  return (
    <div ref={outerRef} className="flex flex-col h-full bg-[#FAFAFA] border-l border-gray-200 text-gray-800 select-none w-full">
      {/* Zoom and Preview Head Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0D2C2C] text-white no-print shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#C69A5D]"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-white">Live Preview</span>
        </div>
        
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gray-200 font-medium">Zoom: {zoom}%</span>
          <input
            type="range"
            min="60"
            max="150"
            step="5"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C69A5D]"
          />
          <button
            onClick={() => setZoom(100)}
            className="px-2 py-1 rounded bg-[#164E4E] hover:bg-[#1C5E5E] text-[10px] text-white font-semibold transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sheet Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 bg-[#F5F5F5] w-full"
      >
        {customFontStyles}

        {/* Scaled viewport container */}
        {(() => {
          const targetWidth = 794; // 210mm in pixels at 96dpi
          const paddingOffset = containerWidth < 640 ? 32 : 48;
          const availableWidth = Math.max(containerWidth - paddingOffset, 200);
          const autoScale = availableWidth < targetWidth ? (availableWidth / targetWidth) : 1;
          const finalScale = autoScale * (zoom / 100);

          return (
            <div
              style={{
                width: `${targetWidth * finalScale}px`,
                height: `${printAreaHeight * finalScale}px`,
                position: 'relative',
                transition: 'width 0.15s ease-out, height 0.15s ease-out'
              }}
              className="no-print mx-auto"
            >
              <div
                ref={printAreaRef}
                id="invoice-print-area"
                style={{
                  ...getFontFamilyStyle(),
                  width: `${targetWidth}px`,
                  minHeight: '1122px', // A4 minimum height
                  transform: `scale(${finalScale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  '--primary-color': theme.primaryColor,
                  '--accent-color': theme.accentColor,
                } as React.CSSProperties}
                className={`
                  print-card bg-white text-slate-800 shadow-2xl rounded-lg p-10 flex flex-col justify-between transition-shadow duration-300
                  ${theme.templateId === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'}
                `}
              >
          {/* Template 1: Premium Rich Teal (Default) */}
          {theme.templateId === 'teal' && (
            <div className="w-full">
              {/* Teal Header Block */}
              <div 
                className="flex items-center justify-between p-8 -mx-10 -mt-10 mb-8"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Invoice</h1>
                  <p className="text-teal-100 text-sm mt-1">Invoice No: {invoiceNumber}</p>
                </div>
                <div>
                  {sender.logoUrl ? (
                    <img
                      src={sender.logoUrl}
                      alt="Company Logo"
                      className="max-h-16 max-w-40 object-contain bg-white/10 p-1.5 rounded"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-white text-2xl font-black bg-white/10 w-14 h-14 rounded flex items-center justify-center tracking-wider">
                      {(sender.name || 'INV').substring(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Meta Columns */}
              <div className="flex justify-between items-start mb-8 text-sm">
                <div>
                  <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-2">Invoice Data</h3>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-slate-400 font-medium">Issue Date:</span> <strong className="font-semibold text-slate-700">{issueDate}</strong></p>
                    <p><span className="text-slate-400 font-medium">Due Date:</span> <strong className="font-semibold text-slate-700">{dueDate}</strong></p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-slate-500 uppercase text-[10px] tracking-wider mb-2">Payment Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusClasses()}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Template 2: Classic Corporate */}
          {theme.templateId === 'classic' && (
            <div className="w-full">
              <div 
                className="flex justify-between items-start pb-6 mb-8 border-b-4"
                style={{ borderBottomColor: theme.primaryColor }}
              >
                <div>
                  {sender.logoUrl ? (
                    <img
                      src={sender.logoUrl}
                      alt="Company Logo"
                      className="max-h-16 max-w-40 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-slate-800" style={{ color: theme.primaryColor }}>
                      {sender.name}
                    </h2>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900" style={{ color: theme.primaryColor }}>
                    Invoice
                  </h1>
                  <p className="text-slate-500 text-sm font-semibold mt-1">#{invoiceNumber}</p>
                </div>
              </div>

              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-slate-400 font-medium">Invoice Number:</span>
                    <strong className="text-slate-800">{invoiceNumber}</strong>
                    <span className="text-slate-400 font-medium">Issue Date:</span>
                    <strong className="text-slate-800">{issueDate}</strong>
                    <span className="text-slate-400 font-medium">Due Date:</span>
                    <strong className="text-slate-800">{dueDate}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getStatusClasses()}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Template 3: Modern Minimal */}
          {theme.templateId === 'modern' && (
            <div className="w-full relative">
              {/* Modern Left Border Bar */}
              <div 
                className="absolute left-[-40px] top-[-40px] bottom-[-40px] w-2"
                style={{ backgroundColor: theme.primaryColor }}
              />
              
              <div className="flex justify-between items-start mb-10">
                <div>
                  {sender.logoUrl && (
                    <img
                      src={sender.logoUrl}
                      alt="Company Logo"
                      className="max-h-14 max-w-36 object-contain mb-3"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h2 className="text-lg font-bold text-slate-900">{sender.name}</h2>
                  <p className="text-slate-400 text-xs">{sender.email}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-4xl font-extralight tracking-widest text-slate-900 uppercase">
                    Invoice
                  </h1>
                  <p className="text-slate-800 font-mono text-sm mt-2 font-bold">#{invoiceNumber}</p>
                  <div className="mt-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusClasses()}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8 pb-6 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Invoice Number</span>
                  <strong className="text-slate-800 font-mono text-sm">{invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Date of Issue</span>
                  <strong className="text-slate-800 text-sm">{issueDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Payment Due</span>
                  <strong className="text-slate-800 text-sm" style={{ color: theme.primaryColor }}>{dueDate}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Template 4: Clean Simple */}
          {theme.templateId === 'simple' && (
            <div className="w-full">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{sender.name}</h2>
                  <p className="text-xs text-slate-500">Invoice No: {invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-black uppercase text-slate-800 tracking-tight">Invoice</h1>
                  <p className="text-xs text-slate-500">Date: {issueDate}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 text-xs">
                <p><strong>Invoice Date:</strong> {issueDate}</p>
                <p><strong>Due Date:</strong> {dueDate}</p>
                <p className="uppercase font-extrabold tracking-wider" style={{ color: theme.primaryColor }}>
                  Status: {status}
                </p>
              </div>
            </div>
          )}

          {/* Template 5: Premium Dark */}
          {theme.templateId === 'dark' && (
            <div className="w-full">
              <div className="flex items-center justify-between p-6 -mx-10 -mt-10 mb-8 border-b border-slate-800 bg-slate-900">
                <div>
                  <h1 className="text-2xl font-black tracking-wider text-white uppercase">Invoice</h1>
                  <p className="text-xs mt-1" style={{ color: theme.primaryColor }}>#{invoiceNumber}</p>
                </div>
                <div>
                  {sender.logoUrl ? (
                    <img
                      src={sender.logoUrl}
                      alt="Company Logo"
                      className="max-h-14 max-w-36 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-slate-100 text-xl font-bold bg-slate-800 px-3 py-1.5 rounded font-mono border border-slate-700">
                      {(sender.name || 'INV').substring(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mb-8 text-xs bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <div className="space-y-1">
                  <p className="text-slate-400">Invoice Details:</p>
                  <p><span className="text-slate-500 font-medium">Invoice No:</span> <strong className="text-slate-200 font-mono">{invoiceNumber}</strong></p>
                  <p><span className="text-slate-500 font-medium">Issue Date:</span> <strong className="text-slate-200">{issueDate}</strong></p>
                  <p><span className="text-slate-500 font-medium">Due Date:</span> <strong className="text-slate-200">{dueDate}</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusClasses()}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Template 6: Royal Indigo */}
          {theme.templateId === 'indigo' && (
            <div className="w-full">
              <div 
                className="flex items-center justify-between p-6 -mx-10 -mt-10 mb-8 border-b-4 text-white"
                style={{ backgroundColor: theme.primaryColor || '#312e81', borderBottomColor: theme.accentColor || '#fda4af' }}
              >
                <div>
                  <h1 className="text-2xl font-black tracking-wider uppercase">Invoice</h1>
                  <p className="text-xs mt-1" style={{ color: theme.accentColor || '#fda4af' }}>No: {invoiceNumber}</p>
                </div>
                <div>
                  {sender.logoUrl ? (
                    <img
                      src={sender.logoUrl}
                      alt="Company Logo"
                      className="max-h-14 max-w-36 object-contain bg-white/10 p-1 rounded"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-lg font-bold bg-white px-3 py-1.5 rounded font-mono" style={{ color: theme.primaryColor || '#312e81' }}>
                      {(sender.name || 'INV').substring(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mb-8 text-xs p-4 rounded-lg border"
                style={{ 
                  backgroundColor: getAlphaColor(theme.primaryColor || '#312e81', 0.06), 
                  borderColor: getAlphaColor(theme.primaryColor || '#312e81', 0.2) 
                }}
              >
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold uppercase tracking-wider text-[9px]" style={{ color: theme.primaryColor || '#312e81' }}>Invoice Details</p>
                  <p><span className="text-slate-400 font-medium">Invoice No:</span> <strong className="text-slate-800 font-mono">{invoiceNumber}</strong></p>
                  <p><span className="text-slate-400 font-medium">Issue Date:</span> <strong className="text-slate-800">{issueDate}</strong></p>
                  <p><span className="text-slate-400 font-medium">Due Date:</span> <strong className="text-slate-800" style={{ color: theme.primaryColor }}>{dueDate}</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusClasses()}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Template 7: Emerald Luxe */}
          {theme.templateId === 'emerald' && (
            <div className="w-full">
              <div 
                className="flex items-center justify-between p-6 -mx-10 -mt-10 mb-8 border-b-4 text-white"
                style={{ backgroundColor: theme.primaryColor || '#064e3b', borderBottomColor: theme.accentColor || '#fef08a' }}
              >
                <div>
                  <h1 className="text-2xl font-black tracking-wider uppercase">Invoice</h1>
                  <p className="text-xs mt-1" style={{ color: theme.accentColor || '#fef08a' }}>No: {invoiceNumber}</p>
                </div>
                <div>
                  {sender.logoUrl ? (
                    <img
                      src={sender.logoUrl}
                      alt="Company Logo"
                      className="max-h-14 max-w-36 object-contain bg-white/10 p-1 rounded"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-lg font-bold bg-white px-3 py-1.5 rounded font-mono" style={{ color: theme.primaryColor || '#064e3b' }}>
                      {(sender.name || 'INV').substring(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mb-8 text-xs p-4 rounded-lg border"
                style={{ 
                  backgroundColor: getAlphaColor(theme.primaryColor || '#064e3b', 0.06), 
                  borderColor: getAlphaColor(theme.primaryColor || '#064e3b', 0.2) 
                }}
              >
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold uppercase tracking-wider text-[9px]" style={{ color: theme.primaryColor || '#064e3b' }}>Invoice Details</p>
                  <p><span className="text-slate-400 font-medium">Invoice No:</span> <strong className="text-slate-800 font-mono">{invoiceNumber}</strong></p>
                  <p><span className="text-slate-400 font-medium">Issue Date:</span> <strong className="text-slate-800">{issueDate}</strong></p>
                  <p><span className="text-slate-400 font-medium">Due Date:</span> <strong className="text-slate-800" style={{ color: theme.primaryColor }}>{dueDate}</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block mb-1">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusClasses()}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Core Content Layout (Addresses) */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill From */}
            <div className="flex flex-col">
              <h4 
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b"
                style={{ 
                  color: theme.templateId === 'dark' ? theme.accentColor : theme.primaryColor,
                  borderColor: theme.templateId === 'dark' ? '#334155' : '#e2e8f0'
                }}
              >
                Bill From
              </h4>
              <strong className={`text-sm mb-1 ${theme.templateId === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {sender.name}
              </strong>
              <div className={`text-xs space-y-1 whitespace-pre-line leading-relaxed ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {sender.address}
                <div className="pt-1 space-y-0.5">
                  <p><span className="text-slate-400">Email:</span> {sender.email}</p>
                  {sender.phone && <p><span className="text-slate-400">Phone:</span> {sender.phone}</p>}
                  {sender.taxId && <p><span className="text-slate-400">Tax ID:</span> {sender.taxId}</p>}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="flex flex-col">
              <h4 
                className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b"
                style={{ 
                  color: theme.templateId === 'dark' ? theme.accentColor : theme.primaryColor,
                  borderColor: theme.templateId === 'dark' ? '#334155' : '#e2e8f0'
                }}
              >
                Bill To
              </h4>
              <strong className={`text-sm mb-1 ${theme.templateId === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {receiver.name}
              </strong>
              <div className={`text-xs space-y-1 whitespace-pre-line leading-relaxed ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                {receiver.address}
                <div className="pt-1 space-y-0.5">
                  <p><span className="text-slate-400">Email:</span> {receiver.email}</p>
                  {receiver.phone && <p><span className="text-slate-400">Phone:</span> {receiver.phone}</p>}
                  {receiver.taxId && <p><span className="text-slate-400">Tax ID:</span> {receiver.taxId}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="w-full text-xs">
              {/* Header */}
              <div 
                className="grid grid-cols-12 gap-2 py-2 px-3 border-b-2 font-bold uppercase tracking-wider"
                style={{ 
                  borderColor: theme.primaryColor,
                  backgroundColor: theme.templateId === 'teal' ? '#f0fdfa' : (theme.templateId === 'dark' ? '#1e293b' : '#f8fafc'),
                  color: theme.templateId === 'dark' ? '#f1f5f9' : theme.primaryColor
                }}
              >
                <div className="col-span-6">Description / Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>

              {/* Rows */}
              <div className={`divide-y border-b ${theme.templateId === 'dark' ? 'divide-slate-800 border-slate-800' : 'divide-slate-100 border-slate-100'}`}>
                {items.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className={`grid grid-cols-12 gap-2 py-3 px-3 items-center text-xs ${
                      theme.templateId === 'dark' ? 'border-slate-800 divide-slate-800' : ''
                    }`}
                  >
                    <div className={`col-span-6 leading-relaxed font-medium ${theme.templateId === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                      {item.description || <span className="text-slate-300 italic">No description</span>}
                    </div>
                    <div className={`col-span-2 text-center font-mono ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.quantity}
                    </div>
                    <div className={`col-span-2 text-right font-mono ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                      {formatCurrency(item.rate)}
                    </div>
                    <div className={`col-span-2 text-right font-mono font-bold ${theme.templateId === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {formatCurrency(item.quantity * item.rate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Layout: Notes & Totals */}
          <div className="grid grid-cols-12 gap-8 mb-8 items-start">
            {/* Notes Section */}
            <div className="col-span-7 space-y-4">
              {notes && (
                <div>
                  <h5 
                    className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: theme.templateId === 'dark' ? theme.accentColor : theme.primaryColor }}
                  >
                    Notes
                  </h5>
                  <p className={`text-[11px] leading-relaxed whitespace-pre-line ${theme.templateId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {notes}
                  </p>
                </div>
              )}

              {terms && (
                <div>
                  <h5 
                    className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: theme.templateId === 'dark' ? theme.accentColor : theme.primaryColor }}
                  >
                    Terms &amp; Conditions
                  </h5>
                  <p className={`text-[11px] leading-relaxed whitespace-pre-line ${theme.templateId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {terms}
                  </p>
                </div>
              )}
            </div>

            {/* Totals Section */}
            <div 
              className={`col-span-5 p-4 rounded-lg text-xs space-y-2.5 ${
                theme.templateId === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50'
              }`}
            >
              <div className={`flex justify-between ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                <span>Subtotal:</span>
                <span className={`font-mono font-semibold ${theme.templateId === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{formatCurrency(subtotal)}</span>
              </div>

              {discountRate > 0 && (
                <div className={`flex justify-between ${theme.templateId === 'dark' ? 'text-rose-400 font-medium' : 'text-rose-600 font-semibold'}`}>
                  <span>Discount ({discountRate}%):</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {taxRate > 0 && (
                <div className={`flex justify-between ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                  <span>Tax ({taxRate}%):</span>
                  <span className={`font-mono font-semibold ${theme.templateId === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{formatCurrency(taxAmount)}</span>
                </div>
              )}

              {shippingFee > 0 && (
                <div className={`flex justify-between ${theme.templateId === 'dark' ? 'text-slate-300' : 'text-slate-500'}`}>
                  <span>Shipping:</span>
                  <span className={`font-mono font-semibold ${theme.templateId === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{formatCurrency(shippingFee)}</span>
                </div>
              )}

              <div 
                className="flex justify-between items-center pt-2.5 border-t font-bold text-sm"
                style={{ borderColor: theme.templateId === 'dark' ? '#334155' : '#e2e8f0' }}
              >
                <span className={theme.templateId === 'dark' ? 'text-white' : 'text-slate-800'}>Total Due:</span>
                <span className="font-mono text-base" style={{ color: theme.templateId === 'dark' ? theme.accentColor : theme.primaryColor }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Wire & Signature Footer Section */}
          {(sender.bankName || sender.bankAccount || sender.paymentDetails) && (
            <div 
              className="pt-4 border-t text-[10px]"
              style={{ borderColor: theme.templateId === 'dark' ? '#334155' : '#e2e8f0' }}
            >
              <h5 
                className="text-[10px] font-bold uppercase tracking-wider mb-2"
                style={{ color: theme.templateId === 'dark' ? theme.accentColor : theme.primaryColor }}
              >
                Payment &amp; Bank Details
              </h5>
              
              {sender.bankName && (
                <div className={`grid grid-cols-3 gap-4 mb-2 ${theme.templateId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <div>
                    <span className="text-[9px] text-slate-400 block">Bank Name</span>
                    <strong className={`text-xs ${theme.templateId === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{sender.bankName}</strong>
                  </div>
                  {sender.bankAccount && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Account Number</span>
                      <strong className={`text-xs font-mono ${theme.templateId === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{sender.bankAccount}</strong>
                    </div>
                  )}
                  {sender.bankRouting && (
                    <div>
                      <span className="text-[9px] text-slate-400 block">Routing Number</span>
                      <strong className={`text-xs font-mono ${theme.templateId === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{sender.bankRouting}</strong>
                    </div>
                  )}
                </div>
              )}

              {sender.paymentDetails && (
                <p className={`leading-relaxed text-[10px] ${theme.templateId === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <strong className={theme.templateId === 'dark' ? 'text-slate-200' : 'text-slate-700'}>Instructions: </strong>
                  {sender.paymentDetails}
                </p>
              )}
            </div>
          )}

          {/* Low Opacity Platform Footer */}
          <div 
            className="mt-8 pt-3 border-t border-dashed flex justify-between items-center text-[9px] font-medium tracking-wide"
            style={{ 
              borderColor: theme.templateId === 'dark' ? '#1e293b' : '#f1f5f9',
              color: theme.templateId === 'dark' ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.45)'
            }}
          >
            <span>Invoice generated using <a href="https://invoicely.samsproject.in" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Invoicely Studio</a></span>
            <span>invoicely.samsproject.in</span>
          </div>
        </div>
      </div>
          );
        })()}
      </div>
    </div>
  );
};
