import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export interface NoticeQueryParams {
  search?: string;
  category?: string;
  department?: string;
  departmentKey?: string;
  status?: string;
  isImportant?: boolean | string;
  isUrgent?: boolean | string;
  actionRequired?: boolean | string;
  date?: string;
  month?: number | string;
  year?: number | string;
  page?: number | string;
  limit?: number | string;
}

export class NoticeService {
  /**
   * Normalizes notice object to satisfy both Admin Portal and Student Portal interfaces
   */
  static normalizeNotice(notice: any, userId?: string) {
    const isBookmarked = userId
      ? notice.bookmarks && notice.bookmarks.length > 0
      : false;
    const isAcknowledged = userId
      ? notice.acknowledgements && notice.acknowledgements.length > 0
      : false;

    const formattedAttachments = (notice.attachments || []).map((att: any) => ({
      id: att.id,
      name: att.name,
      originalName: att.originalName,
      size: att.fileSize || att.size,
      type: att.fileType ? att.fileType.toLowerCase() : 'pdf',
      url: att.fileUrl,
    }));

    return {
      id: notice.id,
      refNo: notice.refNo,
      title: notice.title,
      category: notice.category,
      status: notice.status === 'PUBLISHED' ? 'Published' : 'Archived',
      summary: notice.summary,
      content: notice.content,
      fullBody: notice.fullBody,
      issuedBy: notice.issuedBy,
      department: notice.department,
      departmentKey: notice.departmentKey,
      targetAudience: notice.targetAudience,
      academicYear: notice.academicYear || 'AY 2026-27',
      date: notice.date,
      time: notice.time || '',
      // Dual property naming for 100% frontend backward compatibility
      isImportant: Boolean(notice.isImportant),
      important: Boolean(notice.isImportant),
      isUrgent: Boolean(notice.isUrgent),
      urgent: Boolean(notice.isUrgent),
      actionRequired: Boolean(notice.actionRequired),
      actionDeadline: notice.actionDeadline || undefined,
      actionDescription: notice.actionDescription || undefined,
      attachments: formattedAttachments,
      bookmarked: isBookmarked,
      acknowledged: isAcknowledged,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
    };
  }

  static async getNotices(params: NoticeQueryParams, userId?: string, isAdmin: boolean = false) {
    const page = Math.max(1, parseInt(String(params.page || 1), 10));
    const limit = Math.max(1, parseInt(String(params.limit || 10), 10));
    const skip = (page - 1) * limit;

    const where: Prisma.NoticeWhereInput = {};

    // For public / non-admin users, restrict to published notices only
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      const st = params.status.toLowerCase();
      if (st === 'published') where.status = 'PUBLISHED';
      else if (st === 'archived') where.status = 'ARCHIVED';
    }

    // Category filter
    if (params.category && params.category !== 'all') {
      const cat = params.category.toLowerCase().trim();
      if (cat === 'exam' || cat === 'examination') {
        where.category = { contains: 'Exam', mode: 'insensitive' };
      } else if (cat === 'placement') {
        where.category = { contains: 'Placement', mode: 'insensitive' };
      } else if (cat === 'events' || cat === 'cultural') {
        where.category = { contains: 'Event', mode: 'insensitive' };
      } else if (cat === 'general' || cat === 'administration' || cat === 'admin') {
        where.OR = [
          { category: { contains: 'General', mode: 'insensitive' } },
          { category: { contains: 'Admin', mode: 'insensitive' } },
          { category: { contains: 'Academic', mode: 'insensitive' } },
        ];
      } else {
        where.category = { equals: params.category, mode: 'insensitive' };
      }
    }

    // Department / departmentKey filter
    if (params.departmentKey && params.departmentKey !== 'all') {
      where.departmentKey = { equals: params.departmentKey, mode: 'insensitive' };
    } else if (params.department && params.department !== 'all') {
      where.department = { contains: params.department, mode: 'insensitive' };
    }

