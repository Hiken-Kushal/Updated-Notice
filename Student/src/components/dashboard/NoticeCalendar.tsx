import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import type { Notice } from '../../types/notice';

interface NoticeCalendarProps {
  notices: Notice[];
  onSelectNotice: (id: string) => void;
}

// Category styling map for Google Calendar-style event chips
const getCategoryStyles = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('exam')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-l-amber-500',
      dot: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      name: 'Examination',
    };
  }
  if (cat.includes('placement')) {
    return {
      bg: 'bg-blue-50',
      text: 'text-[#00275a]',
      border: 'border-l-[#003c84]',
      dot: 'bg-[#003c84]',
      badge: 'bg-blue-100 text-[#00275a] border-blue-200',
      name: 'Placement',
    };
  }
  if (cat.includes('academic')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-l-emerald-500',
      dot: 'bg-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      name: 'Academic',
    };
  }
  if (cat.includes('event') || cat.includes('sport')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-l-purple-500',
      dot: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      name: 'Events',
    };
  }
  if (cat.includes('admin')) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-l-indigo-500',
      dot: 'bg-indigo-600',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      name: 'Administrative',
    };
  }
  return {
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-l-slate-400',
    dot: 'bg-slate-500',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    name: 'General',
  };
};

/**
 * Normalizes different date strings into { year, month, day }
 * Supports 'Today', 'Yesterday', 'Oct 24, 2023', 'October 24', ISO strings, etc.
 * Normalizes mock years (< 2025) to current year so they show in the live calendar.
 */
function parseNoticeDate(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. "Today..."
  if (/^today/i.test(trimmed)) {
    return {
      year: now.getFullYear(),
      month: now.getMonth(), // 0-indexed
      day: now.getDate(),
    };
  }

  // 2. "Yesterday..."
  if (/^yesterday/i.test(trimmed)) {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    return {
      year: yest.getFullYear(),
      month: yest.getMonth(),
      day: yest.getDate(),
    };
  }

  // 3. "Tomorrow..."
  if (/^tomorrow/i.test(trimmed)) {
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    return {
      year: tom.getFullYear(),
      month: tom.getMonth(),
      day: tom.getDate(),
    };
  }

  // 4. Standard Date.parse
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const yr = parsed.getFullYear();
    return {
      year: yr < 2025 ? currentYear : yr,
      month: parsed.getMonth(),
      day: parsed.getDate(),
    };
  }

  // 5. Regex for "Oct 24, 2023" or "October 24"
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };

  const match = trimmed.match(/([a-zA-Z]+)\s+(\d{1,2})(?:[,\s]+(\d{4}))?/);
  if (match) {
    const mKey = match[1].toLowerCase().slice(0, 3);
    const day = parseInt(match[2], 10);
    const yr = match[3] ? parseInt(match[3], 10) : currentYear;
    if (monthMap[mKey] !== undefined) {
      return {
        year: yr < 2025 ? currentYear : yr,
        month: monthMap[mKey],
        day,
      };
    }
  }

  return null;
}

