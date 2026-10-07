import React from 'react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalNoticesCount: number;
  publishedNoticesCount: number;
  onCreateNotice: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  searchTerm,
  onSearchChange,
  totalNoticesCount,
  publishedNoticesCount,
  onCreateNotice,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full lg:ml-64 lg:w-[calc(100%-16rem)] min-h-16 h-auto lg:h-16 bg-white/95 backdrop-blur-xl flex flex-wrap items-center justify-between gap-y-2 px-4 sm:px-6 lg:px-8 py-2 lg:flex-nowrap lg:py-0 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e6ec]/70">
      {/* Mobile Toggle & Global Search Bar */}
      <div className="flex items-center gap-3 flex-1 basis-full lg:basis-auto max-w-lg min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-[#5c6470] hover:text-[#00275a] hover:bg-[#f5f7fa] rounded transition-colors shrink-0 cursor-pointer"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative flex-1 min-w-0">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3 text-[#737782] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search notices, department, authority..."
              className="w-full pl-9 pr-8 py-2 bg-[#f5f7fa] text-xs sm:text-sm text-[#1c1b1b] placeholder:text-[#737782] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#003c84] border border-transparent focus:border-[#003c84] transition-all rounded-lg"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-[#737782] hover:text-[#1c1b1b] cursor-pointer"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Compact Statistics & Create Notice Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 shrink-0 w-full lg:w-auto pl-0 lg:pl-3">
        {/* Compact Statistics Badges */}
        <div className="flex items-center gap-2">
          {/* Total Notices */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f0f4fd] border border-[#d8e2ff] rounded-md">
            <span className="text-[11px] font-semibold text-[#5c6470]">Total:</span>
            <span className="text-xs font-bold text-[#00275a]">{totalNoticesCount}</span>
          </div>

          {/* Published Notices */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#ecfdf5] border border-[#a7f3d0] rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            <span className="text-[11px] font-semibold text-[#065f46]">Published:</span>
            <span className="text-xs font-bold text-[#059669]">{publishedNoticesCount}</span>
          </div>
        </div>

        {/* Create Notice Button */}
        <button
          onClick={onCreateNotice}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#003c84] hover:bg-[#00275a] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          title="Create New Notice"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="whitespace-nowrap">Create Notice</span>
        </button>
      </div>
    </header>
  );
};
