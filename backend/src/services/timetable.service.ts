import { prisma } from '../config/prisma';

export class TimetableService {
  static async getTimetable(department?: string, day?: string) {
    const where: any = {};
    if (department && department !== 'all') {
      where.department = { equals: department.toLowerCase() };
    }
    if (day && day !== 'all') {
      where.dayOfWeek = { equals: day, mode: 'insensitive' };
    }

    const items = await prisma.scheduleItem.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => ({
      id: item.id,
      time: item.time,
      period: item.period,
      subject: item.subject,
      details: item.details,
      type: item.type.toLowerCase(),
      colorBorder: item.colorBorder || 'primary',
      department: item.department,
      dayOfWeek: item.dayOfWeek,
    }));
  }
}
