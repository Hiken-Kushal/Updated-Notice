import React, { useState } from 'react';
import {
  BellRing,
  FileCheck,
  Briefcase,
  Megaphone,
  Sparkles,
  X,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StudentApiService } from '../../services/studentApi';

interface SidebarProps {
  currentView: string;
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  categoryCounts?: {
    all: number;
    exam: number;
    placement: number;
    general: number;
    events?: number;
  };
  totalNoticesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedCategory = 'all',
  onSelectCategory,
  onNavigate,
  isOpen,
  onClose,
  categoryCounts,
  totalNoticesCount = 13,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleBrandClick = () => {
    onNavigate('dashboard');
    onClose();
  };

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    onClose();
  };

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }
    setEmailError('');
    setIsSubscribed(true);
    try {
      await StudentApiService.subscribeNewsletter({ email: email.trim() });
    } catch (err) {
      console.warn('Backend newsletter subscription error:', err);
    }
  };

  const isNoticesView = currentView === 'dashboard' || currentView === 'notices' || currentView === 'notice-detail' || currentView === 'events';

  const navCategories = [
    {
      id: 'all',
      label: 'All Notices',
      icon: BellRing,
      count: categoryCounts?.all ?? totalNoticesCount,
    },
    {
      id: 'exam',
      label: 'Exam Notices',
      icon: FileCheck,
      count: categoryCounts?.exam ?? 0,
    },
    {
      id: 'placement',
      label: 'Placement Notices',
      icon: Briefcase,
      count: categoryCounts?.placement ?? 0,
    },
    {
      id: 'general',
      label: 'General Notices',
      icon: Megaphone,
      count: categoryCounts?.general ?? 0,
    },
    {
      id: 'events',
      label: 'Events & Cultures',
      icon: Sparkles,
      count: categoryCounts?.events ?? 8,
    },
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

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white z-50 flex flex-col border-r border-[#e2e6ec] shadow-sm transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-4 gap-3 border-b border-[#e2e6ec] shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={handleBrandClick}
          >
            <div className="w-8 h-8 rounded-sm bg-white p-0.5 border border-[#e2e6ec] flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src="/indira-logo.png"
                alt="Indira Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-[#00275a] text-lg tracking-tight leading-none block">ICEM Portal</span>
              <span className="text-[10px] text-[#5c6470] font-semibold tracking-wider uppercase">INDIRA COLLEGE</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#5c6470] hover:text-[#1c1b1b] rounded"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation & Content Section */}
        <div className="flex-1 flex flex-col justify-between px-3 py-4 overflow-y-auto">
          {/* Notice Categories Navigation Stack */}
          <div className="flex flex-col gap-1.5">
            <div className="px-3.5 pb-1 pt-0.5">
              <span className="text-[10px] font-bold text-[#737782] uppercase tracking-wider">
                Categories
              </span>
            </div>

            {navCategories.map((item) => {
              const IconComponent = item.icon;
              const isActive = isNoticesView && selectedCategory === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleCategoryClick(item.id)}
                  className={`w-full flex items-center px-3.5 py-3 text-sm font-semibold transition-all rounded-sm text-left cursor-pointer ${isActive
                      ? 'bg-[#003c84]/10 text-[#00275a] border-l-4 border-[#003c84] shadow-2xs'
                      : 'text-[#434751] hover:bg-[#f5f7fa] hover:text-[#1c1b1b] border-l-4 border-transparent'
                    }`}
                >
                  <IconComponent
                    className={`w-5 h-5 mr-3 shrink-0 ${isActive ? 'text-[#003c84]' : 'text-[#737782]'}`}
                  />
                  <span className="flex-1 truncate text-sm">{item.label}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${isActive
                        ? 'bg-[#003c84]/15 text-[#00275a]'
                        : 'bg-[#e2e6ec]/70 text-[#5c6470]'
                      }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>


          {/* Email Subscription Card (Compact & Secondary) */}
          <div className="mt-auto pt-4">
            <div className="p-3.5 bg-[#f8fafc] border border-[#e2e6ec] rounded-lg shadow-2xs">
              <div className="flex items-center gap-1.5 text-[#00275a] mb-1">
                <Mail className="w-4 h-4 text-[#003c84] shrink-0" />
                <h4 className="text-xs font-bold text-[#1c1b1b] leading-tight">
                  Never miss an important notice
                </h4>
              </div>

              <p className="text-[11px] text-[#5c6470] leading-snug mb-3">
                Get the latest college announcements directly in your inbox.
              </p>

              {isSubscribed ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-2.5 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-emerald-800 leading-snug font-medium">
                    ✓ You're subscribed! You'll receive new notices by email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    placeholder="Enter your email address"
                    className={`w-full px-2.5 py-1.5 text-xs bg-white border rounded-sm text-[#1c1b1b] placeholder:text-[#737782] focus:border-[#003c84] focus:outline-none transition-colors ${emailError ? 'border-red-400 focus:border-red-500' : 'border-[#e2e6ec]'
                      }`}
                  />
                  {emailError && (
                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailError}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 bg-[#003c84] hover:bg-[#00275a] text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer text-center shadow-2xs"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
