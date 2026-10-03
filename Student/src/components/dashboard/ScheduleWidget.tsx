import React, { useState, useEffect } from 'react';
import { Calendar, FileText, HelpCircle, BookOpen, ExternalLink } from 'lucide-react';
import { mockScheduleItems } from '../../data/mockNotices';
import { StudentApiService } from '../../services/studentApi';
import type { ScheduleItem } from '../../types/notice';

interface ScheduleWidgetProps {
  onNavigateView: (view: string) => void;
}

export const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ onNavigateView }) => {
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
    <div className="flex flex-col gap-3.5">
      {/* Quick Actions (Slimmer) */}
      <div className="bg-white p-2 border border-[#e2e6ec] rounded-lg flex gap-2 shadow-2xs">
        <button 
          onClick={() => onNavigateView('library')}
          className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-[#f5f7fa] hover:bg-[#eae7e7] border border-[#e2e6ec] rounded-sm transition-colors text-xs font-semibold text-[#1c1b1b]"
        >
          <FileText className="w-4 h-4 text-[#003c84]" />
          <span>Docs</span>
        </button>
        <button 
          onClick={() => onNavigateView('notices')}
          className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-[#f5f7fa] hover:bg-[#eae7e7] border border-[#e2e6ec] rounded-sm transition-colors text-xs font-semibold text-[#1c1b1b]"
        >
          <BookOpen className="w-4 h-4 text-[#00696c]" />
          <span>Circulars</span>
        </button>
        <button 
          onClick={() => alert('ICEM Student Helpdesk: support@indiraicem.ac.in | Toll-free: 1800-233-042')}
          className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-[#f5f7fa] hover:bg-[#eae7e7] border border-[#e2e6ec] rounded-sm transition-colors text-xs font-semibold text-[#1c1b1b]"
        >
          <HelpCircle className="w-4 h-4 text-[#003c84]" />
          <span>Help</span>
        </button>
      </div>

      {/* Schedule / Timetable Widget */}
      <div className="bg-white border border-[#e2e6ec] rounded-lg overflow-hidden shadow-2xs">
        <div className="bg-[#f6f3f2] border-b border-[#e2e6ec] p-3 flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#1c1b1b] flex items-center gap-1.5 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-[#003c84]" />
            Today's Schedule
          </h3>
          <span className="text-[11px] text-[#5c6470] font-semibold bg-white border border-[#e2e6ec] px-2 py-0.5 rounded-sm">
            Oct 24 (Tuesday)
          </span>
        </div>

        <ul className="flex flex-col divide-y divide-[#e2e6ec]">
          {schedule.map((item) => {
            const isBreak = item.type === 'break';
            return (
              <li
                key={item.id}
                className={`p-3 flex gap-3 items-start transition-colors ${
                  isBreak
                    ? 'bg-[#f6f3f2]/60 opacity-75'
                    : 'hover:bg-[#f5f7fa]'
                }`}
              >
                <div className="text-right shrink-0 w-12">
                  <div className="text-xs font-bold text-[#1c1b1b] leading-none">{item.time}</div>
                  <div className="text-[10px] text-[#5c6470] font-medium mt-0.5">{item.period}</div>
                </div>

                <div
                  className={`border-l-2 pl-2.5 ${
                    item.colorBorder === 'primary'
                      ? 'border-[#003c84]'
                      : item.colorBorder === 'secondary'
                      ? 'border-[#00696c]'
                      : item.colorBorder === 'tertiary'
                      ? 'border-[#7a3008]'
                      : 'border-[#c3c6d2]'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#1c1b1b] leading-tight">{item.subject}</p>
                  <p className="text-[11px] text-[#5c6470] mt-0.5">{item.details}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div 
          onClick={() => onNavigateView('timetable')}
          className="p-2.5 text-center bg-[#f5f7fa] hover:bg-[#eae7e7] border-t border-[#e2e6ec] transition-colors cursor-pointer"
        >
          <span className="text-[11px] font-bold text-[#003c84] uppercase tracking-wider flex items-center justify-center gap-1">
            Full Timetable <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
