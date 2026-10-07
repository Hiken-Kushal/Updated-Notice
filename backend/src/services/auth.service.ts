import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { TokenPayload, UserRole } from '../types';

export class AuthService {
  static async register(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
    department?: string;
    academicYear?: string;
  }) {
    const role = data.role || 'STUDENT';
    if (role === 'SUPERADMIN') {
      throw new Error('SuperAdmin accounts cannot be created through registration');
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existing) {
      if (existing.username === data.username) {
        throw new Error('Username is already taken');
      }
      throw new Error('Email is already registered');
    }

    const passwordHash = await hashPassword(data.password);

    // FACULTY and ADMIN accounts require approval; STUDENT accounts are approved immediately.
    const requiresApproval = role === 'FACULTY' || role === 'ADMIN';
    const accountStatus = requiresApproval ? 'PENDING' : 'APPROVED';

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role,
        status: accountStatus,
        department: data.department || null,
        academicYear: data.academicYear || null,
      },
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

    return user;
  }

  static async login(usernameOrEmail: string, plainPass: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isValid = await comparePassword(plainPass, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Check account status for FACULTY and ADMIN (PENDING/REJECTED accounts cannot log in)
    if (user.status === 'PENDING') {
      throw new Error('Your account is pending approval. Please wait for administrator review.');
    }
    if (user.status === 'REJECTED') {
      throw new Error('Your account registration has been rejected. Please contact the administrator.');
    }

    const payload: TokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as UserRole,
      department: user.department,
    };

    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      token,
      tokens: {
        accessToken: token,
        refreshToken,
        expiresIn: '1d',
      },
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        academicYear: user.academicYear,
      },
    };
  }

  static async refreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
      }
      throw new Error('Refresh token is invalid or expired. Please log in again.');
    }

    if (stored.user.status !== 'APPROVED') {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new Error('Refresh token is invalid or expired. Please log in again.');
    }

    const payload: TokenPayload = {
      id: stored.user.id,
      username: stored.user.username,
      email: stored.user.email,
      role: stored.user.role as UserRole,
      department: stored.user.department,
    };

    const newAccessToken = signAccessToken(payload);
    return {
      token: newAccessToken,
      tokens: {
        accessToken: newAccessToken,
        expiresIn: '1d',
      },
    };
  }

  static async logout(refreshToken: string) {
    try {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
    } catch {
      // Ignore if already deleted
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        academicYear: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