export const NoticeCalendar: React.FC<NoticeCalendarProps> = ({ notices, onSelectNotice }) => {
  const today = useMemo(() => new Date(), []);
  
  // Current month being viewed in calendar
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Selected date key (YYYY-MM-DD) for inspector
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Popover modal for days with multiple events
  const [modalDateKey, setModalDateKey] = useState<string | null>(null);

  // Map notices by YYYY-MM-DD date key
  const noticesByDate = useMemo(() => {
    const map: Record<string, Notice[]> = {};
    notices.forEach((notice) => {
      const parsed = parseNoticeDate(notice.date);
      if (parsed) {
        const key = `${parsed.year}-${String(parsed.month + 1).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`;
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push(notice);
      }
    });
    return map;
  }, [notices]);

  // Current month details
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
  };

  // Generate 7x5 or 7x6 month grid cells
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: {
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      notices: Notice[];
    }[] = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonthDate = new Date(viewYear, viewMonth - 1, day);
      const key = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateKey: key,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        notices: noticesByDate[key] || [],
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateKey: key,
        isCurrentMonth: true,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        notices: noticesByDate[key] || [],
      });
    }

    // Next month trailing days to complete full grid (multiples of 7)
    const remainingDays = 7 - (cells.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonthDate = new Date(viewYear, viewMonth + 1, day);
        const key = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cells.push({
          dayNumber: day,
          dateKey: key,
          isCurrentMonth: false,
          isToday: key === todayKey,
          isSelected: key === selectedDateKey,
          notices: noticesByDate[key] || [],
        });
      }
    }

    return cells;
  }, [viewYear, viewMonth, todayKey, selectedDateKey, noticesByDate]);

  // Count total notices in the displayed month
  const monthNoticesCount = useMemo(() => {
    return calendarCells
      .filter((c) => c.isCurrentMonth)
      .reduce((sum, c) => sum + c.notices.length, 0);
  }, [calendarCells]);

  // Selected date notices
  const selectedNotices = noticesByDate[selectedDateKey] || [];
  const selectedDateFormatted = useMemo(() => {
    const parts = selectedDateKey.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return selectedDateKey;
  }, [selectedDateKey]);

  // Modal notices for overflow day
  const modalNotices = modalDateKey ? (noticesByDate[modalDateKey] || []) : [];
  const modalDateFormatted = useMemo(() => {
    if (!modalDateKey) return '';
    const parts = modalDateKey.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return modalDateKey;
  }, [modalDateKey]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Calendar Card */}
      <div className="bg-white border border-[#e2e6ec] rounded-lg shadow-2xs overflow-hidden flex flex-col">
        {/* Calendar Header with Navigation */}
        <div className="p-3 sm:p-4 bg-[#f8fafc] border-b border-[#e2e6ec] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-[#003c84]/10 text-[#003c84] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-[#003c84]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1c1b1b] flex items-center gap-2">
                <span>{monthName}</span>
                <span className="text-[10px] text-[#003c84] bg-blue-50 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  {monthNoticesCount} {monthNoticesCount === 1 ? 'Notice' : 'Notices'}
                </span>
              </h3>
              <p className="text-[11px] text-[#5c6470] hidden xs:block">
                Circular & Academic Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleGoToToday}
              className="px-2.5 py-1 text-xs font-semibold text-[#003c84] bg-white border border-[#e2e6ec] hover:bg-[#f1f5f9] rounded-sm transition-colors shadow-2xs cursor-pointer"
              title="Jump to current date"
            >
              Today
            </button>
            <div className="flex items-center bg-white border border-[#e2e6ec] rounded-sm shadow-2xs">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-[#5c6470] hover:text-[#1c1b1b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-[#e2e6ec]" />
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-[#5c6470] hover:text-[#1c1b1b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#e2e6ec] bg-[#f8fafc] text-center text-[11px] font-semibold text-[#5c6470] py-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="truncate px-0.5">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Monthly Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#e2e6ec] bg-[#e2e6ec]/40">
          {calendarCells.map((cell, idx) => {
            const hasNotices = cell.notices.length > 0;
            return (
              <div
                key={`${cell.dateKey}-${idx}`}
                onClick={() => setSelectedDateKey(cell.dateKey)}
                className={`min-h-[66px] sm:min-h-[76px] p-1 sm:p-1.5 flex flex-col justify-start transition-all cursor-pointer relative ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-[#fafbfc]/70 text-[#9aa0a6]'
                } ${
                  cell.isSelected
                    ? 'ring-2 ring-inset ring-[#003c84] bg-blue-50/20'
                    : 'hover:bg-[#f8fafc]'
                }`}
              >
                {/* Date Number Header */}
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className={`text-[11px] sm:text-xs font-semibold inline-flex items-center justify-center ${
                      cell.isToday
                        ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#003c84] text-white shadow-2xs'
                        : cell.isSelected
                        ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#003c84]/15 text-[#003c84]'
                        : cell.isCurrentMonth
                        ? 'text-[#1c1b1b]'
                        : 'text-[#9aa0a6]'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Dot indicator on mobile if space is tight */}
                  {hasNotices && (
                    <span className="xs:hidden flex gap-0.5">
                      {cell.notices.slice(0, 2).map((n, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${getCategoryStyles(n.category).dot}`}
                        />
                      ))}
                    </span>
                  )}
                </div>

                {/* Event Chips Container (Desktop & Tablet) */}
                <div className="hidden xs:flex flex-col gap-1 mt-0.5 min-w-0">
                  {cell.notices.slice(0, 2).map((notice) => {
                    const styles = getCategoryStyles(notice.category);
                    return (
                      <button
                        key={notice.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNotice(notice.id);
                        }}
                        title={`${notice.category}: ${notice.title}`}
                        className={`w-full text-left px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] leading-tight font-medium rounded-xs truncate border-l-2 ${styles.bg} ${styles.text} ${styles.border} hover:opacity-85 transition-opacity cursor-pointer`}
                      >
                        {notice.title}
                      </button>
                    );
                  })}

                  {/* Overflow badge if more than 2 notices on this day */}
                  {cell.notices.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalDateKey(cell.dateKey);
                      }}
                      className="text-[9px] text-[#003c84] font-bold hover:underline text-left px-1 py-0.5 cursor-pointer leading-none"
                    >
                      +{cell.notices.length - 2} more
                    </button>
                  )}
                </div>

                {/* Mobile Single Pill Indicator */}
                {hasNotices && (
                  <div className="xs:hidden mt-auto">
                    <span className="text-[9px] text-[#003c84] font-bold bg-[#003c84]/10 rounded px-1 py-0.2">
                      {cell.notices.length}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtle Category Color Legend */}
        <div className="px-3 py-2 bg-[#f8fafc] border-t border-[#e2e6ec] flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-[#5c6470]">
          <span className="font-semibold text-[#1c1b1b]">Categories:</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#003c84]"></span>
              <span>Placement</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Exam</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Academic</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>Events</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Admin</span>
            </span>
          </div>
        </div>
      </div>

      {/* Selected Day Inspector / Agenda */}
      <div className="bg-white border border-[#e2e6ec] rounded-lg p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e6ec]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#003c84]" />
            <h4 className="text-xs font-bold text-[#1c1b1b] uppercase tracking-wider">
              {selectedDateFormatted}
            </h4>
          </div>
          <span className="text-[11px] text-[#5c6470] font-medium">
            {selectedNotices.length} {selectedNotices.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>

        {selectedNotices.length === 0 ? (
          <div className="py-4 text-center text-[#5c6470]">
            <p className="text-xs">No circulars scheduled for this date.</p>
            <button
              onClick={handleGoToToday}
              className="mt-1.5 text-xs text-[#003c84] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Check Today's Updates <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-[#e2e6ec]">
            {selectedNotices.map((notice) => {
              const styles = getCategoryStyles(notice.category);
              return (
                <li
                  key={notice.id}
                  onClick={() => onSelectNotice(notice.id)}
                  className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 group cursor-pointer hover:bg-[#f8fafc] -mx-2 px-2 rounded-sm transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-xs border ${styles.badge}`}>
                        {notice.category}
                      </span>
                      <span className="text-[10px] text-[#5c6470] truncate">
                        {notice.department}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-[#1c1b1b] group-hover:text-[#003c84] transition-colors line-clamp-2 leading-snug">
                      {notice.title}
                    </h5>
                  </div>
                  <div className="shrink-0 text-[#737782] group-hover:text-[#003c84] group-hover:translate-x-0.5 transition-all self-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Overflow Modal: Shows all notices for a day with many events */}
      {modalDateKey && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="bg-white border border-[#e2e6ec] rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e6ec] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1c1b1b] uppercase tracking-wider">
                  Notices for {modalDateFormatted}
                </h4>
                <p className="text-[11px] text-[#5c6470]">
                  {modalNotices.length} events scheduled
                </p>
              </div>
              <button
                onClick={() => setModalDateKey(null)}
                className="p-1 text-[#737782] hover:text-[#1c1b1b] hover:bg-[#eaeef4] rounded transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto divide-y divide-[#e2e6ec]">
              {modalNotices.map((n) => {
                const styles = getCategoryStyles(n.category);
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      setModalDateKey(null);
                      onSelectNotice(n.id);
                    }}
                    className="py-3 first:pt-0 last:pb-0 hover:bg-[#f8fafc] p-2 rounded cursor-pointer group transition-colors flex items-start gap-2.5"
                  >
                    <div className="mt-1 shrink-0">
                      <span className={`w-2 h-2 rounded-full inline-block ${styles.dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-xs border ${styles.badge}`}>
                          {n.category}
                        </span>
                        <span className="text-[11px] text-[#5c6470] truncate">{n.department}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#1c1b1b] group-hover:text-[#003c84] transition-colors leading-snug">
                        {n.title}
                      </p>
                      {n.summary && (
                        <p className="text-[11px] text-[#5c6470] line-clamp-1 mt-0.5">
                          {n.summary}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#737782] group-hover:text-[#003c84] self-center shrink-0" />
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 bg-[#f8fafc] border-t border-[#e2e6ec] text-right">
              <button
                onClick={() => setModalDateKey(null)}
                className="px-3 py-1.5 text-xs font-semibold text-[#1c1b1b] bg-white border border-[#e2e6ec] hover:bg-[#f1f5f9] rounded-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
