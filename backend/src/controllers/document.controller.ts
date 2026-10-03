import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { ApiResponse } from '../utils/apiResponse';
import { documentSchema } from '../validators';

export class DocumentController {
  static async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const docs = await DocumentService.getDocuments(search, category);
      return ApiResponse.success(res, 'Documents retrieved successfully', docs);
    } catch (error) {
      next(error);
    }
  }

  static async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = documentSchema.parse(req.body);
      const authorId = req.user?.id;
      const doc = await DocumentService.createDocument(validated, authorId);
      return ApiResponse.success(res, 'Document created successfully', doc, 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await DocumentService.deleteDocument(id);
      return ApiResponse.success(res, 'Document deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
