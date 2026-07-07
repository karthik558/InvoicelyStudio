/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Invoice, AppSettings } from './types';
import { sampleInvoicesList } from './data/sampleInvoice';

// Lazy load components for enhanced performance & instant startup
const InvoiceForm = React.lazy(() => import('./components/InvoiceForm').then(m => ({ default: m.InvoiceForm })));
const InvoicePreview = React.lazy(() => import('./components/InvoicePreview').then(m => ({ default: m.InvoicePreview })));
const InvoiceList = React.lazy(() => import('./components/InvoiceList').then(m => ({ default: m.InvoiceList })));
const PDFExporter = React.lazy(() => import('./components/PDFExporter').then(m => ({ default: m.PDFExporter })));

// Beautiful, responsive skeletal loading designs
const InvoiceListSkeleton = () => (
  <div className="flex flex-col h-full bg-[#0E2C2C] text-white p-5 space-y-4 animate-pulse">
    <div className="h-5 bg-white/10 rounded-lg w-1/3" />
    <div className="h-10 bg-white/5 rounded-xl w-full border border-white/5" />
    <div className="space-y-3 pt-3 flex-1 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/10 rounded w-1/5" />
          </div>
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const InvoiceFormSkeleton = () => (
  <div className="flex flex-col h-full bg-white p-6 space-y-6 animate-pulse overflow-hidden">
    <div className="flex justify-between items-center pb-4 border-b border-gray-100 shrink-0">
      <div className="h-6 bg-slate-200 rounded-lg w-1/4" />
      <div className="flex space-x-2">
        <div className="h-8 bg-slate-100 rounded-lg w-20" />
        <div className="h-8 bg-slate-100 rounded-lg w-20" />
      </div>
    </div>
    <div className="flex-1 space-y-5 overflow-hidden">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-slate-200/80 rounded w-1/4" />
          <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200/80 rounded w-1/4" />
          <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200/80 rounded w-1/6" />
        <div className="h-24 bg-slate-50 rounded-xl w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200/80 rounded w-1/5" />
        <div className="h-32 bg-slate-50 border border-slate-100/50 rounded-xl w-full" />
      </div>
    </div>
  </div>
);

const InvoicePreviewSkeleton = () => (
  <div className="flex flex-col h-full bg-[#E8EBEB] p-6 items-center justify-center animate-pulse overflow-hidden">
    <div className="bg-white w-full max-w-[480px] sm:max-w-xl aspect-[1/1.41] rounded-2xl shadow-xl shadow-slate-900/5 p-8 space-y-8 flex flex-col justify-between border border-slate-200/40">
      <div className="flex justify-between shrink-0">
        <div className="space-y-2 w-1/3">
          <div className="h-6 bg-slate-200 rounded-lg w-full" />
          <div className="h-3 bg-slate-100 rounded-lg w-2/3" />
        </div>
        <div className="h-12 bg-slate-100 rounded-xl w-16" />
      </div>
      <div className="space-y-4 py-8 flex-1">
        <div className="h-4 bg-slate-200/80 rounded w-full" />
        <div className="h-4 bg-slate-200/80 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-3/4" />
      </div>
      <div className="flex justify-between border-t border-slate-100 pt-6 shrink-0">
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        <div className="h-6 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  </div>
);
import { 
  Download, 
  FileText, 
  AlertCircle,
  ClipboardCheck,
  CheckCircle,
  Menu,
  X,
  Save,
  Edit,
  Eye,
  Sliders
} from 'lucide-react';

const createStarterInvoice = (defaultSender?: any): Invoice => {
  const today = new Date().toISOString().split('T')[0];
  const twoWeeksLater = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0];

  const sender = defaultSender || {
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    bankName: '',
    bankAccount: '',
    bankRouting: '',
    paymentDetails: '',
    logoUrl: ''
  };

  return {
    id: `invoice-${Date.now()}`,
    invoiceNumber: 'INV-2026-0101',
    issueDate: today,
    dueDate: twoWeeksLater,
    status: 'pending',
    sender,
    receiver: {
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: ''
    },
    items: [
      {
        id: `item-${Date.now()}`,
        description: 'Professional Services',
        quantity: 1,
        rate: 0.00,
        amount: 0.00
      }
    ],
    taxRate: 0,
    discountRate: 0,
    discountType: 'percentage',
    shippingFee: 0,
    gstRate: 18,
    gstEnabled: false,
    gstSplit: false,
    gstType: 'igst',
    notes: defaultSender?.notes || 'Thank you for your business!',
    terms: defaultSender?.terms || 'Payment is due within 14 days of issue.',
    theme: {
      primaryColor: '#0f766e', // Deep Teal
      accentColor: '#b45309',  // Gold
      fontFamily: 'Inter',
      templateId: 'teal'
    },
    currency: 'USD',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

export default function App() {
  // --- STATE ---
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const local = localStorage.getItem('invoice_studio_data_v1');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse local storage invoices:', e);
      }
    }
    // Read default sender settings if they exist
    const savedSettings = localStorage.getItem('invoicely_global_sender');
    let defaultSender = null;
    if (savedSettings) {
      try {
        defaultSender = JSON.parse(savedSettings);
      } catch (e) {}
    }
    const starter = createStarterInvoice(defaultSender);
    return [starter];
  });

  const [selectedId, setSelectedId] = useState<string>(() => {
    const local = localStorage.getItem('invoice_studio_data_v1');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      } catch (e) {}
    }
    return '';
  });

  // Mobile navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'edit' | 'preview'>('edit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PDF Layout settings state & click outside listener
  const [isLayoutSettingsOpen, setIsLayoutSettingsOpen] = useState(false);
  const layoutSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (layoutSettingsRef.current && !layoutSettingsRef.current.contains(event.target as Node)) {
        setIsLayoutSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initial preloader states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFadeOut, setIsFadeOut] = useState(false);

  // Preloader transition controller
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadeOut(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Custom Confirmation & Alert Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; isDestructive?: boolean }
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      isDestructive: options?.isDestructive || false,
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
    });
  };

  // Get active invoice
  const activeInvoice = invoices.find((inv) => inv.id === selectedId) || invoices[0];

  // --- LOCAL PERSISTENCE ---
  const saveToLocalStorage = (updatedInvoices: Invoice[]) => {
    localStorage.setItem('invoice_studio_data_v1', JSON.stringify(updatedInvoices));
  };

  // --- SHARE LINK IMPORT CHECK ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('invoiceData');
    if (sharedData) {
      try {
        const decoded = decodeURIComponent(escape(atob(sharedData)));
        const parsedInvoice = JSON.parse(decoded) as Invoice;
        
        if (parsedInvoice && parsedInvoice.invoiceNumber) {
          const newInvoice: Invoice = {
            ...parsedInvoice,
            id: `shared-${Date.now()}`,
            invoiceNumber: `${parsedInvoice.invoiceNumber} (Shared)`,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };

          // Check if already exists in state
          setInvoices((prev) => {
            const exists = prev.some(
              (inv) => inv.invoiceNumber === newInvoice.invoiceNumber && inv.receiver.name === newInvoice.receiver.name
            );
            if (exists) {
              return prev;
            }
            const updated = [newInvoice, ...prev];
            saveToLocalStorage(updated);
            return updated;
          });
          setSelectedId(newInvoice.id);
          
          // Clear query params to keep clean address bar
          window.history.replaceState({}, document.title, window.location.pathname);
          showToast('Imported shared invoice successfully!');
        }
      } catch (e) {
        console.error('Failed to decode shared invoice payload:', e);
        showToast('Failed to parse shared invoice payload');
      }
    }
  }, []);

  // Keyboard shortcut listener: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoices, selectedId]);

  // --- TOAST UTILITY ---
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2500); // Snappy duration: stays for 2.5s
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // --- INVOICE ACTIONS ---

  const handleInvoiceChange = (updated: Invoice) => {
    const updatedInvoices = invoices.map((inv) => (inv.id === updated.id ? updated : inv));
    const sorted = [...updatedInvoices].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setInvoices(sorted);
    saveToLocalStorage(sorted);
  };

  const getNextInvoiceNumber = (list: Invoice[]) => {
    const numbers = list.map((i) => i.invoiceNumber);
    let maxNum = 100;
    for (const num of numbers) {
      const match = num.match(/\d+$/);
      if (match) {
        const parsed = parseInt(match[0], 10);
        if (parsed > maxNum) maxNum = parsed;
      }
    }
    return `INV-2026-0${maxNum + 1}`;
  };

  const handleNewInvoice = () => {
    const newNum = getNextInvoiceNumber(invoices);
    const nextId = `invoice-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const twoWeeksLater = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0];

    // Read default sender settings if they exist
    const savedSettings = localStorage.getItem('invoicely_global_sender');
    let sender = {
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      bankName: '',
      bankAccount: '',
      bankRouting: '',
      paymentDetails: '',
      logoUrl: ''
    };
    let notes = 'Thank you for your business!';
    let terms = 'Payment is due within 14 days of issue.';

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        sender = {
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
        };
        if (parsed.notes) notes = parsed.notes;
        if (parsed.terms) terms = parsed.terms;
      } catch (e) {}
    } else {
      // Set some initial clean empty details instead of hardcoded demo details
      sender = {
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        bankName: '',
        bankAccount: '',
        bankRouting: '',
        paymentDetails: '',
        logoUrl: ''
      };
    }

    const newInvoice: Invoice = {
      id: nextId,
      invoiceNumber: newNum,
      issueDate: today,
      dueDate: twoWeeksLater,
      status: 'pending',
      sender,
      receiver: {
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: ''
      },
      items: [
        {
          id: `item-${Date.now()}`,
          description: 'Professional Services',
          quantity: 1,
          rate: 0.00,
          amount: 0.00
        }
      ],
      taxRate: 0,
      discountRate: 0,
      shippingFee: 0,
      gstRate: 18,
      gstEnabled: false,
      gstSplit: false,
      gstType: 'igst',
      notes,
      terms,
      theme: {
        primaryColor: '#0f766e', // Deep Teal
        accentColor: '#b45309',  // Gold
        fontFamily: 'Inter',
        templateId: 'teal'
      },
      currency: 'USD',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    setSelectedId(newInvoice.id);
    saveToLocalStorage(updated);
    setIsSidebarOpen(false);
    setActiveMobileView('edit');
    showToast(`Created blank invoice: ${newNum}`);
  };

  const handleDuplicateInvoice = () => {
    if (!activeInvoice) return;
    const newNum = `${activeInvoice.invoiceNumber}-COPY`;
    const nextId = `invoice-${Date.now()}`;
    
    const duplicated: Invoice = {
      ...activeInvoice,
      id: nextId,
      invoiceNumber: newNum,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [duplicated, ...invoices];
    setInvoices(updated);
    setSelectedId(duplicated.id);
    saveToLocalStorage(updated);
    showToast(`Duplicated invoice to: ${newNum}`);
  };

  const handleDeleteInvoice = (idToDelete?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetId = idToDelete || selectedId;
    const invoiceToDelete = invoices.find(inv => inv.id === targetId);
    
    if (!invoiceToDelete) return;

    triggerConfirm(
      'Delete Invoice',
      `Are you sure you want to permanently delete invoice ${invoiceToDelete.invoiceNumber}? This action is irreversible.`,
      () => {
        const remaining = invoices.filter((inv) => inv.id !== targetId);
        
        if (remaining.length === 0) {
          // If none left, auto create one so app doesn't break
          setInvoices([]);
          localStorage.removeItem('invoice_studio_data_v1');
          handleNewInvoice();
          return;
        }

        setInvoices(remaining);
        saveToLocalStorage(remaining);
        
        if (targetId === selectedId) {
          setSelectedId(remaining[0].id);
        }
        showToast('Invoice deleted successfully');
      },
      { confirmText: 'Delete', cancelText: 'Cancel', isDestructive: true }
    );
  };

  const handleLoadDemo = () => {
    triggerConfirm(
      'Load Demo Invoices',
      'Would you like to reload the premium sample invoices? This will override your current entries and reload high-polish defaults.',
      () => {
        setInvoices(sampleInvoicesList);
        setSelectedId(sampleInvoicesList[0].id);
        saveToLocalStorage(sampleInvoicesList);
        showToast('Loaded aesthetic sample invoice templates!');
      },
      { confirmText: 'Load Demo', cancelText: 'Keep Current' }
    );
  };

  const handleImportBackup = (imported: Invoice[]) => {
    setInvoices(imported);
    if (imported.length > 0) {
      setSelectedId(imported[0].id);
    }
    saveToLocalStorage(imported);
    showToast(`Imported ${imported.length} invoices successfully!`);
  };

  const handleClearAll = () => {
    triggerConfirm(
      'Wipe Entire Database',
      'CRITICAL: Are you sure you want to wipe all stored invoices from this browser? This deletes your complete database permanently.',
      () => {
        localStorage.removeItem('invoice_studio_data_v1');
        
        // Load default sender if preset
        const savedSettings = localStorage.getItem('invoicely_global_sender');
        let defaultSender = null;
        if (savedSettings) {
          try {
            defaultSender = JSON.parse(savedSettings);
          } catch (e) {}
        }
        
        const starter = createStarterInvoice(defaultSender);
        const updated = [starter];
        setInvoices(updated);
        setSelectedId(starter.id);
        saveToLocalStorage(updated);
        showToast('Database wiped successfully.');
      },
      { confirmText: 'Wipe Database', cancelText: 'Cancel', isDestructive: true }
    );
  };

  const handleSave = () => {
    // Explicit manual save trigger
    const updated = invoices.map(i => i.id === selectedId ? { ...i, updatedAt: Date.now() } : i);
    const sorted = [...updated].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setInvoices(sorted);
    saveToLocalStorage(sorted);
    showToast(`Saved invoice details: ${activeInvoice.invoiceNumber}`);
  };

  const handleShareLink = () => {
    if (!activeInvoice) return;
    try {
      // Stringify current active invoice and encode it
      const payload = JSON.stringify(activeInvoice);
      const encoded = btoa(unescape(encodeURIComponent(payload)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?invoiceData=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl);
      showToast('Shareable URL copied to clipboard! (Compressed state enclosed)');
    } catch (err) {
      console.error('Failed to generate share link:', err);
      // Fallback to clipboard JSON
      navigator.clipboard.writeText(JSON.stringify(activeInvoice, null, 2));
      showToast('Raw JSON copied as fallback backup!');
    }
  };

  const handleToggleLayoutMode = (mode: 'compact' | 'standard') => {
    if (!activeInvoice) return;
    const updated = invoices.map(i => {
      if (i.id === activeInvoice.id) {
        return {
          ...i,
          theme: {
            ...i.theme,
            pdfLayout: mode
          },
          updatedAt: Date.now()
        };
      }
      return i;
    });
    const sorted = [...updated].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    setInvoices(sorted);
    saveToLocalStorage(sorted);
    showToast(`PDF layout updated to ${mode === 'compact' ? 'Compact Mode' : 'Standard Padding'}`);
  };



  return (
    <div className="flex flex-col h-screen bg-[#F3F5F5] text-slate-800 overflow-hidden font-sans">
      
      {/* Aesthetic Brand Preloader */}
      {isInitialLoading && (
        <div className={`fixed inset-0 bg-[#0D2C2C] z-[100] flex items-center justify-center transition-all duration-700 ease-in-out ${isFadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center text-3xl sm:text-5xl font-bold tracking-tight text-white select-none">
            <span>Invo</span>
            <span className="relative inline-block">
              ı
              <span className="absolute top-[8px] sm:top-[10px] left-[3.5px] sm:left-[4px] w-[5.5px] sm:w-[7px] h-[5.5px] sm:h-[7px] bg-[#C69A5D] rounded-[0.8px] sm:rounded-[1px] animate-dotBounce"></span>
            </span>
            <span>cely</span>
            <span className="font-light text-slate-300 ml-2">Studio</span>
          </div>
        </div>
      )}

      {/* Dynamic Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-[#0D2C2C] border border-[#1A3F3F] pl-4 pr-3 py-2.5 rounded-xl shadow-xl shadow-slate-950/25 z-50 flex items-center space-x-2.5 text-xs font-semibold text-white tracking-wide animate-slideUp select-none min-w-[200px] justify-between border-white/5">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-[#C69A5D] shrink-0" />
            <span className="max-w-[220px] sm:max-w-xs truncate">{toastMessage}</span>
          </div>
          <button 
            type="button"
            onClick={dismissToast}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-1.5 focus:outline-none"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main SaaS App Bar Header */}
      <header className="h-16 bg-[#0D2C2C] text-white flex items-center justify-between px-3 sm:px-6 border-b border-[#1A3F3F] shrink-0 z-20 no-print">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Mobile Hamburger toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer shrink-0"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center min-w-0 select-none">
            <div className="flex items-center min-w-0">
              <div className="flex items-center text-base sm:text-lg font-bold tracking-tight text-white mr-1 sm:mr-2 shrink-0">
                <span>Invo</span>
                <span className="relative inline-block">
                  ı
                  <span className="absolute top-[4px] left-[2px] w-[3.5px] h-[3.5px] bg-[#C69A5D] rounded-[0.5px]"></span>
                </span>
                <span>cely</span>
                <span className="font-light text-slate-300 ml-1.5">Studio</span>
              </div>
              <div className="h-4 w-px bg-white/20 mx-2 hidden lg:block"></div>
              <span className="text-xs text-gray-400 font-medium truncate hidden lg:block max-w-[150px] xl:max-w-none">Workspace / Invoice Dashboard</span>
            </div>
          </div>
        </div>

        {/* Global actions: Switcher & Operations */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile View Tabs (Form vs Preview) */}
          <div className="flex lg:hidden bg-slate-950/80 p-1 rounded-lg border border-white/5 shrink-0">
            <button
              onClick={() => setActiveMobileView('edit')}
              className={`p-1.5 rounded transition-all cursor-pointer ${activeMobileView === 'edit' ? 'bg-[#C69A5D] text-[#0D2C2C]' : 'text-slate-400'}`}
              title="Editor"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveMobileView('preview')}
              className={`p-1.5 rounded transition-all cursor-pointer ${activeMobileView === 'preview' ? 'bg-[#C69A5D] text-[#0D2C2C]' : 'text-slate-400'}`}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic react-pdf Download Link Trigger (Lazy Loaded) */}
          {activeInvoice && (
            <Suspense fallback={
              <div className="flex items-center justify-center p-2 bg-white/5 rounded-lg text-sm border border-white/10 text-gray-400 shrink-0 select-none animate-pulse">
                <Download className="w-4 h-4 text-[#C69A5D]/60" />
                <span className="hidden sm:inline ml-1.5 text-xs font-semibold">Compiling...</span>
              </div>
            }>
              <PDFExporter activeInvoice={activeInvoice} />
            </Suspense>
          )}

          {/* PDF Layout Settings Panel */}
          {activeInvoice && (
            <div className="relative" ref={layoutSettingsRef}>
              <button
                id="pdf-layout-settings-btn"
                onClick={() => setIsLayoutSettingsOpen(!isLayoutSettingsOpen)}
                className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  isLayoutSettingsOpen 
                    ? 'bg-[#C69A5D] text-[#0D2C2C] border-[#C69A5D]' 
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
                title="PDF Layout Settings"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-xs font-semibold">PDF Layout</span>
              </button>

              {isLayoutSettingsOpen && (
                <div 
                  id="pdf-layout-settings-panel"
                  className="absolute right-0 mt-2 w-72 bg-[#123636] border border-[#1D4A4A] text-white rounded-xl shadow-2xl p-4 z-50 animate-slideDown animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">PDF Output Settings</h4>
                    <span className="text-[10px] bg-[#C69A5D]/10 text-[#C69A5D] font-mono px-1.5 py-0.5 rounded font-semibold">A4 / Letter</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                    Toggle spacing density for the exported PDF output to fit more items and prevent text overlapping.
                  </p>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Density Preset</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="layout-standard-btn"
                        type="button"
                        onClick={() => handleToggleLayoutMode('standard')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          (activeInvoice.theme.pdfLayout || 'standard') === 'standard'
                            ? 'bg-[#C69A5D] text-[#0D2C2C] border-[#C69A5D] shadow-md shadow-[#C69A5D]/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <span className="text-xs">Standard</span>
                        <span className="text-[9px] font-normal opacity-85">Spacious Padding</span>
                      </button>

                      <button
                        id="layout-compact-btn"
                        type="button"
                        onClick={() => handleToggleLayoutMode('compact')}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          activeInvoice.theme.pdfLayout === 'compact'
                            ? 'bg-[#C69A5D] text-[#0D2C2C] border-[#C69A5D] shadow-md shadow-[#C69A5D]/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <span className="text-xs">Compact</span>
                        <span className="text-[9px] font-normal opacity-85">Prevent Overlaps</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Active PDF preset:</span>
                    <strong className="text-white uppercase font-mono font-bold">
                      {activeInvoice.theme.pdfLayout === 'compact' ? 'Compact' : 'Standard'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Golden Save Button (Icon-only) */}
          <button
            onClick={handleSave}
            className="flex items-center justify-center p-2 bg-[#C69A5D] hover:bg-[#B5894D] text-[#0D2C2C] rounded-lg shadow-lg shadow-[#C69A5D]/20 transition-all cursor-pointer shrink-0"
            title="Save Invoice"
          >
            <Save className="w-4 h-4 text-[#0D2C2C]" />
          </button>
        </div>
      </header>

      {/* Main SaaS Workspace Block */}
      <main className="flex-1 flex relative overflow-hidden">
        
        {/* SIDEBAR: Registry Invoices List (Collapsible on mobile) */}
        <div 
          className={`
            absolute inset-y-0 left-0 w-80 bg-white z-30 transform transition-transform duration-200 lg:relative lg:translate-x-0 no-print
            ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          `}
        >
          <Suspense fallback={<InvoiceListSkeleton />}>
            <InvoiceList
              invoices={invoices}
              selectedInvoiceId={selectedId}
              onSelectInvoice={(id) => {
                setSelectedId(id);
                setIsSidebarOpen(false);
              }}
              onNewInvoice={handleNewInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onImportBackup={handleImportBackup}
              onClearAll={handleClearAll}
              onAlert={triggerAlert}
            />
          </Suspense>
        </div>

        {/* Mobile Sidebar overlay backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/40 z-20 no-print lg:hidden"
          />
        )}

        {/* MIDDLE COLUMN: Form Editor (Visible on laptop, or active edit mobile tab) */}
        <div 
          className={`
            flex-1 h-full overflow-hidden no-print bg-white
            ${activeMobileView === 'edit' ? 'block' : 'hidden lg:block'}
          `}
        >
          {activeInvoice ? (
            <Suspense fallback={<InvoiceFormSkeleton />}>
              <InvoiceForm
                invoice={activeInvoice}
                onChange={handleInvoiceChange}
                onLoadDemo={handleLoadDemo}
                onSave={handleSave}
                onDuplicate={handleDuplicateInvoice}
                onDelete={() => handleDeleteInvoice()}
                onNew={handleNewInvoice}
                onAlert={triggerAlert}
              />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 bg-white">
              <AlertCircle className="w-12 h-12 text-[#0D2C2C]" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">No Invoice Selected</h3>
                <p className="text-xs text-gray-500 mt-1">Select an existing invoice from the registry or create a new one.</p>
              </div>
              <button onClick={handleNewInvoice} className="px-4 py-1.5 bg-[#0D2C2C] text-white rounded text-xs font-semibold">
                Create First Invoice
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HTML Live Preview (Visible on laptop, or active preview mobile tab) */}
        <div 
          className={`
            flex-1 xl:flex-none xl:w-[540px] 2xl:w-[620px] h-full overflow-hidden border-l border-gray-200 bg-[#E8EBEB]
            ${activeMobileView === 'preview' ? 'block' : 'hidden lg:block'}
          `}
        >
          {activeInvoice ? (
            <Suspense fallback={<InvoicePreviewSkeleton />}>
              <InvoicePreview invoice={activeInvoice} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full bg-[#E8EBEB] text-gray-500 text-xs">
              Preview is empty
            </div>
          )}
        </div>

      </main>

      {/* Sleek footer */}
      <footer className="hidden sm:flex h-10 bg-[#0A2323] border-t border-white/5 items-center justify-between px-6 shrink-0 z-20 no-print text-gray-400 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-500 font-medium">Copyright © 2026 Invoicely Studio</span>
        </div>
        
        <div className="flex gap-4 items-center">
          <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            All changes saved locally
          </span>
          <span className="text-gray-600/40">•</span>
          <span className="text-[10px] text-gray-500 font-medium">Shortcuts: ⌘S Save</span>
        </div>
      </footer>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn no-print">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-left">
            <h3 className="text-sm font-bold text-[#0D2C2C] flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${confirmModal.isDestructive ? 'text-rose-600' : 'text-[#C69A5D]'}`} />
              <span>{confirmModal.title}</span>
            </h3>
            <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end space-x-2 mt-5">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-white shadow-sm ${
                  confirmModal.isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-[#0D2C2C] hover:bg-[#164E4E]'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn no-print">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-left">
            <h3 className="text-sm font-bold text-[#0D2C2C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C69A5D]" />
              <span>{alertModal.title}</span>
            </h3>
            <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">{alertModal.message}</p>
            <div className="flex items-center justify-end mt-5">
              <button
                onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 bg-[#0D2C2C] hover:bg-[#164E4E] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
