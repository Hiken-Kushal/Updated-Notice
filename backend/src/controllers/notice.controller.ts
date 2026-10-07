import { Request, Response, NextFunction } from 'express';
import { NoticeService } from '../services/notice.service';
import { ApiResponse } from '../utils/apiResponse';
import { noticeCreateSchema } from '../validators';

export class NoticeController {
  static async getNotices(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      const userId = req.user?.id;
      const result = await NoticeService.getNotices(req.query, userId, isAdmin);
      return ApiResponse.paginated(
        res,
        'Notices retrieved successfully',
        result.notices,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  static async getNoticeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';
      const result = await NoticeService.getNoticeById(id, userId, isAdmin);
      if (!result) {
        return ApiResponse.error(res, 'Notice not found', 404);
      }
      return ApiResponse.success(res, 'Notice details retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  static async createNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = noticeCreateSchema.parse(req.body);
      const authorId = req.user?.id;
      const notice = await NoticeService.createNotice(validated, authorId);
      return ApiResponse.success(res, 'Notice created successfully', notice, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const notice = await NoticeService.updateNotice(id, req.body);
      return ApiResponse.success(res, 'Notice updated successfully', notice);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const statusOverride = req.body?.status;
      const notice = await NoticeService.toggleStatus(id, statusOverride);
      return ApiResponse.success(res, 'Notice status updated', notice);
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await NoticeService.deleteNotice(id);
      return ApiResponse.success(res, 'Notice deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await NoticeService.getStats();
      return ApiResponse.success(res, 'Notice statistics retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  static async getActionRequired(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await NoticeService.getActionRequiredNotices();
      return ApiResponse.success(res, 'Action required notices retrieved', items);
    } catch (error) {
      next(error);
    }
  }

  static async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await NoticeService.getCalendarNotices();
      return ApiResponse.success(res, 'Calendar notices retrieved', items);
    } catch (error) {
      next(error);
    }
  }
}
