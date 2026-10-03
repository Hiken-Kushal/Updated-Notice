import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink 
} from 'lucide-react';
import type { FeaturedEvent } from '../../types/notice';
import { mockFeaturedEvents } from '../../data/mockNotices';
import { StudentApiService } from '../../services/studentApi';

const BANNER_STORAGE_KEY = 'icem_student_dashboard_banners';
const BANNER_CHANNEL_NAME = 'icem_banner_sync_channel';

interface FeaturedEventsProps {
  events?: FeaturedEvent[];
}

export const FeaturedEvents: React.FC<FeaturedEventsProps> = ({
  events: propEvents,
}) => {
  const [liveEvents, setLiveEvents] = useState<FeaturedEvent[]>(() => {
    if (propEvents && propEvents.length > 0) return propEvents;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(BANNER_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((e: any) => e.isActive !== false);
          }
        }
      } catch (err) {
        console.error('Error reading stored banners in Student Portal:', err);
      }
    }
    return mockFeaturedEvents;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({});

  // Sync with Backend and Admin Portal banner updates via localStorage & BroadcastChannel
  const loadActiveBanners = useCallback(async () => {
    if (propEvents && propEvents.length > 0) {
      setLiveEvents(propEvents);
      return;
    }

    try {
      const banners = await StudentApiService.getBanners();
      if (banners && banners.length > 0) {
        setLiveEvents(banners);
        return;
      }
    } catch (err) {
      console.warn('Backend getBanners failed in Student Portal, using local storage:', err);
    }

    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(BANNER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const activeOnly = parsed.filter((e: any) => e.isActive !== false);
          setLiveEvents(activeOnly);
          return;
        }
      }
      setLiveEvents(mockFeaturedEvents);
    } catch (err) {
      console.error('Error syncing banners in Student Portal:', err);
      setLiveEvents(mockFeaturedEvents);
    }
  }, [propEvents]);

  useEffect(() => {
    loadActiveBanners();

    // 1. Listen for storage events across tabs/windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === BANNER_STORAGE_KEY || !e.key) {
        loadActiveBanners();
      }
    };

    // 2. Listen for custom events
    const handleCustomUpdate = () => {
      loadActiveBanners();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('icem-banner-update', handleCustomUpdate);

    // 3. Listen via BroadcastChannel if available
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel(BANNER_CHANNEL_NAME);
        channel.onmessage = () => {
          loadActiveBanners();
        };
      } catch (e) {
        // BroadcastChannel fallback
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('icem-banner-update', handleCustomUpdate);
      if (channel) {
        channel.close();
      }
    };
  }, [loadActiveBanners]);

  // If active events list changes, make sure currentIndex remains valid
  useEffect(() => {
    if (currentIndex >= liveEvents.length) {
      setCurrentIndex(0);
    }
  }, [liveEvents.length, currentIndex]);

  if (!liveEvents || liveEvents.length === 0) return null;

  const currentEvent = liveEvents[currentIndex] || liveEvents[0];
  const isRegistered = !!registeredEvents[currentEvent.id];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? liveEvents.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === liveEvents.length - 1 ? 0 : prev + 1));
  };

  const handleRegister = () => {
    setRegisteredEvents((prev) => ({ ...prev, [currentEvent.id]: true }));
  };

  const ctaLabel = (currentEvent as any).actionText || 'Register';

  return (
    <>
      {/* Featured Event Card (Preserves exact dimensions, gradients & shadows) */}
      <div 
        onClick={() => setShowModal(true)}
        className="border border-[#e2e6ec] rounded-lg overflow-hidden relative h-36 group cursor-pointer shadow-2xs select-none"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${StudentApiService.resolveFileUrl(currentEvent.image)}')`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top Tag & Carousel Dots / Arrows */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-sm">
            <Sparkles className="w-3 h-3 text-[#43ccd1]" /> {currentEvent.tag}
          </span>

          {/* Carousel Controls if multiple events */}
          {liveEvents.length > 1 && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-sm">
              <button
                onClick={handlePrev}
                className="text-white hover:text-[#43ccd1] p-0.5 transition-colors cursor-pointer"
                aria-label="Previous event"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {liveEvents.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'bg-[#43ccd1] w-3' : 'bg-white/50 hover:bg-white'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="text-white hover:text-[#43ccd1] p-0.5 transition-colors cursor-pointer"
                aria-label="Next event"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Details & Action */}
        <div className="absolute bottom-0 left-0 p-3.5 w-full flex justify-between items-end">
          <div className="min-w-0 flex-1 mr-2">
            <h4 className="text-sm font-bold text-white leading-tight truncate">
              {currentEvent.title}
            </h4>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              {currentEvent.deadlineText}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
            className="bg-[#003c84] hover:bg-[#43ccd1] text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-sm shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            {isRegistered ? 'Registered ✓' : ctaLabel}
          </button>
        </div>
      </div>

      {/* Event Details & Registration Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-[#e2e6ec] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Event Banner */}
            <div className="relative h-40 bg-[#00275a] p-4 text-white flex flex-col justify-end overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url('${StudentApiService.resolveFileUrl(currentEvent.image)}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00275a] via-[#00275a]/70 to-transparent" />

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <span className="text-xs font-bold text-[#43ccd1] uppercase tracking-wider">
                  {currentEvent.tag}
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {currentEvent.title}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-3.5 text-xs text-[#1c1b1b]">
              {currentEvent.startDate && (
                <div className="flex items-center gap-2 text-[#5c6470]">
                  <Calendar className="w-4 h-4 text-[#003c84] shrink-0" />
                  <span>
                    {currentEvent.startDate}
                    {currentEvent.endDate ? ` – ${currentEvent.endDate}` : ''}
                  </span>
                </div>
              )}

              {currentEvent.venue && (
                <div className="flex items-center gap-2 text-[#5c6470]">
                  <MapPin className="w-4 h-4 text-[#003c84] shrink-0" />
                  <span>{currentEvent.venue}</span>
                </div>
              )}

              <p className="leading-relaxed text-[#434751]">
                {currentEvent.shortDescription}
              </p>

              {isRegistered ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-sm flex items-center gap-2 font-medium animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>You are registered for {currentEvent.title}! Confirmation details have been sent.</span>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full py-2.5 bg-[#003c84] hover:bg-[#00275a] text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer text-center"
                >
                  Confirm Event Registration
                </button>
              )}

              {currentEvent.registrationUrl && (
                <div className="text-center pt-1">
                  <a
                    href={currentEvent.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#003c84] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Visit Official Event Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
