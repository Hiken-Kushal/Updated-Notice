export type NoticeStatus = 'Published' | 'Archived';

export type AdminNoticeCategory =
  | 'Academics'
  | 'Examination'
  | 'Placement & Training'
  | 'Events & Cultural'
  | 'Administration';

export interface AdminAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'excel' | 'image' | 'doc';
  url?: string;
}

export interface AdminNotice {
  id: string;
  refNo: string;
  title: string;
  category: AdminNoticeCategory | string;
  status: NoticeStatus;
  summary: string;
  content?: string;
  issuedBy: string;
  department: string;
  departmentKey: 'tpo' | 'exam' | 'comp' | 'it' | 'admin' | 'all' | string;
  date: string;
  time: string;
  targetAudience: string;
  academicYear?: string;
  isImportant?: boolean;
  isUrgent?: boolean;
  actionRequired?: boolean;
  actionDeadline?: string;
  actionDescription?: string;
  attachments: AdminAttachment[];
}

export interface AdminFilterState {
  search: string;
  category: string;
  department: string;
  statusTab: 'all' | 'published' | 'action_required';
  dateFilter?: string;
  selectedDate?: string;
}