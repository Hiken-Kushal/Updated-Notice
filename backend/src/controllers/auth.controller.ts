import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { loginSchema, registerSchema, refreshTokenSchema } from '../validators';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const user = await AuthService.register(validated);
      return ApiResponse.success(res, 'User registered successfully', user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated.usernameOrEmail, validated.password);
      return ApiResponse.success(res, 'Logged in successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }
      const user = await AuthService.getProfile(req.user.id);
      return ApiResponse.success(res, 'User profile fetched', user);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshToken(validated.refreshToken);
      return ApiResponse.success(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body?.refreshToken;
      if (token) {
        await AuthService.logout(token);
      }
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}
