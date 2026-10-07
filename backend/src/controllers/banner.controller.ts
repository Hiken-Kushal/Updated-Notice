import { Request, Response, NextFunction } from 'express';
import { BannerService } from '../services/banner.service';
import { ApiResponse } from '../utils/apiResponse';
import { bannerSchema } from '../validators';

export class BannerController {
  static async getBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const banners = await BannerService.getPublicBanners(category);
      return ApiResponse.success(res, 'Banners retrieved successfully', banners);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminBanners(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await BannerService.getBanners(false);
      return ApiResponse.success(res, 'All banners retrieved for admin', banners);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminBannerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const banner = await BannerService.getBannerById(id);
      return ApiResponse.success(res, 'Banner retrieved for admin', banner);
    } catch (error) {
      next(error);
    }
  }

  static async getBannerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const banner = await BannerService.getPublicBannerById(id);
      if (!banner) {
        return ApiResponse.error(res, 'Banner not found', 404);
      }
      return ApiResponse.success(res, 'Banner retrieved', banner);
    } catch (error) {
      next(error);
    }
  }

  static async createBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = bannerSchema.parse(req.body);
      const authorId = req.user?.id;
      const banner = await BannerService.createBanner(validated, authorId);
      return ApiResponse.success(res, 'Banner created successfully', banner, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const banner = await BannerService.updateBanner(id, req.body);
      return ApiResponse.success(res, 'Banner updated successfully', banner);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const banner = await BannerService.toggleStatus(id);
      return ApiResponse.success(res, 'Banner status toggled', banner);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBanner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await BannerService.deleteBanner(id);
      return ApiResponse.success(res, 'Banner deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async resetToPresets(req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await BannerService.resetToPresets();
      return ApiResponse.success(res, 'Banners reset to institutional presets', banners);
    } catch (error) {
      next(error);
    }
  }
}
