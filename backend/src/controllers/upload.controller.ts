import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import path from 'path';

export class UploadController {
  static formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  }

  static getFileType(filename: string): 'pdf' | 'excel' | 'doc' | 'image' {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') return 'excel';
    if (ext === '.doc' || ext === '.docx') return 'doc';
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.webp' || ext === '.svg') return 'image';
    return 'pdf';
  }

  static async uploadNoticeAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return ApiResponse.error(res, 'No files were uploaded', 400);
      }

      const results = files.map((file) => ({
        name: file.originalname,
        originalName: file.originalname,
        fileUrl: `/uploads/notices/${file.filename}`,
        url: `/uploads/notices/${file.filename}`,
        fileType: UploadController.getFileType(file.originalname),
        type: UploadController.getFileType(file.originalname),
        fileSize: UploadController.formatFileSize(file.size),
        size: UploadController.formatFileSize(file.size),
        mimeType: file.mimetype,
      }));

      return ApiResponse.success(res, `Uploaded ${results.length} files successfully`, results);
    } catch (error) {
      next(error);
    }
  }

  static async uploadBannerImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return ApiResponse.error(res, 'No image file was uploaded', 400);
      }

      const imageUrl = `/uploads/banners/${file.filename}`;
      return ApiResponse.success(res, 'Banner image uploaded successfully', { imageUrl });
    } catch (error) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return ApiResponse.error(res, 'No document file was uploaded', 400);
      }

      const downloadUrl = `/uploads/documents/${file.filename}`;
      const fileType = UploadController.getFileType(file.originalname).toUpperCase();
      const fileSize = UploadController.formatFileSize(file.size);

      return ApiResponse.success(res, 'Document uploaded successfully', {
        downloadUrl,
        fileType,
        fileSize,
        originalName: file.originalname,
      });
    } catch (error) {
      next(error);
    }
  }
}
