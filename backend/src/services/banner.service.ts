import { prisma } from '../config/prisma';
import { BannerStatus } from '@prisma/client';

export const initialPresets = [
  {
    title: "National Innovation Hackathon '24",
    tag: 'HACKATHON',
    category: 'Competitions',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    shortDescription: '24-hour national level software and hardware sprint with cash prizes exceeding ₹2,50,000.',
    longDescription:
      "Western India's premier collegiate hackathon inviting innovative student developers to build AI, IoT, and FinTech prototypes.",
    registrationUrl: 'https://indiraicem.ac.in/hackathon24',
    actionText: 'Register',
    deadlineText: 'Registration closes Sept 20',
    startDate: 'Nov 15, 2024',
    endDate: 'Nov 16, 2024',
    time: '09:00 AM – 09:00 AM',
    venue: 'ICEM Innovation Lab & Engineering Quad',
    isFeatured: true,
    status: 'CLOSING_SOON' as BannerStatus,
    isActive: true,
  },
  {
    title: 'AI & Cloud Infrastructure Bootcamp',
    tag: 'WORKSHOP',
    category: 'Workshops',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Hands-on industrial masterclass on LLMs, Kubernetes, and scalable distributed systems by Google Architects.',
    longDescription: 'Deep dive into cloud-native architectures, container orchestration, and deploying generative AI workloads at scale.',
    registrationUrl: 'https://indiraicem.ac.in/ai-bootcamp',
    actionText: 'Register',
    deadlineText: 'Oct 26 • Limited 60 Seats',
    startDate: 'Oct 26, 2024',
    endDate: 'Oct 27, 2024',
    time: '10:00 AM – 04:00 PM',
    venue: 'Central Seminar Hall (Block B, 3rd Floor)',
    isFeatured: true,
    status: 'OPEN' as BannerStatus,
    isActive: true,
  },
  {
    title: "Innovate '24 — Technical & Robotic Fest",
    tag: 'TECH FEST',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    shortDescription: 'Flagship engineering extravaganza featuring RoboWars, Drone Racing, and Project Exhibition.',
    longDescription: 'Annual technological symposium bringing together robotics teams across the nation for combat and showcase.',
    registrationUrl: 'https://indiraicem.ac.in/innovate24',
    actionText: 'Register',
    deadlineText: 'Nov 15-17 • Registration Open',
    startDate: 'Nov 15, 2024',
    endDate: 'Nov 17, 2024',
    time: '09:00 AM – 06:00 PM',
    venue: 'ICEM Main Auditorium & Ground',
    isFeatured: true,
    status: 'OPEN' as BannerStatus,
    isActive: true,
  },
];

function parseBannerDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasExplicitTime(value: string): boolean {
  return /T\d{2}:\d{2}|\b\d{1,2}:\d{2}(?:\s*[AP]M)?\b/i.test(value);
}

export function isBannerPubliclyVisible(banner: {
  isActive: boolean;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}, now: Date = new Date()): boolean {
  if (!banner.isActive || banner.status.toUpperCase() === 'CLOSED') {
    return false;
  }

  if (banner.startDate) {
    const startsAt = parseBannerDate(banner.startDate);
    if (!startsAt || startsAt > now) {
      return false;
    }
  }

  if (banner.endDate) {
    const endsAt = parseBannerDate(banner.endDate);
    if (!endsAt) {
      return false;
    }
    if (!hasExplicitTime(banner.endDate)) {
      endsAt.setUTCHours(23, 59, 59, 999);
    }
    if (endsAt < now) {
      return false;
    }
  }

  return true;
}

export class BannerService {
  static normalizeBanner(banner: any) {
    let statusFormatted = 'open';
    if (banner.status === 'CLOSING_SOON') statusFormatted = 'closing-soon';
    else if (banner.status === 'CLOSED') statusFormatted = 'closed';

    return {
      id: banner.id,
      title: banner.title,
      tag: banner.tag,
      category: banner.category || 'College Events',
      image: banner.image,
      shortDescription: banner.shortDescription,
      longDescription: banner.longDescription || banner.shortDescription,
      registrationUrl: banner.registrationUrl || '',
      actionText: banner.actionText || 'Register',
      deadlineText: banner.deadlineText,
      startDate: banner.startDate || undefined,
      endDate: banner.endDate || undefined,
      time: banner.time || undefined,
      venue: banner.venue || undefined,
      isFeatured: Boolean(banner.isFeatured),
      status: statusFormatted,
      isActive: Boolean(banner.isActive),
      noticeId: banner.noticeId || undefined,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    };
  }

