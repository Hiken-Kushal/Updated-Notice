import { prisma } from '../config/prisma';
import { NoticeService } from './notice.service';

export class StudentService {
  static async toggleAcknowledge(noticeId: string, userId: string) {
    const existing = await prisma.noticeAcknowledgement.findUnique({
      where: {
        noticeId_userId: { noticeId, userId },
      },
    });

    if (existing) {
      await prisma.noticeAcknowledgement.delete({
        where: { id: existing.id },
      });
      const count = await prisma.noticeAcknowledgement.count({ where: { noticeId } });
      return { acknowledged: false, count, acknowledgementCount: count };
    }

    const record = await prisma.noticeAcknowledgement.create({
      data: { noticeId, userId },
    });
    const count = await prisma.noticeAcknowledgement.count({ where: { noticeId } });
    return { acknowledged: true, acknowledgedAt: record.acknowledgedAt, count, acknowledgementCount: count };
  }

  static async toggleBookmark(noticeId: string, userId: string) {
    const existing = await prisma.noticeBookmark.findUnique({
      where: {
        noticeId_userId: { noticeId, userId },
      },
    });

    if (existing) {
      await prisma.noticeBookmark.delete({
        where: { id: existing.id },
      });
      const count = await prisma.noticeBookmark.count({ where: { noticeId } });
      return { bookmarked: false, count, bookmarkCount: count };
    }

    await prisma.noticeBookmark.create({
      data: { noticeId, userId },
    });
    const count = await prisma.noticeBookmark.count({ where: { noticeId } });
    return { bookmarked: true, count, bookmarkCount: count };
  }

  static async getBookmarks(userId: string) {
    const bookmarks = await prisma.noticeBookmark.findMany({
      where: { userId },
      include: {
        notice: {
          include: {
            attachments: true,
            bookmarks: { where: { userId } },
            acknowledgements: { where: { userId } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks.map((b) => NoticeService.normalizeNotice(b.notice, userId));
  }

  static async getAcknowledgements(userId: string) {
    const acks = await prisma.noticeAcknowledgement.findMany({
      where: { userId },
      select: { noticeId: true, acknowledgedAt: true },
    });
    return acks;
  }
}
