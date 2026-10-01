import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminNoticeWorkbench } from './views/AdminNoticeWorkbench';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [publishedCount, setPublishedCount] = useState<number>(0);

  // Hash-based routing
  const parseRoute = useCallback(() => {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (!rawHash || rawHash === 'dashboard' || rawHash === 'manage-notices' || rawHash === 'admin') {
      return { tab: 'dashboard', category: 'all' };
    }
    if (rawHash === 'create-notice') {
      return { tab: 'create-notice', category: 'all' };
    }
    if (rawHash.startsWith('category/')) {
      const cat = decodeURIComponent(rawHash.replace('category/', ''));
      return { tab: 'dashboard', category: cat };
    }
    return { tab: 'dashboard', category: 'all' };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const route = parseRoute();
      setCurrentTab(route.tab);
      setSelectedCategory(route.category);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseRoute]);

  const handleNavigateTab = (tab: string, category: string = 'all') => {
    setCurrentTab(tab);
    setSelectedCategory(category);
    if (tab === 'create-notice') {
      window.location.hash = '#/create-notice';
    } else if (category && category !== 'all') {
      window.location.hash = `#/category/${encodeURIComponent(category)}`;
    } else {
      window.location.hash = '#/dashboard';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatsChange = (total: number, published: number) => {
    setTotalCount(total);
    setPublishedCount(published);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#1c1b1b] flex flex-col selection:bg-[#003c84] selection:text-white overflow-x-hidden font-sans">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        selectedCategory={selectedCategory}
        onNavigateTab={handleNavigateTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Top Header */}
      <AdminHeader
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalNoticesCount={totalCount}
        publishedNoticesCount={publishedCount}
        onCreateNotice={() => handleNavigateTab('create-notice')}
      />

      {/* Main Administrative Content Area */}
      <main className="relative pt-20 min-h-screen bg-[#f5f7fa] lg:ml-64 flex flex-col flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
        <AdminNoticeWorkbench
          initialSearch={searchTerm}
          currentTab={currentTab}
          selectedCategory={selectedCategory}
          onNavigateTab={handleNavigateTab}
          onStatsChange={handleStatsChange}
        />
      </main>
    </div>
  );
};

export default App;
