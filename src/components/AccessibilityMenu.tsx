/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccessibilitySettings } from '../types';
import { 
  Type, 
  Contrast, 
  Eye, 
  Keyboard, 
  X, 
  Check, 
  ShieldCheck, 
  Command
} from 'lucide-react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
  a11y: AccessibilitySettings;
  onUpdateA11y: (updates: Partial<AccessibilitySettings>) => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  isOpen,
  onClose,
  a11y,
  onUpdateA11y
}) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4 sm:pr-6 bg-black/40 backdrop-blur-xs animate-fadeIn no-print"
        onClick={onClose}
        role="dialog"
        aria-label="Accessibility & Preferences"
      >
        <div 
          className="w-full max-w-sm bg-[#0D2C2C] border border-[#1A3F3F] text-white rounded-2xl shadow-2xl overflow-hidden animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#1A3F3F] bg-[#0A2323]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C69A5D]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Accessibility & Ease of Access</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            
            {/* 1. Font Size Scaling */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Type className="w-3.5 h-3.5 text-[#C69A5D]" /> Text Scaling</span>
                <span className="font-mono text-[#C69A5D] capitalize">{a11y.fontScale}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: '100% Normal' },
                  { id: 'large', label: '115% Large' },
                  { id: 'xlarge', label: '125% Extra' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onUpdateA11y({ fontScale: option.id as any })}
                    className={`py-2 px-2 rounded-xl text-center border text-[11px] font-semibold transition-all cursor-pointer ${
                      a11y.fontScale === option.id 
                        ? 'bg-[#C69A5D] text-[#0D2C2C] border-[#C69A5D] shadow-sm font-bold' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. High Contrast Boost */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="pr-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-[#C69A5D]" />
                  <span>High Contrast Boost</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Enhance border lines and text visibility for low vision.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateA11y({ highContrast: !a11y.highContrast })}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                  a11y.highContrast ? 'bg-[#C69A5D]' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#0D2C2C] transform transition-transform ${a11y.highContrast ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 3. Colorblind Badge Glyphs */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="pr-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#C69A5D]" />
                  <span>Colorblind Status Glyphs</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Show distinct shape icons alongside badge colors.</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdateA11y({ colorblindIcons: !a11y.colorblindIcons })}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                  a11y.colorblindIcons ? 'bg-[#C69A5D]' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#0D2C2C] transform transition-transform ${a11y.colorblindIcons ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* 4. Keyboard Shortcuts Sheet Button */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0A2323] hover:bg-[#123636] border border-[#1A3F3F] text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Keyboard className="w-4 h-4 text-[#C69A5D]" />
                <span className="font-semibold">Keyboard Shortcuts Guide</span>
              </div>
              <span className="text-[10px] text-[#C69A5D] font-mono">Press ?</span>
            </button>

          </div>

          <div className="px-4 py-3 border-t border-[#1A3F3F] bg-[#0A2323] text-center text-[10px] text-slate-400">
            InvoiceStudio Accessibility & Preferences
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0D2C2C] border border-[#1A3F3F] text-white rounded-2xl shadow-2xl p-5 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1A3F3F]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#C69A5D]" />
                <span>Keyboard Shortcuts Reference</span>
              </h3>
              <button 
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { shortcut: '⌘S / Ctrl+S', description: 'Save current active invoice' },
                { shortcut: '⌘K / Ctrl+K', description: 'Open Quick Command Palette' },
                { shortcut: 'Esc', description: 'Close modals, drawers & command palette' },
                { shortcut: 'Tab', description: 'Navigate focusable form controls' },
                { shortcut: 'Shift + Tab', description: 'Navigate back to previous control' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-300">{item.description}</span>
                  <kbd className="text-[#C69A5D] font-mono font-bold">{item.shortcut}</kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2 bg-[#C69A5D] text-[#0D2C2C] font-bold rounded-xl text-xs hover:bg-[#b5894d] transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
