import { prisma } from '../config/prisma';

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface UserListQuery {
  role?: string;
  status?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}

export class UserService {
  /**
   * List all users with optional role/status/search filters (SUPERADMIN only)
   */
  static async listUsers(params: UserListQuery) {
    const page = Math.max(1, parseInt(String(params.page || 1), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 20), 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.role && params.role !== 'all') {
      where.role = params.role.toUpperCase();
    }

    if (params.status && params.status !== 'all') {
      where.status = params.status.toUpperCase();
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          department: true,
          academicYear: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        department: true,
        academicYear: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  /**
   * Update a user's account status (SUPERADMIN only)
   */
  static async updateUserStatus(userId: string, status: AccountStatus) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        department: true,
        academicYear: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  /**
   * Update a user's role (SUPERADMIN only)
   */
  static async updateUserRole(userId: string, role: UserRole) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        department: true,
        academicYear: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  /**
   * Delete a user (SUPERADMIN only). Cannot delete yourself.
   */
  static async deleteUser(userId: string, requestingUserId: string) {
    if (userId === requestingUserId) {
      throw new Error('You cannot delete your own account');
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    await prisma.user.delete({ where: { id: userId } });
    return { id: userId, message: 'User deleted successfully' };
  }

  /**
   * Get pending user accounts that need approval
   */
  static async getPendingUsers() {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        department: true,
        academicYear: true,
        createdAt: true,
      },
    });
    return users;
  }
}
