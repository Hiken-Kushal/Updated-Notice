import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { ApiResponse } from '../utils/apiResponse';

export class StudentController {
  static async toggleAcknowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const noticeId = String(req.params.id);
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }
      const result = await StudentService.toggleAcknowledge(noticeId, userId);
      return ApiResponse.success(res, 'Acknowledgement toggled', result);
    } catch (error) {
      next(error);
    }
  }

  static async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const noticeId = String(req.params.id);
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }
      const result = await StudentService.toggleBookmark(noticeId, userId);
      return ApiResponse.success(res, 'Bookmark toggled', result);
    } catch (error) {
      next(error);
    }
  }

  static async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookmarks = await StudentService.getBookmarks(userId);
      return ApiResponse.success(res, 'Bookmarks retrieved', bookmarks);
    } catch (error) {
      next(error);
    }
  }

  static async getAcknowledgements(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const acks = await StudentService.getAcknowledgements(userId);
      return ApiResponse.success(res, 'Acknowledgements retrieved', acks);
    } catch (error) {
      next(error);
    }
  }
}