  static async getBanners(activeOnly: boolean = true, category?: string) {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (category && category !== 'All Events') {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const banners = await prisma.bannerEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return banners.map(this.normalizeBanner);
  }

  static async getPublicBanners(category?: string) {
    const banners = await this.getBanners(true, category);
    return banners.filter((banner) => isBannerPubliclyVisible(banner));
  }

  static async getBannerById(id: string) {
    const banner = await prisma.bannerEvent.findUnique({ where: { id } });
    if (!banner) throw new Error('Banner not found');
    return this.normalizeBanner(banner);
  }

  static async getPublicBannerById(id: string) {
    const banner = await prisma.bannerEvent.findUnique({ where: { id } });
    if (!banner || !isBannerPubliclyVisible(banner)) {
      return null;
    }
    return this.normalizeBanner(banner);
  }

  static async createBanner(data: any, authorId?: string) {
    let statusEnum: BannerStatus = 'OPEN';
    const st = (data.status || 'open').toLowerCase();
    if (st === 'closing-soon' || st === 'closing_soon') statusEnum = 'CLOSING_SOON';
    else if (st === 'closed') statusEnum = 'CLOSED';

    const banner = await prisma.bannerEvent.create({
      data: {
        title: data.title.trim(),
        tag: (data.tag || 'ANNOUNCEMENT').toUpperCase(),
        category: data.category || 'College Events',
        image: data.image.trim(),
        shortDescription: data.shortDescription || '',
        longDescription: data.longDescription || null,
        registrationUrl: data.registrationUrl || null,
        actionText: data.actionText || 'Register',
        deadlineText: data.deadlineText || 'Registration Open',
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        time: data.time || null,
        venue: data.venue || null,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : true,
        status: statusEnum,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        noticeId: data.noticeId || null,
        createdById: authorId || null,
      },
    });

    return this.normalizeBanner(banner);
  }

  static async updateBanner(id: string, data: any) {
    const existing = await prisma.bannerEvent.findUnique({ where: { id } });
    if (!existing) throw new Error('Banner not found');

    let statusEnum = existing.status;
    if (data.status) {
      const st = data.status.toLowerCase();
      if (st === 'closing-soon' || st === 'closing_soon') statusEnum = 'CLOSING_SOON';
      else if (st === 'closed') statusEnum = 'CLOSED';
      else statusEnum = 'OPEN';
    }

    const updated = await prisma.bannerEvent.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : existing.title,
        tag: data.tag !== undefined ? data.tag.toUpperCase() : existing.tag,
        category: data.category !== undefined ? data.category : existing.category,
        image: data.image !== undefined ? data.image.trim() : existing.image,
        shortDescription: data.shortDescription !== undefined ? data.shortDescription : existing.shortDescription,
        longDescription: data.longDescription !== undefined ? data.longDescription : existing.longDescription,
        registrationUrl: data.registrationUrl !== undefined ? data.registrationUrl : existing.registrationUrl,
        actionText: data.actionText !== undefined ? data.actionText : existing.actionText,
        deadlineText: data.deadlineText !== undefined ? data.deadlineText : existing.deadlineText,
        startDate: data.startDate !== undefined ? data.startDate : existing.startDate,
        endDate: data.endDate !== undefined ? data.endDate : existing.endDate,
        time: data.time !== undefined ? data.time : existing.time,
        venue: data.venue !== undefined ? data.venue : existing.venue,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : existing.isFeatured,
        status: statusEnum,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
        noticeId: data.noticeId !== undefined ? data.noticeId : existing.noticeId,
      },
    });

    return this.normalizeBanner(updated);
  }

  static async toggleStatus(id: string) {
    const banner = await prisma.bannerEvent.findUnique({ where: { id } });
    if (!banner) throw new Error('Banner not found');

    const updated = await prisma.bannerEvent.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });

    return this.normalizeBanner(updated);
  }

  static async deleteBanner(id: string) {
    const existing = await prisma.bannerEvent.findUnique({ where: { id } });
    if (!existing) throw new Error('Banner not found');

    await prisma.bannerEvent.delete({ where: { id } });
    return { id, message: 'Banner deleted successfully' };
  }

  static async resetToPresets() {
    await prisma.bannerEvent.deleteMany({});
    for (const preset of initialPresets) {
      await prisma.bannerEvent.create({ data: preset });
    }
    return this.getBanners(false);
  }
}
