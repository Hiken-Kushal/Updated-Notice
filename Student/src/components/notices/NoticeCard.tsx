import React from 'react';
import { Calendar, Paperclip, ArrowRight, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import type { Notice } from '../../types/notice';
import { stripHtmlAndMarkdown } from '../../types/notice';

interface NoticeCardProps {
  notice: Notice;
  onClick: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onClick }) => {
  // Category styling based on design system
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Academics':
      case 'Academic':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Examination':
      case 'Exam':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Placement & Training':
      case 'Placement':
        return 'bg-teal-100 text-teal-900 border-teal-200';
      case 'Events & Cultural':
      case 'Events':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Administration':
      case 'Administrative':
      case 'Admin':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Library':
        return 'bg-orange-100 text-orange-900 border-orange-200';
      case 'Sports':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getBorderColor = () => {
    if (notice.urgent || notice.accentColor === 'warning') return 'bg-[#f59e0b]';
    if (notice.category === 'Placement & Training' || notice.category === 'Placement' || notice.accentColor === 'primary') return 'bg-[#003c84]';
    if (notice.category === 'Events & Cultural' || notice.category === 'Events') return 'bg-[#7c3aed]';
    if (notice.category === 'Examination' || notice.category === 'Exam') return 'bg-[#b45309]';
    if (notice.category === 'Administration' || notice.category === 'Admin') return 'bg-[#2563eb]';
    return 'bg-[#c3c6d2]';
  };

  const firstAttachment = notice.attachments && notice.attachments[0];
  const summarySnippet = stripHtmlAndMarkdown(notice.summary || notice.content);

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white rounded-lg border border-[#e2e6ec] shadow-2xs hover:shadow-md hover:border-[#cbd5e1] transition-all duration-200 overflow-hidden cursor-pointer h-full"
    >
      {/* Left Border Accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColor()}`} />

      <div className="p-4 sm:p-5 flex flex-col h-full pl-5">
        {/* Top meta row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getCategoryBadge(
                notice.category
              )}`}
            >
              {notice.category}
            </span>
            {notice.urgent && (
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-red-200">
                URGENT
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#5c6470] flex items-center gap-1 font-medium shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#737782]" />
            {notice.date}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-[#1c1b1b] mb-2 group-hover:text-[#003c84] transition-colors line-clamp-2 leading-snug">
          {notice.title}
        </h3>

        {/* Summary text */}
        <p className="text-xs sm:text-sm text-[#434751] mb-4 line-clamp-3 flex-grow leading-relaxed">
          {summarySnippet}
        </p>

        {/* Bottom Card Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0eded]">
          {firstAttachment ? (
            <div className="flex items-center gap-1.5 text-[#003c84] text-xs font-semibold">
              {firstAttachment.type === 'image' ? (
                <ImageIcon className="w-3.5 h-3.5 text-[#43ccd1]" />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-[#003c84]" />
              )}
              <span className="truncate max-w-[170px]">
                {firstAttachment.type === 'image' ? 'Poster attached' : firstAttachment.name}
              </span>
            </div>
          ) : (
            <div className="text-xs text-[#5c6470] font-medium truncate max-w-[180px]">
              {notice.issuedBy || notice.department}
            </div>
          )}

          <div className="flex items-center gap-1 text-[#737782] group-hover:text-[#003c84] transition-colors">
            {notice.acknowledged && (
              <span className="text-[10px] text-emerald-600 font-bold mr-1 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Seen
              </span>
            )}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};