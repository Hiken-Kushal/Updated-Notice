export type NoticeCategory =
  | 'Academics'
  | 'Academic'
  | 'Examination'
  | 'Exam'
  | 'Placement & Training'
  | 'Placement'
  | 'Events & Cultural'
  | 'Events'
  | 'Administration'
  | 'Administrative'
  | 'Admin'
  | 'General'
  | 'Sports'
  | 'Library'
  | string;

export type NavCategoryKey =
  | 'all'
  | 'academics'
  | 'academic'
  | 'examination'
  | 'exam'
  | 'placement'
  | 'events'
  | 'administration'
  | 'admin'
  | 'general'
  | string;

export const matchesNavCategory = (noticeCategory: string, categoryKey: string): boolean => {
  if (!categoryKey || categoryKey === 'all') return true;
  const cat = (noticeCategory || '').toLowerCase().trim();
  const key = categoryKey.toLowerCase().trim();

  if (key === 'academics' || key === 'academic') {
    return cat === 'academics' || cat === 'academic';
  }
  if (key === 'exam' || key === 'examination') {
    return cat === 'exam' || cat === 'examination';
  }
  if (key === 'placement' || key === 'placement & training' || key === 'training & placement') {
    return (
      cat === 'placement' ||
      cat === 'placement & training' ||
      cat === 'training & placement'
    );
  }
  if (key === 'events' || key === 'events & cultural' || key === 'cultural' || key === 'sports') {
    return (
      cat === 'events' ||
      cat === 'events & cultural' ||
      cat === 'cultural' ||
      cat === 'sports'
    );
  }
  if (key === 'admin' || key === 'administration' || key === 'administrative') {
    return (
      cat === 'admin' ||
      cat === 'administration' ||
      cat === 'administrative'
    );
  }
  if (key === 'general') {
    return (
      cat === 'general' ||
      cat === 'administrative' ||
      cat === 'admin' ||
      cat === 'administration' ||
      cat === 'academics' ||
      cat === 'academic' ||
      cat === 'events' ||
      cat === 'sports' ||
      cat === 'library'
    );
  }
  return cat === key;
};

/**
 * Strips HTML tags and markdown symbols for clean text snippet display in cards
 */
export const stripHtmlAndMarkdown = (str?: string): string => {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitizes and formats rich text / markdown into safe HTML for display
 */
export const formatNoticeContentToHtml = (content?: string, summary?: string): string => {
  const raw = content || summary || '';
  if (!raw) return '<p>No notice content provided.</p>';

  // Check if string contains HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(raw);

  let html = raw;
  if (!hasHtml) {
    // Convert Markdown / plain text to HTML
    html = raw
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      // Paragraphs & Line breaks
      .split(/\n\s*\n/)
      .map((para) => `<p class="mb-3">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }

  // Sanitize: strip script tags and dangerous event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
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
  departmentKey?: 'ce' | 'it' | 'mech' | 'civil' | 'all' | string;
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
  venue?: string;
  isFeatured?: boolean;
  status?: 'open' | 'closing-soon' | 'closed';
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