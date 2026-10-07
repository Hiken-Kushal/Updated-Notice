import React from 'react';
import { X, Download, FileText, FileSpreadsheet, Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { Attachment } from '../../types/notice';
import { StudentApiService } from '../../services/studentApi';

interface AttachmentModalProps {
  attachment: Attachment | null;
  noticeTitle: string;
  onClose: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  attachment,
  noticeTitle,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-[#e2e6ec]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#00275a] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {attachment.type === 'pdf' && <FileText className="w-5 h-5 text-red-400 shrink-0" />}
            {attachment.type === 'excel' && <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />}
            {attachment.type === 'image' && <ImageIcon className="w-5 h-5 text-teal-400 shrink-0" />}
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{attachment.name}</h3>
              <p className="text-[11px] text-slate-300 truncate">{noticeTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewer Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#f5f7fa] flex flex-col items-center justify-center text-center min-h-[260px]">
          <div className="w-16 h-16 rounded-full bg-white border border-[#e2e6ec] shadow-sm flex items-center justify-center mb-3">
            {attachment.type === 'pdf' && <FileText className="w-8 h-8 text-red-500" />}
            {attachment.type === 'excel' && <FileSpreadsheet className="w-8 h-8 text-emerald-600" />}
            {attachment.type === 'image' && <ImageIcon className="w-8 h-8 text-teal-600" />}
            {attachment.type === 'doc' && <FileText className="w-8 h-8 text-blue-600" />}
          </div>

          <h4 className="text-base font-semibold text-[#1c1b1b] mb-1">{attachment.name}</h4>
          <p className="text-xs text-[#5c6470] mb-4">
            Size: {attachment.size} • Verified Institutional Document (SPPU/ICEM)
          </p>

          <div className="bg-white p-4 rounded-lg border border-[#e2e6ec] text-left w-full text-xs text-[#434751] space-y-2 mb-4 shadow-2xs">
            <p className="font-semibold text-[#00275a] flex items-center justify-between border-b border-[#e2e6ec] pb-1.5">
              <span>Document Verification Stamp</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">DIGITALLY SIGNED</span>
            </p>
            <p className="text-[11px] text-[#5c6470]">
              Issued by ICEM Academic Operations & Student Affairs Directorate for official student reference.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              onClick={() => {
                if (attachment.url) {
                  const link = document.createElement('a');
                  link.href = StudentApiService.resolveFileUrl(attachment.url);
                  link.setAttribute('download', attachment.name);
                  link.setAttribute('target', '_blank');
                  link.setAttribute('rel', 'noopener noreferrer');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  alert(`Downloading: ${attachment.name}`);
                }
              }}
              className="px-5 py-2.5 bg-[#003c84] hover:bg-[#00275a] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Original ({attachment.size})
            </button>
            <button
              onClick={() => {
                if (attachment.url) {
                  const fullUrl = StudentApiService.resolveFileUrl(attachment.url);
                  const isPreviewable = attachment.type === 'pdf' || attachment.type === 'image' || attachment.name.match(/\.(pdf|png|jpe?g|webp|svg|txt)$/i);
                  if (isPreviewable) {
                    window.open(fullUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    const link = document.createElement('a');
                    link.href = fullUrl;
                    link.setAttribute('download', attachment.name);
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                } else {
                  window.open('#', '_blank', 'noopener,noreferrer');
                }
              }}
              className="px-4 py-2.5 bg-white border border-[#e2e6ec] hover:bg-[#f5f7fa] text-[#1c1b1b] text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#737782]" /> Open in New Tab
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-white border-t border-[#e2e6ec] flex items-center justify-between text-xs text-[#5c6470]">
          <span>Indira College of Engineering & Management • Official Repository</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs text-[#5c6470] hover:text-[#1c1b1b] hover:bg-[#f5f7fa] rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
