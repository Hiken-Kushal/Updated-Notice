export type NoticeCategory =
  | 'Academic'
  | 'Academics'
  | 'Examination'
  | 'Exam'
  | 'Placement'
  | 'Placement & Training'
  | 'Events'
  | 'Events & Cultural'
  | 'Administrative'
  | 'Administration'
  | 'Admin'
  | 'General'
  | 'Sports'
  | 'Library';

export type NavCategoryKey = 'all' | 'exam' | 'placement' | 'general' | 'events' | 'academic';

export const matchesNavCategory = (noticeCategory: string, categoryKey: string): boolean => {
  if (!categoryKey || categoryKey === 'all') return true;
  const cat = (noticeCategory || '').toLowerCase().trim();
  const key = categoryKey.toLowerCase().trim();

  // Examination / Exam
  if (key === 'exam' || key === 'examination') {
    return cat.includes('exam');
  }

  // Placement & Training -> placement
  if (key === 'placement' || key === 'placement & training') {
    return cat.includes('placement');
  }

  // Events & Cultural -> events
  if (
    key === 'events' ||
    key === 'event' ||
    key === 'culture' ||
    key === 'cultural' ||
    key === 'events & cultural' ||
    key === 'sports'
  ) {
    return (
      cat.includes('event') ||
      cat.includes('cultural') ||
      cat.includes('culture') ||
      cat.includes('sport')
    );
  }

  // Academics -> academic
  if (key === 'academic' || key === 'academics') {
    return cat.includes('acad');
  }

  // Administration -> general
  if (
    key === 'general' ||
    key === 'administration' ||
    key === 'administrative' ||
    key === 'admin'
  ) {
    return (
      cat.includes('admin') ||
      cat.includes('general') ||
      cat.includes('library') ||
      cat.includes('acad') ||
      cat === 'administration' ||
      cat === 'administrative'
    );
  }

  return cat === key || cat.includes(key);
};


export interface Attachment {
  name: string;
  size: string;
  type: 'pdf' | 'excel' | 'image' | 'doc';
  url?: string;
}

export interface Notice {
  id: string;
  title: string;
  category: NoticeCategory;
  date: string;
  time?: string;
  summary: string;
  content: string;
  fullBody?: {
    salutation?: string;
    introduction: string;
    sections?: {
      title: string;
      items?: string[];
      paragraphs?: string[];
    }[];
    callout?: string;
    instructions?: string[];
  };
  important?: boolean;
  urgent?: boolean;
  actionRequired?: boolean;
  actionDeadline?: string;
  targetAudience: string;
  department: string;
  departmentKey?: 'ce' | 'it' | 'mech' | 'civil' | 'all';
  issuedBy: string;
  attachments?: Attachment[];
  acknowledged?: boolean;
  bookmarked?: boolean;
  facultyAvatar?: string;
  accentColor?: 'warning' | 'primary' | 'secondary' | 'neutral' | 'error' | 'info';
}

export interface RecentUpdate {
  id: string;
  title: string;
  department: string;
  timeAgo: string;
  category?: NoticeCategory | string;
  noticeId?: string;
  isUrgent?: boolean;
}

export interface CollegeDocument {
  id: string;
  title: string;
  category: string;
  fileType: 'pdf' | 'doc' | 'excel';
  fileSize: string;
  description?: string;
  downloadUrl?: string;
  lastUpdated?: string;
}

export interface FeaturedEvent {
  id: string;
  title: string;
  tag: string;
  image: string;
  shortDescription: string;
  registrationUrl?: string;
  deadlineText: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  venue?: string;
  isFeatured?: boolean;
  status?: 'open' | 'closing-soon' | 'closed';
  category?: 'Cultural Events' | 'College Events' | 'Festivals' | 'Competitions' | 'Workshops' | 'Student Activities' | string;
  noticeId?: string;
  longDescription?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  period: 'AM' | 'PM';
  subject: string;
  details: string;
  type: 'lecture' | 'lab' | 'break';
  colorBorder: 'primary' | 'secondary' | 'tertiary' | 'muted';
}

export interface ActionItem {
  id: string;
  dateLabel: string;
  title: string;
  noticeId: string;
  type: 'error' | 'warning' | 'info';
}
