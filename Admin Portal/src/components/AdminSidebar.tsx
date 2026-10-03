import React from 'react';

interface AdminSidebarProps {
  currentTab?: string;
  selectedCategory?: string;
  onNavigateTab?: (tab: string, category?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToStudentPortal?: () => void;
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab = 'dashboard',
  selectedCategory = 'all',
  onNavigateTab,
  isOpen,
  onClose,
  onSwitchToStudentPortal,
  onLogout,
}) => {
  const navItems = [
    { id: 'all', label: 'All Notices', icon: 'dashboard' },
    { id: 'Academics', label: 'Academics', icon: 'school' },
    { id: 'Examination', label: 'Examination', icon: 'fact_check' },
    { id: 'Placement & Training', label: 'Placement & Training', icon: 'work' },
    { id: 'Events & Cultural', label: 'Events & Cultural', icon: 'celebration' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e2e6ec] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between gap-3 bg-white border-b border-[#e2e6ec]/70 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="/indira-logo.png"
                alt="ICEM Institutional Emblem"
                className="h-8 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-[#00275a] tracking-tight leading-none">ICEM</span>
                  <span className="text-[10px] font-bold uppercase bg-[#003c84] text-white px-1.5 py-0.5 rounded leading-none">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-[#5c6470] leading-tight mt-0.5 font-medium">
                  Notice Management
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-[#5c6470] hover:text-[#1c1b1b] rounded cursor-pointer"
              aria-label="Close navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Section Label: Notice Categories Navigation */}
          <div className="px-4 pt-4 pb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c6470]">
              Notice Categories
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 px-2 pb-3">
            {navItems.map((item) => {
              const isDashboard = currentTab === 'dashboard' || currentTab === 'manage-notices';
              const isActive = isDashboard && (
                item.id === 'all'
                  ? selectedCategory === 'all' || !selectedCategory
                  : selectedCategory?.toLowerCase() === item.id.toLowerCase()
              );

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onNavigateTab) {
                      onNavigateTab('dashboard', item.id);
                    }
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#d8e2ff] text-[#001a41] font-semibold shadow-xs'
                      : 'text-[#434751] hover:bg-[#eae7e7]/60 hover:text-[#1c1b1b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#00275a]' : 'text-[#737782]'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Clean Admin Profile */}
        <div className="p-3 bg-white border-t border-[#e2e6ec]/80 flex flex-col gap-2 shrink-0">
          {/* Admin User Card */}
          <div className="w-full flex items-center justify-between p-2 rounded-lg bg-[#f8fafc] border border-[#e2e6ec]/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#003c84] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-[#e2e6ec]">
                CA
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1c1b1b] leading-tight truncate">
                  College Admin
                </span>
                <span className="text-[10px] text-[#5c6470] truncate">ICEM Administration</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onSwitchToStudentPortal && (
                <button
                  onClick={onSwitchToStudentPortal}
                  title="Switch to Student Portal"
                  className="p-1 text-[#00696c] hover:bg-[#75f6fb]/20 rounded cursor-pointer transition-colors"
                  aria-label="Student Portal"
                >
                  <span className="material-symbols-outlined text-[18px]">school</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out of Admin Portal"
                  className="p-1 text-[#dc2626] hover:bg-[#fee2e2] rounded cursor-pointer transition-colors"
                  aria-label="Sign Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
