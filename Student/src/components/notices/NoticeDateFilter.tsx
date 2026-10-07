import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface NoticeDateFilterProps {
  selectedDate?: string; // YYYY-MM-DD
  onSelectDate: (date?: string) => void;
  availableDates?: string[]; // Array of date strings from notices
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const normalizeDateToKey = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatDateForDisplay = (dateKey: string): string => {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const NoticeDateFilter: React.FC<NoticeDateFilterProps> = ({
  selectedDate,
  onSelectDate,
  availableDates = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [calYear, setCalYear] = useState<number>(() => {
    if (selectedDate) {
      const [y] = selectedDate.split('-').map(Number);
      if (y) return y;
    }
    return new Date().getFullYear();
  });

  const [calMonth, setCalMonth] = useState<number>(() => {
    if (selectedDate) {
      const [, m] = selectedDate.split('-').map(Number);
      if (m) return m - 1;
    }
    return new Date().getMonth();
  });

  // Sync calendar when selectedDate updates
  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (y && m) {
        setCalYear(y);
        setCalMonth(m - 1);
      }
    }
  }, [selectedDate]);

  // Handle outside clicks to close calendar popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((prev) => prev - 1);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((prev) => prev + 1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(key);
    setIsOpen(false);
  };

  const handleClearDate = () => {
    onSelectDate(undefined);
    setIsOpen(false);
  };

  // Find dates in the current month with notices
  const activeDatesInMonth = useMemo(() => {
    const set = new Set<number>();
    availableDates.forEach((dateStr) => {
      const key = normalizeDateToKey(dateStr);
      if (key) {
        const [y, m, d] = key.split('-').map(Number);
        if (y === calYear && m - 1 === calMonth) {
          set.add(d);
        }
      }
    });
    return set;
  }, [availableDates, calYear, calMonth]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Date Filter Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3 py-1.5 text-xs sm:text-sm border rounded-sm focus:outline-none focus:ring-1 focus:ring-[#003c84] transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs ${
          selectedDate
            ? 'border-[#003c84] text-[#00275a] font-semibold bg-[#003c84]/10'
            : 'border-[#e2e6ec] bg-white text-[#434751] hover:border-[#cbd5e1] hover:text-[#1c1b1b]'
        }`}
        aria-label="Filter notices by date"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <CalendarIcon
            className={`w-3.5 h-3.5 shrink-0 ${selectedDate ? 'text-[#003c84]' : 'text-[#737782]'}`}
          />
          <span className="truncate">
            {selectedDate ? formatDateForDisplay(selectedDate) : 'Filter by Date'}
          </span>
        </div>

        {selectedDate ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleClearDate();
            }}
            className="p-0.5 hover:bg-[#003c84]/20 text-[#003c84] rounded transition-colors cursor-pointer shrink-0"
            title="Clear date filter"
          >
            <X className="w-3.5 h-3.5 block" />
          </span>
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-[#737782] shrink-0 rotate-90" />
        )}
      </button>

      {/* Calendar Dropdown Popup (Matches Admin Portal workbench design & behavior) */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1.5 z-50 bg-white border border-[#e2e6ec] rounded-lg shadow-xl p-3 w-[280px] max-w-[calc(100vw-2rem)] text-[#1c1b1b] animate-in fade-in duration-150">
          {/* Calendar Header with Month/Year Navigation */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e2e6ec]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-[#737782] hover:text-[#00275a] hover:bg-[#f0eded] rounded transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#00275a]">
              {MONTH_NAMES[calMonth]} {calYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-[#737782] hover:text-[#00275a] hover:bg-[#f0eded] rounded transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-semibold text-[#5c6470] uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dayKey;
              const hasNotices = activeDatesInMonth.has(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 text-xs rounded flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
                    isSelected
                      ? 'bg-[#00275a] text-white font-bold shadow-xs'
                      : 'hover:bg-[#f0f4fd] hover:text-[#00275a] text-[#1c1b1b]'
                  }`}
                >
                  <span>{day}</span>
                  {hasNotices && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#003c84] absolute bottom-1"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer with Clear Action */}
          <div className="mt-2.5 pt-2 border-t border-[#e2e6ec] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleClearDate}
              className="text-[#003c84] hover:text-[#00275a] font-semibold hover:underline transition-colors cursor-pointer"
            >
              All Dates
            </button>
            <span className="text-[11px] text-[#5c6470]">
              {selectedDate ? 'Filtered' : 'Showing all'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