    // Flags
    if (params.isImportant !== undefined) {
      where.isImportant = String(params.isImportant) === 'true';
    }
    if (params.isUrgent !== undefined) {
      where.isUrgent = String(params.isUrgent) === 'true';
    }
    if (params.actionRequired !== undefined) {
      where.actionRequired = String(params.actionRequired) === 'true';
    }

    // Date search
    if (params.date) {
      where.date = { contains: params.date, mode: 'insensitive' };
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { issuedBy: { contains: q, mode: 'insensitive' } },
        { refNo: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, notices] = await Promise.all([
      prisma.notice.count({ where }),
      prisma.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          attachments: true,
          bookmarks: userId ? { where: { userId } } : false,
          acknowledgements: userId ? { where: { userId } } : false,
        },
      }),
    ]);

    const normalized = notices.map((n) => this.normalizeNotice(n, userId));

    return {
      notices: normalized,
      total,
      page,
      limit,
    };
  }

  static async getNoticeById(id: string, userId?: string) {
    if (!id || typeof id !== 'string') {
      return null;
    }

    try {
      const notice = await prisma.notice.findUnique({
        where: { id },
        include: {
          attachments: true,
          bookmarks: userId ? { where: { userId } } : false,
          acknowledgements: userId ? { where: { userId } } : false,
        },
      });

      if (!notice) {
        return null;
      }

      // Fetch related notices (up to 3 from same category or department, excluding current)
      const related = await prisma.notice.findMany({
        where: {
          id: { not: id },
          status: 'PUBLISHED',
          OR: [{ category: notice.category }, { department: notice.department }],
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { attachments: true },
      });

      return {
        notice: this.normalizeNotice(notice, userId),
        relatedNotices: related.map((r) => this.normalizeNotice(r, userId)),
      };
    } catch {
      return null;
    }
  }

  static async createNotice(data: any, authorId?: string) {
    const now = new Date();
    const displayDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const displayTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const refNo =
      data.refNo ||
      `REF-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const status = (data.status || 'PUBLISHED').toUpperCase() === 'ARCHIVED' ? 'ARCHIVED' : 'PUBLISHED';

    const isImportant = data.isImportant !== undefined ? Boolean(data.isImportant) : Boolean(data.important);
    const isUrgent = data.isUrgent !== undefined ? Boolean(data.isUrgent) : Boolean(data.urgent);

    const notice = await prisma.notice.create({
      data: {
        refNo,
        title: data.title.trim(),
        category: data.category,
        status,
        summary: data.summary,
        content: data.content || '',
        fullBody: data.fullBody || null,
        issuedBy: data.issuedBy,
        department: data.department,
        departmentKey: data.departmentKey || 'admin',
        targetAudience: data.targetAudience || 'All Enrolled Students',
        academicYear: data.academicYear || 'AY 2026-27',
        date: data.date || displayDate,
        time: data.time || displayTime,
        isImportant,
        isUrgent,
        actionRequired: Boolean(data.actionRequired),
        actionDeadline: data.actionDeadline || null,
        actionDescription: data.actionDescription || null,
        createdById: authorId || null,
        attachments: {
          create: (data.attachments || []).map((att: any) => ({
            name: att.name,
            originalName: att.originalName || att.name,
            fileUrl: att.url || att.fileUrl || '',
            fileType: (att.type || 'PDF').toUpperCase(),
            fileSize: att.size || att.fileSize || '1.0 MB',
            mimeType: att.mimeType || null,
          })),
        },
      },
      include: {
        attachments: true,
      },
    });

    return this.normalizeNotice(notice);
  }

  static async updateNotice(id: string, data: any) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Notice not found');
    }

    const isImportant =
      data.isImportant !== undefined
        ? Boolean(data.isImportant)
        : data.important !== undefined
        ? Boolean(data.important)
        : existing.isImportant;

    const isUrgent =
      data.isUrgent !== undefined
        ? Boolean(data.isUrgent)
        : data.urgent !== undefined
        ? Boolean(data.urgent)
        : existing.isUrgent;

    const status = data.status
      ? data.status.toUpperCase() === 'ARCHIVED'
        ? 'ARCHIVED'
        : 'PUBLISHED'
      : existing.status;

    // If attachments are passed, recreate them
    let attachmentsUpdate: any = undefined;
    if (data.attachments && Array.isArray(data.attachments)) {
      attachmentsUpdate = {
        deleteMany: {},
        create: data.attachments.map((att: any) => ({
          name: att.name,
          originalName: att.originalName || att.name,
          fileUrl: att.url || att.fileUrl || '',
          fileType: (att.type || 'PDF').toUpperCase(),
          fileSize: att.size || att.fileSize || '1.0 MB',
          mimeType: att.mimeType || null,
        })),
      };
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : existing.title,
        category: data.category !== undefined ? data.category : existing.category,
        status,
        summary: data.summary !== undefined ? data.summary : existing.summary,
        content: data.content !== undefined ? data.content : existing.content,
        fullBody: data.fullBody !== undefined ? data.fullBody : existing.fullBody,
        issuedBy: data.issuedBy !== undefined ? data.issuedBy : existing.issuedBy,
        department: data.department !== undefined ? data.department : existing.department,
        departmentKey: data.departmentKey !== undefined ? data.departmentKey : existing.departmentKey,
        targetAudience: data.targetAudience !== undefined ? data.targetAudience : existing.targetAudience,
        academicYear: data.academicYear !== undefined ? data.academicYear : existing.academicYear,
        date: data.date !== undefined ? data.date : existing.date,
        time: data.time !== undefined ? data.time : existing.time,
        isImportant,
        isUrgent,
        actionRequired: data.actionRequired !== undefined ? Boolean(data.actionRequired) : existing.actionRequired,
        actionDeadline: data.actionDeadline !== undefined ? data.actionDeadline : existing.actionDeadline,
        actionDescription: data.actionDescription !== undefined ? data.actionDescription : existing.actionDescription,
        attachments: attachmentsUpdate,
      },
      include: {
        attachments: true,
      },
    });

    return this.normalizeNotice(updated);
  }

  static async toggleStatus(id: string, statusOverride?: string) {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      throw new Error('Notice not found');
    }

    const nextStatus = statusOverride
      ? statusOverride.toUpperCase() === 'ARCHIVED'
        ? 'ARCHIVED'
        : 'PUBLISHED'
      : notice.status === 'PUBLISHED'
      ? 'ARCHIVED'
      : 'PUBLISHED';

    const updated = await prisma.notice.update({
      where: { id },
      data: { status: nextStatus },
      include: { attachments: true },
    });

    return this.normalizeNotice(updated);
  }

  static async deleteNotice(id: string) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Notice not found');
    }

    await prisma.notice.delete({ where: { id } });
    return { id, message: 'Notice deleted successfully' };
  }

  static async getStats() {
    const [totalNotices, publishedNotices, archivedNotices, actionRequiredCount] = await Promise.all([
      prisma.notice.count(),
      prisma.notice.count({ where: { status: 'PUBLISHED' } }),
      prisma.notice.count({ where: { status: 'ARCHIVED' } }),
      prisma.notice.count({ where: { status: 'PUBLISHED', actionRequired: true } }),
    ]);

    return {
      totalNotices,
      publishedNotices,
      archivedNotices,
      actionRequiredCount,
    };
  }

  static async getActionRequiredNotices() {
    const notices = await prisma.notice.findMany({
      where: {
        status: 'PUBLISHED',
        actionRequired: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return notices.map((n) => ({
      id: `action-${n.id}`,
      noticeId: n.id,
      title: n.title,
      dateLabel: n.actionDeadline || n.date,
      type: n.isUrgent ? 'error' : n.isImportant ? 'warning' : 'info',
    }));
  }

  static async getCalendarNotices() {
    const notices = await prisma.notice.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        date: true,
        time: true,
        department: true,
        isImportant: true,
        isUrgent: true,
      },
    });

    return notices.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      date: n.date,
      time: n.time,
      department: n.department,
      important: n.isImportant,
      urgent: n.isUrgent,
    }));
  }
}
