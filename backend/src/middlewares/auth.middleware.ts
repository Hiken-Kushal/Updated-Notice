import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { verifyAccessToken } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { TokenPayload, UserRole } from '../types';

export async function loadApprovedCurrentUser(decoded: TokenPayload): Promise<TokenPayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      department: true,
      status: true,
    },
  });

  if (!user || user.status !== 'APPROVED') {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    department: user.department,
  };
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authentication token missing or invalid format', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded: TokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Authentication token has expired', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }

  try {
    const currentUser = await loadApprovedCurrentUser(decoded);
    if (!currentUser) {
      return ApiResponse.error(res, 'Authentication token is invalid or no longer active', 401);
    }
    req.user = currentUser;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Optional authentication: attaches user if valid token present, but does not block guests
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  let decoded: TokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    // Ignore invalid tokens for optional auth
    return next();
  }

  try {
    const currentUser = await loadApprovedCurrentUser(decoded);
    if (!currentUser) {
      return ApiResponse.error(res, 'Authentication token is invalid or no longer active', 401);
    }
    req.user = currentUser;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Role-based authorization guard
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthorized. Please log in first.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
}
