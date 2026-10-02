import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ArrowRight,
  X, 
  ExternalLink, 
  FileText,
  Users
} from 'lucide-react';
import { mockFeaturedEvents } from '../data/mockNotices';
import type { FeaturedEvent } from '../types/notice';

interface EventsCultureViewProps {
  onNavigateNotice: (id: string) => void;
  onNavigateView?: (view: string) => void;
}

export const EventsCultureView: React.FC<EventsCultureViewProps> = ({
  onNavigateNotice,
  onNavigateView,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [selectedEvent, setSelectedEvent] = useState<FeaturedEvent | null>(null);

  const categories = [
    'All Events',
    'Cultural Events',
    'College Events',
    'Festivals',
    'Competitions',
    'Workshops',
    'Student Activities',
  ];

  // Filter events based on selected category tab
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All Events') return mockFeaturedEvents;

    return mockFeaturedEvents.filter((item) => {
      if (item.category === selectedCategory) return true;

      // Also support dual mapping based on tag and content
      const catLow = selectedCategory.toLowerCase();
      const tagLow = (item.tag || '').toLowerCase();
      const titleLow = (item.title || '').toLowerCase();

      if (catLow.includes('cultural')) {
        return tagLow.includes('cultur') || tagLow.includes('drama') || tagLow.includes('dance') || tagLow.includes('music') || tagLow.includes('audition') || tagLow.includes('theatre');
      }
      if (catLow.includes('college')) {
        return true; // All campus events belong to college
      }
      if (catLow.includes('festival')) {
        return tagLow.includes('fest') || titleLow.includes('fest') || titleLow.includes('gathering');
      }
      if (catLow.includes('competition')) {
        return tagLow.includes('hackathon') || tagLow.includes('competition') || titleLow.includes('championship') || titleLow.includes('face-off');
      }
      if (catLow.includes('workshop')) {
        return tagLow.includes('workshop') || titleLow.includes('bootcamp');
      }
      if (catLow.includes('student')) {
        return tagLow.includes('audition') || titleLow.includes('audition') || tagLow.includes('sports');
      }
      return false;
    });
  }, [selectedCategory]);

  const getCategoryBadgeStyle = (category?: string) => {
    switch (category) {
      case 'Cultural Events':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Festivals':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Competitions':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Workshops':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'College Events':
        return 'bg-blue-50 text-[#00275a] border-blue-200';
      case 'Student Activities':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3.5 sm:p-6 flex flex-col gap-5 sm:gap-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        {onNavigateView && (
          <button
            onClick={() => onNavigateView('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-[#003c84] font-semibold hover:underline cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to All Notices</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs text-[#5c6470]">
          <span>Portal</span>
          <span>/</span>
          <span className="font-semibold text-[#00275a]">Events & Cultures</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-[#e2e6ec] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1c1b1b] flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-[#003c84]" />
              <span>Events & Cultures</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5c6470] mt-1.5">
              Discover upcoming college events, cultural activities and campus celebrations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-2.5 py-1 bg-[#00275a]/5 text-[#00275a] text-xs font-semibold rounded-sm border border-[#00275a]/10">
              {mockFeaturedEvents.length} Active Events
            </span>
          </div>
        </div>
      </div>

      {/* Clean Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#00275a] text-white border-[#00275a] shadow-xs'
                  : 'bg-white hover:bg-[#f5f7fa] text-[#434751] hover:text-[#1c1b1b] border-[#e2e6ec]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredEvents.map((event) => {
          const badgeStyle = getCategoryBadgeStyle(event.category);
          const dateText = event.startDate
            ? event.endDate && event.endDate !== event.startDate
              ? `${event.startDate} – ${event.endDate}`
              : event.startDate
            : event.deadlineText;

          return (
            <div
              key={event.id}
              className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#cbd5e1] transition-all flex flex-col group h-full"
            >
              {/* Optional event image / banner */}
              {event.image && (
                <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-2xs backdrop-blur-xs ${badgeStyle}`}
                    >
                      {event.category || event.tag}
                    </span>
                  </div>

                  {event.status === 'closing-soon' && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs uppercase tracking-wider">
                      Closing Soon
                    </div>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category Pill if no image */}
                  {!event.image && (
                    <div className="mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                      >
                        {event.category || event.tag}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-semibold text-[#1c1b1b] group-hover:text-[#003c84] transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-[#5c6470] mt-2 line-clamp-2 leading-relaxed">
                    {event.shortDescription}
                  </p>

                  {/* Meta Details */}
                  <div className="mt-3.5 pt-3 border-t border-[#f0f2f5] space-y-1.5 text-xs text-[#434751]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#003c84] shrink-0" />
                      <span className="font-medium truncate">{dateText}</span>
                    </div>

                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#737782] shrink-0" />
                        <span className="text-[#5c6470] truncate">{event.time}</span>
                      </div>
                    )}

                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="text-[#5c6470] truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Row */}
                <div className="mt-4 pt-3 border-t border-[#f0f2f5] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#737782]">
                    {event.deadlineText}
                  </span>

                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#003c84] hover:text-[#00275a] hover:underline cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-xl border border-[#e2e6ec] p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#737782] mx-auto opacity-50" />
          <h4 className="text-sm font-semibold text-[#1c1b1b]">No events found in this category</h4>
          <p className="text-xs text-[#5c6470]">Try selecting 'All Events' to view the complete schedule.</p>
          <button
            onClick={() => setSelectedCategory('All Events')}
            className="px-3.5 py-1.5 bg-[#003c84] text-white text-xs font-semibold rounded-sm cursor-pointer hover:bg-[#00275a] transition-colors"
          >
            Show All Events
          </button>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-xl border border-[#e2e6ec] max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            {selectedEvent.image && (
              <div className="h-44 sm:h-52 w-full relative shrink-0 bg-slate-900">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#003c84] text-white border border-white/20">
                    {selectedEvent.category || selectedEvent.tag}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold mt-1 line-clamp-2 leading-snug">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>
            )}

            {/* Modal Content Scroll Area */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {!selectedEvent.image && (
                <div className="flex items-start justify-between gap-3 border-b border-[#e2e6ec] pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#003c84]/10 text-[#00275a] border border-[#003c84]/20">
                      {selectedEvent.category || selectedEvent.tag}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-[#1c1b1b] mt-1">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1.5 text-[#5c6470] hover:text-[#1c1b1b] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Event Details Grid */}
              <div className="bg-[#f8fafc] border border-[#e2e6ec] rounded-lg p-3 sm:p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#1c1b1b]">
                  <Calendar className="w-4 h-4 text-[#003c84] shrink-0" />
                  <span className="font-semibold">Date:</span>
                  <span>
                    {selectedEvent.startDate}
                    {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate
                      ? ` – ${selectedEvent.endDate}`
                      : ''}
                  </span>
                </div>

                {selectedEvent.time && (
                  <div className="flex items-center gap-2 text-[#1c1b1b]">
                    <Clock className="w-4 h-4 text-[#737782] shrink-0" />
                    <span className="font-semibold">Time:</span>
                    <span>{selectedEvent.time}</span>
                  </div>
                )}

                {selectedEvent.venue && (
                  <div className="flex items-center gap-2 text-[#1c1b1b]">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-semibold">Venue:</span>
                    <span>{selectedEvent.venue}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[#1c1b1b]">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Registration Status:</span>
                  <span className="capitalize">{selectedEvent.status || 'Open'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-[#00275a] uppercase tracking-wider mb-1.5">
                  About the Event
                </h4>
                <p className="text-xs sm:text-sm text-[#434751] leading-relaxed">
                  {selectedEvent.longDescription || selectedEvent.shortDescription}
                </p>
              </div>

              {/* College Notice Reference */}
              {selectedEvent.noticeId && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#00275a]">
                    <FileText className="w-4 h-4 text-[#003c84] shrink-0" />
                    <span>Official circular notice published for this event</span>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedEvent.noticeId) {
                        onNavigateNotice(selectedEvent.noticeId);
                        setSelectedEvent(null);
                      }
                    }}
                    className="text-xs font-semibold text-[#003c84] hover:underline shrink-0 cursor-pointer"
                  >
                    View Circular →
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 sm:p-4 bg-[#f8fafc] border-t border-[#e2e6ec] flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#5c6470] hover:text-[#1c1b1b] rounded-sm transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedEvent.registrationUrl && (
                <a
                  href={selectedEvent.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-[#003c84] hover:bg-[#00275a] text-white text-xs font-semibold rounded-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Register Online</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EventsCultureView;
