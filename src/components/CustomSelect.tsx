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
        className={`w-full flex items-center justify-between bg-white dark:bg-[#0B1B1B] border rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-[#0D2C2C] dark:focus:ring-[#C69A5D] transition-all cursor-pointer text-left ${
          disabled 
            ? 'bg-gray-100/80 dark:bg-[#1A3F3F]/50 border-gray-100 dark:border-[#1A3F3F] text-gray-400 dark:text-gray-500 cursor-not-allowed select-none' 
            : 'border-gray-200 dark:border-[#1A3F3F] hover:border-gray-300 dark:hover:border-[#1A3F3F] focus:border-[#0D2C2C] dark:focus:border-[#C69A5D]'
        } ${className}`}
      >
        <span className="truncate font-medium">{selectedOption?.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0 ml-1.5" />
      </button>

      {isOpen && !disabled && (
        <div 
          className={`absolute z-100 left-0 right-0 max-h-60 overflow-y-auto bg-white dark:bg-[#0B1B1B] border border-gray-200 dark:border-[#1A3F3F] rounded-lg shadow-xl py-1 text-xs divide-y divide-gray-50 dark:divide-[#1A3F3F] animate-fadeIn ${
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
              className={`w-full text-left px-3 py-2 hover:bg-[#0D2C2C]/5 dark:hover:bg-[#1A3F3F] transition-colors focus:outline-none flex flex-col ${
                option.value === value ? 'bg-[#0D2C2C]/5 dark:bg-[#1A3F3F] font-semibold text-[#0D2C2C] dark:text-[#C69A5D]' : 'text-gray-700 dark:text-gray-200'
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
