import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { supabase } from '../config/supabase';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { verifyAccessToken } from '../utils/jwt';
import { loadApprovedCurrentUser } from '../middlewares/auth.middleware';
import { TokenPayload } from '../types';
import path from 'path';
import crypto from 'crypto';

function sanitizeFilename(filename: string): string {
  const parsed = path.parse(filename);
  const safeName = parsed.name
    .trim()
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 80);
  const safeExt = parsed.ext.toLowerCase().replace(/[^a-zA-Z0-9\.]/g, '');
  return `${safeName}${safeExt}`;
}

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

  /**
   * Uploads notice attachments to private Supabase Storage bucket 'notice-attachments'
   */
  static async uploadNoticeAttachments(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return ApiResponse.error(res, 'No files were uploaded', 400);
      }

      const uploadedPaths: string[] = [];
      const results: Array<{
        name: string;
        originalName: string;
        fileUrl: string;
        storagePath: string;
        url: string;
        fileType: 'pdf' | 'excel' | 'doc' | 'image';
        type: 'pdf' | 'excel' | 'doc' | 'image';
        fileSize: string;
        size: string;
        mimeType: string;
      }> = [];

      try {
        for (const file of files) {
          const timestamp = Date.now();
          const randomHex = crypto.randomBytes(4).toString('hex');
          const safeName = sanitizeFilename(file.originalname);
          const storagePath = `notices/${timestamp}-${randomHex}-${safeName}`;

          const { error: uploadError } = await supabase.storage
            .from(env.SUPABASE_STORAGE_BUCKET)
            .upload(storagePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`Upload failed for "${file.originalname}": ${uploadError.message}`);
          }

          uploadedPaths.push(storagePath);

          const fileType = UploadController.getFileType(file.originalname);
          const fileSize = UploadController.formatFileSize(file.size);
          const accessUrl = `/api/v1/upload/attachments/access?path=${encodeURIComponent(storagePath)}`;

          results.push({
            name: file.originalname,
            originalName: file.originalname,
            fileUrl: storagePath,       // Permanent storage path for DB
            storagePath: storagePath,   // Explicit storage path
            url: accessUrl,             // Access URL for frontend preview
            fileType,
            type: fileType,
            fileSize,
            size: fileSize,
            mimeType: file.mimetype,
          });
        }

        return ApiResponse.success(res, `Uploaded ${results.length} files successfully`, results);
      } catch (uploadErr: any) {
        // Rollback any successfully uploaded files in this batch to prevent orphans
        if (uploadedPaths.length > 0) {
          try {
            await supabase.storage.from(env.SUPABASE_STORAGE_BUCKET).remove(uploadedPaths);
          } catch (cleanupErr: any) {
            console.error('[UploadController] Error cleaning up partial uploads:', cleanupErr.message);
          }
        }
        console.error('[UploadController] Attachment upload failed:', uploadErr.message || uploadErr);
        return ApiResponse.error(
          res,
          `Failed to upload attachments to storage: ${uploadErr.message || 'Unknown error'}`,
          500
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Attachment download & access endpoint:
   * Generates a signed URL for a given Supabase storage path.
   * Handles authentication/authorization:
   * - Published notice attachments are accessible to all portal users/students
   * - Archived or draft attachments require ADMIN authentication
   * Redirects browser navigation or returns JSON based on request headers/params.
   */
  static async getAttachmentAccessUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const storagePath =
        (req.query.path as string) ||
        (req.body?.path as string) ||
        (req.body?.storagePath as string);

      if (!storagePath) {
        return ApiResponse.error(res, 'Storage path query parameter is required (e.g. ?path=notices/...)', 400);
      }

      // Security check: Prevent path traversal attacks
      if (storagePath.includes('..') || storagePath.includes('\\') || storagePath.startsWith('/')) {
        return ApiResponse.error(res, 'Invalid storage path', 400);
      }

      // Ensure path is restricted to authorized folder namespaces
      if (
        !storagePath.startsWith('notices/') &&
        !storagePath.startsWith('banners/') &&
        !storagePath.startsWith('documents/')
      ) {
        return ApiResponse.error(res, 'Invalid storage path prefix', 400);
      }

      // Determine user identity (supports Authorization header, optionalAuth middleware, or ?token= query param)
      let user = (req as any).user;
      if (!user) {
        const queryToken = req.query.token as string;
        if (queryToken) {
          let decoded: TokenPayload | null = null;
          try {
            decoded = verifyAccessToken(queryToken);
          } catch {
            // Invalid query token; ignore and continue as guest
          }
          if (decoded) {
            user = await loadApprovedCurrentUser(decoded);
            if (!user) {
              return ApiResponse.error(res, 'Authentication token is invalid or no longer active', 401);
            }
          }
        }
      }

      // Check database authorization for notice attachments
      if (storagePath.startsWith('notices/')) {
        const dbAttachment = await prisma.noticeAttachment.findFirst({
          where: { fileUrl: storagePath },
          include: {
            notice: {
              select: { id: true, status: true },
            },
          },
        });

        if (dbAttachment) {
          // If attachment belongs to an ARCHIVED notice, require ADMIN role
          if (dbAttachment.notice.status === 'ARCHIVED' && (!user || user.role !== 'ADMIN')) {
            return ApiResponse.error(res, 'Access denied. This notice circular is archived.', 403);
          }
          // If PUBLISHED, accessible to students/guests/admins
        } else {
          // If file is not yet attached to any notice in DB (e.g. draft upload in Workbench):
          // Require ADMIN role to preview
          if (!user || user.role !== 'ADMIN') {
            return ApiResponse.error(res, 'Access denied. You must be an administrator to preview draft attachments.', 403);
          }
        }
      }

      // Generate Supabase signed URL (1 hour expiry = 3600 seconds)
      const EXPIRES_IN_SECONDS = 3600;
      const { data, error } = await supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .createSignedUrl(storagePath, EXPIRES_IN_SECONDS);

      if (error || !data?.signedUrl) {
        console.error(`[UploadController] Failed to generate signed URL for "${storagePath}":`, error?.message || 'Not found');
        return ApiResponse.error(res, 'Attachment file not found in storage or could not be accessed', 404);
      }

      // If client explicitly requests JSON (redirect=false) or sends application/json without browser navigation
      const isRedirectRequested =
        req.query.redirect === 'true' ||
        (req.query.redirect !== 'false' && (req.headers.accept?.includes('text/html') || (req.method === 'GET' && !req.xhr)));

      if (isRedirectRequested) {
        return res.redirect(data.signedUrl);
      }

      return ApiResponse.success(res, 'Signed URL generated successfully', {
        signedUrl: data.signedUrl,
        expiresIn: EXPIRES_IN_SECONDS,
        storagePath,
      });
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

      const timestamp = Date.now();
      const randomHex = crypto.randomBytes(4).toString('hex');
      const safeName = sanitizeFilename(file.originalname);
      const storagePath = `banners/${timestamp}-${randomHex}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload banner: ${uploadError.message}`);
      }

      const imageUrl = `/api/v1/upload/attachments/access?path=${encodeURIComponent(storagePath)}`;
      return ApiResponse.success(res, 'Banner image uploaded successfully', { imageUrl, storagePath });
    } catch (error: any) {
      console.error('[UploadController] Banner upload error:', error.message || error);
      return ApiResponse.error(res, `Failed to upload banner: ${error.message || 'Storage error'}`, 500);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return ApiResponse.error(res, 'No document file was uploaded', 400);
      }

      const timestamp = Date.now();
      const randomHex = crypto.randomBytes(4).toString('hex');
      const safeName = sanitizeFilename(file.originalname);
      const storagePath = `documents/${timestamp}-${randomHex}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload document: ${uploadError.message}`);
      }

      const downloadUrl = `/api/v1/upload/attachments/access?path=${encodeURIComponent(storagePath)}`;
      const fileType = UploadController.getFileType(file.originalname).toUpperCase();
      const fileSize = UploadController.formatFileSize(file.size);

      return ApiResponse.success(res, 'Document uploaded successfully', {
        downloadUrl,
        storagePath,
        fileType,
        fileSize,
        originalName: file.originalname,
      });
    } catch (error: any) {
      console.error('[UploadController] Document upload error:', error.message || error);
      return ApiResponse.error(res, `Failed to upload document: ${error.message || 'Storage error'}`, 500);
    }
  }
}
