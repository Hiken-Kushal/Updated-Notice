import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';

export class UserController {
  /**
   * GET /api/v1/users — List all users (SUPERADMIN only)
   */
  static async listUsers(req: Request, res: Response) {
    try {
      const { role, status, search, page, limit } = req.query as any;
      const result = await UserService.listUsers({ role, status, search, page, limit });
      return ApiResponse.paginated(
        res,
        'Users retrieved successfully',
        result.users,
        result.page,
        result.limit,
        result.total
      );
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to list users', 500);
    }
  }

  /**
   * GET /api/v1/users/pending — Get pending user accounts
   */
  static async getPendingUsers(req: Request, res: Response) {
    try {
      const users = await UserService.getPendingUsers();
      return ApiResponse.success(res, 'Pending users retrieved', users);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to get pending users', 500);
    }
  }

  /**
   * GET /api/v1/users/:id — Get user by ID
   */
  static async getUserById(req: Request<{ id: string }>, res: Response) {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return ApiResponse.error(res, 'User not found', 404);
      return ApiResponse.success(res, 'User retrieved', user);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to get user', 500);
    }
  }

  /**
   * PATCH /api/v1/users/:id/status — Update user account status
   */
  static async updateUserStatus(req: Request<{ id: string }>, res: Response) {
    try {
      const { status } = req.body;
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
      if (!status || !validStatuses.includes(String(status).toUpperCase())) {
        return ApiResponse.error(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }
      const updated = await UserService.updateUserStatus(req.params.id, String(status).toUpperCase() as any);
      return ApiResponse.success(res, 'User status updated successfully', updated);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to update user status', 500);
    }
  }

  /**
   * PATCH /api/v1/users/:id/role — Update user role
   */
  static async updateUserRole(req: Request<{ id: string }>, res: Response) {
    try {
      const { role } = req.body;
      const validRoles = ['SUPERADMIN', 'ADMIN', 'FACULTY', 'STUDENT'];
      if (!role || !validRoles.includes(String(role).toUpperCase())) {
        return ApiResponse.error(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
      }
      const updated = await UserService.updateUserRole(req.params.id, String(role).toUpperCase() as any);
      return ApiResponse.success(res, 'User role updated successfully', updated);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to update user role', 500);
    }
  }

  /**
   * DELETE /api/v1/users/:id — Delete a user
   */
  static async deleteUser(req: Request<{ id: string }>, res: Response) {
    try {
      const requestingUserId = req.user?.id;
      if (!requestingUserId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }
      const result = await UserService.deleteUser(req.params.id, requestingUserId);
      return ApiResponse.success(res, 'User deleted successfully', result);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to delete user', 500);
    }
  }
}
