import { Request, Response, NextFunction } from 'express';
import { TimetableService } from '../services/timetable.service';
import { ApiResponse } from '../utils/apiResponse';

export class TimetableController {
  static async getTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const department = req.query.department as string | undefined;
      const day = req.query.day as string | undefined;
      const items = await TimetableService.getTimetable(department, day);
      return ApiResponse.success(res, 'Timetable items retrieved', items);
    } catch (error) {
      next(error);
    }
  }
}
