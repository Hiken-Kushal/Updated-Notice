import { prisma } from '../config/prisma';

export class DocumentService {
  static async getDocuments(search?: string, category?: string) {
    const where: any = {};
    if (category && category !== 'all') {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const docs = await prisma.collegeDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      fileType: d.fileType.toLowerCase(),
      fileSize: d.fileSize,
      description: d.description || '',
      downloadUrl: d.downloadUrl,
      lastUpdated: d.lastUpdated || '',
    }));
  }

  static async createDocument(data: any, authorId?: string) {
    const doc = await prisma.collegeDocument.create({
      data: {
        title: data.title.trim(),
        category: data.category,
        fileType: (data.fileType || 'PDF').toUpperCase(),
        fileSize: data.fileSize || '1.0 MB',
        description: data.description || null,
        downloadUrl: data.downloadUrl || '#',
        lastUpdated: data.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        uploadedById: authorId || null,
      },
    });

    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      fileType: doc.fileType.toLowerCase(),
      fileSize: doc.fileSize,
      description: doc.description || '',
      downloadUrl: doc.downloadUrl,
      lastUpdated: doc.lastUpdated || '',
    };
  }

  static async deleteDocument(id: string) {
    const existing = await prisma.collegeDocument.findUnique({ where: { id } });
    if (!existing) throw new Error('Document not found');

    await prisma.collegeDocument.delete({ where: { id } });
    return { id, message: 'Document deleted successfully' };
  }
}
