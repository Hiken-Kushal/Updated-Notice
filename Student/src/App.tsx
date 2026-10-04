import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SplashScreen } from './components/layout/SplashScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ActionRequiredBanner } from './components/layout/ActionRequiredBanner';
import { DashboardView } from './views/DashboardView';
import { NoticesView } from './views/NoticesView';
import { NoticeDetailView } from './views/NoticeDetailView';
import { TimetableView } from './views/SecondaryViews';
import { AdminLoginView } from './views/AdminLoginView';
import { matchesNavCategory } from './types/notice';
import type { Notice, ActionItem } from './types/notice';
import { StudentApiService } from './services/studentApi';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadNotices = useCallback(async () => {
    try {
      const data = await StudentApiService.getNotices({ limit: 100 });
      if (Array.isArray(data)) {
        setNotices(data);
        if (data.length > 0) {
          if (!selectedNoticeId || !data.some((n) => n.id === selectedNoticeId)) {
            setSelectedNoticeId(data[0].id);
          }
        } else {
          setSelectedNoticeId('');
        }
      }
    } catch (err) {
      console.warn('Backend notices fetch failed in Student Portal:', err);
    }
  }, [selectedNoticeId]);

  const loadActionItems = useCallback(async () => {
    try {
      const items = await StudentApiService.getActionRequired();
      if (Array.isArray(items)) {
        setActionItems(items);
      }
    } catch (err) {
      console.warn('Backend action items fetch failed in Student Portal:', err);
    }
  }, []);

  useEffect(() => {
    loadNotices();
    loadActionItems();
  }, [loadNotices, loadActionItems]);

  // Calculate live counts for the 4 sidebar notice categories + events
  const categoryCounts = useMemo(() => {
    return {
      all: notices.length,
      exam: notices.filter((n) => matchesNavCategory(n.category, 'exam')).length,
      placement: notices.filter((n) => matchesNavCategory(n.category, 'placement')).length,
      general: notices.filter((n) => matchesNavCategory(n.category, 'general')).length,
      events: notices.filter((n) => matchesNavCategory(n.category, 'events')).length,
    };
  }, [notices]);

  // Parse URL hash for robust routing & back/forward/refresh support
  const parseRoute = useCallback(() => {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!rawHash || rawHash === 'dashboard' || rawHash === 'notices/all' || rawHash === 'notices') {
      return { view: 'dashboard', category: 'all', noticeId: undefined };
    }
    if (rawHash === 'admin-login' || rawHash === 'admin' || rawHash === 'login') {
      return { view: 'admin-login', category: 'all', noticeId: undefined };
    }
    if (rawHash.startsWith('notices/')) {
      const cat = rawHash.replace('notices/', '').toLowerCase();
      if (cat === 'exam' || cat === 'placement' || cat === 'general' || cat === 'events') {
        return { view: 'dashboard', category: cat, noticeId: undefined };
      }
      return { view: 'dashboard', category: 'all', noticeId: undefined };
    }
    if (rawHash === 'notices-table' || rawHash === 'notices-all-table') {
      return { view: 'notices', category: 'all', noticeId: undefined };
    }
    if (rawHash.startsWith('notice/')) {
      const id = rawHash.replace('notice/', '');
      return { view: 'notice-detail', category: 'all', noticeId: id };
    }
    if (rawHash === 'timetable') {
      return { view: 'timetable', category: 'all', noticeId: undefined };
    }
    if (rawHash === 'events' || rawHash === 'events-cultures') {
      return { view: 'dashboard', category: 'events', noticeId: undefined };
    }
    return { view: 'dashboard', category: 'all', noticeId: undefined };
  }, []);

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseRoute();
      setCurrentView(route.view);
      if (route.category) {
        setSelectedCategory(route.category);
      }
      if (route.noticeId) {
        setSelectedNoticeId(route.noticeId);
      }
    };

    // Run on initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseRoute]);

  // Navigate helper updating hash
  const navigateTo = (path: string) => {
    const cleanPath = path.replace(/^#\/?/, '').replace(/^\//, '');
    const newHash = `#/${cleanPath}`;
    if (window.location.hash !== newHash) {
      window.location.hash = newHash;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle category selection from left sidebar - opens dedicated category page
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    navigateTo(`notices/${cat}`);
  };

  // Navigate to notice details
  const handleSelectNotice = (id: string) => {
    setSelectedNoticeId(id);
    navigateTo(`notice/${id}`);
  };

  // Find active selected notice for detail view
  const activeNotice = notices.find((n) => n.id === selectedNoticeId) || (notices.length > 0 ? notices[0] : null);

  // Back button handler from notice detail
  const handleBackFromDetail = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo(selectedCategory ? `notices/${selectedCategory}` : 'notices/all');
    }
  };

  // Toggle acknowledge state
  const handleToggleAcknowledge = async (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: !n.acknowledged } : n))
    );
    try {
      await StudentApiService.toggleAcknowledge(id);
    } catch (err) {
      console.warn('Could not sync acknowledgement with backend:', err);
    }
  };

  // Toggle bookmark state
  const handleToggleBookmark = async (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n))
    );
    try {
      await StudentApiService.toggleBookmark(id);
    } catch (err) {
      console.warn('Could not sync bookmark with backend:', err);
    }
  };

  // Global Search trigger
  const handleSearchSubmit = () => {
    if (searchTerm.trim() && currentView !== 'notices' && currentView !== 'dashboard') {
      navigateTo('notices/all');
    }
  };

  // Global keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search notices"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (currentView === 'admin-login') {
    return (
      <AdminLoginView
        onBackToStudentPortal={() => navigateTo('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#1c1b1b] flex flex-col selection:bg-[#003c84] selection:text-white overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onNavigate={(view) => {
          if (view === 'dashboard') {
            navigateTo('dashboard');
          } else if (view === 'notices') {
            navigateTo('notices/all');
          } else {
            navigateTo(view);
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categoryCounts={categoryCounts}
        totalNoticesCount={notices.length}
      />

      {/* Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        onNavigateNotice={handleSelectNotice}
        onNavigateAdminLogin={() => navigateTo('admin-login')}
      />

      {/* Main Content Area */}
      <main className="relative pt-14 min-h-screen bg-[#f5f7fa] lg:pl-72 flex flex-col flex-1 max-w-full overflow-x-hidden">
        {/* Top Action Required Strip */}
        {(currentView === 'dashboard' || currentView === 'notices' || currentView === 'events') && (
          <ActionRequiredBanner
            items={actionItems}
            onSelectNotice={handleSelectNotice}
          />
        )}

        {/* Dynamic View Router */}
        <div className="flex-1 w-full max-w-full">
          {(currentView === 'dashboard' || currentView === 'events') && (
            <DashboardView
              notices={notices}
              selectedCategory={selectedCategory}
              onSelectNotice={handleSelectNotice}
              onNavigateView={(view) => {
                if (view === 'notices') {
                  navigateTo('notices-table');
                } else {
                  navigateTo(view);
                }
              }}
              onRefreshData={loadNotices}
              searchTerm={searchTerm}
              onClearSearch={() => setSearchTerm('')}
            />
          )}

          {currentView === 'notices' && (
            <NoticesView
              key={selectedCategory}
              notices={notices}
              selectedCategory={selectedCategory}
              onSelectNotice={handleSelectNotice}
              initialSearch={searchTerm}
            />
          )}

          {currentView === 'notice-detail' && (
            activeNotice ? (
              <NoticeDetailView
                notice={activeNotice}
                allNotices={notices}
                onBack={handleBackFromDetail}
                onSelectNotice={handleSelectNotice}
                onToggleAcknowledge={handleToggleAcknowledge}
                onToggleBookmark={handleToggleBookmark}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-[#5c6470] max-w-md mx-auto my-12 bg-white rounded-xl border border-[#e2e6ec] shadow-2xs">
                <p className="text-base font-semibold text-[#1c1b1b] mb-1">Notice Not Found</p>
                <p className="text-xs mb-4">The requested circular may have been removed, archived, or is unavailable.</p>
                <button
                  onClick={handleBackFromDetail}
                  className="px-4 py-2 bg-[#003c84] text-white rounded text-xs font-semibold hover:bg-[#00275a] transition-colors cursor-pointer"
                >
                  Back to Notices
                </button>
              </div>
            )
          )}

          {currentView === 'timetable' && (
            <TimetableView
              onNavigateNotice={handleSelectNotice}
              onNavigateView={(view) => {
                if (view === 'dashboard') navigateTo('dashboard');
                else if (view === 'notices') navigateTo('dashboard');
                else navigateTo(view);
              }}
            />
          )}
        </div>
      </main>

      {/* Full Viewport Initial Loading Screen Overlay */}
      <SplashScreen />
    </div>
  );
};

export default App;

