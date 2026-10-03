import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowLeft
} from 'lucide-react';
import { mockScheduleItems } from '../data/mockNotices';
import { StudentApiService } from '../services/studentApi';
import type { ScheduleItem } from '../types/notice';

interface GenericViewProps {
  onNavigateNotice: (id: string) => void;
  onNavigateView?: (view: string) => void;
}

export const TimetableView: React.FC<GenericViewProps> = ({ onNavigateView }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(mockScheduleItems);

  useEffect(() => {
    StudentApiService.getTimetable()
      .then((items) => {
        if (items && items.length > 0) {
          setSchedule(items);
        }
      })
      .catch((err) => {
        console.warn('Could not load timetable from backend, using fallback:', err);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-3.5 sm:p-6 flex flex-col gap-4 sm:gap-5">
      {onNavigateView && (
        <button
          onClick={() => onNavigateView('dashboard')}
          className="self-start flex items-center gap-1.5 text-xs text-[#003c84] font-semibold hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Notices</span>
        </button>
      )}

      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#e2e6ec] shadow-2xs">
        <h1 className="text-lg sm:text-xl font-bold text-[#1c1b1b] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#003c84]" /> Weekly Academic Timetable
        </h1>
        <p className="text-xs text-[#5c6470] mt-1">Computer Engineering • Semester I (AY 2026-27)</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e6ec] overflow-hidden shadow-2xs">
        <div className="p-3.5 sm:p-4 bg-[#f8fafc] border-b border-[#e2e6ec] flex justify-between items-center">
          <span className="font-bold text-xs text-[#00275a] uppercase tracking-wider">Tuesday Schedule (Current)</span>
          <span className="text-xs text-[#5c6470] font-medium">Room 304 & Labs</span>
        </div>
        <div className="divide-y divide-[#e2e6ec]">
          {schedule.map((item) => (
            <div key={item.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 hover:bg-[#f8fafc] transition-colors">
              <div className="w-24 shrink-0 font-bold text-xs sm:text-sm text-[#00275a]">
                {item.time} {item.period}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs sm:text-sm text-[#1c1b1b]">{item.subject}</h4>
                <p className="text-[11px] sm:text-xs text-[#5c6470] mt-0.5">{item.details}</p>
              </div>
              <span className="self-start text-[10px] sm:text-[11px] uppercase font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded shrink-0">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EventsView: React.FC<GenericViewProps> = () => null;

