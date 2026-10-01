import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SplashScreen } from './components/layout/SplashScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ActionRequiredBanner } from './components/layout/ActionRequiredBanner';
import { DashboardView } from './views/DashboardView';
import { NoticesView } from './views/NoticesView';
import { NoticeDetailView } from './views/NoticeDetailView';
import { TimetableView, EventsView } from './views/SecondaryViews';
import { mockNotices, mockActionItems } from './data/mockNotices';
import { matchesNavCategory } from './types/notice';
import type { Notice } from './types/notice';

const NOTICES_STORAGE_KEY = 'icem_notices_v1';

const getInitialNotices = (): Notice[] => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(NOTICES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to load notices from storage:', err);
  }
  return mockNotices;
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>('notice-1');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notices, setNotices] = useState<Notice[]>(getInitialNotices);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sync notices across tabs and components
  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('icem_notices_channel');
        broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.notices && Array.isArray(event.data.notices)) {
            setNotices(event.data.notices);
          }
        };
      }
    } catch {
      broadcastChannel = null;
    }

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof CustomEvent && e.detail && Array.isArray(e.detail)) {
        setNotices(e.detail);
      } else {
        const updated = getInitialNotices();
        setNotices(updated);
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('icem-notices-update', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('icem-notices-update', handleStorageChange as EventListener);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  // Calculate live counts for the 5 categories
  const categoryCounts = useMemo(() => {
    return {
      all: notices.length,
      academics: notices.filter((n) => matchesNavCategory(n.category, 'academics')).length,
      examination: notices.filter((n) => matchesNavCategory(n.category, 'examination')).length,
      placement: notices.filter((n) => matchesNavCategory(n.category, 'placement')).length,
      events: notices.filter((n) => matchesNavCategory(n.category, 'events')).length,
      administration: notices.filter((n) => matchesNavCategory(n.category, 'administration')).length,
    };
  }, [notices]);

  // Parse URL hash for robust routing & back/forward/refresh support
  const parseRoute = useCallback(() => {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!rawHash || rawHash === 'dashboard' || rawHash === 'notices/all' || rawHash === 'notices') {
      return { view: 'dashboard', category: 'all', noticeId: undefined };
    }
    if (rawHash.startsWith('notices/')) {
      const cat = decodeURIComponent(rawHash.replace('notices/', '')).toLowerCase();
      return { view: 'notices', category: cat, noticeId: undefined };
    }
    if (rawHash.startsWith('notice/')) {
      const id = rawHash.replace('notice/', '');
      return { view: 'notice-detail', category: 'all', noticeId: id };
    }
    if (rawHash === 'timetable') {
      return { view: 'timetable', category: 'all', noticeId: undefined };
    }
    if (rawHash === 'events') {
      return { view: 'events', category: 'all', noticeId: undefined };
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
  const activeNotice = notices.find((n) => n.id === selectedNoticeId) || notices[0];

  // Back button handler from notice detail
  const handleBackFromDetail = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo(selectedCategory ? `notices/${selectedCategory}` : 'notices/all');
    }
  };

  // Toggle acknowledge state
  const handleToggleAcknowledge = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: !n.acknowledged } : n))
    );
  };

  // Toggle bookmark state
  const handleToggleBookmark = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, bookmarked: !n.bookmarked } : n))
    );
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
      />

      {/* Main Content Area */}
      <main className="relative pt-14 min-h-screen bg-[#f5f7fa] lg:pl-72 flex flex-col flex-1 max-w-full overflow-x-hidden">
        {/* Top Action Required Strip */}
        {(currentView === 'dashboard' || currentView === 'notices') && (
          <ActionRequiredBanner
            items={mockActionItems}
            onSelectNotice={handleSelectNotice}
          />
        )}

        {/* Dynamic View Router */}
        <div className="flex-1 w-full max-w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              notices={notices}
              selectedCategory="all"
              onSelectNotice={handleSelectNotice}
              onNavigateView={(view) => {
                if (view === 'notices') {
                  navigateTo('notices/all');
                } else {
                  navigateTo(view);
                }
              }}
              onRefreshData={() => setNotices([...mockNotices])}
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

          {currentView === 'notice-detail' && activeNotice && (
            <NoticeDetailView
              notice={activeNotice}
              allNotices={notices}
              onBack={handleBackFromDetail}
              onSelectNotice={handleSelectNotice}
              onToggleAcknowledge={handleToggleAcknowledge}
              onToggleBookmark={handleToggleBookmark}
            />
          )}

          {currentView === 'timetable' && (
            <TimetableView
              onNavigateNotice={handleSelectNotice}
              onNavigateView={(view) => {
                if (view === 'dashboard') navigateTo('dashboard');
                else if (view === 'notices') navigateTo('notices/all');
                else navigateTo(view);
              }}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              onNavigateNotice={handleSelectNotice}
              onNavigateView={(view) => {
                if (view === 'dashboard') navigateTo('dashboard');
                else if (view === 'notices') navigateTo('notices/all');
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