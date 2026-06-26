/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Invoice, AppSettings } from './types';
import { sampleInvoicesList } from './data/sampleInvoice';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceList } from './components/InvoiceList';
import { InvoicePDFDocument } from './components/InvoicePDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
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
  Eye
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
    paymentDetails: ''
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
    shippingFee: 0,
    notes: defaultSender?.notes || 'Thank you for your business!',
    terms: defaultSender?.terms || 'Payment is due within 14 days of issue.',
    theme: {
      primaryColor: '#0f766e', // Deep Teal
      accentColor: '#b45309',  // Gold
      fontFamily: 'Inter',
      templateId: 'teal'
    },
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
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // --- INVOICE ACTIONS ---

  const handleInvoiceChange = (updated: Invoice) => {
    const updatedInvoices = invoices.map((inv) => (inv.id === updated.id ? updated : inv));
    setInvoices(updatedInvoices);
    saveToLocalStorage(updatedInvoices);
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
      paymentDetails: ''
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
          paymentDetails: parsed.paymentDetails || ''
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
        paymentDetails: ''
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
      notes,
      terms,
      theme: {
        primaryColor: '#0f766e', // Deep Teal
        accentColor: '#b45309',  // Gold
        fontFamily: 'Inter',
        templateId: 'teal'
      },
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
    setInvoices(updated);
    saveToLocalStorage(updated);
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
            <span>ce</span>
            <span className="font-light text-slate-300 ml-2">Studio</span>
          </div>
        </div>
      )}

      {/* Dynamic Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-[#0D2C2C] border border-[#1A3F3F] px-5 py-3 rounded-lg shadow-xl shadow-slate-950/20 z-50 flex items-center space-x-3 text-sm font-semibold text-white tracking-wide animate-slideUp">
          <CheckCircle className="w-5 h-5 text-[#C69A5D]" />
          <span>{toastMessage}</span>
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
                <span>ce</span>
                <span className="font-light text-slate-300 ml-1.5">Studio</span>
              </div>
              <div className="h-4 w-px bg-white/20 mx-2 hidden lg:block"></div>
              <span className="text-xs text-gray-400 font-medium truncate hidden lg:block max-w-[150px] xl:max-w-none">Workspace / Global Digital Agency</span>
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

          {/* Dynamic react-pdf Download Link Trigger */}
          <PDFDownloadLink
            key={`${activeInvoice?.id}-${activeInvoice?.updatedAt}`}
            document={<InvoicePDFDocument invoice={activeInvoice} />}
            fileName={`Invoice_${activeInvoice?.invoiceNumber || 'draft'}.pdf`}
            className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10 transition-colors text-white cursor-pointer shrink-0"
            title="Export PDF"
          >
            {({ loading }) => (
              <div className="flex items-center">
                <Download className="w-4 h-4 text-[#C69A5D]" />
                <span className="hidden sm:inline ml-1.5 text-xs font-semibold">{loading ? 'Compiling...' : 'Export PDF'}</span>
              </div>
            )}
          </PDFDownloadLink>

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
            <InvoicePreview invoice={activeInvoice} />
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
          <span className="text-[10px] text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            All changes saved locally
          </span>
        </div>
        
        <div className="flex gap-4">
          <span className="text-[10px] text-gray-500 font-medium">v2.4.2-stable</span>
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
