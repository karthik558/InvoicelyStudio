/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Invoice, AppSettings, localISODate } from './types';
import { sampleInvoicesList } from './data/sampleInvoice';

// Lazy load components for enhanced performance & instant startup
const InvoiceForm = React.lazy(() => import('./components/InvoiceForm').then(m => ({ default: m.InvoiceForm })));
const InvoicePreview = React.lazy(() => import('./components/InvoicePreview').then(m => ({ default: m.InvoicePreview })));
const InvoiceList = React.lazy(() => import('./components/InvoiceList').then(m => ({ default: m.InvoiceList })));
const PDFExporter = React.lazy(() => import('./components/PDFExporter').then(m => ({ default: m.PDFExporter })));

// Beautiful, responsive skeletal loading designs
const InvoiceListSkeleton = () => (
  <div className="flex flex-col h-full bg-[var(--surface)] p-5 space-y-4 animate-pulse">
    <div className="h-5 bg-[var(--line)] rounded-lg w-1/3" />
    <div className="h-10 bg-[var(--surface-muted)] rounded-xl w-full border border-[var(--line)]" />
    <div className="space-y-3 pt-3 flex-1 overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3.5 bg-[var(--surface-muted)] rounded-xl border border-[var(--line)] space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-[var(--line)] rounded w-1/3" />
            <div className="h-3 bg-[var(--line)] rounded w-1/5" />
          </div>
          <div className="h-3 bg-[var(--line)] rounded w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

const InvoiceFormSkeleton = () => (
  <div className="flex flex-col h-full bg-[var(--surface)] p-6 space-y-6 animate-pulse overflow-hidden">
    <div className="flex justify-between items-center pb-4 border-b border-[var(--line)] shrink-0">
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
  <div className="flex flex-col h-full bg-[var(--preview)] p-6 items-center justify-center animate-pulse overflow-hidden">
    <div className="bg-[var(--surface)] w-full max-w-120 sm:max-w-xl aspect-[1/1.41] rounded-2xl shadow-xl shadow-slate-900/5 p-8 space-y-8 flex flex-col justify-between border border-slate-200/40">
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
import { AccessibilitySettings, LineItem } from './types';
import { CommandPalette } from './components/CommandPalette';
import { AccessibilityMenu } from './components/AccessibilityMenu';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ItemPresetsModal } from './components/ItemPresetsModal';

import { 
  Moon,
  Sun,
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
  Sliders,
  Search,
  ShieldCheck,
  PieChart,
  Command,
  Layers
} from 'lucide-react';

function readStoredSender() {
  const savedSettings = localStorage.getItem('invoicely_global_sender');
  if (!savedSettings) return null;
  try {
    return JSON.parse(savedSettings);
  } catch {
    return null;
  }
}

const createStarterInvoice = (defaultSender?: any): Invoice => {
  const today = localISODate();
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const twoWeeksLater = localISODate(due);

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
      primaryColor: '#1e3a8a',
      accentColor: '#c2410c',
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

  // App Theme state
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('invoicely_theme') as 'light' | 'dark') || 'light');

  useEffect(() => {
    if (appTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('invoicely_theme', appTheme);
  }, [appTheme]);

  // Version 3.0 Accessibility & Modals State
  const [a11y, setA11y] = useState<AccessibilitySettings>(() => {
    const local = localStorage.getItem('invoicely_a11y');
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return { fontScale: 'normal', highContrast: false, colorblindIcons: true, reducedMotion: false };
  });

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isA11yMenuOpen, setIsA11yMenuOpen] = useState(false);
  const [isAnalyticsDashboardOpen, setIsAnalyticsDashboardOpen] = useState(false);
  const [isItemPresetsModalOpen, setIsItemPresetsModalOpen] = useState(false);

  const handleUpdateA11y = (updates: Partial<AccessibilitySettings>) => {
    setA11y((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('invoicely_a11y', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-large', 'font-scale-xlarge', 'high-contrast-mode');
    if (a11y.fontScale === 'large') root.classList.add('font-scale-large');
    if (a11y.fontScale === 'xlarge') root.classList.add('font-scale-xlarge');
    if (a11y.highContrast) root.classList.add('high-contrast-mode');
  }, [a11y]);

  // Global Keyboard Shortcuts (Cmd+K for Command Palette, ? for A11y Guide)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsA11yMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const handleAddItemFromPreset = (newItem: LineItem) => {
    if (!activeInvoice) return;
    const updated = {
      ...activeInvoice,
      items: [...activeInvoice.items, newItem],
      updatedAt: Date.now()
    };
    handleInvoiceChange(updated);
    showToast(`Added catalog preset item: ${newItem.description.split('-')[0]}`);
  };

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

  // Preloader transition controller (Snappy 800ms total)
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadeOut(true);
    }, 400);

    const removeTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);

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

  useEffect(() => {
    if (invoices.length === 0) return;
    if (!invoices.some((inv) => inv.id === selectedId)) {
      setSelectedId(invoices[0].id);
    }
  }, [invoices, selectedId]);

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
    let maxNum = 100;
    for (const inv of list) {
      const match = String(inv.invoiceNumber || '').match(/(\d+)(?:-COPY(?:-\d+)?)?$/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed > maxNum) maxNum = parsed;
      }
    }
    return `INV-${new Date().getFullYear()}-${String(maxNum + 1).padStart(4, '0')}`;
  };

  const handleNewInvoice = () => {
    const newNum = getNextInvoiceNumber(invoices);
    const nextId = `invoice-${Date.now()}`;
    const today = localISODate();
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const twoWeeksLater = localISODate(due);

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
      discountType: 'percentage',
      shippingFee: 0,
      gstRate: 18,
      gstEnabled: false,
      gstSplit: false,
      gstType: 'igst',
      notes,
      terms,
      theme: {
        primaryColor: '#1e3a8a',
        accentColor: '#c2410c',
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
    const baseNumber = activeInvoice.invoiceNumber.replace(/-COPY(?:-\d+)?$/, '');
    let newNum = `${baseNumber}-COPY`;
    let copyIndex = 2;
    while (invoices.some((inv) => inv.invoiceNumber === newNum)) {
      newNum = `${baseNumber}-COPY-${copyIndex}`;
      copyIndex += 1;
    }
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
          const starter = createStarterInvoice(readStoredSender());
          setInvoices([starter]);
          setSelectedId(starter.id);
          saveToLocalStorage([starter]);
          showToast('Invoice deleted. A blank invoice is ready.');
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
    if (!activeInvoice) return;
    const updated = invoices.map(i => i.id === activeInvoice.id ? { ...i, updatedAt: Date.now() } : i);
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
    <div className="app-ui flex flex-col h-screen bg-[var(--canvas)] text-[var(--ink)] overflow-hidden font-sans">
      
      {/* Aesthetic Brand Preloader */}
      {isInitialLoading && (
        <div className={`fixed inset-0 bg-[var(--ink)] z-100 flex items-center justify-center transition-all duration-300 ease-in-out ${isFadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center text-3xl sm:text-5xl font-bold tracking-tight text-white select-none">
            <span>Invo</span>
            <span className="relative inline-block">
              ı
              <span className="absolute top-2 sm:top-2.5 left-1 sm:left-1 w-1.5 sm:w-1.75 h-1.5 sm:h-1.75 bg-white rounded-xs animate-dotBounce"></span>
            </span>
            <span>cely</span>
            <span className="font-light text-slate-300 ml-2">Studio</span>
          </div>
        </div>
      )}

      {/* Dynamic Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-[var(--accent)] border border-[var(--line)] pl-4 pr-3 py-2.5 rounded-xl shadow-xl shadow-slate-950/25 z-50 flex items-center space-x-2.5 text-xs font-semibold text-white tracking-wide animate-slideUp select-none min-w-50 justify-between">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span className="max-w-55 sm:max-w-xs truncate">{toastMessage}</span>
          </div>
          <button 
            type="button"
            onClick={dismissToast}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer shrink-0 ml-1.5 focus:outline-none"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main SaaS App Bar Header */}
      <header className="h-14 bg-[var(--chrome)] text-[var(--chrome-fg)] flex items-center justify-between px-3 sm:px-5 border-b border-[var(--line)] shrink-0 z-20 no-print">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Mobile Hamburger toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-[var(--accent-soft)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer shrink-0"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center min-w-0 select-none">
            <div className="flex items-center min-w-0">
              <div className="hidden sm:flex items-center text-base sm:text-lg font-bold tracking-tight text-[var(--ink)] mr-1 sm:mr-2 shrink-0">
                <span>Invo</span>
                <span className="relative inline-block">
                  ı
                  <span className="absolute top-1 left-0.5 w-1 h-1 bg-[var(--accent)] rounded-xs"></span>
                </span>
                <span>cely</span>
                <span className="font-light text-[var(--muted)] ml-1.5">Studio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global actions: Switcher & Operations */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">

          {/* Command Palette Trigger (Cmd+K) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center space-x-2 h-9 px-3 bg-[var(--surface-muted)] hover:bg-[var(--accent-soft)] text-[var(--muted)] rounded-lg border border-[var(--line)] text-xs transition-all cursor-pointer shrink-0"
            title="Open Command Palette (Cmd+K)"
          >
            <Search className="w-4 h-4 text-[var(--accent-text)]" />
            <span className="text-[var(--ink)] text-xs font-medium">Search</span>
          </button>

          {/* Financial Analytics Summary Toggle */}
          <button
            onClick={() => setIsAnalyticsDashboardOpen(prev => !prev)}
            className={`flex items-center justify-center h-9 w-9 rounded-lg border transition-all cursor-pointer shrink-0 ${
              isAnalyticsDashboardOpen 
                ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)]' 
                : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]'
            }`}
            title="Toggle Financial Metrics Summary"
          >
            <PieChart className="w-4 h-4" />
          </button>

          {/* Accessibility Settings Menu Trigger */}
          <button
            onClick={() => setIsA11yMenuOpen(prev => !prev)}
            className={`flex items-center justify-center h-9 w-9 rounded-lg border transition-all cursor-pointer shrink-0 ${
              isA11yMenuOpen 
                ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)]' 
                : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]'
            }`}
            title="Accessibility & Preferences"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setAppTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="flex items-center justify-center h-9 w-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] rounded-lg border border-[var(--accent)] transition-all cursor-pointer shrink-0"
            title="Toggle Theme"
          >
            {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile View Tabs (Form vs Preview) */}
          <div className="flex lg:hidden bg-[var(--surface-muted)] p-0.5 h-9 rounded-lg border border-[var(--line)] shrink-0 items-center">
            <button
              onClick={() => setActiveMobileView('edit')}
              className={`p-1.5 rounded transition-all cursor-pointer ${activeMobileView === 'edit' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'text-[var(--muted)]'}`}
              title="Editor"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveMobileView('preview')}
              className={`p-1.5 rounded transition-all cursor-pointer ${activeMobileView === 'preview' ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'text-[var(--muted)]'}`}
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic react-pdf Download Link Trigger (Lazy Loaded) */}
          {activeInvoice && (
            <Suspense fallback={
              <div className="flex items-center justify-center h-9 px-3 bg-[var(--surface-muted)] rounded-lg text-sm border border-[var(--line)] text-[var(--muted)] shrink-0 select-none animate-pulse">
                <Download className="w-4 h-4 text-[var(--accent-text)]/60" />
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
                className={`flex items-center justify-center h-9 px-2.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  isLayoutSettingsOpen 
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)]' 
                    : 'bg-[var(--surface)] border-[var(--line)] text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]'
                }`}
                title="PDF Layout Settings"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden md:inline ml-1.5 text-xs font-semibold">PDF Layout</span>
              </button>

              {isLayoutSettingsOpen && (
                <div 
                  id="pdf-layout-settings-panel"
                  className="absolute right-0 mt-2 w-72 bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] rounded-xl shadow-2xl p-4 z-50 animate-slideDown"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">PDF Output Settings</h4>
                    <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent-text)] font-mono px-1.5 py-0.5 rounded font-semibold">A4 / Letter</span>
                  </div>

                  <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-4">
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
                            ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)] shadow-md shadow-[var(--accent)]/15'
                            : 'bg-[var(--surface-muted)] border-[var(--line)] hover:bg-[var(--accent-soft)] text-[var(--ink)]'
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
                            ? 'bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)] shadow-md shadow-[var(--accent)]/15'
                            : 'bg-[var(--surface-muted)] border-[var(--line)] hover:bg-[var(--accent-soft)] text-[var(--ink)]'
                        }`}
                      >
                        <span className="text-xs">Compact</span>
                        <span className="text-[9px] font-normal opacity-85">Prevent Overlaps</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Active PDF preset:</span>
                    <strong className="text-[var(--ink)] uppercase font-mono font-bold">
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
            className="flex items-center justify-center h-9 w-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] rounded-lg shadow-lg shadow-[var(--accent)]/20 transition-all cursor-pointer shrink-0"
            title="Save Invoice"
          >
            <Save className="w-4 h-4 text-[var(--on-accent)]" />
          </button>
        </div>
      </header>

      {/* Financial Analytics Summary Drawer */}
      <AnalyticsDashboard
        invoices={invoices}
        isOpen={isAnalyticsDashboardOpen}
        onToggle={() => setIsAnalyticsDashboardOpen(!isAnalyticsDashboardOpen)}
      />

      {/* Main SaaS Workspace Block */}
      <main className="flex-1 flex relative overflow-hidden">
        
        {/* SIDEBAR: Registry Invoices List (Collapsible on mobile) */}
        <div 
          className={`
            absolute inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] bg-[var(--surface)] z-30 transform transition-transform duration-200 lg:relative lg:translate-x-0 no-print
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
            flex-1 min-w-0 h-full overflow-hidden no-print bg-[var(--surface)]
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
                onOpenPresets={() => setIsItemPresetsModalOpen(true)}
              />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 bg-[var(--surface)]">
              <AlertCircle className="w-12 h-12 text-[var(--on-accent)]" />
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No Invoice Selected</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select an existing invoice from the registry or create a new one.</p>
              </div>
              <button onClick={handleNewInvoice} className="px-4 py-1.5 bg-[var(--accent)] text-white rounded text-xs font-semibold">
                Create First Invoice
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HTML Live Preview (Visible on laptop, or active preview mobile tab) */}
        <div 
          className={`
            flex-1 xl:flex-none xl:w-[34rem] 2xl:w-[40rem] min-w-0 h-full overflow-hidden border-l border-[var(--line)] bg-[var(--preview)]
            ${activeMobileView === 'preview' ? 'block' : 'hidden lg:block'}
          `}
        >
          {activeInvoice ? (
            <Suspense fallback={<InvoicePreviewSkeleton />}>
              <InvoicePreview invoice={activeInvoice} />
            </Suspense>
          ) : (
            <div className="flex items-center justify-center h-full bg-[var(--preview)] text-gray-500 dark:text-gray-400 text-xs">
              Preview is empty
            </div>
          )}
        </div>

      </main>

      {/* Version 3.0 Mobile Bottom Navigation Dock */}
      <nav className="lg:hidden h-14 bg-[var(--chrome)] border-t border-[var(--line)] text-[var(--ink)] flex items-center justify-around px-2 shrink-0 z-30 no-print select-none">
        {/* 1. Sidebar Registry Toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--muted)] hover:text-[var(--ink)] transition-colors relative cursor-pointer"
          title="Invoice Registry"
        >
          <div className="relative">
            <FileText className="w-4 h-4" />
            <span className="absolute -top-1 -right-2 bg-[var(--accent)] text-[var(--on-accent)] text-[8px] font-black px-1 rounded-full">
              {invoices.length}
            </span>
          </div>
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Invoices</span>
        </button>

        {/* 2. Form Editor Tab */}
        <button
          onClick={() => setActiveMobileView('edit')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer relative ${
            activeMobileView === 'edit' ? 'text-[var(--accent-text)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          title="Invoice Editor"
        >
          <Edit className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Editor</span>
          {activeMobileView === 'edit' && (
            <span className="absolute top-0 w-6 h-0.5 rounded-full bg-[var(--accent)]"></span>
          )}
        </button>

        {/* 3. Live Preview Tab */}
        <button
          onClick={() => setActiveMobileView('preview')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer relative ${
            activeMobileView === 'preview' ? 'text-[var(--accent-text)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
          title="Live Preview"
        >
          <Eye className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Preview</span>
          {activeMobileView === 'preview' && (
            <span className="absolute top-0 w-6 h-0.5 rounded-full bg-[var(--accent)]"></span>
          )}
        </button>

        {/* 4. Catalog Presets Trigger */}
        <button
          onClick={() => setIsItemPresetsModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          title="Service Catalog Presets"
        >
          <Layers className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Catalog</span>
        </button>

        {/* 5. Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          title="Search & Commands"
        >
          <Search className="w-4 h-4" />
          <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Search</span>
        </button>
      </nav>

      {/* Sleek footer */}
      <footer className="hidden sm:flex h-9 bg-[var(--chrome)] border-t border-[var(--line)] items-center justify-between px-6 shrink-0 z-20 no-print text-[var(--muted)] gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Copyright © 2026 Invoicely Studio</span>
        </div>
        
        <div className="flex gap-4 items-center">
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Shortcuts: ⌘K Command Palette | ? Accessibility</span>
        </div>
      </footer>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        invoices={invoices}
        onSelectInvoice={(id) => {
          setSelectedId(id);
          setIsSidebarOpen(false);
        }}
        onNewInvoice={handleNewInvoice}
        onSaveInvoice={handleSave}
        onLoadDemo={handleLoadDemo}
        onToggleTheme={() => setAppTheme(prev => prev === 'light' ? 'dark' : 'light')}
        appTheme={appTheme}
        a11y={a11y}
        onUpdateA11y={handleUpdateA11y}
        onExportBackup={() => {
          const dataStr = JSON.stringify(invoices, null, 2);
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `InvoicelyStudio_Backup_${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      />

      {/* Accessibility Menu */}
      <AccessibilityMenu
        isOpen={isA11yMenuOpen}
        onClose={() => setIsA11yMenuOpen(false)}
        a11y={a11y}
        onUpdateA11y={handleUpdateA11y}
      />

      {/* Service Items Preset Catalog Modal */}
      <ItemPresetsModal
        isOpen={isItemPresetsModalOpen}
        onClose={() => setIsItemPresetsModalOpen(false)}
        onAddItem={handleAddItemFromPreset}
        currency={activeInvoice?.currency}
      />

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn no-print">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-left">
            <h3 className="text-sm font-bold text-[var(--ink)] dark:text-white flex items-center gap-2">
              <AlertCircle className={`w-4 h-4 ${confirmModal.isDestructive ? 'text-rose-500' : 'text-[var(--accent-text)]'}`} />
              <span>{confirmModal.title}</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2.5 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end space-x-2.5 mt-5">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 border border-[var(--line)] bg-[var(--surface)] hover:bg-gray-100 hover:bg-[var(--surface-muted)] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-white shadow-md ${
                  confirmModal.isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                    : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--ink)] font-extrabold shadow-[var(--accent)]/20'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn no-print">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--line)] max-w-sm w-full p-6 shadow-2xl animate-scaleUp text-left">
            <h3 className="text-sm font-bold text-[var(--ink)] dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--accent-text)]" />
              <span>{alertModal.title}</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2.5 leading-relaxed">{alertModal.message}</p>
            <div className="flex items-center justify-end mt-5">
              <button
                type="button"
                onClick={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[var(--accent)]/20"
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
