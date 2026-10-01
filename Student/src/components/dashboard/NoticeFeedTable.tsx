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
import { matchesNavCategory } from '../../types/notice';

export interface NoticeFeedTableProps {
  notices: Notice[];
  onSelectNotice: (id: string) => void;
  onViewAllNotices?: () => void;
  showHeader?: boolean;
  showCategoryFilters?: boolean;
  limit?: number;
}

export const NoticeFeedTable: React.FC<NoticeFeedTableProps> = ({
  notices,
  onSelectNotice,
  onViewAllNotices,
  showHeader = true,
  showCategoryFilters = true,
  limit,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [feedFilter, setFeedFilter] = useState<string>('');

  const categories = [
    'All',
    'Academics',
    'Examination',
    'Placement & Training',
    'Events & Cultural',
    'Administration',
  ];

  const filteredNotices = notices.filter((n) => {
    // Category filtering
    if (showCategoryFilters && activeCategory !== 'All') {
      if (!matchesNavCategory(n.category, activeCategory)) {
        return false;
      }
    }

    // Keyword filtering
    if (showHeader && feedFilter.trim()) {
      const query = feedFilter.toLowerCase();
      const matchesTitle = n.title.toLowerCase().includes(query);
      const matchesCategory = (n.category || '').toLowerCase().includes(query);
      const matchesDept = (n.department || '').toLowerCase().includes(query);
      const matchesIssuer = (n.issuedBy || '').toLowerCase().includes(query);
      const matchesSummary = (n.summary || '').toLowerCase().includes(query);
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
      case 'Academics':
      case 'Academic':
        return <GraduationCap className="w-4 h-4 text-[#00696c]" />;
      case 'Examination':
      case 'Exam':
        return <FileCheck className="w-4 h-4 text-[#b45309]" />;
      case 'Placement & Training':
      case 'Placement':
        return <Briefcase className="w-4 h-4 text-[#00275a]" />;
      case 'Events & Cultural':
      case 'Events':
        return <Sparkles className="w-4 h-4 text-[#7c3aed]" />;
      case 'Administration':
      case 'Admin':
      case 'Administrative':
        return <ShieldAlert className="w-4 h-4 text-[#4338ca]" />;
      case 'Sports':
        return <Trophy className="w-4 h-4 text-[#3b82f6]" />;
      case 'Library':
        return <BookOpen className="w-4 h-4 text-[#7a3008]" />;
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

      {/* Level 2: Compact Category Filter Buttons */}
      {showCategoryFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#003c84] text-white font-semibold shadow-2xs'
                    : 'bg-white text-[#434751] hover:bg-[#f5f7fa] hover:text-[#1c1b1b] border border-[#e2e6ec]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Level 3: Polished Notice List Table */}
      <div className="bg-white border border-[#e2e6ec] rounded-lg overflow-hidden shadow-2xs flex flex-col">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e6ec] text-[10px] sm:text-[11px] text-[#5c6470] uppercase tracking-wider font-semibold">
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 w-9 sm:w-12 text-center">Type</th>
              <th className="py-2 sm:py-2.5 px-2 sm:px-3 w-auto">Subject</th>
              <th className="py-2 sm:py-2.5 px-3 w-36 lg:w-44 hidden md:table-cell">Issued By / Department</th>
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
                  className="hover:bg-[#f5f7fa] cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-center align-middle">
                    <div className="w-7 h-7 mx-auto rounded-sm bg-[#f8fafc] border border-[#e2e6ec] flex items-center justify-center group-hover:bg-white transition-colors">
                      {getCategoryIcon(notice.category)}
                    </div>
                  </td>

                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 align-middle">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-[#1c1b1b] group-hover:text-[#003c84] transition-colors line-clamp-1">
                        {notice.title}
                      </span>
                      {notice.urgent && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                          Urgent
                        </span>
                      )}
                      {notice.attachments && notice.attachments.length > 0 && (
                        <Paperclip className="w-3 h-3 text-[#737782] shrink-0" />
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 sm:py-3 px-3 text-[#5c6470] hidden md:table-cell align-middle truncate font-medium">
                    {notice.issuedBy || notice.department}
                  </td>

                  <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right text-[#5c6470] align-middle whitespace-nowrap">
                    <span className="inline-flex items-center justify-end gap-1 font-medium">
                      <span>{notice.date.split(',')[0]}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#737782] group-hover:text-[#003c84] group-hover:translate-x-0.5 transition-all" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Optional View All Footer */}
        {onViewAllNotices && filteredNotices.length > (limit || 7) && (
          <div className="p-2.5 bg-[#f8fafc] border-t border-[#e2e6ec] text-center">
            <button
              onClick={onViewAllNotices}
              className="text-xs font-semibold text-[#003c84] hover:text-[#00275a] inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View all {filteredNotices.length} notices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};