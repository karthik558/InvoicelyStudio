/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Invoice, LineItem, InvoiceStatus, InvoiceTemplateId, CURRENCIES } from '../types';
import { sampleInvoice } from '../data/sampleInvoice';
import { CustomSelect } from './CustomSelect';

const DatePicker = React.lazy(() => import('./DatePicker').then(m => ({ default: m.DatePicker })));
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
  PenTool
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
}

type FormTab = 'details' | 'parties' | 'items' | 'payment' | 'design' | 'settings';

// Predefined premium color palettes
const COLOR_PALETTES = [
  { name: 'Rich Teal & Gold (Default)', primary: '#0f766e', accent: '#b45309' },
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
}) => {
  const activeCurrency = invoice.currency || 'USD';
  const currencySymbol = CURRENCIES.find(c => c.code === activeCurrency)?.symbol || '$';

  const [activeTab, setActiveTab] = useState<FormTab>('details');
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
    terms: 'Payment is due within 14 days of issue.'
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
          terms: parsed.terms || 'Payment is due within 14 days of issue.'
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
      terms: invoice.terms || 'Payment is due within 14 days of issue.'
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
          paymentDetails: parsed.paymentDetails || ''
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
          if (!updated.gstRate) {
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
            if (!updated.gstRate) {
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
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const qty = field === 'quantity' ? Number(value) : item.quantity;
          const rate = field === 'rate' ? Number(value) : item.rate;
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

  // Base64 Logo parser
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (file) {
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
    if (file) {
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
    <div className="flex flex-col h-full bg-white lg:border-r border-gray-200">
      
      {/* Action Toolbar Header */}
      <div className="px-4 sm:px-5 py-3 bg-gray-50/50 border-b border-gray-200 flex flex-wrap gap-2.5 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onNew} 
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0D2C2C] hover:bg-[#164E4E] text-white font-medium text-xs rounded-lg transition-all duration-150 shadow-md shadow-[#0D2C2C]/15 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Create New</span>
            <span className="inline xs:hidden">New</span>
          </button>
          
          <button 
            onClick={onLoadDemo} 
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium text-xs rounded-lg border border-gray-200 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#C69A5D]" />
            <span className="hidden xs:inline font-semibold">Load Demo</span>
            <span className="inline xs:hidden font-semibold">Demo</span>
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <button 
            onClick={onDuplicate}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 text-xs rounded-lg border border-gray-200 transition-all font-semibold cursor-pointer shrink-0"
            title="Duplicate Invoice"
          >
            <Copy className="w-3.5 h-3.5 text-gray-400" />
            <span>Duplicate</span>
          </button>
          <button 
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer shrink-0"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Tabs */}
      <div className="hidden lg:flex bg-gray-50/40 border-b border-gray-200/80 px-4 py-2.5 overflow-x-auto no-scrollbar justify-between items-center shrink-0">
        <div className="flex bg-gray-200/40 p-1 rounded-xl border border-gray-200/50 gap-0.5 shadow-inner">
          {(['details', 'parties', 'items', 'payment', 'design', 'settings'] as FormTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            const icons = {
              details: <FileText className="w-3.5 h-3.5" />,
              parties: <Users className="w-3.5 h-3.5" />,
              items: <Plus className="w-3.5 h-3.5" />,
              payment: <CreditCard className="w-3.5 h-3.5" />,
              design: <Palette className="w-3.5 h-3.5" />,
              settings: <Settings className="w-3.5 h-3.5" />
            };

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex items-center space-x-2 py-1.5 px-3.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap rounded-lg outline-none focus:outline-none select-none
                  ${isActive 
                    ? 'bg-white text-[#0D2C2C] shadow-sm font-bold scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                  }
                `}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-[#C69A5D]' : 'text-gray-400'}`}>
                  {icons[tab]}
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Auto-save status with proper styles and padding */}
        {saveStatus === 'saving' ? (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50/90 border border-amber-100/80 rounded-xl shrink-0 select-none shadow-xs ml-4 transition-all duration-300">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider font-mono">
              Saving...
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/90 border border-emerald-100/80 rounded-xl shrink-0 select-none shadow-xs ml-4 transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-mono">
              Saved {lastSavedTime && `at ${lastSavedTime}`}
            </span>
          </div>
        )}
      </div>

      {/* Editor Fields Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
        
        {/* TAB 1: DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#C69A5D]" />
                <span>Invoice Meta Credentials</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Invoice Number</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField(null, 'invoiceNumber', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
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
              <div className="border-t border-gray-100 pt-4">
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
                  <p className="text-[10px] text-gray-400 mt-1">
                    Select the billing currency for this invoice. The PDF document and preview layouts will automatically adapt formatting and localization rules.
                  </p>
                </div>
              </div>
            </div>

            {/* Logo upload widget */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2">
                  <FileUp className="w-4 h-4 text-[#C69A5D]" />
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
                <div className="flex items-center space-x-4 bg-white p-3 rounded-lg border border-gray-200">
                  <img 
                    src={invoice.sender.logoUrl} 
                    alt="Uploaded logo" 
                    className="w-16 h-16 object-contain bg-gray-50 rounded p-1 border border-gray-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs">
                    <p className="text-gray-700 font-medium truncate max-w-[200px]">{logoFileName || 'logo.png'}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">Stored as responsive inline Base64</p>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 hover:border-[#0D2C2C] rounded-lg p-5 flex flex-col items-center justify-center text-center transition-all bg-white group relative overflow-hidden">
                  <FileUp className="w-7 h-7 text-gray-400 group-hover:text-[#C69A5D] mb-2 transition-colors" />
                  <p className="text-xs text-gray-600 font-semibold">Click or Drag to Upload Logo</p>
                  <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG, SVG (Max 500KB)</p>
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
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2.5 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C69A5D]"></span>
                  <span>Bill From (Sender Details)</span>
                </h3>
                {localStorage.getItem('invoicely_global_sender') && (
                  <button
                    type="button"
                    onClick={handleApplyGlobalSender}
                    className="text-[10px] bg-[#0D2C2C] hover:bg-[#164E4E] text-white px-2 py-1 rounded font-semibold cursor-pointer transition-colors"
                  >
                    Load Default Settings
                  </button>
                )}
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Company / Sender Name</label>
                  <input
                    type="text"
                    value={invoice.sender.name}
                    onChange={(e) => updateField('sender', 'name', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="e.g. Aesthetic Studio Inc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Email</label>
                    <input
                      type="email"
                      value={invoice.sender.email}
                      onChange={(e) => updateField('sender', 'email', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                      placeholder="hello@aesthetic.studio"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Phone</label>
                    <input
                      type="text"
                      value={invoice.sender.phone}
                      onChange={(e) => updateField('sender', 'phone', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Street Address</label>
                  <textarea
                    value={invoice.sender.address}
                    onChange={(e) => updateField('sender', 'address', e.target.value)}
                    rows={2.5}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors resize-none focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="123 Studio Blvd, Suite 100&#10;San Francisco, CA 94107"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Tax / VAT Identifier</label>
                  <input
                    type="text"
                    value={invoice.sender.taxId}
                    onChange={(e) => updateField('sender', 'taxId', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="Tax Registration ID"
                  />
                </div>
              </div>
            </div>

            {/* RECEIVER INFO */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 border-b border-gray-100 pb-2.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C69A5D]"></span>
                <span>Bill To (Client / Receiver Details)</span>
              </h3>

               {previousClients.length > 0 && (
                <div className="mb-4 bg-white p-3 rounded-lg border border-gray-100 space-y-1.5">
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
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Client Company / Name</label>
                  <input
                    type="text"
                    value={invoice.receiver.name}
                    onChange={(e) => updateField('receiver', 'name', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="Client Company Name LLC"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Client Email</label>
                    <input
                      type="email"
                      value={invoice.receiver.email}
                      onChange={(e) => updateField('receiver', 'email', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                      placeholder="accounts@client.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Client Phone</label>
                    <input
                      type="text"
                      value={invoice.receiver.phone}
                      onChange={(e) => updateField('receiver', 'phone', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Client Address</label>
                  <textarea
                    value={invoice.receiver.address}
                    onChange={(e) => updateField('receiver', 'address', e.target.value)}
                    rows={2.5}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors resize-none focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="987 Corporate Way&#10;Austin, TX 78701"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Client Tax ID</label>
                  <input
                    type="text"
                    value={invoice.receiver.taxId}
                    onChange={(e) => updateField('receiver', 'taxId', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0D2C2C] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
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
            <div className="flex justify-between items-center border-b border-gray-200 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C]">
                Line Items ({invoice.items.length})
              </h3>
              <button
                onClick={addItem}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F0F7F7] hover:bg-[#0D2C2C] hover:text-white text-[#0D2C2C] text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-[#0D2C2C]/10"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            {/* List of Line Items */}
            <div className="space-y-3.5">
              {invoice.items.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className="bg-gray-50/50 p-4 rounded-xl border border-gray-200/80 relative space-y-3 group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item #{index + 1}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50 cursor-pointer"
                      title="Delete Line Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">Description / Item details</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none transition-colors resize-none"
                      placeholder="Service description, details, milestones..."
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={item.quantity || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2 py-1 text-xs text-gray-800 outline-none transition-colors font-mono"
                      />
                    </div>
                    <div className="col-span-4 space-y-1.5">
                      <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">Rate ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate || ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2 py-1 text-xs text-gray-800 outline-none transition-colors font-mono"
                      />
                    </div>
                    <div className="col-span-4 space-y-1.5 text-right">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">Total</span>
                      <div className="py-1 text-xs font-bold text-gray-900 font-mono pr-1">
                        {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL OVERRIDES */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3.5 mt-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C]">
                  Financial Additions / Reductions
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={!!invoice.gstEnabled}
                    value={invoice.gstEnabled ? 0 : (invoice.taxRate || '')}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'taxRate', Number(e.target.value))}
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C] transition-colors ${
                      invoice.gstEnabled 
                        ? 'bg-gray-100/80 border-gray-100 text-gray-400 cursor-not-allowed select-none' 
                        : 'bg-white border-gray-200 focus:border-[#0D2C2C]'
                    }`}
                    title={invoice.gstEnabled ? "Disable GST Addon first to use standard Tax Rate" : ""}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">
                      Discount {invoice.discountType === 'flat' ? `(${currencySymbol})` : '(%)'}
                    </label>
                    <div className="flex bg-gray-100 rounded-md p-0.5 border border-gray-200/50">
                      <button
                        type="button"
                        onClick={() => updateField(null, 'discountType', 'percentage')}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-semibold transition-colors ${
                          invoice.discountType !== 'flat'
                            ? 'bg-white text-gray-800 shadow-xs'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField(null, 'discountType', 'flat')}
                        className={`px-1.5 py-0.5 text-[9px] rounded font-semibold transition-colors ${
                          invoice.discountType === 'flat'
                            ? 'bg-white text-gray-800 shadow-xs'
                            : 'text-gray-400 hover:text-gray-600'
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
                    value={invoice.discountRate || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'discountRate', Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Shipping ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoice.shippingFee || ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => updateField(null, 'shippingFee', Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>
              </div>
            </div>

            {/* GST ADDON SECTION */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3.5 mt-4 select-none">
              <div 
                onClick={() => updateField(null, 'gstEnabled', !invoice.gstEnabled)}
                className="flex items-center justify-between border-b border-gray-100 pb-2 cursor-pointer group select-none"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] group-hover:text-[#0D2C2C]/80 transition-colors">
                    GST & Tax Category Addon
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-semibold transition-colors ${invoice.gstEnabled ? 'text-[#0D2C2C]' : 'text-gray-400'}`}>
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
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#0D2C2C]/50 ${
                      invoice.gstEnabled ? 'bg-[#0D2C2C]' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        invoice.gstEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {invoice.gstEnabled && (
                <div className="grid grid-cols-2 gap-4 text-xs animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">GST / Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="e.g. 18"
                      value={invoice.gstRate !== undefined ? (invoice.gstRate || '') : 18}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateField(null, 'gstRate', Number(e.target.value))}
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C]"
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
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 border-b border-gray-100 pb-2.5">
                <CreditCard className="w-4 h-4 text-[#C69A5D]" />
                <span>Bank Payment Details</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Bank Name</label>
                  <input
                    type="text"
                    value={invoice.sender.bankName || ''}
                    onChange={(e) => updateField('sender', 'bankName', e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="e.g. Sovereign Mutual Bank"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Account Number</label>
                    <input
                      type="text"
                      value={invoice.sender.bankAccount || ''}
                      onChange={(e) => updateField('sender', 'bankAccount', e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                      placeholder="e.g. 1029-3847-55"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Routing Number</label>
                    <input
                      type="text"
                      value={invoice.sender.bankRouting || ''}
                      onChange={(e) => updateField('sender', 'bankRouting', e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                      placeholder="e.g. 122105155"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Custom Payment Instructions</label>
                  <textarea
                    value={invoice.sender.paymentDetails || ''}
                    onChange={(e) => updateField('sender', 'paymentDetails', e.target.value)}
                    rows={2.5}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors resize-none focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="e.g. Please send wire and email transfer receipt within 5 business days..."
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT QR CODE CONFIGURATION */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 border-b border-gray-100 pb-2.5">
                <QrCode className="w-4 h-4 text-[#C69A5D]" />
                <span>Payment QR Code Option</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">QR Code Link / UPI String</label>
                  <input
                    type="text"
                    value={invoice.sender.paymentQrLink || ''}
                    onChange={(e) => updateField('sender', 'paymentQrLink', e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="e.g. upi://pay?pa=billing@company&pn=Acme or paypal.me/acme/150 or Stripe link"
                  />
                  <p className="text-[10px] text-gray-400">
                    Provide a standard payment link, email, or UPI string to automatically render a scan-to-pay QR code on the invoice layout.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-2">Or Upload Custom QR Code Image</label>
                  
                  {invoice.sender.paymentQrImage ? (
                    <div className="flex items-center space-x-3 bg-white p-3 border border-gray-200 rounded-xl">
                      <img 
                        src={invoice.sender.paymentQrImage} 
                        alt="Custom QR Code" 
                        className="w-16 h-16 object-contain rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-800 truncate">{qrFileName || 'custom_qr_code.png'}</p>
                        <p className="text-[9px] text-gray-400">Custom QR image successfully loaded</p>
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
                      <label className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0D2C2C] text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-all duration-200">
                        <FileUp className="w-4 h-4 text-[#C69A5D]" />
                        <span>Upload QR Code Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-gray-400">Supports PNG, JPG, or SVG</span>
                    </div>
                  )}
                </div>

                {/* Real-time QR Code Preview within the editor */}
                {(invoice.sender.paymentQrLink || invoice.sender.paymentQrImage) && (
                  <div className="flex flex-col items-center justify-center p-4 bg-white/60 rounded-xl border border-dashed border-gray-200 mt-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-[#0D2C2C] mb-2">Scan Preview</span>
                    <img
                      src={invoice.sender.paymentQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(invoice.sender.paymentQrLink || '')}`}
                      alt="Invoice Payment QR"
                      className="w-24 h-24 border p-1 bg-white rounded shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[9px] text-gray-400 mt-1.5 font-mono text-center max-w-xs truncate">
                      {invoice.sender.paymentQrImage ? 'Using Uploaded QR Code' : `Generating: ${invoice.sender.paymentQrLink}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* NOTES & TERMS */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 border-b border-gray-100 pb-2.5">
                <Info className="w-4 h-4 text-[#C69A5D]" />
                <span>Notes &amp; Terms Statement</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Memo / Notes (Client visible)</label>
                  <textarea
                    value={invoice.notes}
                    onChange={(e) => updateField(null, 'notes', e.target.value)}
                    rows={2.5}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors resize-none focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="e.g. Thank you for your business..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Terms &amp; Conditions</label>
                  <textarea
                    value={invoice.terms}
                    onChange={(e) => updateField(null, 'terms', e.target.value)}
                    rows={2.5}
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors resize-none focus:ring-1 focus:ring-[#0D2C2C]"
                    placeholder="e.g. Please pay within 14 days. Late fees apply..."
                  />
                </div>
              </div>
            </div>

            {/* AUTHORIZED SIGNATURE */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 border-b border-gray-100 pb-2.5">
                <PenTool className="w-4 h-4 text-[#C69A5D]" />
                <span>Authorized Signature</span>
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Signature Type</label>
                    <CustomSelect
                      value={invoice.signatureType || 'none'}
                      onChange={(val) => updateField(null, 'signatureType', val)}
                      options={[
                        { value: 'none', label: 'No Signature' },
                        { value: 'text', label: 'Digital Text Signature' },
                        { value: 'image', label: 'Image Upload' }
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Designation / Title</label>
                    <input
                      type="text"
                      value={invoice.signatureDesignation || ''}
                      onChange={(e) => updateField(null, 'signatureDesignation', e.target.value)}
                      placeholder="e.g. Authorized Signatory, Director"
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors focus:ring-1 focus:ring-[#0D2C2C]"
                    />
                  </div>
                </div>

                {invoice.signatureType === 'text' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Signature Text / Name</label>
                    <input
                      type="text"
                      value={invoice.signatureText || ''}
                      onChange={(e) => updateField(null, 'signatureText', e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none transition-colors font-serif italic text-base focus:ring-1 focus:ring-[#0D2C2C]"
                    />
                  </div>
                )}

                {invoice.signatureType === 'image' && (
                  <div className="space-y-3 animate-fadeIn">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Signature Image</label>
                    {invoice.signatureImage ? (
                      <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg bg-white/50">
                        <img 
                          src={invoice.signatureImage} 
                          alt="Signature Preview" 
                          className="h-10 w-auto object-contain max-w-[120px] bg-white border border-gray-100 rounded p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-800 truncate">{sigFileName || 'signature_image.png'}</p>
                          <p className="text-[9px] text-gray-400">Custom signature loaded</p>
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
                        <label className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0D2C2C] text-gray-600 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs transition-all duration-200">
                          <FileUp className="w-4 h-4 text-[#C69A5D]" />
                          <span>Upload Signature Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSigUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-gray-400">Supports transparent PNG, JPG</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DESIGN & STYLE */}
        {activeTab === 'design' && (
          <div className="space-y-4 animate-fadeIn">
            
            {/* TEMPLATES SELECTOR */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#C69A5D]" />
                <span>Invoice Structural Templates</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'teal', label: 'Rich Teal (Default)', desc: 'Elegant teal + gold accents' },
                  { id: 'classic', label: 'Classic Corporate', desc: 'Symmetrical traditional style' },
                  { id: 'modern', label: 'Modern Minimal', desc: 'Contemporary side-accent bar' },
                  { id: 'simple', label: 'Clean Simple', desc: 'Direct, clear, ink-friendly' },
                  { id: 'dark', label: 'Premium Dark', desc: 'Sleek contrast charcoal theme' },
                  { id: 'indigo', label: 'Royal Indigo', desc: 'Deep indigo royal styling' },
                  { id: 'emerald', label: 'Emerald Luxe', desc: 'Executive rich forest green theme' }
                ].map((item) => {
                  const isSelected = invoice.theme.templateId === item.id;
                  const TEMPLATE_DEFAULTS: Record<string, { primary: string; accent: string }> = {
                    teal: { primary: '#0f766e', accent: '#b45309' },
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
                        const defaults = TEMPLATE_DEFAULTS[item.id] || { primary: '#0f766e', accent: '#b45309' };
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
                          ? 'border-[#0D2C2C] bg-[#F0F7F7] text-[#0D2C2C] shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2">
                <Palette className="w-4 h-4 text-[#C69A5D]" />
                <span>Theme Brand Customization</span>
              </h3>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Aesthetic Color Presets</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {COLOR_PALETTES.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPalette(p.primary, p.accent)}
                      className="p-1.5 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 flex items-center space-x-2 text-left cursor-pointer transition-colors shadow-sm"
                    >
                      <div className="flex space-x-0.5">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.primary }} />
                        <div className="w-3.5 h-3.5 rounded-full -ml-1.5 border border-white" style={{ backgroundColor: p.accent }} />
                      </div>
                      <span className="text-[10px] text-gray-700 truncate font-semibold">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Colors Picker */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Primary Header</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={invoice.theme.primaryColor}
                      onChange={(e) => updateField('theme', 'primaryColor', e.target.value)}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={invoice.theme.primaryColor}
                      onChange={(e) => updateField('theme', 'primaryColor', e.target.value)}
                      className="flex-1 bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2 py-1 text-xs text-gray-800 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Accent / Gold</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={invoice.theme.accentColor}
                      onChange={(e) => updateField('theme', 'accentColor', e.target.value)}
                      className="w-8 h-8 rounded-lg border border-gray-200 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={invoice.theme.accentColor}
                      onChange={(e) => updateField('theme', 'accentColor', e.target.value)}
                      className="flex-1 bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-2 py-1 text-xs text-gray-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FONTS SELECTION */}
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2">
                <Type className="w-4 h-4 text-[#C69A5D]" />
                <span>Typography Configuration</span>
              </h3>

              {/* Built-in font selection */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Select Font Family</span>
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
                            ? 'border-[#0D2C2C] bg-[#F0F7F7] text-[#0D2C2C]' 
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Upload Custom Brand Font</span>
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
                  <div className="flex items-center space-x-3 bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                    <Type className="w-5 h-5 text-[#0D2C2C]" />
                    <div className="flex-1 truncate">
                      <p className="text-gray-700 font-medium truncate">{fontFileName || 'BrandCustomFont.ttf'}</p>
                      <p className="text-gray-400 text-[10px]">Embedded and registered successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 hover:border-[#0D2C2C] rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all bg-white relative group overflow-hidden">
                    <Type className="w-6 h-6 text-gray-400 group-hover:text-[#C69A5D] mb-1.5 transition-colors" />
                    <p className="text-xs text-gray-600 font-semibold">Click to Load custom TTF / OTF font</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Enables absolute custom branded PDFs</p>
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
            <div className="bg-amber-50 border border-amber-200/40 rounded-xl p-4 text-xs text-amber-800 space-y-1.5 shadow-sm">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-[#C69A5D]" />
                <span>Default Global Details</span>
              </p>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                Save your primary company information here. Whenever you click <strong>Create New</strong>, these default details will auto-populate as your sender parameters automatically.
              </p>
            </div>

            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 pb-1.5 border-b border-gray-100">
                <Users className="w-4 h-4 text-[#C69A5D]" />
                <span>Default Company Details</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Sender Name</label>
                  <input
                    type="text"
                    value={globalSender.name}
                    onChange={(e) => setGlobalSender({ ...globalSender, name: e.target.value })}
                    placeholder="e.g. Acme Studio LLC"
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Email Address</label>
                    <input
                      type="email"
                      value={globalSender.email}
                      onChange={(e) => setGlobalSender({ ...globalSender, email: e.target.value })}
                      placeholder="e.g. billing@acme.com"
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Phone Number</label>
                    <input
                      type="text"
                      value={globalSender.phone}
                      onChange={(e) => setGlobalSender({ ...globalSender, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 0199"
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Tax ID / VAT</label>
                  <input
                    type="text"
                    value={globalSender.taxId}
                    onChange={(e) => setGlobalSender({ ...globalSender, taxId: e.target.value })}
                    placeholder="e.g. US-9912093"
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Sender Full Address</label>
                  <textarea
                    rows={3}
                    value={globalSender.address}
                    onChange={(e) => setGlobalSender({ ...globalSender, address: e.target.value })}
                    placeholder="e.g. 123 Studio Way, Suite 100&#10;San Francisco, CA 94107"
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 pb-1.5 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-[#C69A5D]" />
                <span>Default Bank Payment Details</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Bank Name</label>
                  <input
                    type="text"
                    value={globalSender.bankName}
                    onChange={(e) => setGlobalSender({ ...globalSender, bankName: e.target.value })}
                    placeholder="e.g. Chase Bank, NA"
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Account Number</label>
                    <input
                      type="text"
                      value={globalSender.bankAccount}
                      onChange={(e) => setGlobalSender({ ...globalSender, bankAccount: e.target.value })}
                      placeholder="e.g. 1029-3847-55"
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Routing Number</label>
                    <input
                      type="text"
                      value={globalSender.bankRouting}
                      onChange={(e) => setGlobalSender({ ...globalSender, bankRouting: e.target.value })}
                      placeholder="e.g. 122105155"
                      className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none font-mono focus:ring-1 focus:ring-[#0D2C2C]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Payment Instructions</label>
                  <textarea
                    rows={2}
                    value={globalSender.paymentDetails}
                    onChange={(e) => setGlobalSender({ ...globalSender, paymentDetails: e.target.value })}
                    placeholder="e.g. ACH / Wire Transfer is preferred."
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2C2C] flex items-center space-x-2 pb-1.5 border-b border-gray-100">
                <FileText className="w-4 h-4 text-[#C69A5D]" />
                <span>Default Notes & Terms</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Invoice Notes</label>
                  <textarea
                    rows={2}
                    value={globalSender.notes}
                    onChange={(e) => setGlobalSender({ ...globalSender, notes: e.target.value })}
                    placeholder="Thank you for your business!"
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block">Default Invoice Terms</label>
                  <textarea
                    rows={2}
                    value={globalSender.terms}
                    onChange={(e) => setGlobalSender({ ...globalSender, terms: e.target.value })}
                    placeholder="Payment is due within 14 days of issue."
                    className="w-full bg-white border border-gray-200 focus:border-[#0D2C2C] rounded-lg px-3 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-[#0D2C2C]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2 pb-4">
              <button
                type="button"
                onClick={handleSaveGlobalSettings}
                className="flex-1 py-2.5 bg-[#0D2C2C] hover:bg-[#164E4E] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
              >
                Save Default Settings
              </button>
              <button
                type="button"
                onClick={handleUseCurrentAsDefault}
                className="py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-all cursor-pointer text-center"
                title="Fill settings with currently opened invoice's details"
              >
                Use Current Sender Info
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button Bar */}
      <div className="hidden lg:flex px-5 py-3.5 bg-gray-50/50 border-t border-gray-200 items-center justify-between">
        <span className="text-[10px] text-gray-400 font-mono">
          Last updated {new Date(invoice.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <button
          onClick={onSave}
          className="flex items-center space-x-1 px-4 py-1.5 bg-[#0D2C2C] hover:bg-[#164E4E] text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-[#0D2C2C]/10"
        >
          <span>Save Changes</span>
        </button>
      </div>

      {/* Mobile Navigation Bar UI Sector */}
      <div className="lg:hidden bg-[#0A2323] border-t border-white/10 py-2.5 px-3 flex items-center justify-between z-20 shrink-0 no-print w-full">
        {(['details', 'parties', 'items', 'payment', 'design', 'settings'] as FormTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          const icons = {
            details: <FileText className="w-4 h-4" />,
            parties: <Users className="w-4 h-4" />,
            items: <Plus className="w-4 h-4" />,
            payment: <CreditCard className="w-4 h-4" />,
            design: <Palette className="w-4 h-4" />,
            settings: <Settings className="w-4 h-4" />
          };

          return (
            <div
              key={tab}
              role="button"
              onClick={() => setActiveTab(tab)}
              className={`
                flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 relative cursor-pointer outline-none select-none rounded-none
                ${isActive ? 'text-[#C69A5D] scale-105' : 'text-slate-400 active:scale-95'}
              `}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-300 transform ${
                isActive 
                  ? 'bg-white/10 text-[#C69A5D] -translate-y-0.5 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}>
                {icons[tab]}
              </div>
              <span className={`text-[8px] font-bold mt-1 tracking-wider uppercase transition-colors ${
                isActive ? 'text-[#C69A5D] font-extrabold' : 'text-slate-500'
              }`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-[#C69A5D] shadow-[0_0_8px_rgba(198,154,93,0.8)]"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
