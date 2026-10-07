export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  department?: string | null;
}

export interface AuthenticatedUser extends TokenPayload {
  fullName: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
