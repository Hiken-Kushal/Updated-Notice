import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['ADMIN', 'STUDENT']).default('STUDENT'),
  department: z.string().optional(),
  academicYear: z.string().optional(),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => !!(data.usernameOrEmail || data.username || data.email), {
  message: 'Username or email is required',
  path: ['usernameOrEmail'],
}).transform(data => ({
  usernameOrEmail: (data.usernameOrEmail || data.username || data.email) as string,
  password: data.password,
}));

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const noticeCreateSchema = z.object({
  refNo: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['PUBLISHED', 'ARCHIVED', 'Published', 'Archived']).default('PUBLISHED'),
  summary: z.string().min(1, 'Summary is required'),
  content: z.string().optional().default(''),
  fullBody: z.any().optional(),
  issuedBy: z.string().min(1, 'Issuing authority is required'),
  department: z.string().min(1, 'Department is required'),
  departmentKey: z.string().default('admin'),
  targetAudience: z.string().default('All Enrolled Students'),
  academicYear: z.string().optional().default('AY 2026-27'),
  date: z.string().optional(),
  time: z.string().optional(),
  isImportant: z.boolean().optional().default(false),
  important: z.boolean().optional(),
  isUrgent: z.boolean().optional().default(false),
  urgent: z.boolean().optional(),
  actionRequired: z.boolean().optional().default(false),
  actionDeadline: z.string().optional().nullable(),
  actionDescription: z.string().optional().nullable(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        size: z.string(),
        type: z.enum(['pdf', 'excel', 'image', 'doc']),
        url: z.string().optional(),
      })
    )
    .optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(3, 'Banner title is required'),
  tag: z.string().default('ANNOUNCEMENT'),
  category: z.string().optional().default('College Events'),
  image: z.string().min(1, 'Image URL or file path is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  longDescription: z.string().optional(),
  registrationUrl: z.string().optional().nullable(),
  actionText: z.string().optional().default('Register'),
  deadlineText: z.string().default('Registration Open'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(true),
  status: z.enum(['open', 'closing-soon', 'closed', 'OPEN', 'CLOSING_SOON', 'CLOSED']).default('open'),
  isActive: z.boolean().optional().default(true),
  noticeId: z.string().optional().nullable(),
});

export const documentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  fileType: z.enum(['PDF', 'EXCEL', 'DOC', 'pdf', 'excel', 'doc']).default('PDF'),
  fileSize: z.string().default('1.0 MB'),
  description: z.string().optional(),
  downloadUrl: z.string().optional().default('#'),
});

export const subscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
