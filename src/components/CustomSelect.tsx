/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  disabled?: boolean;
  openDirection?: 'top' | 'bottom';
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
  openDirection = 'bottom',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[var(--surface)] border rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[var(--accent)] dark:focus:ring-[var(--accent)] transition-all cursor-pointer text-left ${
          disabled 
            ? 'bg-gray-100/80 bg-[var(--surface-muted)]/50 border-[var(--line)] text-gray-400 dark:text-gray-500 cursor-not-allowed select-none' 
            : 'border-[var(--line)] hover:border-gray-300 dark:hover:border-[var(--line)] focus:border-[var(--accent)] dark:focus:border-[var(--accent)]'
        } ${className}`}
      >
        <span className="truncate font-medium">{selectedOption?.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0 ml-1.5" />
      </button>

      {isOpen && !disabled && (
        <div 
          className={`absolute z-100 left-0 right-0 max-h-60 overflow-y-auto bg-[var(--surface)] border border-[var(--line)] rounded-lg shadow-xl py-1 text-xs divide-y divide-gray-50 dark:divide-[#1A3F3F] animate-fadeIn ${
            openDirection === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 hover:bg-[var(--accent)]/5 hover:bg-[var(--surface-muted)] transition-colors focus:outline-none flex flex-col ${
                option.value === value ? 'bg-[var(--accent)]/5 bg-[var(--surface-muted)] font-semibold text-[var(--on-accent)] text-[var(--accent-text)]' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <span>{option.label}</span>
              {option.subLabel && <span className="text-[9px] text-gray-400 dark:text-gray-500 font-normal">{option.subLabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
