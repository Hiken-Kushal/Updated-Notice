import type { AdminNotice, NoticeStatus } from '../types/adminNotice';
import type { DashboardBanner } from '../types/adminBanner';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api/v1';
export const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string) || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: any;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'STUDENT';
  department?: string;
  year?: string;
  prn?: string;
}

export interface LoginResult {
  user: AdminUser;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: string;
  };
  token?: string;
  refreshToken?: string;
}

export interface NoticeStats {
  total: number;
  published: number;
  actionRequired: number;
  categoryCounts: Record<string, number>;
}

export interface NoticeQueryParams {
  category?: string;
  status?: string;
  departmentKey?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AdminApiService {
  private static tokenKey = 'icem_access_token';
  private static refreshTokenKey = 'icem_refresh_token';
  private static userKey = 'icem_admin_user';

  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.refreshTokenKey);
    } catch {
      return null;
    }
  }

  static getStoredUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static setAuth(loginResult: LoginResult): void {
    try {
      const accessToken = loginResult.tokens?.accessToken || loginResult.token || '';
      const refreshToken = loginResult.tokens?.refreshToken || loginResult.refreshToken || '';
      if (accessToken) localStorage.setItem(this.tokenKey, accessToken);
      if (refreshToken) localStorage.setItem(this.refreshTokenKey, refreshToken);
      if (loginResult.user) localStorage.setItem(this.userKey, JSON.stringify(loginResult.user));
      localStorage.setItem('icem_admin_auth', 'true');
    } catch (err) {
      console.error('Failed to store auth tokens:', err);
    }
  }

  static clearAuth(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem('icem_admin_auth');
      sessionStorage.removeItem('icem_admin_authenticated');
    } catch (err) {
      console.error('Failed to clear auth tokens:', err);
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Helper to resolve relative upload URLs to full URLs
   */
  static resolveFileUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${SERVER_URL}${cleanUrl}`;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit & { _isRetry?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        // If unauthorized and we have a refresh token, attempt token refresh once
        if (response.status === 401 && !options._isRetry) {
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            try {
              const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });
              const refreshData = await refreshRes.json();
              if (refreshRes.ok && refreshData.success && refreshData.data?.tokens?.accessToken) {
                const newAccessToken = refreshData.data.tokens.accessToken;
                localStorage.setItem(this.tokenKey, newAccessToken);
                if (refreshData.data.tokens.refreshToken) {
                  localStorage.setItem(this.refreshTokenKey, refreshData.data.tokens.refreshToken);
                }
                const newHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
                return await this.request<T>(endpoint, {
                  ...options,
                  headers: newHeaders,
                  _isRetry: true,
                });
              }
            } catch (refreshErr) {
              console.warn('Token refresh failed:', refreshErr);
            }
          }
          this.clearAuth();
        }

        let errorMsg = data.message || `Request failed with status ${response.status}`;
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const detail = data.errors.map((e: any) => e.message || `${e.field}: invalid`).join(', ');
          errorMsg = `${errorMsg}: ${detail}`;
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  static async login(username: string, password: string): Promise<LoginResult> {
    const res = await this.request<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, usernameOrEmail: username, password }),
    });

    if (res.data) {
      this.setAuth(res.data);
      return res.data;
    }
    throw new Error('Login failed: invalid response data from server');
  }

  static async getMe(): Promise<AdminUser> {
    const res = await this.request<AdminUser>('/auth/me');
    if (res.data) {
      return res.data;
    }
    throw new Error('Could not fetch user profile');
  }

  static async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      console.warn('Logout API call failed, clearing local session:', err);
    } finally {
      this.clearAuth();
    }
  }

  // ==================== NOTICES ====================

  static async getNotices(params: NoticeQueryParams = {}): Promise<{ notices: AdminNotice[]; total: number }> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') {
      query.append('category', params.category);
    }
    if (params.status && params.status !== 'all') {
      query.append('status', params.status);
    }
    if (params.departmentKey && params.departmentKey !== 'all') {
      query.append('departmentKey', params.departmentKey);
    }
    if (params.search) {
      query.append('search', params.search);
    }
    if (params.page) {
      query.append('page', String(params.page));
    }
    if (params.limit) {
      query.append('limit', String(params.limit));
    } else {
      query.append('limit', '100'); // default to 100 for admin workbench
    }

    const endpoint = `/notices?${query.toString()}`;
    const res = await this.request<AdminNotice[]>(endpoint);
    return {
      notices: res.data || [],
      total: res.pagination?.total ?? (res.data ? res.data.length : 0),
    };
  }

  static async getNoticeStats(): Promise<NoticeStats> {
    const res = await this.request<NoticeStats>('/notices/stats');
    return res.data || { total: 0, published: 0, actionRequired: 0, categoryCounts: {} };
  }

  static async getNoticeById(id: string): Promise<AdminNotice> {
    const res = await this.request<AdminNotice>(`/notices/${id}`);
    if (!res.data) throw new Error('Notice not found');
    return res.data;
  }

  static async createNotice(notice: Partial<AdminNotice>): Promise<AdminNotice> {
    const res = await this.request<AdminNotice>('/notices', {
      method: 'POST',
      body: JSON.stringify(notice),
    });
    if (!res.data) throw new Error('Failed to create notice');
    return res.data;
  }

  static async updateNotice(id: string, notice: Partial<AdminNotice>): Promise<AdminNotice> {
    const res = await this.request<AdminNotice>(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notice),
    });
    if (!res.data) throw new Error('Failed to update notice');
    return res.data;
  }

  static async deleteNotice(id: string): Promise<void> {
    await this.request(`/notices/${id}`, {
      method: 'DELETE',
    });
  }

  static async updateNoticeStatus(id: string, status: NoticeStatus): Promise<AdminNotice> {
    const res = await this.request<AdminNotice>(`/notices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res.data) throw new Error('Failed to update notice status');
    return res.data;
  }

  // ==================== BANNERS ====================

  static async getBanners(activeOnly?: boolean): Promise<DashboardBanner[]> {
    const query = activeOnly ? '?activeOnly=true' : '';
    const res = await this.request<DashboardBanner[]>(`/banners${query}`);
    return res.data || [];
  }

  static async createBanner(banner: Partial<DashboardBanner>): Promise<DashboardBanner> {
    const res = await this.request<DashboardBanner>('/banners', {
      method: 'POST',
      body: JSON.stringify(banner),
    });
    if (!res.data) throw new Error('Failed to create banner');
    return res.data;
  }

  static async updateBanner(id: string, banner: Partial<DashboardBanner>): Promise<DashboardBanner> {
    const res = await this.request<DashboardBanner>(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner),
    });
    if (!res.data) throw new Error('Failed to update banner');
    return res.data;
  }

  static async deleteBanner(id: string): Promise<void> {
    await this.request(`/banners/${id}`, {
      method: 'DELETE',
    });
  }

  static async toggleBannerStatus(id: string, isActive: boolean): Promise<DashboardBanner> {
    const res = await this.request<DashboardBanner>(`/banners/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
    if (!res.data) throw new Error('Failed to toggle banner status');
    return res.data;
  }

  static async resetBanners(): Promise<DashboardBanner[]> {
    const res = await this.request<DashboardBanner[]>('/banners/reset', {
      method: 'POST',
    });
    return res.data || [];
  }

  // ==================== FILE UPLOADS ====================

  static async uploadNoticeAttachments(files: File[]): Promise<Array<{
    name: string;
    size: string;
    type: 'pdf' | 'excel' | 'image' | 'doc';
    url: string;
  }>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await this.request<any[]>('/upload/attachments', {
      method: 'POST',
      body: formData,
    });

    return (res.data || []).map((item) => ({
      name: item.name || item.originalName,
      size: item.size || item.fileSize,
      type: item.type || item.fileType,
      url: item.url || item.fileUrl,
    }));
  }

  static async uploadBannerImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await this.request<{ imageUrl: string }>('/upload/banner-image', {
      method: 'POST',
      body: formData,
    });

    if (!res.data?.imageUrl) {
      throw new Error('Failed to get uploaded banner image URL');
    }
    return res.data;
  }
}
