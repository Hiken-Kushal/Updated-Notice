import React, { useState } from 'react';
import {
  GraduationCap,
  Trophy,
  BookOpen,
  Briefcase,
  Megaphone,
  Search,
  Sparkles,
  Paperclip,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';
import type { Notice } from '../../types/notice';

export interface NoticeFeedTableProps {
  notices: Notice[];
  onSelectNotice: (id: string) => void;
  onViewAllNotices?: () => void;
  showHeader?: boolean;
  showCategoryFilters?: boolean;
  activeCategory?: string;
  limit?: number;
}

export const NoticeFeedTable: React.FC<NoticeFeedTableProps> = ({
  notices,
  onSelectNotice,
  onViewAllNotices,
  showHeader = true,
  activeCategory = 'All',
  limit,
}) => {
  const [feedFilter, setFeedFilter] = useState<string>('');

  const filteredNotices = notices.filter((n) => {
    // Category filtering
    if (activeCategory !== 'All') {
      if (activeCategory === 'Administrative') {
        if (n.category !== 'Administrative' && n.category !== 'Admin') return false;
      } else if (activeCategory === 'Events') {
        if (n.category !== 'Events' && n.category !== 'Sports') return false;
      } else if (n.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
    }

    // Keyword filtering
    if (showHeader && feedFilter.trim()) {
      const query = feedFilter.toLowerCase();
      const matchesTitle = n.title.toLowerCase().includes(query);
      const matchesCategory = n.category.toLowerCase().includes(query);
      const matchesDept = n.department.toLowerCase().includes(query);
      const matchesIssuer = n.issuedBy.toLowerCase().includes(query);
      const matchesSummary = n.summary?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesCategory && !matchesDept && !matchesIssuer && !matchesSummary) {
        return false;
      }
    }

    return true;
  });

  // Limit display if specified, or if onViewAllNotices is provided default to 7, otherwise show all
  const displayNotices = limit !== undefined
    ? filteredNotices.slice(0, limit)
    : (onViewAllNotices ? filteredNotices.slice(0, 7) : filteredNotices);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academic':
        return <GraduationCap className="w-4 h-4 text-[#00696c]" />;
      case 'Examination':
        return <FileCheck className="w-4 h-4 text-[#b45309]" />;
      case 'Sports':
        return <Trophy className="w-4 h-4 text-[#3b82f6]" />;
      case 'Library':
        return <BookOpen className="w-4 h-4 text-[#7a3008]" />;
      case 'Placement':
        return <Briefcase className="w-4 h-4 text-[#00275a]" />;
      case 'Events':
        return <Sparkles className="w-4 h-4 text-[#7c3aed]" />;
      case 'Administrative':
      case 'Admin':
        return <ShieldAlert className="w-4 h-4 text-[#4338ca]" />;
      default:
        return <Megaphone className="w-4 h-4 text-[#737782]" />;
    }
  };

  return (
    <section className="flex flex-col gap-3">
      {/* Level 1: Notice Feed Header with Search */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1c1b1b]">Notice Feed</h2>
            <span className="text-xs text-[#5c6470] bg-[#e2e6ec]/60 px-2 py-0.5 rounded-full font-medium">
              {filteredNotices.length} updates
            </span>
          </div>

          {/* Search input in feed */}
          <div className="relative">
            <input
              type="text"
              value={feedFilter}
              onChange={(e) => setFeedFilter(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full sm:w-56 pl-7 pr-7 py-1.5 text-xs bg-white border border-[#e2e6ec] rounded-sm focus:border-[#003c84] outline-none text-[#1c1b1b] placeholder:text-[#5c6470] transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[#737782] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {feedFilter && (
              <button
                onClick={() => setFeedFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737782] hover:text-[#1c1b1b]"
                aria-label="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}


      {/* Level 3: Polished Notice List Table */}
      <div className="bg-white border border-[#e2e6ec] rounded-lg overflow-hidden shadow-2xs flex flex-col">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e6ec] text-[10px] sm:text-[11px] text-[#5c6470] uppercase tracking-wider font-semibold">
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 w-9 sm:w-12 text-center">Type</th>
              <th className="py-2 sm:py-2.5 px-2 sm:px-3 w-auto">Subject</th>
              <th className="py-2 sm:py-2.5 px-3 w-36 lg:w-44 hidden md:table-cell">Department / Unit</th>
              <th className="py-2 sm:py-2.5 px-2 sm:px-3 w-20 sm:w-28 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e6ec] text-xs">
            {displayNotices.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 px-4 text-center text-[#5c6470]">
                  <p className="font-semibold text-sm text-[#1c1b1b] mb-1">No notices found</p>
                  <p className="text-xs">No circulars match the selected filter or search term.</p>
                </td>
              </tr>
            ) : (
              displayNotices.map((notice) => (
                <tr
                  key={notice.id}
                  onClick={() => onSelectNotice(notice.id)}
                  className="hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                >
                  {/* Type Column */}
                  <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center align-middle">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#f1f5f9] flex items-center justify-center mx-auto shrink-0">
                      {getCategoryIcon(notice.category)}
                    </div>
                  </td>

                  {/* Subject Column: Clearly prominent bold title + secondary metadata */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 align-middle">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[13px] sm:text-sm text-[#1c1b1b] group-hover:text-[#003c84] transition-colors leading-snug line-clamp-2 sm:line-clamp-1">
                        {notice.title}
                      </span>
                      {notice.urgent && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                          URGENT
                        </span>
                      )}
                    </div>

                    {/* Secondary metadata */}
                    <div className="text-[10.5px] sm:text-[11px] text-[#5c6470] mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="font-semibold text-[9.5px] sm:text-[10px] text-[#00275a] bg-[#00275a]/8 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        {notice.category}
                      </span>
                      <span className="text-[#c3c6d2]">•</span>
                      <span className="truncate max-w-[110px] xs:max-w-[160px] sm:max-w-xs">{notice.issuedBy}</span>
                      {notice.attachments && notice.attachments.length > 0 && (
                        <>
                          <span className="text-[#c3c6d2]">•</span>
                          <span className="inline-flex items-center gap-0.5 text-[#00696c] font-medium bg-[#75f6fb]/20 px-1 py-0.2 rounded-2xs shrink-0">
                            <Paperclip className="w-2.5 h-2.5" />
                            <span>{notice.attachments.length} attached</span>
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Department Column */}
                  <td className="py-2.5 sm:py-3 px-3 hidden md:table-cell text-[#5c6470] font-medium truncate align-middle">
                    {notice.department}
                  </td>

                  {/* Date Column */}
                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right text-[#5c6470] font-medium whitespace-nowrap align-middle">
                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                      <span className="text-[10px] sm:text-[11px]">{notice.date.split(',')[0]}</span>
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#737782] group-hover:text-[#003c84] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* VIEW ALL NOTICES Action at bottom of Notice Feed */}
        {onViewAllNotices && (
          <div className="bg-[#f8fafc] border-t border-[#e2e6ec] px-4 py-2.5 flex items-center justify-center">
            <button
              onClick={onViewAllNotices}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003c84] hover:text-[#00275a] hover:underline uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>View All Notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
