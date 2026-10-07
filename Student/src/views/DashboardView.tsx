import React, { useState, useMemo } from 'react';
import { RotateCw, CheckCircle2, Search, X } from 'lucide-react';
import { NoticeFeedTable } from '../components/dashboard/NoticeFeedTable';
import { NoticeDateFilter, normalizeDateToKey } from '../components/notices/NoticeDateFilter';
import { matchesNavCategory } from '../types/notice';
import type { Notice } from '../types/notice';
import { formatDepartmentTargetAudience } from '../../../shared/targetAudiences';

interface DashboardViewProps {
  notices: Notice[];
  selectedCategory?: string;
  selectedTargetAudience?: string;
  onSelectNotice: (id: string) => void;
  onNavigateView: (view: string) => void;
  onRefreshData: () => void;
  searchTerm?: string;
  onClearSearch?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notices,
  selectedCategory = 'all',
  selectedTargetAudience = '',
  onSelectNotice,
  onNavigateView,
  onRefreshData,
  searchTerm = '',
  onClearSearch,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 3000);
    }, 500);
  };

  // 1. Filter notices by selected navbar category
  const categoryFilteredNotices = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return notices;
    return notices.filter((n) => matchesNavCategory(n.category, selectedCategory));
  }, [notices, selectedCategory]);

  // 2. Filter notices by date if selected
  const dateFilteredNotices = useMemo(() => {
    if (!selectedDate) return categoryFilteredNotices;
    return categoryFilteredNotices.filter((n) => normalizeDateToKey(n.date) === selectedDate);
  }, [categoryFilteredNotices, selectedDate]);

  // 3. Filter notices if global search term is provided
  const displayNotices = useMemo(() => {
    if (!searchTerm.trim()) return dateFilteredNotices;
    const query = searchTerm.toLowerCase();
    return dateFilteredNotices.filter((n) => {
      return (
        n.title.toLowerCase().includes(query) ||
        n.summary?.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query) ||
        n.department.toLowerCase().includes(query) ||
        n.issuedBy.toLowerCase().includes(query)
      );
    });
  }, [dateFilteredNotices, searchTerm]);

  // Available notice dates for the calendar date picker
  const availableDates = useMemo(() => {
    return notices.map((n) => n.date).filter(Boolean);
  }, [notices]);

  // Dynamic header titles based on active category
  const getHeaderInfo = () => {
    if (selectedTargetAudience) {
      return {
        title: formatDepartmentTargetAudience(selectedTargetAudience),
        subtitle: 'Notices targeted to this department audience.',
      };
    }

    switch (selectedCategory) {
      case 'exam':
        return {
          title: 'Exam Notices',
          subtitle: 'Examination timetables, re-evaluation circulars, SPPU university forms, and hall tickets.',
        };
      case 'placement':
        return {
          title: 'Placement Notices',
          subtitle: 'Campus recruitment drives, interview schedules, TPO updates, and eligibility notices.',
        };
      case 'general':
        return {
          title: 'General Notices',
          subtitle: 'Administrative guidelines, student welfare updates, statutory notices, and campus circulars.',
        };
      case 'events':
        return {
          title: 'Events & Cultures',
          subtitle: 'Discover upcoming college events, cultural activities and campus celebrations.',
        };
      default:
        return {
          title: 'All Notices',
          subtitle: 'Stay updated with the latest announcements, deadlines, events and important information from ICEM.',
        };
    }
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getHeaderInfo();

  return (
    <div className="flex flex-col w-full">
      {/* Page Title & Subtitle */}
      <div className="px-3.5 sm:px-6 py-3 sm:py-3.5 bg-white border-b border-[#e2e6ec] flex flex-row justify-between items-center gap-2.5 sm:gap-3 shadow-2xs">
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-xl font-bold text-[#1c1b1b] truncate sm:whitespace-normal">
            {pageTitle}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#5c6470] mt-0.5 leading-normal line-clamp-1 sm:line-clamp-none">
            {pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NoticeDateFilter
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            availableDates={availableDates}
          />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#003c84] text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 hover:bg-[#00275a] transition-colors rounded-sm flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline sm:inline">{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            <span className="xs:hidden sm:hidden">{isRefreshing ? '...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Status indicator when date is active */}
      {selectedDate && (
        <div className="mx-3.5 sm:mx-6 mt-3 bg-blue-50 border border-blue-200 text-[#00275a] text-xs px-3 sm:px-3.5 py-2 rounded-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">
              Filtered by Date: <strong className="text-[#00275a]">{selectedDate}</strong> ({displayNotices.length} notices found)
            </span>
          </div>
          <button
            onClick={() => setSelectedDate(undefined)}
            className="text-xs text-[#003c84] hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" /> <span>Clear date filter</span>
          </button>
        </div>
      )}

      {/* Search status indicator when search is active */}
      {searchTerm && (
        <div className="mx-3.5 sm:mx-6 mt-3 bg-blue-50 border border-blue-200 text-[#00275a] text-xs px-3 sm:px-3.5 py-2 rounded-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#003c84] shrink-0" />
            <span className="truncate">
              Showing results for: <strong className="text-[#00275a]">"{searchTerm}"</strong> ({displayNotices.length} found)
            </span>
          </div>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="text-xs text-[#003c84] hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Clear search</span>
            </button>
          )}
        </div>
      )}

      {/* Refresh confirmation toast */}
      {refreshToast && (
        <div className="mx-3.5 sm:mx-6 mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 sm:px-3.5 py-2 rounded-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Notice feed synced with ICEM Central Database.</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-3 sm:p-6 flex flex-col gap-5">
        <NoticeFeedTable
          notices={displayNotices}
          onSelectNotice={onSelectNotice}
          onViewAllNotices={selectedCategory === 'all' ? () => onNavigateView('notices') : undefined}
          showTargetAudience
        />
      </div>
    </div>
  );
};
