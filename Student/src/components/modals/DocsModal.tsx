import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Search, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileCode,
  ExternalLink 
} from 'lucide-react';
import type { CollegeDocument } from '../../types/notice';
import { mockCollegeDocuments } from '../../data/mockNotices';
import { StudentApiService } from '../../services/studentApi';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents?: CollegeDocument[];
}

export const DocsModal: React.FC<DocsModalProps> = ({
  isOpen,
  onClose,
  documents: propDocs,
}) => {
  const [docsList, setDocsList] = useState<CollegeDocument[]>(propDocs || mockCollegeDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      StudentApiService.getDocuments()
        .then((data) => {
          if (data && data.length > 0) {
            setDocsList(data);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch documents from backend, using fallback:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDocs = docsList.filter((doc) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    );
  });

  const handleDownload = (doc: CollegeDocument) => {
    setDownloadToast(`Downloading ${doc.title}...`);
    if (doc.downloadUrl) {
      const url = StudentApiService.resolveFileUrl(doc.downloadUrl);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.title);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setTimeout(() => {
      setDownloadToast(null);
    }, 2500);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'doc':
        return <FileCode className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-[#e2e6ec] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#00275a] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center text-[#43ccd1]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">College Documents & Forms</h3>
              <p className="text-[11px] text-slate-300">Official student forms and downloadable resources</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="p-3 border-b border-[#e2e6ec] bg-[#f8fafc] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#737782] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search forms by name or category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#e2e6ec] rounded-sm focus:border-[#003c84] outline-none text-[#1c1b1b] placeholder:text-[#5c6470]"
              autoFocus
            />
          </div>
        </div>

        {/* Toast feedback */}
        {downloadToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Document List */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1 divide-y divide-[#f0eded]">
          {filteredDocs.length === 0 ? (
            <div className="py-8 text-center text-[#5c6470] text-xs">
              No documents matching your search.
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="pt-2 first:pt-0 flex items-start justify-between gap-3 group hover:bg-[#f8fafc] p-2 rounded transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-slate-100 border border-[#e2e6ec] flex items-center justify-center shrink-0 mt-0.5">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-[#1c1b1b] group-hover:text-[#003c84] transition-colors leading-tight">
                      {doc.title}
                    </h4>
                    {doc.description && (
                      <p className="text-[11px] text-[#5c6470] line-clamp-1 mt-0.5">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-[#737782] mt-1 font-medium">
                      <span className="bg-[#00275a]/5 text-[#00275a] px-1.5 py-0.2 rounded-2xs uppercase tracking-wider font-semibold">
                        {doc.category}
                      </span>
                      <span>•</span>
                      <span>{doc.fileSize}</span>
                      {doc.lastUpdated && (
                        <>
                          <span>•</span>
                          <span>Updated {doc.lastUpdated}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(doc)}
                  className="px-2.5 py-1.5 bg-[#f8fafc] hover:bg-[#003c84] text-[#003c84] hover:text-white border border-[#e2e6ec] hover:border-[#003c84] rounded-sm text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  title="Download Form"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#e2e6ec] bg-[#f8fafc] flex items-center justify-between text-xs text-[#5c6470] shrink-0">
          <span>Need a document not listed here?</span>
          <a
            href="mailto:support@indiraicem.ac.in"
            className="text-[#003c84] font-semibold hover:underline flex items-center gap-1"
          >
            Contact Registrar Office <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
