import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { AdminNotice, AdminFilterState, AdminNoticeCategory } from '../types/adminNotice';
import {
  getStoredNotices,
  saveStoredNotices,
  isoToDisplayDate,
  displayDateToIso,
  time12To24,
  time24To12,
} from '../utils/noticeStorage';
import { RichTextEditor } from '../components/RichTextEditor';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES: AdminNoticeCategory[] = [
  'Academics',
  'Examination',
  'Placement & Training',
  'Events & Cultural',
  'Administration',
];

const normalizeNoticeDateToKey = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDateForDisplay = (dateKey: string): string => {
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

interface AdminNoticeWorkbenchProps {
  initialSearch?: string;
  currentTab?: string;
  selectedCategory?: string;
  onNavigateTab?: (tab: string, category?: string) => void;
  onStatsChange?: (total: number, published: number) => void;
}

const getInitialCreateNoticeState = (): Partial<AdminNotice> => {
  const now = new Date();
  const displayDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const displayTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return {
    title: '',
    category: 'Academics',
    status: 'Published',
    department: 'Academics',
    departmentKey: 'admin',
    summary: '',
    content: '',
    issuedBy: '',
    targetAudience: 'All Enrolled Students',
    academicYear: 'AY 2024-25',
    date: displayDate,
    time: displayTime,
    isImportant: false,
    isUrgent: false,
    actionRequired: false,
    actionDeadline: '',
    actionDescription: '',
    attachments: [],
  };
};

export const AdminNoticeWorkbench: React.FC<AdminNoticeWorkbenchProps> = ({
  initialSearch = '',
  currentTab = 'dashboard',
  selectedCategory = 'all',
  onNavigateTab,
  onStatsChange,
}) => {
  const [notices, setNotices] = useState<AdminNotice[]>(() => getStoredNotices());
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Create Notice Form state
  const [createNoticeData, setCreateNoticeData] = useState<Partial<AdminNotice>>(getInitialCreateNoticeState);

  // Edit state for existing notice
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<AdminFilterState>({
    search: initialSearch,
    category: selectedCategory || 'all',
    department: 'all',
    statusTab: 'all',
    dateFilter: undefined,
    selectedDate: undefined,
  });

  // Date Picker dropdown state for list filtering
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());

  // Listen for storage / cross-tab updates
  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setNotices(e.detail);
      } else {
        setNotices(getStoredNotices());
      }
    };
    window.addEventListener('icem-notices-update', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('icem-notices-update', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Update selected category from prop
  useEffect(() => {
    if (selectedCategory) {
      setFilters((prev) => ({ ...prev, category: selectedCategory }));
      setCurrentPage(1);
    }
  }, [selectedCategory]);

  // Update search from prop
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: initialSearch }));
    setCurrentPage(1);
  }, [initialSearch]);

  // Sync notice stats to parent/header
  useEffect(() => {
    const total = notices.length;
    const published = notices.filter((n) => n.status === 'Published').length;
    if (onStatsChange) {
      onStatsChange(total, published);
    }
  }, [notices, onStatsChange]);

  // Set default selected notice if none selected
  useEffect(() => {
    if (!selectedNoticeId && notices.length > 0) {
      setSelectedNoticeId(notices[0].id);
    }
  }, [notices, selectedNoticeId]);

  // Sync calendar view month/year when selectedDate changes
  useEffect(() => {
    if (filters.selectedDate) {
      const [y, m] = filters.selectedDate.split('-').map(Number);
      if (y && m) {
        setCalYear(y);
        setCalMonth(m - 1);
      }
    }
  }, [filters.selectedDate]);

  // Click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Calendar calculations
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
    const selectedKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFilters((prev) => ({ ...prev, selectedDate: selectedKey }));
    setCurrentPage(1);
    setIsDatePickerOpen(false);
  };

  const handleClearDate = () => {
    setFilters((prev) => ({ ...prev, selectedDate: undefined }));
    setCurrentPage(1);
    setIsDatePickerOpen(false);
  };

  // Dates in current month that have notices
  const activeDatesInMonth = useMemo(() => {
    const datesSet = new Set<number>();
    notices.forEach((n) => {
      const key = normalizeNoticeDateToKey(n.date);
      if (key) {
        const [y, m, d] = key.split('-').map(Number);
        if (y === calYear && m - 1 === calMonth) {
          datesSet.add(d);
        }
      }
    });
    return datesSet;
  }, [notices, calYear, calMonth]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered notices calculation
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchTitle = notice.title.toLowerCase().includes(q);
        const matchSummary = notice.summary?.toLowerCase().includes(q);
        const matchContent = notice.content?.toLowerCase().includes(q);
        const matchDept = notice.department?.toLowerCase().includes(q);
        const matchIssuer = notice.issuedBy?.toLowerCase().includes(q);
        const matchCat = notice.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary && !matchContent && !matchDept && !matchIssuer && !matchCat) {
          return false;
        }
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        const catFilter = filters.category.toLowerCase().trim();
        const noticeCat = (notice.category || '').toLowerCase().trim();
        
        // Match exact or standard synonyms
        if (catFilter === 'academics' || catFilter === 'academic') {
          if (noticeCat !== 'academics' && noticeCat !== 'academic') return false;
        } else if (catFilter === 'examination' || catFilter === 'exam') {
          if (noticeCat !== 'examination' && noticeCat !== 'exam') return false;
        } else if (catFilter === 'placement & training' || catFilter === 'placement' || catFilter === 'training & placement') {
          if (noticeCat !== 'placement & training' && noticeCat !== 'placement' && noticeCat !== 'training & placement') return false;
        } else if (catFilter === 'events & cultural' || catFilter === 'events' || catFilter === 'event' || catFilter === 'cultural') {
          if (noticeCat !== 'events & cultural' && noticeCat !== 'events' && noticeCat !== 'event' && noticeCat !== 'cultural') return false;
        } else if (catFilter === 'administration' || catFilter === 'admin' || catFilter === 'administrative') {
          if (noticeCat !== 'administration' && noticeCat !== 'admin' && noticeCat !== 'administrative') return false;
        } else if (noticeCat !== catFilter) {
          return false;
        }
      }

      // Specific Date Filter (Calendar-day match)
      if (filters.selectedDate) {
        const noticeDateKey = normalizeNoticeDateToKey(notice.date);
        if (noticeDateKey !== filters.selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [notices, filters]);

  // Selected notice object
  const activeNotice = useMemo(() => {
    return notices.find((n) => n.id === selectedNoticeId) || filteredNotices[0] || notices[0];
  }, [notices, selectedNoticeId, filteredNotices]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / itemsPerPage));
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(start, start + itemsPerPage);
  }, [filteredNotices, currentPage, itemsPerPage]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      department: 'all',
      statusTab: 'all',
      dateFilter: undefined,
      selectedDate: undefined,
    });
    setCurrentPage(1);
    setIsDatePickerOpen(false);
    if (onNavigateTab) {
      onNavigateTab('dashboard', 'all');
    }
    showToast('All filters reset.');
  };

  // Action: Delete Notice
  const handleDeleteNotice = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this notice?')) {
      const updated = notices.filter((n) => n.id !== id);
      setNotices(updated);
      saveStoredNotices(updated);
      if (selectedNoticeId === id) {
        setSelectedNoticeId(updated[0]?.id || '');
      }
      showToast('Notice deleted successfully.');
    }
  };

  // Action: Open Edit Notice in full page form
  const handleOpenEdit = (notice: AdminNotice) => {
    setEditingNoticeId(notice.id);
    setCreateNoticeData({
      id: notice.id,
      refNo: notice.refNo,
      title: notice.title,
      category: notice.category,
      status: 'Published',
      summary: notice.summary,
      content: notice.content || notice.summary,
      issuedBy: notice.issuedBy,
      department: notice.department,
      departmentKey: notice.departmentKey,
      date: notice.date,
      time: notice.time,
      targetAudience: notice.targetAudience,
      academicYear: notice.academicYear || 'AY 2024-25',
      isImportant: notice.isImportant || false,
      isUrgent: notice.isUrgent || false,
      actionRequired: notice.actionRequired || false,
      actionDeadline: notice.actionDeadline || '',
      actionDescription: notice.actionDescription || '',
      attachments: notice.attachments ? [...notice.attachments] : [],
    });
    if (onNavigateTab) {
      onNavigateTab('create-notice');
    } else {
      window.location.hash = '#/create-notice';
    }
  };

  // Dedicated Full-Page Create/Edit Notice Save Handler
  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createNoticeData.title || !createNoticeData.title.trim()) {
      showToast('Please enter a notice title.');
      return;
    }

    const noticeSummary = createNoticeData.summary?.trim() || createNoticeData.content?.replace(/<[^>]+>/g, '').trim() || '';
    const noticeContent = createNoticeData.content?.trim() || createNoticeData.summary?.trim() || '';
    const noticeDate = createNoticeData.date || isoToDisplayDate();
    const noticeTime = createNoticeData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const noticeAuthority = createNoticeData.issuedBy?.trim() || 'College Admin';

    if (editingNoticeId) {
      // Update existing notice
      const updated = notices.map((n) => {
        if (n.id === editingNoticeId) {
          return {
            ...n,
            title: createNoticeData.title!.trim(),
            category: createNoticeData.category || n.category,
            status: 'Published' as const,
            summary: noticeSummary,
            content: noticeContent,
            issuedBy: noticeAuthority,
            department: createNoticeData.department || n.department || (createNoticeData.category as string),
            departmentKey: createNoticeData.departmentKey || n.departmentKey || 'admin',
            date: noticeDate,
            time: noticeTime,
            targetAudience: createNoticeData.targetAudience?.trim() || n.targetAudience,
            academicYear: createNoticeData.academicYear || n.academicYear || 'AY 2024-25',
            isImportant: createNoticeData.isImportant !== undefined ? createNoticeData.isImportant : n.isImportant,
            isUrgent: createNoticeData.isUrgent !== undefined ? createNoticeData.isUrgent : n.isUrgent,
            actionRequired: createNoticeData.actionRequired !== undefined ? createNoticeData.actionRequired : n.actionRequired,
            actionDeadline: createNoticeData.actionDeadline?.trim() || undefined,
            actionDescription: createNoticeData.actionDescription?.trim() || undefined,
            attachments: createNoticeData.attachments ? [...createNoticeData.attachments] : [],
          };
        }
        return n;
      });

      setNotices(updated);
      saveStoredNotices(updated);
      setSelectedNoticeId(editingNoticeId);
      setEditingNoticeId(null);
      setCreateNoticeData(getInitialCreateNoticeState());
      showToast('Notice updated and published successfully.');
    } else {
      // Create new notice
      const newNotice: AdminNotice = {
        id: `notice-${Date.now()}`,
        refNo: `REF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        title: createNoticeData.title.trim(),
        category: createNoticeData.category || 'Academics',
        status: 'Published',
        summary: noticeSummary,
        content: noticeContent,
        issuedBy: noticeAuthority,
        department: createNoticeData.department || (createNoticeData.category as string) || 'Academics',
        departmentKey: createNoticeData.departmentKey || 'admin',
        date: noticeDate,
        time: noticeTime,
        targetAudience: createNoticeData.targetAudience?.trim() || 'All Enrolled Students',
        academicYear: createNoticeData.academicYear || 'AY 2024-25',
        isImportant: createNoticeData.isImportant || false,
        isUrgent: createNoticeData.isUrgent || false,
        actionRequired: createNoticeData.actionRequired || false,
        actionDeadline: createNoticeData.actionDeadline?.trim() || undefined,
        actionDescription: createNoticeData.actionDescription?.trim() || undefined,
        attachments: createNoticeData.attachments || [],
      };

      const updated = [newNotice, ...notices];
      setNotices(updated);
      saveStoredNotices(updated);
      setSelectedNoticeId(newNotice.id);
      setCreateNoticeData(getInitialCreateNoticeState());
      showToast('Notice published successfully.');
    }

    if (onNavigateTab) {
      onNavigateTab('dashboard');
    } else {
      window.location.hash = '#/dashboard';
    }
  };

  const handleCancelCreate = () => {
    setEditingNoticeId(null);
    setCreateNoticeData(getInitialCreateNoticeState());
    if (onNavigateTab) {
      onNavigateTab('dashboard');
    } else {
      window.location.hash = '#/dashboard';
    }
  };

  const processUploadedFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const newAttachments: Array<{ name: string; size: string; type: 'pdf' | 'excel' | 'doc' | 'image' }> = [];

    Array.from(files).forEach((file) => {
      let fileType: 'pdf' | 'excel' | 'doc' | 'image' = 'pdf';
      const nameLower = file.name.toLowerCase();
      if (nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.csv')) {
        fileType = 'excel';
      } else if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) {
        fileType = 'doc';
      } else if (
        nameLower.endsWith('.jpg') ||
        nameLower.endsWith('.jpeg') ||
        nameLower.endsWith('.png') ||
        nameLower.endsWith('.webp')
      ) {
        fileType = 'image';
      }

      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      newAttachments.push({
        name: file.name,
        size: sizeStr,
        type: fileType,
      });
    });

    setCreateNoticeData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments],
    }));

    showToast(`Attached ${newAttachments.length} document${newAttachments.length > 1 ? 's' : ''}`);
  };

  const handleFileAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleFileAttachmentDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setCreateNoticeData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  const getCategoryBadgeClass = (category?: string) => {
    switch (category) {
      case 'Examination':
        return 'text-[#92400e] bg-[#fef3c7] border border-[#fde68a]';
      case 'Placement & Training':
        return 'text-[#0f766e] bg-[#ccfbf1] border border-[#99f6e4]';
      case 'Academics':
        return 'text-[#334155] bg-[#f1f5f9] border border-[#e2e8f0]';
      case 'Events & Cultural':
        return 'text-[#6b21a8] bg-[#f3e8ff] border border-[#e9d5ff]';
      case 'Administration':
        return 'text-[#1e3a8a] bg-[#dbeafe] border border-[#bfdbfe]';
      default:
        return 'text-[#334155] bg-[#f1f5f9] border border-[#e2e8f0]';
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00275a] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-[#d8e2ff]/30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white ml-2 cursor-pointer"
            aria-label="Close notification"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {currentTab === 'create-notice' ? (
        /* ========================================================================= */
        /* CREATE / EDIT NOTICE VIEW (Focused, No Live Preview, No Drafts)           */
        /* ========================================================================= */
        <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-start sm:items-center gap-3.5 pt-2 border-b border-[#e2e6ec] pb-4">
            <button
              type="button"
              onClick={handleCancelCreate}
              className="p-2.5 bg-white text-[#5c6470] hover:text-[#00275a] hover:bg-[#f0f4fd] border border-[#e2e6ec] hover:border-[#00275a]/40 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
              title="Return to Notice Dashboard"
              aria-label="Return to Notice Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#5c6470]">Notice Management</span>
                <span className="text-xs text-[#737782]">/</span>
                <span className="text-xs font-semibold text-[#00275a]">
                  {editingNoticeId ? 'Edit Notice' : 'Create Notice'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#00275a] tracking-tight leading-tight mt-0.5">
                {editingNoticeId ? 'Edit Notice' : 'Create Notice'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5c6470]">
                {editingNoticeId
                  ? 'Update circular details, schedule, attachments, and student requirements.'
                  : 'Compose and publish official announcements for students and faculty.'}
              </p>
            </div>
          </div>

          {/* Create/Edit Form */}
          <form onSubmit={handleSaveCreate} className="flex flex-col gap-5">
            {/* Card 1: Core Information */}
            <div className="bg-white rounded-xl border border-[#e2e6ec] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2e6ec]">
                <div className="w-8 h-8 rounded-lg bg-[#003c84]/10 text-[#003c84] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#00275a]">Notice Details</h2>
                  <p className="text-xs text-[#5c6470]">Headline, category, and date/time scheduling.</p>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#434751] flex items-center justify-between">
                  <span>Notice Title <span className="text-[#ef4444]">*</span></span>
                  <span className="text-[11px] font-normal text-[#737782] lowercase">required</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS Campus Recruitment Drive 2024 - Important Updates"
                  value={createNoticeData.title || ''}
                  onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm placeholder:text-[#737782] border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none transition-colors"
                />
              </div>

              {/* Category, Issuing Authority, Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434751]">
                    Category <span className="text-[#ef4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={createNoticeData.category || 'Academics'}
                      onChange={(e) =>
                        setCreateNoticeData((prev) => ({
                          ...prev,
                          category: e.target.value as AdminNoticeCategory,
                          department: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none appearance-none cursor-pointer pr-8"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737782] text-[18px] pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Issuing Authority */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434751]">
                    Issuing Authority <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Training & Placement Officer"
                    value={createNoticeData.issuedBy || ''}
                    onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, issuedBy: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm placeholder:text-[#737782] border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none transition-colors"
                  />
                </div>

                {/* Target Audience */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434751]">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. All Final Year Students"
                    value={createNoticeData.targetAudience || ''}
                    onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm placeholder:text-[#737782] border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Date & Time Picker Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Date Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434751] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#003c84]">calendar_today</span>
                    <span>Notice Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={displayDateToIso(createNoticeData.date)}
                    onChange={(e) => {
                      const iso = e.target.value;
                      setCreateNoticeData((prev) => ({
                        ...prev,
                        date: isoToDisplayDate(iso),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none transition-colors cursor-pointer"
                  />
                </div>

                {/* Time Picker */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434751] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#003c84]">schedule</span>
                    <span>Notice Time</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={time12To24(createNoticeData.time)}
                    onChange={(e) => {
                      const time24 = e.target.value;
                      setCreateNoticeData((prev) => ({
                        ...prev,
                        time: time24To12(time24),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Rich-Text Description Editor */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#434751] flex items-center justify-between">
                  <span>Notice Description &amp; Instructions <span className="text-[#ef4444]">*</span></span>
                  <span className="text-[11px] font-normal text-[#737782]">supports bold, italic, underline, lists, alignment</span>
                </label>
                <RichTextEditor
                  value={createNoticeData.content || createNoticeData.summary || ''}
                  onChange={(html) => {
                    const plain = html.replace(/<[^>]+>/g, ' ').trim();
                    setCreateNoticeData((prev) => ({
                      ...prev,
                      content: html,
                      summary: plain,
                    }));
                  }}
                  placeholder="Enter full notice announcement with rich formatting (bold, italic, underline, alignments, bullet points)..."
                  minHeight="180px"
                />
              </div>
            </div>

            {/* Card 2: Student Action & Deadlines */}
            <div className="bg-white rounded-xl border border-[#e2e6ec] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2e6ec]">
                <div className="w-8 h-8 rounded-lg bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">alarm</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#00275a]">Student Action &amp; Deadlines</h2>
                  <p className="text-xs text-[#5c6470]">Flag this notice if students must complete a task before a cutoff date.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e6ec]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createNoticeData.actionRequired || false}
                    onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, actionRequired: e.target.checked }))}
                    className="accent-[#003c84] h-4 w-4 mt-0.5 rounded cursor-pointer shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold text-[#1c1b1b]">
                      Action Required / Mandatory Student Submission
                    </span>
                    <span className="text-[11px] text-[#5c6470]">
                      Displays deadline warning badge on student notices.
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-4 pl-7 sm:pl-0">
                  <label className="flex items-center gap-2 text-xs text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createNoticeData.isUrgent || false}
                      onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, isUrgent: e.target.checked }))}
                      className="accent-[#ef4444] h-3.5 w-3.5 rounded"
                    />
                    <span className="font-semibold text-[#ef4444]">Mark as Urgent</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#1c1b1b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createNoticeData.isImportant || false}
                      onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, isImportant: e.target.checked }))}
                      className="accent-[#00275a] h-3.5 w-3.5 rounded"
                    />
                    <span className="font-semibold text-[#00275a]">Important</span>
                  </label>
                </div>
              </div>

              {createNoticeData.actionRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-200">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#434751]">
                      Action Deadline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oct 28, 2024 · 05:00 PM"
                      value={createNoticeData.actionDeadline || ''}
                      onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, actionDeadline: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#434751]">
                      Action Instruction
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mandatory submission for hall ticket clearance."
                      value={createNoticeData.actionDescription || ''}
                      onChange={(e) => setCreateNoticeData((prev) => ({ ...prev, actionDescription: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white text-[#1c1b1b] text-sm border border-[#e2e6ec] rounded-lg focus:border-[#003c84] focus:ring-1 focus:ring-[#003c84] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Attachments */}
            <div className="bg-white rounded-xl border border-[#e2e6ec] p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2e6ec]">
                <div className="w-8 h-8 rounded-lg bg-[#003c84]/10 text-[#003c84] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[#00275a]">Supporting Attachments</h2>
                  <p className="text-xs text-[#5c6470]">Attach PDFs, spreadsheets, or circular documents.</p>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                multiple
                ref={attachmentFileInputRef}
                onChange={handleFileAttachmentUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                className="hidden"
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                }}
                onDrop={handleFileAttachmentDrop}
                onClick={() => attachmentFileInputRef.current?.click()}
                className={`p-5 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 ${
                  isDraggingFile
                    ? 'border-[#003c84] bg-[#f0f4fd]'
                    : 'border-[#cbd5e1] hover:border-[#003c84] bg-[#f8fafc] hover:bg-[#f0f4fd]/50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-[#e2e8f0] text-[#003c84] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#00275a]">
                  Drag &amp; drop files here, or <span className="underline">browse</span>
                </p>
                <p className="text-[11px] text-[#737782]">PDF, DOCX, XLSX, CSV, JPG, PNG (Max 10MB)</p>
              </div>

              {/* Attached files list */}
              {createNoticeData.attachments && createNoticeData.attachments.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  {createNoticeData.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e6ec]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[#003c84] text-[20px] shrink-0">
                          {att.type === 'pdf' ? 'picture_as_pdf' : att.type === 'excel' ? 'table_chart' : 'description'}
                        </span>
                        <span className="text-xs font-semibold text-[#1c1b1b] truncate">{att.name}</span>
                        <span className="text-[11px] text-[#5c6470] shrink-0">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="p-1 text-[#737782] hover:text-[#ef4444] rounded cursor-pointer shrink-0"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-5 py-2.5 bg-white border border-[#e2e6ec] text-[#434751] hover:bg-[#f1f5f9] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#003c84] hover:bg-[#00275a] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {editingNoticeId ? 'save' : 'publish'}
                </span>
                <span>{editingNoticeId ? 'Update Notice' : 'Publish Notice'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* MAIN NOTICE DASHBOARD WORKBENCH VIEW                                     */
        /* ========================================================================= */
        <>
          {/* Page Header */}
          <div className="flex flex-col gap-1 pt-1">
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#00275a] tracking-tight leading-tight">
              {filters.category && filters.category !== 'all' ? `${filters.category} Notices` : 'Manage Notices'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5c6470] max-w-2xl leading-relaxed">
              {filters.category && filters.category !== 'all'
                ? `Filter and manage institutional circulars in the ${filters.category} category.`
                : 'Search, review, edit, or publish institutional circulars and notices.'}
            </p>
          </div>

          {/* Split Master-Detail Workbench Layout (~60% Left, ~40% Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (lg:col-span-7): Filter Bar + Notice List */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Filter & Query Command Bar */}
              <div className="bg-white p-3.5 rounded-lg border border-[#e2e6ec] shadow-xs flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Search Input */}
                  <div className="sm:col-span-5 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#737782] text-[18px]">
                      search
                    </span>
                    <input
                      value={filters.search}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, search: e.target.value }));
                        setCurrentPage(1);
                      }}
                      placeholder="Search title, authority, keywords..."
                      type="text"
                      className="w-full pl-9 pr-3 py-2 bg-white text-[#1c1b1b] text-xs sm:text-sm placeholder:text-[#737782] border border-[#e2e6ec] rounded-lg focus:border-[#00275a] focus:ring-1 focus:ring-[#00275a] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="sm:col-span-4 relative">
                    <select
                      value={filters.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setFilters((prev) => ({ ...prev, category: cat }));
                        setCurrentPage(1);
                        if (onNavigateTab) {
                          onNavigateTab('dashboard', cat);
                        }
                      }}
                      className="w-full px-2.5 py-2 bg-white text-[#1c1b1b] text-xs sm:text-sm border border-[#e2e6ec] rounded-lg focus:border-[#00275a] focus:ring-1 focus:ring-[#00275a] focus:outline-none appearance-none cursor-pointer pr-7 text-ellipsis overflow-hidden transition-colors"
                      aria-label="Filter notices by category"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#737782] text-[16px] pointer-events-none">
                      expand_more
                    </span>
                  </div>

                  {/* Date Filter */}
                  <div className="sm:col-span-3 relative" ref={datePickerRef}>
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen((prev) => !prev)}
                      className={`w-full px-2.5 py-2 bg-white text-xs sm:text-sm border rounded-lg focus:border-[#00275a] focus:ring-1 focus:ring-[#00275a] focus:outline-none cursor-pointer transition-colors flex items-center justify-between gap-1 text-left ${
                        filters.selectedDate
                          ? 'border-[#00275a] text-[#00275a] font-semibold bg-[#f0f4fd]'
                          : 'border-[#e2e6ec] text-[#1c1b1b] hover:border-[#cbd5e1]'
                      }`}
                      aria-label="Filter notices by date"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className={`material-symbols-outlined text-[16px] shrink-0 ${filters.selectedDate ? 'text-[#00275a]' : 'text-[#737782]'}`}>
                          calendar_today
                        </span>
                        <span className="truncate text-xs">
                          {filters.selectedDate ? formatDateForDisplay(filters.selectedDate) : 'Date'}
                        </span>
                      </div>

                      {filters.selectedDate ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearDate();
                          }}
                          className="p-0.5 hover:bg-[#d8e2ff] text-[#737782] hover:text-[#00275a] rounded transition-colors cursor-pointer shrink-0"
                          title="Clear date"
                        >
                          <span className="material-symbols-outlined text-[14px] block">close</span>
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[#737782] text-[16px] shrink-0 pointer-events-none">
                          expand_more
                        </span>
                      )}
                    </button>

                    {/* Calendar Dropdown */}
                    {isDatePickerOpen && (
                      <div className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1.5 z-50 bg-white border border-[#e2e6ec] rounded-lg shadow-lg p-3 w-[270px] text-[#1c1b1b]">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e2e6ec]">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 text-[#737782] hover:text-[#00275a] hover:bg-[#f0eded] rounded transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px] block">chevron_left</span>
                          </button>
                          <span className="text-xs font-bold text-[#00275a]">
                            {MONTH_NAMES[calMonth]} {calYear}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 text-[#737782] hover:text-[#00275a] hover:bg-[#f0eded] rounded transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px] block">chevron_right</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <span key={d} className="text-[10px] font-semibold text-[#5c6470] uppercase">
                              {d}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-7 h-7" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = filters.selectedDate === dayKey;
                            const hasNotices = activeDatesInMonth.has(day);

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleSelectDay(day)}
                                className={`w-7 h-7 text-xs rounded flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#00275a] text-white font-bold shadow-xs'
                                    : 'hover:bg-[#f0f4fd] hover:text-[#00275a] text-[#1c1b1b]'
                                }`}
                              >
                                <span>{day}</span>
                                {hasNotices && !isSelected && (
                                  <span className="w-1 h-1 rounded-full bg-[#00275a] absolute bottom-0.5"></span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#e2e6ec] flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={handleClearDate}
                            className="text-[#00696c] hover:text-[#00275a] font-medium transition-colors cursor-pointer"
                          >
                            All Dates
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Filter tags & Reset */}
                {(filters.category !== 'all' || filters.selectedDate || filters.search) && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e2e6ec]/80 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#5c6470] font-medium">Active Filters:</span>
                      {filters.category !== 'all' && (
                        <span className="px-2 py-0.5 bg-[#f0f4fd] text-[#00275a] font-semibold rounded border border-[#d8e2ff]">
                          {filters.category}
                        </span>
                      )}
                      {filters.selectedDate && (
                        <span className="px-2 py-0.5 bg-[#f0f4fd] text-[#00275a] font-semibold rounded border border-[#d8e2ff]">
                          {formatDateForDisplay(filters.selectedDate)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="text-[#00696c] hover:text-[#00275a] underline transition-colors cursor-pointer font-medium shrink-0"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Notice Master List */}
              <div className="bg-white rounded-lg shadow-xs border border-[#e2e6ec] overflow-hidden">
                {/* List Header */}
                <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e6ec] flex items-center justify-between text-[#434751]">
                  <span className="text-xs uppercase tracking-wider font-semibold">
                    Notices ({filteredNotices.length})
                  </span>
                  <span className="text-xs text-[#5c6470]">
                    Showing <strong className="text-[#00275a] font-semibold">{paginatedNotices.length}</strong> of{' '}
                    {filteredNotices.length}
                  </span>
                </div>

                {/* List Items */}
                <div className="divide-y divide-[#e2e6ec]">
                  {paginatedNotices.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-[#737782] mb-2">
                        search_off
                      </span>
                      <p className="text-sm font-semibold text-[#1c1b1b]">No matching notices found</p>
                      <p className="text-xs text-[#5c6470] mt-1">
                        Try adjusting your search criteria or resetting filters.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-3 px-3 py-1.5 text-xs bg-[#00275a] text-white rounded font-medium cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    paginatedNotices.map((notice) => {
                      const isSelected = activeNotice?.id === notice.id;

                      return (
                        <div
                          key={notice.id}
                          onClick={() => setSelectedNoticeId(notice.id)}
                          className={`p-4 transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#d8e2ff]/30 border-l-4 border-[#00275a]'
                              : 'hover:bg-[#f8fafc] border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex flex-col gap-1.5">
                            {/* Category Pill + Title */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {notice.isImportant && (
                                <span className="w-2 h-2 rounded-full bg-[#00275a] shrink-0" title="Important Notice"></span>
                              )}
                              {notice.isUrgent && (
                                <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" title="Urgent Notice"></span>
                              )}

                              <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded shrink-0 ${getCategoryBadgeClass(notice.category)}`}>
                                {notice.category}
                              </span>

                              <h3 className="text-sm sm:text-base font-bold tracking-tight text-[#00275a] hover:underline flex-1 min-w-0">
                                {notice.title}
                              </h3>
                            </div>

                            {/* 2-line summary snippet */}
                            <p className="text-xs sm:text-sm text-[#434751] line-clamp-2 leading-relaxed">
                              {notice.summary}
                            </p>

                            {/* Authority & Date/Time Metadata */}
                            <div className="flex items-center gap-2 sm:gap-3 text-[#5c6470] text-xs flex-wrap pt-0.5">
                              <span className="flex items-center gap-1 font-medium text-[#1c1b1b]">
                                <span className="material-symbols-outlined text-[15px] text-[#737782]">
                                  person
                                </span>
                                {notice.issuedBy}
                              </span>
                              <span>•</span>
                              <span>
                                {notice.date} · {notice.time}
                              </span>
                              {notice.actionRequired && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#ea580c] font-semibold flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[13px]">alarm</span>
                                    Deadline: {notice.actionDeadline || 'Required'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Pagination */}
              {filteredNotices.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1 text-xs text-[#5c6470]">
                  <div className="flex items-center gap-3">
                    <span>
                      Page <strong className="text-[#1c1b1b]">{currentPage}</strong> of {totalPages}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Items per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-0.5 bg-white border border-[#e2e6ec] text-[#1c1b1b] text-xs rounded focus:outline-none cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>

                  <nav aria-label="Notices pagination" className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 bg-white text-[#434751] border border-[#e2e6ec] rounded hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded cursor-pointer ${
                          pg === currentPage
                            ? 'bg-[#00275a] text-white font-bold'
                            : 'bg-white text-[#1c1b1b] border border-[#e2e6ec] hover:bg-[#f1f5f9]'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 bg-white text-[#434751] border border-[#e2e6ec] rounded hover:bg-[#f1f5f9] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 font-medium"
                    >
                      <span>Next</span>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </nav>
                </div>
              )}
            </div>

            {/* Right Column (~40% width: lg:col-span-5): Notice Inspector */}
            <div className="lg:col-span-5 sticky top-20">
              {activeNotice ? (
                <div className="bg-white rounded-lg border border-[#e2e6ec] shadow-xs overflow-hidden flex flex-col">
                  {/* Inspector Header */}
                  <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e6ec] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#00275a] text-[18px]">
                        info
                      </span>
                      <h2 className="text-sm font-bold text-[#00275a] tracking-tight">
                        Notice Details
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded">
                      Published
                    </span>
                  </div>

                  {/* Inspector Body */}
                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                    {/* Category & Title */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] uppercase tracking-wider font-bold rounded ${getCategoryBadgeClass(activeNotice.category)}`}>
                          {activeNotice.category}
                        </span>
                        {activeNotice.isUrgent && (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-[#ef4444] bg-[#fee2e2] rounded border border-[#fca5a5]">
                            Urgent
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg text-[#00275a] font-bold leading-snug">
                        {activeNotice.title}
                      </h3>
                    </div>

                    {/* Action Required Banner */}
                    {activeNotice.actionRequired && (
                      <div className="p-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#ea580c] text-[18px] mt-0.5 shrink-0">
                          alarm
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#ea580c]">
                            Action Deadline: {activeNotice.actionDeadline || 'Specified by Authority'}
                          </span>
                          <span className="text-xs text-[#5c6470] mt-0.5">
                            {activeNotice.actionDescription || 'Mandatory submission required.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-[#e2e6ec] text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c6470] font-semibold">
                          Issued By
                        </span>
                        <span className="font-semibold text-[#1c1b1b] mt-0.5 truncate">
                          {activeNotice.issuedBy}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c6470] font-semibold">
                          Date &amp; Time
                        </span>
                        <span className="font-semibold text-[#1c1b1b] mt-0.5">
                          {activeNotice.date} · {activeNotice.time}
                        </span>
                      </div>
                    </div>

                    {/* Description Body */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#5c6470] font-semibold">
                        Content / Description
                      </span>
                      <div
                        className="text-xs sm:text-sm text-[#334155] leading-relaxed bg-[#f8fafc] p-3 rounded-lg border border-[#e2e6ec] max-h-56 overflow-y-auto prose prose-sm max-w-none [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                        dangerouslySetInnerHTML={{
                          __html: activeNotice.content || activeNotice.summary || '<p>No description provided.</p>',
                        }}
                      />
                    </div>

                    {/* Attachments */}
                    {activeNotice.attachments && activeNotice.attachments.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c6470] font-semibold">
                          Attachments ({activeNotice.attachments.length})
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {activeNotice.attachments.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-[#f8fafc] border border-[#e2e6ec] rounded text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-[#003c84] text-[18px] shrink-0">
                                  {file.type === 'pdf' ? 'picture_as_pdf' : file.type === 'excel' ? 'table_chart' : 'description'}
                                </span>
                                <span className="font-medium text-[#1c1b1b] truncate">{file.name}</span>
                                <span className="text-[10px] text-[#5c6470] shrink-0">({file.size})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons: Edit & Delete Only */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e2e6ec]">
                      <button
                        onClick={() => handleOpenEdit(activeNotice)}
                        className="py-2.5 px-3 bg-[#003c84] hover:bg-[#00275a] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-lg cursor-pointer shadow-2xs"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Edit Notice</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(activeNotice.id)}
                        className="py-2.5 px-3 bg-white border border-[#fca5a5] text-[#dc2626] hover:bg-[#fee2e2] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 rounded-lg cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Delete Notice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-[#e2e6ec] p-8 text-center text-[#5c6470] shadow-xs">
                  <span className="material-symbols-outlined text-4xl text-[#737782] mb-2">
                    info
                  </span>
                  <p className="text-sm font-semibold text-[#1c1b1b]">No Notice Selected</p>
                  <p className="text-xs mt-1">Select a notice to view details or perform actions.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
