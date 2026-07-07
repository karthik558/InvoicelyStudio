/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
  align?: 'left' | 'right';
}

export function DatePicker({ value, onChange, label, className = '', align = 'left' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const currentDate = useMemo(() => {
    if (!value) return new Date();
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    return new Date();
  }, [value]);

  // View state (which month we are looking at)
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth()); // 0-11

  // Update view month/year if selected date changes from outside
  useEffect(() => {
    setViewYear(currentDate.getFullYear());
    setViewMonth(currentDate.getMonth());
  }, [currentDate]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate days to display in the calendar grid
  const gridCells = useMemo(() => {
    const cells = [];
    
    // First day of current month (0 = Sunday, 6 = Saturday)
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    
    // Number of days in current month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    
    // Number of days in previous month
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    
    // 1. Add days from previous month to fill the first row
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      // Previous month's year/month
      let pm = viewMonth - 1;
      let py = viewYear;
      if (pm < 0) {
        pm = 11;
        py -= 1;
      }
      cells.push({
        day: d,
        month: pm,
        year: py,
        isCurrentMonth: false,
      });
    }
    
    // 2. Add days of the current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }
    
    // 3. Add days of the next month to pad the grid to multiples of 7
    const remainingCells = 42 - cells.length; // 6 rows of 7 days = 42
    for (let d = 1; d <= remainingCells; d++) {
      let nm = viewMonth + 1;
      let ny = viewYear;
      if (nm > 11) {
        nm = 0;
        ny += 1;
      }
      cells.push({
        day: d,
        month: nm,
        year: ny,
        isCurrentMonth: false,
      });
    }
    
    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleSelectDay = (cell: { day: number; month: number; year: number }) => {
    const dateString = `${cell.year}-${pad(cell.month + 1)}-${pad(cell.day)}`;
    onChange(dateString);
    setIsOpen(false);
  };

  // Helper to check if a grid cell represents the selected date
  const isSelected = (cell: { day: number; month: number; year: number }) => {
    return (
      cell.day === currentDate.getDate() &&
      cell.month === currentDate.getMonth() &&
      cell.year === currentDate.getFullYear()
    );
  };

  // Helper to check if a grid cell is today
  const isToday = (cell: { day: number; month: number; year: number }) => {
    const today = new Date();
    return (
      cell.day === today.getDate() &&
      cell.month === today.getMonth() &&
      cell.year === today.getFullYear()
    );
  };

  // Format date for the button display: "MMMM D, YYYY"
  const formattedButtonText = useMemo(() => {
    if (!value) return 'Select date';
    const parts = value.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    return value;
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-50 dark:bg-[#0A2323] border border-gray-200 dark:border-[#1A3F3F] hover:border-gray-300 dark:hover:border-[#1A3F3F] focus:border-[#0D2C2C] dark:focus:border-[#C69A5D] focus:bg-white dark:focus:bg-[#0B1B1B] dark:bg-[#0B1B1B] rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-gray-200 outline-none transition-all focus:ring-1 focus:ring-[#0D2C2C] dark:focus:ring-[#C69A5D] text-left cursor-pointer shadow-sm"
      >
        <span className="truncate font-medium">{formattedButtonText}</span>
        <CalendarIcon className="w-3.5 h-3.5 text-[#C69A5D] ml-2 shrink-0" />
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-1.5 w-64 bg-white dark:bg-[#0B1B1B] border border-gray-200/90 dark:border-[#1A3F3F] rounded-xl shadow-xl z-[150] p-3 animate-fadeIn select-none ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {/* Calendar Header: Month & Year & Chevrons */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#1A3F3F] dark:bg-[#1A3F3F] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {months[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#1A3F3F] dark:bg-[#1A3F3F] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1">
            {daysOfWeek.map(day => (
              <div key={day} className="py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Grid of Days */}
          <div className="grid grid-cols-7 gap-px bg-gray-50 dark:bg-[#0A2323] rounded-lg overflow-hidden border border-gray-100 dark:border-[#1A3F3F]">
            {gridCells.map((cell, idx) => {
              const selected = isSelected(cell);
              const today = isToday(cell);
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell)}
                  className={`
                    py-1.5 text-[11px] text-center font-medium transition-all relative cursor-pointer outline-none focus:z-10
                    ${cell.isCurrentMonth ? 'bg-white dark:bg-[#0B1B1B] text-gray-800 dark:text-gray-200' : 'bg-gray-50/60 dark:bg-[#0A2323]/80 text-gray-300 dark:text-gray-600'}
                    ${selected 
                      ? 'bg-[#0D2C2C]! text-white! font-bold rounded-md shadow-sm z-10' 
                      : 'hover:bg-gray-100 dark:hover:bg-[#1A3F3F] dark:bg-[#1A3F3F] hover:text-[#0D2C2C] dark:hover:text-[#C69A5D] hover:rounded-md'
                    }
                  `}
                >
                  {cell.day}
                  {today && !selected && (
                    <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#C69A5D] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick selectors for convenience / premium feel */}
          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#1A3F3F] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-[#C69A5D] hover:text-[#B5894D] transition-colors uppercase tracking-wider cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
                onChange(tomStr);
                setIsOpen(false);
              }}
              className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 dark:text-gray-200 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
