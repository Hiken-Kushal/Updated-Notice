import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  AlertTriangle, 
  Paperclip, 
  Download, 
  Eye, 
  Share2, 
  CheckCircle2, 
  Bookmark, 
  History, 
  MapPin, 
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import type { Notice, Attachment } from '../types/notice';
import { AttachmentModal } from '../components/notices/AttachmentModal';

interface NoticeDetailViewProps {
  notice: Notice;
  allNotices: Notice[];
  onBack: () => void;
  onSelectNotice: (id: string) => void;
  onToggleAcknowledge: (id: string) => void;
  onToggleBookmark?: (id: string) => void;
}

export const NoticeDetailView: React.FC<NoticeDetailViewProps> = ({
  notice,
  allNotices,
  onBack,
  onSelectNotice,
  onToggleAcknowledge,
  onToggleBookmark,
}) => {
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Filter related notices from the same category or department, excluding current
  const relatedNotices = allNotices
    .filter((n) => n.id !== notice.id && (n.category === notice.category || n.department === notice.department))
    .slice(0, 3);

  // Fallback related if none match strictly
  const finalRelated = relatedNotices.length > 0 
    ? relatedNotices 
    : allNotices.filter((n) => n.id !== notice.id).slice(0, 3);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const isWarning = notice.accentColor === 'warning' || notice.urgent;

  return (
    <>
      <div className="flex flex-col w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-4 sm:py-6 gap-4 sm:gap-5">
        {/* Back Navigation & Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#5c6470] flex-wrap">
          <button
            onClick={onBack}
            className="hover:text-[#00275a] transition-colors flex items-center gap-1 font-medium group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Notices</span>
          </button>
          <span className="text-[#c3c6d2]">/</span>
          <span className="text-[#737782] font-medium">{notice.category}</span>
          <span className="text-[#c3c6d2]">/</span>
          <span className="text-[#1c1b1b] font-semibold truncate max-w-[160px] sm:max-w-md">
            {notice.title}
          </span>
        </nav>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 items-start">
          {/* Main Notice Content Area */}
          <div className="flex-1 w-full flex flex-col gap-4 sm:gap-5 min-w-0">
            {/* Header Card */}
            <div
              className={`bg-white rounded-xl shadow-2xs border-l-4 p-4 sm:p-6 relative overflow-hidden ${
                isWarning ? 'border-l-[#f59e0b]' : 'border-l-[#003c84]'
              }`}
            >
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span
                  className={`px-2.5 py-1 rounded text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider ${
                    isWarning ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-[#00275a]'
                  }`}
                >
                  {notice.category}
                </span>

                <div className="flex items-center gap-1.5 text-[#5c6470] text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#737782]" />
                  <span>{notice.date}</span>
                </div>
              </div>

              <h1 className="text-lg sm:text-2xl font-bold text-[#1c1b1b] mb-3 sm:mb-4 relative z-10 leading-tight">
                {notice.title}
              </h1>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#434751] bg-[#f6f3f2] p-2.5 sm:p-3 rounded-lg relative z-10">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#737782] shrink-0" />
                  <span>
                    <strong>Target:</strong> {notice.targetAudience}
                  </span>
                </div>

                <div className="w-px h-3.5 bg-[#c3c6d2] hidden sm:block" />

                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#737782] shrink-0" />
                  <span>
                    <strong>Issued by:</strong> {notice.issuedBy}
                  </span>
                </div>

                {notice.actionDeadline && (
                  <>
                    <div className="w-px h-3.5 bg-[#c3c6d2] hidden sm:block" />
                    <div className="flex items-center gap-1.5 text-[#ef4444] font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Deadline:</strong> {notice.actionDeadline}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notice Body */}
            <div className="bg-white rounded-xl shadow-2xs border border-[#e2e6ec] p-4 sm:p-7 flex flex-col gap-4 text-sm sm:text-base text-[#1c1b1b] leading-relaxed">
              {notice.fullBody?.salutation && (
                <p className="font-semibold text-[#00275a]">{notice.fullBody.salutation}</p>
              )}

              <p className="text-[#334155] leading-relaxed">
                {notice.fullBody?.introduction || notice.content}
              </p>

              {/* Structured Sections */}
              {notice.fullBody?.sections?.map((sec, idx) => (
                <div key={idx} className="mt-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#003c84] mb-2.5">
                    {sec.title}
                  </h3>
                  {sec.items && (
                    <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[#434751]">
                      {sec.items.map((item, i) => (
                        <li key={i} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.paragraphs && (
                    <div className="space-y-2 text-xs sm:text-sm text-[#434751]">
                      {sec.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Institutional Callout Box */}
              {notice.fullBody?.callout && (
                <div className="bg-[#00275a]/5 border border-[#00275a]/20 p-4 rounded-lg mt-3">
                  <p className="font-semibold text-[#00275a] text-xs sm:text-sm flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#003c84] mt-1.5 shrink-0" />
                    <span>{notice.fullBody.callout}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            {notice.attachments && notice.attachments.length > 0 && (
              <div className="bg-white rounded-xl shadow-2xs border border-[#e2e6ec] p-5">
                <h3 className="text-sm font-bold text-[#1c1b1b] mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#737782]" />
                  <span>Attachments ({notice.attachments.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {notice.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center p-3 bg-[#f5f7fa] hover:bg-[#eae7e7] rounded-lg transition-colors border border-[#e2e6ec] group"
                    >
                      <div className="w-9 h-9 bg-white rounded-sm border border-[#e2e6ec] flex items-center justify-center shrink-0 mr-3 shadow-2xs">
                        {att.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                        {att.type === 'excel' && <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                        {att.type === 'image' && <ImageIcon className="w-5 h-5 text-teal-600" />}
                        {att.type === 'doc' && <FileText className="w-5 h-5 text-blue-600" />}
                      </div>

                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-xs font-semibold text-[#1c1b1b] truncate">{att.name}</p>
                        <p className="text-[11px] text-[#5c6470]">{att.size}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveAttachment(att)}
                          className="w-8 h-8 flex items-center justify-center rounded text-[#003c84] hover:bg-[#003c84]/10 transition-colors"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert(`Downloading ${att.name}...`)}
                          className="w-8 h-8 flex items-center justify-center rounded text-[#003c84] hover:bg-[#003c84]/10 transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none justify-center px-3 sm:px-4 py-2 border border-[#737782] text-[#1c1b1b] text-xs font-semibold rounded-sm hover:bg-[#f5f7fa] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? 'Link Copied!' : 'Share Notice'}</span>
                </button>

                {onToggleBookmark && (
                  <button
                    onClick={() => onToggleBookmark(notice.id)}
                    className={`flex-1 sm:flex-none justify-center px-3 py-2 border text-xs font-semibold rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer ${
                      notice.bookmarked
                        ? 'bg-blue-50 border-[#003c84] text-[#003c84]'
                        : 'border-[#e2e6ec] text-[#5c6470] hover:bg-[#f5f7fa]'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${notice.bookmarked ? 'fill-[#003c84]' : ''}`} />
                    <span>{notice.bookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => onToggleAcknowledge(notice.id)}
                className={`w-full sm:w-auto justify-center px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                  notice.acknowledged
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#003c84] hover:bg-[#43ccd1] text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{notice.acknowledged ? 'Acknowledged ✓' : 'Acknowledge Notice'}</span>
              </button>
            </div>
          </div>

          {/* Right Sidebar: Related Notices & Department Contact */}
          <div className="w-full lg:w-[320px] flex flex-col gap-5 shrink-0">
            {/* Related Notices */}
            <div className="bg-white rounded-xl border border-[#e2e6ec] p-4 shadow-2xs">
              <h3 className="text-xs font-bold text-[#1c1b1b] flex items-center gap-2 uppercase tracking-wide border-b border-[#e2e6ec] pb-2.5 mb-3">
                <History className="w-4 h-4 text-[#003c84]" />
                Related Notices
              </h3>

              <div className="flex flex-col gap-2.5">
                {finalRelated.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectNotice(rel.id)}
                    className="p-3 rounded-lg border border-[#e2e6ec] hover:border-[#003c84] hover:bg-[#f5f7fa] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#00696c] bg-[#75f6fb]/20 px-1.5 py-0.5 rounded uppercase">
                        {rel.category}
                      </span>
                      <span className="text-[10px] text-[#5c6470]">{rel.date.split(',')[0]}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#1c1b1b] group-hover:text-[#003c84] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Office Card */}
            <div className="bg-[#00275a] text-white rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#43ccd1] uppercase tracking-wider block mb-1">
                  Department Desk
                </span>
                <h4 className="text-sm font-bold text-white mb-2">{notice.department}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  For queries regarding this circular, visit the departmental office during administrative hours (10:00 AM - 04:00 PM).
                </p>
              </div>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#43ccd1]" />
                  <span>Block B, Room 304</span>
                </div>
                <span className="text-[11px] text-[#43ccd1] font-semibold hover:underline cursor-pointer">
                  Contact Cell
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Document Preview Modal */}
      <AttachmentModal
        attachment={activeAttachment}
        noticeTitle={notice.title}
        onClose={() => setActiveAttachment(null)}
      />
    </>
  );
};
