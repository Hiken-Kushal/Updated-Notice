import React, { useState, useMemo } from 'react';
import { NoticeFilterBar } from '../components/notices/NoticeFilterBar';
import { NoticeFeedTable } from '../components/dashboard/NoticeFeedTable';
import { matchesNavCategory } from '../types/notice';
import type { Notice } from '../types/notice';

interface NoticesViewProps {
  notices: Notice[];
  onSelectNotice: (id: string) => void;
  initialSearch?: string;
  selectedCategory?: string;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  notices,
  onSelectNotice,
  initialSearch = '',
  selectedCategory = 'all',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showOnlyImportant, setShowOnlyImportant] = useState<boolean>(false);

  // Dynamic header titles based on active category
  const getHeaderInfo = () => {
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
          subtitle: 'Official announcements, examination schedules, placement updates, and academic notifications.',
        };
    }
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getHeaderInfo();

  // General sub-categories option for General Notices screen
  const generalSubCategories = [
    { label: 'All General', value: 'all' },
    { label: 'Administrative', value: 'Administrative' },
    { label: 'Academic', value: 'Academic' },
    { label: 'Events', value: 'Events' },
    { label: 'Sports', value: 'Sports' },
    { label: 'Library', value: 'Library' },
  ];

  // Base Category Filter for this dedicated screen
  const categoryBaseNotices = useMemo(() => {
    if (selectedCategory === 'all') return notices;
    return notices.filter((n) => matchesNavCategory(n.category, selectedCategory));
  }, [notices, selectedCategory]);

  // Filter computation
  const filteredNotices = useMemo(() => {
    return categoryBaseNotices.filter((notice) => {
      // Sub-category filter (for All Notices or General Notices)
      if (selectedSubCategory !== 'all') {
        if (selectedSubCategory === 'Administrative') {
          if (notice.category !== 'Administrative' && notice.category !== 'Admin') return false;
        } else if (notice.category.toLowerCase() !== selectedSubCategory.toLowerCase()) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = notice.title.toLowerCase().includes(query);
        const matchesSummary = notice.summary?.toLowerCase().includes(query);
        const matchesDept = notice.department.toLowerCase().includes(query);
        const matchesIssuer = notice.issuedBy.toLowerCase().includes(query);
        const matchesCat = notice.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesDept && !matchesIssuer && !matchesCat) {
          return false;
        }
      }

      // Department filter
      if (selectedDepartment !== 'all') {
        if (notice.departmentKey !== 'all' && notice.departmentKey !== selectedDepartment) {
          return false;
        }
      }

      // Important filter
      if (showOnlyImportant && !notice.important) {
        return false;
      }

      return true;
    });
  }, [categoryBaseNotices, selectedSubCategory, searchTerm, selectedDepartment, showOnlyImportant]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubCategory('all');
    setSelectedDepartment('all');
    setShowOnlyImportant(false);
  };

  return (
    <div className="flex flex-col w-full max-w-[1360px] mx-auto px-3 sm:px-6 py-4 sm:py-6 gap-4 sm:gap-5">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-[#1c1b1b] tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#5c6470] mt-0.5 leading-normal">
            {pageSubtitle}
          </p>
        </div>

        <div className="text-[11px] sm:text-xs text-[#5c6470] font-medium bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-[#e2e6ec] self-start sm:self-auto shadow-2xs shrink-0">
          Showing <strong className="text-[#00275a]">{filteredNotices.length}</strong> {filteredNotices.length === 1 ? 'notice' : 'notices'}
        </div>
      </div>

      {/* Filter Control Bar */}
      <NoticeFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedSubCategory}
        onSelectCategory={selectedCategory === 'exam' || selectedCategory === 'placement' ? undefined : setSelectedSubCategory}
        categories={selectedCategory === 'general' ? generalSubCategories : undefined}
        hideCategoryPills={selectedCategory === 'exam' || selectedCategory === 'placement'}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        showOnlyImportant={showOnlyImportant}
        onToggleImportant={() => setShowOnlyImportant(!showOnlyImportant)}
        onResetFilters={handleResetFilters}
        totalCount={filteredNotices.length}
      />

      {/* Master Notice Feed Table */}
      <NoticeFeedTable
        notices={filteredNotices}
        onSelectNotice={onSelectNotice}
        showHeader={false}
        showCategoryFilters={false}
      />
    </div>
  );
};
