/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Invoice, LineItem, InvoiceStatus, InvoiceTemplateId, CURRENCIES, finiteNumber } from '../types';
import { sampleInvoice } from '../data/sampleInvoice';
import { CustomSelect } from './CustomSelect';

const DatePicker = React.lazy(() => import('./DatePicker').then(m => ({ default: m.DatePicker })));

const MAX_IMAGE_BYTES = 500 * 1024;

function keepNumberDraft(raw: string): number | string {
  if (raw === '' || raw === '-' || raw === '.' || raw === '-.' || raw.endsWith('.')) return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function showNumber(value: unknown): string | number {
  if (value === undefined || value === null) return '';
  return value as string | number;
}
import { 
  FileText, 
  Users, 
  Plus, 
  Trash2, 
  Palette, 
  CreditCard, 
  FileUp, 
  Info,
  Layers,
  Type,
  RefreshCw,
  Settings,
  Copy,
  QrCode,
  ChevronDown,
  PenTool,
  Download,
  Save
} from 'lucide-react';

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
  onLoadDemo: () => void;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onNew: () => void;
  onAlert?: (title: string, message: string) => void;
  onOpenPresets?: () => void;
}

type FormTab = 'details' | 'parties' | 'items' | 'payment' | 'design' | 'settings';

// Predefined premium color palettes
const COLOR_PALETTES = [
  { name: 'Studio Teal & Gold', primary: '#114048', accent: '#d8a748' },
  { name: 'Ink Navy & Terracotta', primary: '#1e3a8a', accent: '#c2410c' },
  { name: 'Sleek Obsidian & Emerald', primary: '#0f172a', accent: '#10b981' },
  { name: 'Classic Corporate Navy', primary: '#1e3a8a', accent: '#3b82f6' },
  { name: 'Royal Amethyst & Rose', primary: '#581c87', accent: '#ec4899' },
  { name: 'Minimal Charcoal & Amber', primary: '#1f2937', accent: '#f59e0b' },
  { name: 'Crimson Burgundy & Slate', primary: '#7f1d1d', accent: '#64748b' }
];

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChange,
  onLoadDemo,
  onSave,
  onDuplicate,
  onDelete,
  onNew,
  onAlert,
  onOpenPresets,
}) => {

  const duplicateItem = (itemToDuplicate: LineItem) => {
    const newItem: LineItem = {
      ...itemToDuplicate,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: itemToDuplicate.description ? `${itemToDuplicate.description} (Copy)` : 'Copy of item'
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
      updatedAt: Date.now()
    });
  };

  const activeCurrency = invoice.currency || 'USD';
  const currencySymbol = CURRENCIES.find(c => c.code === activeCurrency)?.symbol || '$';

  const [activeTab, setActiveTab] = useState<FormTab>('details');
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [qrFileName, setQrFileName] = useState<string>('');
  const [sigFileName, setSigFileName] = useState<string>('');
  const [fontFileName, setFontFileName] = useState<string>('');
  const [previousClients, setPreviousClients] = useState<Invoice['receiver'][]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Set initial lastSavedTime
  useEffect(() => {
    const d = new Date();
    setLastSavedTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, []);

  // Monitor invoice prop changes for interactive auto-save indicators
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
      const d = new Date();
      setLastSavedTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
    return () => clearTimeout(timer);
  }, [invoice]);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoice_studio_data_v1');
    if (savedInvoices) {
      try {
        const parsed: Invoice[] = JSON.parse(savedInvoices);
        if (Array.isArray(parsed)) {
          // Extract unique client details based on company/receiver name
          const clientsMap = new Map<string, Invoice['receiver']>();
          parsed.forEach((inv) => {
            if (inv.receiver && inv.receiver.name && inv.receiver.name.trim() !== '') {
              clientsMap.set(inv.receiver.name.trim().toLowerCase(), inv.receiver);
            }
          });
          setPreviousClients(Array.from(clientsMap.values()));
        }
      } catch (e) {}
    }
  }, [invoice]);

  const [globalSender, setGlobalSender] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    bankName: '',
    bankAccount: '',
    bankRouting: '',
    paymentDetails: '',
    notes: 'Thank you for your business!',
    terms: 'Payment is due within 14 days of issue.',
    logoUrl: ''
  });

  // Load from local storage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('invoicely_global_sender');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGlobalSender({
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          taxId: parsed.taxId || '',
          bankName: parsed.bankName || '',
          bankAccount: parsed.bankAccount || '',
          bankRouting: parsed.bankRouting || '',
          paymentDetails: parsed.paymentDetails || '',
          notes: parsed.notes || 'Thank you for your business!',
          terms: parsed.terms || 'Payment is due within 14 days of issue.',
          logoUrl: parsed.logoUrl || ''
        });
      } catch (e) {}
    }
  }, []);

  const handleSaveGlobalSettings = () => {
    localStorage.setItem('invoicely_global_sender', JSON.stringify(globalSender));
    triggerLocalAlert('Settings Saved', 'Default company settings saved! Future invoices created with "Create New" will automatically pre-populate with these details.');
  };

  const handleUseCurrentAsDefault = () => {
    const fromCurrent = {
      name: invoice.sender.name || '',
      email: invoice.sender.email || '',
      phone: invoice.sender.phone || '',
      address: invoice.sender.address || '',
      taxId: invoice.sender.taxId || '',
      bankName: invoice.sender.bankName || '',
      bankAccount: invoice.sender.bankAccount || '',
      bankRouting: invoice.sender.bankRouting || '',
      paymentDetails: invoice.sender.paymentDetails || '',
      notes: invoice.notes || 'Thank you for your business!',
      terms: invoice.terms || 'Payment is due within 14 days of issue.',
      logoUrl: invoice.sender.logoUrl || ''
    };
    setGlobalSender(fromCurrent);
    localStorage.setItem('invoicely_global_sender', JSON.stringify(fromCurrent));
    triggerLocalAlert('Settings Updated', 'Imported company details from the current active invoice and saved as your global default settings!');
  };

  const triggerLocalAlert = (title: string, message: string) => {
    if (onAlert) {
      onAlert(title, message);
    } else {
      alert(`${title}: ${message}`);
    }
  };

  const handleApplyGlobalSender = () => {
    const saved = localStorage.getItem('invoicely_global_sender');
    if (!saved) {
      triggerLocalAlert('No Defaults Found', 'You have not saved any default settings yet. Please save your default sender details first in the "Settings" tab.');
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      const updated = {
        ...invoice,
        sender: {
          ...invoice.sender,
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          taxId: parsed.taxId || '',
          bankName: parsed.bankName || '',
          bankAccount: parsed.bankAccount || '',
          bankRouting: parsed.bankRouting || '',
          paymentDetails: parsed.paymentDetails || '',
          logoUrl: parsed.logoUrl || ''
        },
        notes: parsed.notes || invoice.notes,
        terms: parsed.terms || invoice.terms,
        updatedAt: Date.now()
      };
      onChange(updated);
      triggerLocalAlert('Defaults Loaded', 'Successfully loaded default sender & bank settings to this active invoice!');
    } catch (e) {
      triggerLocalAlert('Error', 'Failed to load default settings.');
    }
  };

  const updateField = (section: 'sender' | 'receiver' | 'theme' | null, field: string | Record<string, any>, value?: any) => {
    const updated = { ...invoice, updatedAt: Date.now() };
    if (section === 'sender') {
      if (typeof field === 'string') {
        updated.sender = { ...updated.sender, [field]: value };
      } else {
        updated.sender = { ...updated.sender, ...field };
      }
    } else if (section === 'receiver') {
      if (typeof field === 'string') {
        updated.receiver = { ...updated.receiver, [field]: value };
      } else {
        updated.receiver = { ...updated.receiver, ...field };
      }
    } else if (section === 'theme') {
      if (typeof field === 'string') {
        updated.theme = { ...updated.theme, [field]: value };
      } else {
        updated.theme = { ...updated.theme, ...field };
      }
    } else {
      if (typeof field === 'string') {
        (updated as any)[field] = value;
        if (field === 'gstEnabled' && value === true) {
          updated.taxRate = 0;
          if (updated.gstRate === undefined || updated.gstRate === null || updated.gstRate === '') {
            updated.gstRate = 18;
          }
          if (!updated.gstType) {
            updated.gstType = 'igst';
          }
        } else if (field === 'taxRate' && Number(value) > 0) {
          updated.gstEnabled = false;
        }
      } else {
        Object.entries(field).forEach(([k, v]) => {
          (updated as any)[k] = v;
          if (k === 'gstEnabled' && v === true) {
            updated.taxRate = 0;
            if (updated.gstRate === undefined || updated.gstRate === null || updated.gstRate === '') {
              updated.gstRate = 18;
            }
            if (!updated.gstType) {
              updated.gstType = 'igst';
            }
          } else if (k === 'taxRate' && Number(v) > 0) {
            updated.gstEnabled = false;
          }
        });
      }
    }
    onChange(updated);
  };

  // Line Item actions
  const handleItemChange = (itemId: string, field: keyof LineItem, value: any) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === itemId) {
        const nextValue = field === 'quantity' || field === 'rate' ? keepNumberDraft(String(value)) : value;
        const updatedItem = { ...item, [field]: nextValue };
        if (field === 'quantity' || field === 'rate') {
          const qty = finiteNumber(field === 'quantity' ? nextValue : item.quantity);
          const rate = finiteNumber(field === 'rate' ? nextValue : item.rate);
          updatedItem.amount = qty * rate;
        }
        return updatedItem;
      }
      return item;
    });
    
    onChange({
      ...invoice,
      items: updatedItems,
      updatedAt: Date.now()
    });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
      updatedAt: Date.now()
    });
  };

  const removeItem = (itemId: string) => {
    if (invoice.items.length <= 1) {
      triggerLocalAlert('Item Limit', 'Your invoice must contain at least one line item.');
      return;
    }
    onChange({
      ...invoice,
      items: invoice.items.filter((item) => item.id !== itemId),
      updatedAt: Date.now()
    });
  };

  const rejectOversizedImage = (file: File, label: string) => {
    if (file.size <= MAX_IMAGE_BYTES) return false;
    triggerLocalAlert('File Too Large', `${label} must be 500KB or smaller.`);
    return true;
  };

  const handleGlobalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !rejectOversizedImage(file, 'The logo')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGlobalSender({ ...globalSender, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearGlobalLogo = () => {
    setGlobalSender({ ...globalSender, logoUrl: '' });
  };

  // Base64 Logo parser
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !rejectOversizedImage(file, 'The logo')) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('sender', 'logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFileName('');
    updateField('sender', 'logoUrl', undefined);
  };

  // Base64 QR code parser
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !rejectOversizedImage(file, 'The QR image')) {
      setQrFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('sender', 'paymentQrImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearQr = () => {
    setQrFileName('');
    updateField('sender', 'paymentQrImage', undefined);
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !rejectOversizedImage(file, 'The signature image')) {
      setSigFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField(null, {
          signatureImage: reader.result as string,
          signatureType: 'image'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSigImage = () => {
    setSigFileName('');
    updateField(null, 'signatureImage', undefined);
  };

  // Base64 Font parser (.ttf / .otf file)
  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isTTFOrOTF = file.name.endsWith('.ttf') || file.name.endsWith('.otf');
      if (!isTTFOrOTF) {
        triggerLocalAlert('Invalid Font Type', 'Please upload a standard true-type font file (.ttf) or open-type font file (.otf).');
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        triggerLocalAlert('File Too Large', 'Custom fonts must be 2MB or smaller.');
        e.target.value = '';
        return;
      }
      setFontFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const fontName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_"); // sanitize name
        
        // Update theme settings to register and use custom font
        const updatedInvoice = {
          ...invoice,
          theme: {
            ...invoice.theme,
            fontFamily: 'custom',
            customFontName: fontName,
            customFontUrl: base64Data
          },
          updatedAt: Date.now()
        };
        onChange(updatedInvoice);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomFont = () => {
    setFontFileName('');
    const updatedInvoice = {
      ...invoice,
      theme: {
        ...invoice.theme,
        fontFamily: 'Inter',
        customFontName: undefined,
        customFontUrl: undefined
      },
      updatedAt: Date.now()
    };
    onChange(updatedInvoice);
  };

  const applyPalette = (primary: string, accent: string) => {
    onChange({
      ...invoice,
      theme: {
        ...invoice.theme,
        primaryColor: primary,
        accentColor: accent
      },
      updatedAt: Date.now()
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] lg:border-r border-[var(--line)]">
      
      {/* Action Toolbar Header */}
      <div className="px-4 sm:px-5 py-3 bg-gray-50/50 bg-[var(--surface-muted)] border-b border-[var(--line)] flex flex-wrap gap-2.5 items-center justify-end">
        <div className="flex gap-2 items-center">
          <button 
            onClick={onDuplicate}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs rounded-lg border border-[var(--line)] transition-all font-semibold cursor-pointer shrink-0"
            title="Duplicate Invoice"
          >
            <Copy className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span>Duplicate</span>
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 text-gray-400 dark:text-gray-500 hover:text-rose-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer shrink-0"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Navigation Tabs (Clean Modern Flat Capsule Chips) */}
      <div className="flex border-b border-[var(--line)] bg-gray-50 bg-[var(--surface-muted)] px-3 sm:px-4 py-2.5 overflow-x-auto no-scrollbar items-center shrink-0 w-full select-none transition-colors">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar flex-nowrap w-full sm:w-auto">
          {(['details', 'parties', 'items', 'payment', 'design', 'settings'] as FormTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            const icons = {
              details: <FileText className="w-3.5 h-3.5 shrink-0" />,
              parties: <Users className="w-3.5 h-3.5 shrink-0" />,
              items: <Plus className="w-3.5 h-3.5 shrink-0" />,
              payment: <CreditCard className="w-3.5 h-3.5 shrink-0" />,
              design: <Palette className="w-3.5 h-3.5 shrink-0" />,
              settings: <Settings className="w-3.5 h-3.5 shrink-0" />
            };

            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0;
                }}
                className={`
                  flex items-center space-x-2 h-9 px-3 text-xs font-semibold tracking-wide transition-colors duration-150 cursor-pointer whitespace-nowrap rounded-lg outline-none select-none shrink-0 border
                  ${isActive 
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--on-accent)]' 
                    : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)] hover:bg-[var(--accent-soft)]'
                  }
                `}
              >
                <span className={`transition-colors duration-150 ${isActive ? 'text-[var(--on-accent)]' : 'text-[var(--muted)]'}`}>
                  {icons[tab]}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Fields Area (Scrollable) */}
      <div ref={editorScrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
        
        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Invoice Meta Credentials</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Invoice Number</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField(null, 'invoiceNumber', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. INV-2026-001"
                  />
                </div>

                <div className="space-y-1.5">
                  <CustomSelect
                    label="Status"
                    value={invoice.status}
                    onChange={(val) => updateField(null, 'status', val as InvoiceStatus)}
                    options={[
                      { value: 'pending', label: 'Pending', subLabel: 'Awaiting payment from client' },
                      { value: 'advance_paid', label: 'Advance Paid', subLabel: 'Client has paid an advance amount' },
                      { value: 'paid', label: 'Paid', subLabel: 'Invoice settled successfully' },
                      { value: 'overdue', label: 'Overdue', subLabel: 'Payment has passed due date' }
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Suspense fallback={<div className="h-14 bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />}>
                  <DatePicker
                    label="Issue Date"
                    value={invoice.issueDate}
                    onChange={(val) => updateField(null, 'issueDate', val)}
                    align="left"
                  />
                </Suspense>

                <Suspense fallback={<div className="h-14 bg-slate-50 border border-slate-200/50 rounded-lg animate-pulse" />}>
                  <DatePicker
                    label="Due Date"
                    value={invoice.dueDate}
                    onChange={(val) => updateField(null, 'dueDate', val)}
                    align="right"
                  />
                </Suspense>
              </div>

              {/* Global Currency Selection */}
              <div className="border-t border-[var(--line)] pt-4">
                <div className="space-y-1.5">
                  <CustomSelect
                    label="Global Currency"
                    value={invoice.currency || 'USD'}
                    onChange={(val) => updateField(null, 'currency', val)}
                    options={CURRENCIES.map((c) => ({
                      value: c.code,
                      label: `${c.code} (${c.symbol})`,
                      subLabel: c.name
                    }))}
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    Select the billing currency for this invoice. The PDF document and preview layouts will automatically adapt formatting and localization rules.
                  </p>
                </div>
              </div>
            </div>

            {/* Logo upload widget */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2">
                  <FileUp className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>Company Branding Logo</span>
                </h3>
                {invoice.sender.logoUrl && (
                  <button 
                    onClick={clearLogo} 
                    className="text-[10px] text-rose-600 hover:text-rose-500 transition-colors font-medium cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
              </div>

              {invoice.sender.logoUrl ? (
                <div className="flex items-center space-x-4 bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)]">
                  <img 
                    src={invoice.sender.logoUrl} 
                    alt="Uploaded logo" 
                    className="w-16 h-16 object-contain bg-gray-50 bg-[var(--surface-muted)] rounded p-1 border border-[var(--line)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs">
                    <p className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-50">{logoFileName || 'logo.png'}</p>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[var(--line)] hover:border-[var(--accent)] rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all bg-[var(--surface)] group relative overflow-hidden">
                  <FileUp className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-[var(--accent-text)] mb-2 transition-colors" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Click or Drag to Upload Logo</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Supports PNG, JPG, SVG (Max 500KB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PARTIES */}
        {activeTab === 'parties' && (
          <div className="space-y-4 animate-fadeIn">
            {/* SENDER INFO */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3">
              <div className="flex justify-between items-center border-b border-[var(--line)] pb-2.5 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                  <span>Bill From (Sender Details)</span>
                </h3>
                {localStorage.getItem('invoicely_global_sender') && (
                  <button
                    type="button"
                    onClick={handleApplyGlobalSender}
                    className="flex items-center space-x-1.5 px-2.5 py-1 bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white text-[11px] rounded-lg border border-[var(--line)] transition-all font-semibold cursor-pointer shadow-2xs shrink-0"
                    title="Load pre-saved default company sender and bank parameters"
                  >
                    <Download className="w-3 h-3 text-[var(--accent-text)]" />
                    <span>Load Default Settings</span>
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Company / Sender Name</label>
                  <input
                    type="text"
                    value={invoice.sender.name}
                    onChange={(e) => updateField('sender', 'name', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. Aesthetic Studio Inc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Email</label>
                    <input
                      type="email"
                      value={invoice.sender.email}
                      onChange={(e) => updateField('sender', 'email', e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                      placeholder="hello@aesthetic.studio"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Phone</label>
                    <input
                      type="text"
                      value={invoice.sender.phone}
                      onChange={(e) => updateField('sender', 'phone', e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Street Address</label>
                  <textarea
                    value={invoice.sender.address}
                    onChange={(e) => updateField('sender', 'address', e.target.value)}
                    rows={2.5}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors resize-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="123 Studio Blvd, Suite 100&#10;San Francisco, CA 94107"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Tax / VAT Identifier</label>
                  <input
                    type="text"
                    value={invoice.sender.taxId}
                    onChange={(e) => updateField('sender', 'taxId', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Tax Registration ID"
                  />
                </div>
              </div>
            </div>

            {/* RECEIVER INFO */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 border-b border-[var(--line)] pb-2.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                <span>Bill To (Client / Receiver Details)</span>
              </h3>

               {previousClients.length > 0 && (
                <div className="mb-4 bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)] space-y-1.5">
                  <CustomSelect
                    label="Select Stored Client"
                    value=""
                    onChange={(selectedClientName) => {
                      const found = previousClients.find(c => c.name === selectedClientName);
                      if (found) {
                        const updated = {
                          ...invoice,
                          receiver: { ...found },
                          updatedAt: Date.now()
                        };
                        onChange(updated);
                        triggerLocalAlert('Client Loaded', `Loaded billing details for ${found.name}!`);
                      }
                    }}
                    options={[
                      { value: '', label: '-- Choose a previously billed client --' },
                      ...previousClients.map((client) => ({
                        value: client.name,
                        label: client.name,
                        subLabel: client.email || 'No email'
                      }))
                    ]}
                  />
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Client Company / Name</label>
                  <input
                    type="text"
                    value={invoice.receiver.name}
                    onChange={(e) => updateField('receiver', 'name', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Client Company Name LLC"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Client Email</label>
                    <input
                      type="email"
                      value={invoice.receiver.email}
                      onChange={(e) => updateField('receiver', 'email', e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                      placeholder="accounts@client.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Client Phone</label>
                    <input
                      type="text"
                      value={invoice.receiver.phone}
                      onChange={(e) => updateField('receiver', 'phone', e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Client Address</label>
                  <textarea
                    value={invoice.receiver.address}
                    onChange={(e) => updateField('receiver', 'address', e.target.value)}
                    rows={2.5}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors resize-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="987 Corporate Way&#10;Austin, TX 78701"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Client Tax ID</label>
                  <input
                    type="text"
                    value={invoice.receiver.taxId}
                    onChange={(e) => updateField('receiver', 'taxId', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Tax Registration ID"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LINE ITEMS */}
        {activeTab === 'items' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[var(--line)] pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white">
                Line Items ({invoice.items.length})
              </h3>
              <div className="flex items-center space-x-2">
                {onOpenPresets && (
                  <button
                    type="button"
                    onClick={onOpenPresets}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent-text)] hover:text-[var(--on-accent)] text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-[var(--accent)]/30"
                  >
                    <Layers className="w-3 h-3 shrink-0" />
                    <span>From Catalog</span>
                  </button>
                )}
                <button
                  onClick={addItem}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* List of Line Items */}
            <div className="space-y-3.5">
              {invoice.items.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className="bg-gray-50/50 bg-[var(--surface-muted)] p-4 rounded-xl border border-gray-200/80 border-[var(--line)] relative space-y-3 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Item #{index + 1}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => duplicateItem(item)}
                        className="text-gray-400 dark:text-gray-500 hover:text-[var(--accent-text)] transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 cursor-pointer"
                        title="Duplicate Line Item"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 dark:text-gray-500 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Line Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Description / Item details</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors resize-none"
                      placeholder="Service description, details, milestones..."
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={showNumber(item.quantity)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors font-mono"
                      />
                    </div>
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Rate ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={showNumber(item.rate)}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors font-mono"
                      />
                    </div>
                    <div className="col-span-4 space-y-1.5 text-right">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Total</span>
                      <div className="py-1 text-xs font-bold text-gray-900 dark:text-gray-200 font-mono pr-1">
                        {currencySymbol}{(finiteNumber(item.quantity) * finiteNumber(item.rate)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL OVERRIDES */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3.5 mt-2">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white">
                  Financial Additions / Reductions
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!!invoice.gstEnabled}
                    value={invoice.gstEnabled ? 0 : showNumber(invoice.taxRate)}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'taxRate', keepNumberDraft(e.target.value))}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)] transition-colors ${
                      invoice.gstEnabled 
                        ? 'bg-gray-100/80 border-[var(--line)] text-gray-400 dark:text-gray-500 cursor-not-allowed select-none' 
                        : 'bg-[var(--surface)] border-[var(--line)] focus:border-[var(--accent)]'
                    }`}
                    title={invoice.gstEnabled ? "Disable GST Addon first to use standard Tax Rate" : ""}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">
                      Discount {invoice.discountType === 'flat' ? `(${currencySymbol})` : '(%)'}
                    </label>
                    <div className="flex bg-gray-100 rounded-md p-0.5 border border-gray-200/50">
                      <button
                        type="button"
                        onClick={() => updateField(null, 'discountType', 'percentage')}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-semibold transition-colors ${
                          invoice.discountType !== 'flat'
                            ? 'bg-[var(--surface)] text-gray-800 dark:text-gray-200 shadow-xs'
                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField(null, 'discountType', 'flat')}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-semibold transition-colors ${
                          invoice.discountType === 'flat'
                            ? 'bg-[var(--surface)] text-gray-800 dark:text-gray-200 shadow-xs'
                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Val
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={invoice.discountType === 'flat' ? undefined : 100}
                    step="0.01"
                    value={showNumber(invoice.discountRate)}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'discountRate', keepNumberDraft(e.target.value))}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Shipping ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={showNumber(invoice.shippingFee)}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'shippingFee', keepNumberDraft(e.target.value))}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Advance ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={showNumber(invoice.advanceAmount)}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'advanceAmount', keepNumberDraft(e.target.value))}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* GST ADDON SECTION */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3.5 mt-4 select-none">
              <div 
                onClick={() => updateField(null, 'gstEnabled', !invoice.gstEnabled)}
                className="flex items-center justify-between border-b border-[var(--line)] pb-2 cursor-pointer group select-none"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white group-hover:text-[var(--accent-text)] dark:group-hover:text-[var(--accent-text)] transition-colors">
                    GST & Tax Category Addon
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-semibold transition-colors ${invoice.gstEnabled ? 'text-[var(--ink)] text-[var(--accent-text)]' : 'text-gray-400 dark:text-gray-500'}`}>
                    {invoice.gstEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={invoice.gstEnabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField(null, 'gstEnabled', !invoice.gstEnabled);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                      invoice.gstEnabled ? 'bg-[var(--accent)]' : 'bg-gray-300 bg-[var(--surface-muted)] hover:bg-gray-400 dark:hover:bg-[#255757]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        invoice.gstEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {invoice.gstEnabled && (
                <div className="grid grid-cols-2 gap-4 text-xs animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">GST / Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 18"
                      value={showNumber(invoice.gstRate ?? 18)}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateField(null, 'gstRate', keepNumberDraft(e.target.value))}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <CustomSelect
                      label="Tax Scheme / Split-up"
                      value={invoice.gstType || 'igst'}
                      openDirection="top"
                      onChange={(val) => {
                        updateField(null, {
                          gstType: val,
                          gstSplit: val === 'cgst_sgst' || val === 'cgst_utgst'
                        });
                      }}
                      options={[
                        { value: 'igst', label: 'IGST (Integrated GST)', subLabel: 'Billed for interstate transactions' },
                        { value: 'cgst_sgst', label: 'CGST + SGST (Central & State GST)', subLabel: 'Billed for intrastate transactions' },
                        { value: 'cgst_utgst', label: 'CGST + UTGST (Central & UT GST)', subLabel: 'Billed for Union Territories' },
                        { value: 'vat', label: 'VAT (Value Added Tax)', subLabel: 'Standard Value Added Tax' },
                        { value: 'cess', label: 'CESS (Cess Tax Additional)', subLabel: 'Additional tax/levy' }
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT & NOTES */}
        {activeTab === 'payment' && (
          <div className="space-y-4 animate-fadeIn">
            {/* WIRE TRANSFER INFO */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 border-b border-[var(--line)] pb-2.5">
                <CreditCard className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Bank Payment Details</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Bank Name</label>
                  <input
                    type="text"
                    value={invoice.sender.bankName || ''}
                    onChange={(e) => updateField('sender', 'bankName', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. Sovereign Mutual Bank"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Account Number</label>
                    <input
                      type="text"
                      value={invoice.sender.bankAccount || ''}
                      onChange={(e) => updateField('sender', 'bankAccount', e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors font-mono focus:ring-1 focus:ring-[var(--accent)]"
                      placeholder="e.g. 1029-3847-55"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Routing Number</label>
                    <input
                      type="text"
                      value={invoice.sender.bankRouting || ''}
                      onChange={(e) => updateField('sender', 'bankRouting', e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors font-mono focus:ring-1 focus:ring-[var(--accent)]"
                      placeholder="e.g. 122105155"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Custom Payment Instructions</label>
                  <textarea
                    value={invoice.sender.paymentDetails || ''}
                    onChange={(e) => updateField('sender', 'paymentDetails', e.target.value)}
                    rows={2.5}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors resize-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. Please send wire and email transfer receipt within 5 business days..."
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT QR CODE CONFIGURATION */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 border-b border-[var(--line)] pb-2.5">
                <QrCode className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Payment QR Code Option</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">QR Code Link / UPI String</label>
                  <input
                    type="text"
                    value={invoice.sender.paymentQrLink || ''}
                    onChange={(e) => updateField('sender', 'paymentQrLink', e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="e.g. upi://pay?pa=billing@company&pn=Acme or paypal.me/acme/150 or Stripe link"
                  />
                </div>

                <div className="border-t border-[var(--line)] pt-3">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block mb-2">Or Upload Custom QR Code Image</label>
                  
                  {invoice.sender.paymentQrImage ? (
                    <div className="flex items-center space-x-3 bg-[var(--surface)] p-3 border border-[var(--line)] rounded-xl">
                      <img 
                        src={invoice.sender.paymentQrImage} 
                        alt="Custom QR Code" 
                        className="w-16 h-16 object-contain rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate">{qrFileName || 'custom_qr_code.png'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearQr}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center justify-center space-x-2 bg-[var(--surface)] hover:bg-[var(--surface-muted)] border border-[var(--line)] hover:border-[var(--accent)] text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-all duration-200">
                        <FileUp className="w-4 h-4 text-[var(--accent-text)]" />
                        <span>Upload QR Code Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">Supports PNG, JPG, or SVG</span>
                    </div>
                  )}
                </div>

                {/* Real-time QR Code Preview within the editor */}
                {(invoice.sender.paymentQrLink || invoice.sender.paymentQrImage) && (
                  <div className="flex flex-col items-center justify-center p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)] mt-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--ink)] text-[var(--accent-text)] mb-2">Scan Preview</span>
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-xs">
                      <img
                        src={invoice.sender.paymentQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(invoice.sender.paymentQrLink || '')}`}
                        alt="Invoice Payment QR"
                        className="w-24 h-24 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 dark:text-slate-400 mt-2 font-mono text-center max-w-xs truncate">
                      {invoice.sender.paymentQrImage ? 'Using Uploaded QR Code' : `Generating: ${invoice.sender.paymentQrLink}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* NOTES & TERMS */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 border-b border-[var(--line)] pb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                <span>Notes & Terms & Signature</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Invoice Notes</label>
                  <textarea
                    rows={2.5}
                    value={invoice.notes}
                    onChange={(e) => updateField(null, 'notes', e.target.value)}
                    placeholder="e.g. Thank you for your business! Please remit payment via wire transfer."
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Terms & Conditions</label>
                  <textarea
                    rows={2.5}
                    value={invoice.terms}
                    onChange={(e) => updateField(null, 'terms', e.target.value)}
                    placeholder="e.g. Payment due within 14 days. Late fees apply after 30 days."
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                {/* SIGNATURE SECTION */}
                <div className="pt-2 border-t border-[var(--line)] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Authorized Signature</label>
                    <div className="flex bg-gray-100 bg-[var(--surface-muted)] p-0.5 rounded-lg border border-gray-200/60 border-[var(--line)]">
                      <button
                        type="button"
                        onClick={() => updateField(null, 'signatureType', 'text')}
                        className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-colors ${
                          (invoice.signatureType || 'text') === 'text'
                            ? 'bg-[var(--surface)] text-[var(--ink)] dark:text-white shadow-xs'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                        }`}
                      >
                        Typed Text
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField(null, 'signatureType', 'image')}
                        className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-colors ${
                          invoice.signatureType === 'image'
                            ? 'bg-[var(--surface)] text-[var(--ink)] dark:text-white shadow-xs'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                        }`}
                      >
                        Image Upload
                      </button>
                    </div>
                  </div>

                  {(invoice.signatureType || 'text') === 'text' && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Signature Text / Name</label>
                      <input
                        type="text"
                        value={invoice.signatureText || ''}
                        onChange={(e) => updateField(null, 'signatureText', e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none transition-colors font-serif italic focus:ring-1 focus:ring-[var(--accent)]"
                      />
                    </div>
                  )}

                  {invoice.signatureType === 'image' && (
                    <div className="space-y-3 animate-fadeIn">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Signature Image</label>
                      {invoice.signatureImage ? (
                        <div className="flex items-center space-x-3 p-2 border border-[var(--line)] rounded-lg bg-white/50">
                          <img 
                            src={invoice.signatureImage} 
                            alt="Signature Preview" 
                            className="h-10 w-auto object-contain max-w-30 bg-[var(--surface)] border border-[var(--line)] rounded p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate">{sigFileName || 'signature_image.png'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={clearSigImage}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center justify-center space-x-2 bg-[var(--surface)] hover:bg-[var(--surface-muted)] border border-[var(--line)] hover:border-[var(--accent)] text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-all duration-200">
                          <FileUp className="w-4 h-4 text-[var(--accent-text)]" />
                          <span>Upload Signature Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSigUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        {/* TAB 5: DESIGN & STYLE */}
        {activeTab === 'design' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* TEMPLATES SELECTOR */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Invoice Structural Templates</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'teal', label: 'Banded Header (Default)', desc: 'Full-width color band and mark' },
                  { id: 'classic', label: 'Classic Corporate', desc: 'Symmetrical traditional style' },
                  { id: 'modern', label: 'Modern Minimal', desc: 'Contemporary side-accent bar' },
                  { id: 'simple', label: 'Clean Simple', desc: 'Direct, clear, ink-friendly' },
                  { id: 'dark', label: 'Premium Dark', desc: 'Sleek contrast charcoal theme' },
                  { id: 'indigo', label: 'Royal Indigo', desc: 'Deep indigo royal styling' },
                  { id: 'emerald', label: 'Emerald Luxe', desc: 'Executive rich forest green theme' }
                ].map((item) => {
                  const isSelected = invoice.theme.templateId === item.id;
                  const TEMPLATE_DEFAULTS: Record<string, { primary: string; accent: string }> = {
                    teal: { primary: '#114048', accent: '#d8a748' },
                    classic: { primary: '#1e3a8a', accent: '#3b82f6' },
                    modern: { primary: '#1f2937', accent: '#f59e0b' },
                    simple: { primary: '#0f172a', accent: '#10b981' },
                    dark: { primary: '#0f172a', accent: '#38bdf8' },
                    indigo: { primary: '#312e81', accent: '#f43f5e' },
                    emerald: { primary: '#064e3b', accent: '#fbbf24' }
                  };
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        const defaults = TEMPLATE_DEFAULTS[item.id] || { primary: '#114048', accent: '#d8a748' };
                        onChange({
                          ...invoice,
                          theme: {
                            ...invoice.theme,
                            templateId: item.id as InvoiceTemplateId,
                            primaryColor: defaults.primary,
                            accentColor: defaults.accent
                          },
                          updatedAt: Date.now()
                        });
                      }}
                      className={`
                        p-2.5 rounded-lg text-left border cursor-pointer transition-all duration-150
                        ${isSelected 
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] dark:border-[var(--accent)] dark:bg-[var(--accent-soft)] text-[var(--ink)] text-[var(--accent-text)] shadow-sm' 
                          : 'border-[var(--line)] bg-[var(--surface)] text-gray-500 hover:border-gray-300 hover:border-[var(--accent)] hover:text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <strong className="block text-xs">{item.label}</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 block">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PALETTE PRESETS & COLOR PICKER */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2">
                <Palette className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Theme Brand Customization</span>
              </h3>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Aesthetic Color Presets</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {COLOR_PALETTES.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPalette(p.primary, p.accent)}
                      className="p-1.5 rounded-lg bg-[var(--surface)] hover:bg-gray-100 hover:bg-[var(--surface-muted)] border border-[var(--line)] flex items-center space-x-2 text-left cursor-pointer transition-colors shadow-sm"
                    >
                      <div className="flex space-x-0.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.primary }} />
                        <div className="w-3.5 h-3.5 rounded-full -ml-1.5 border border-white" style={{ backgroundColor: p.accent }} />
                      </div>
                      <span className="text-[10px] text-gray-700 dark:text-gray-200 truncate font-semibold">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Colors Picker */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Primary Header</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={invoice.theme.primaryColor}
                      onChange={(e) => updateField('theme', 'primaryColor', e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[var(--line)] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={invoice.theme.primaryColor}
                      onChange={(e) => updateField('theme', 'primaryColor', e.target.value)}
                      className="flex-1 bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={invoice.theme.accentColor}
                      onChange={(e) => updateField('theme', 'accentColor', e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[var(--line)] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={invoice.theme.accentColor}
                      onChange={(e) => updateField('theme', 'accentColor', e.target.value)}
                      className="flex-1 bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-2 py-1 text-xs text-gray-800 dark:text-gray-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FONTS SELECTION */}
            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2">
                <Type className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Typography Configuration</span>
              </h3>

              {/* Built-in font selection */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">Select Font Family</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'Inter', label: 'Inter (Sans-Serif)', preview: 'Abc' },
                    { id: 'Space Grotesk', label: 'Space Grotesk (Tech)', preview: 'Abc' },
                    { id: 'Playfair Display', label: 'Playfair Display (Serif)', preview: 'Abc' },
                    { id: 'JetBrains Mono', label: 'JetBrains Mono (Mono)', preview: 'Abc' }
                  ].map((f) => {
                    const isSelected = invoice.theme.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updateField('theme', 'fontFamily', f.id)}
                        className={`
                          p-2 rounded-lg border cursor-pointer text-left transition-all flex items-center justify-between
                          ${isSelected 
                            ? 'border-[var(--accent)] bg-[var(--accent-soft)] dark:border-[var(--accent)] dark:bg-[var(--accent-soft)] text-[var(--ink)] text-[var(--accent-text)]' 
                            : 'border-[var(--line)] bg-[var(--surface)] text-gray-500 hover:border-gray-300 hover:border-[var(--accent)] hover:text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <span className="truncate">{f.label}</span>
                        <span className="text-[10px] font-bold opacity-60 ml-2">{f.preview}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom font upload widget */}
              <div className="space-y-2 border-t border-[var(--line)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider block">Upload Custom Brand Font</span>
                  {invoice.theme.fontFamily === 'custom' && invoice.theme.customFontUrl && (
                    <button 
                      onClick={removeCustomFont} 
                      className="text-[9px] text-rose-600 hover:text-rose-500 transition-colors font-semibold cursor-pointer"
                    >
                      Use Standard
                    </button>
                  )}
                </div>

                {invoice.theme.fontFamily === 'custom' && invoice.theme.customFontUrl ? (
                  <div className="flex items-center space-x-3 bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--line)] text-xs">
                    <Type className="w-5 h-5 text-[var(--ink)] dark:text-white" />
                    <div className="flex-1 truncate">
                      <p className="text-gray-700 dark:text-gray-200 font-medium truncate">{fontFileName || 'BrandCustomFont.ttf'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[var(--line)] hover:border-[var(--accent)] rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all bg-[var(--surface)] relative group overflow-hidden">
                    <Type className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-[var(--accent-text)] mb-1.5 transition-colors" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Click to Load custom TTF / OTF font</p>
                    <input
                      type="file"
                      accept=".ttf,.otf"
                      onChange={handleFontUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-500/30 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-200 space-y-1.5 shadow-sm">
              <p className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                <Info className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Default Global Details</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                Save your primary company information here. Whenever you click <strong>Create New</strong>, these default details will auto-populate as your sender parameters automatically.
              </p>
            </div>

            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 pb-1.5 border-b border-[var(--line)] w-full mb-2">
                  <FileUp className="w-4 h-4 text-[var(--accent-text)]" />
                  <span>Default Company Logo</span>
                </h3>
                {globalSender.logoUrl && (
                  <button 
                    onClick={clearGlobalLogo} 
                    className="text-[10px] text-rose-600 hover:text-rose-500 transition-colors font-medium cursor-pointer shrink-0"
                  >
                    Remove Logo
                  </button>
                )}
              </div>

              {globalSender.logoUrl ? (
                <div className="flex items-center space-x-4 bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)]">
                  <img 
                    src={globalSender.logoUrl} 
                    alt="Uploaded default logo" 
                    className="w-16 h-16 object-contain bg-gray-50 bg-[var(--surface-muted)] rounded p-1 border border-[var(--line)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs">
                    <p className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-50">Default Brand Logo</p>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">Stored globally</p>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[var(--line)] hover:border-[var(--accent)] rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all bg-[var(--surface)] group relative overflow-hidden">
                  <FileUp className="w-7 h-7 text-gray-400 dark:text-gray-500 group-hover:text-[var(--accent-text)] mb-2 transition-colors" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Click or Drag to Upload Default Logo</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Supports PNG, JPG, SVG</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGlobalLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 pb-1.5 border-b border-[var(--line)]">
                <Users className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Default Company Details</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Sender Name</label>
                  <input
                    type="text"
                    value={globalSender.name}
                    onChange={(e) => setGlobalSender({ ...globalSender, name: e.target.value })}
                    placeholder="e.g. Acme Studio LLC"
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Email Address</label>
                    <input
                      type="email"
                      value={globalSender.email}
                      onChange={(e) => setGlobalSender({ ...globalSender, email: e.target.value })}
                      placeholder="e.g. billing@acme.com"
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Phone Number</label>
                    <input
                      type="text"
                      value={globalSender.phone}
                      onChange={(e) => setGlobalSender({ ...globalSender, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 0199"
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Tax ID / VAT</label>
                  <input
                    type="text"
                    value={globalSender.taxId}
                    onChange={(e) => setGlobalSender({ ...globalSender, taxId: e.target.value })}
                    placeholder="e.g. US-9912093"
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Sender Full Address</label>
                  <textarea
                    rows={3}
                    value={globalSender.address}
                    onChange={(e) => setGlobalSender({ ...globalSender, address: e.target.value })}
                    placeholder="e.g. 123 Studio Way, Suite 100&#10;San Francisco, CA 94107"
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 pb-1.5 border-b border-[var(--line)]">
                <CreditCard className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Default Bank Payment Details</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Bank Name</label>
                  <input
                    type="text"
                    value={globalSender.bankName}
                    onChange={(e) => setGlobalSender({ ...globalSender, bankName: e.target.value })}
                    placeholder="e.g. Chase Bank, NA"
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Account Number</label>
                    <input
                      type="text"
                      value={globalSender.bankAccount}
                      onChange={(e) => setGlobalSender({ ...globalSender, bankAccount: e.target.value })}
                      placeholder="e.g. 1029-3847-55"
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Routing Number</label>
                    <input
                      type="text"
                      value={globalSender.bankRouting}
                      onChange={(e) => setGlobalSender({ ...globalSender, bankRouting: e.target.value })}
                      placeholder="e.g. 122105155"
                      className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none font-mono focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Payment Instructions</label>
                  <textarea
                    rows={2}
                    value={globalSender.paymentDetails}
                    onChange={(e) => setGlobalSender({ ...globalSender, paymentDetails: e.target.value })}
                    placeholder="e.g. ACH / Wire Transfer is preferred."
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 bg-[var(--surface-muted)] p-5 rounded-xl border border-gray-200/80 border-[var(--line)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] dark:text-white flex items-center space-x-2 pb-1.5 border-b border-[var(--line)]">
                <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Default Notes & Terms</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Invoice Notes</label>
                  <textarea
                    rows={2}
                    value={globalSender.notes}
                    onChange={(e) => setGlobalSender({ ...globalSender, notes: e.target.value })}
                    placeholder="Thank you for your business!"
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">Default Invoice Terms</label>
                  <textarea
                    rows={2}
                    value={globalSender.terms}
                    onChange={(e) => setGlobalSender({ ...globalSender, terms: e.target.value })}
                    placeholder="Payment is due within 14 days of issue."
                    className="w-full bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 pb-4">
              <button
                type="button"
                onClick={handleSaveGlobalSettings}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-extrabold text-xs rounded-xl shadow-lg shadow-[var(--accent)]/20 transition-all cursor-pointer text-center"
              >
                <Save className="w-4 h-4 text-[var(--ink)]" />
                <span>Save Default Settings</span>
              </button>
              <button
                type="button"
                onClick={handleUseCurrentAsDefault}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-[var(--surface)] hover:bg-[var(--surface-muted)] text-gray-700 dark:text-gray-200 font-semibold text-xs rounded-xl border border-[var(--line)] transition-all cursor-pointer text-center"
                title="Fill settings with currently opened invoice's details"
              >
                <Copy className="w-4 h-4 text-[var(--accent-text)]" />
                <span>Use Current Sender Info</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
