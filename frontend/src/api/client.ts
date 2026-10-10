import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('carepulse_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and request has not been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If the 401 happened on login or refresh endpoint itself, do not loop
      if (
        originalRequest.url?.includes('/auth/login/') ||
        originalRequest.url?.includes('/auth/token/refresh/')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('carepulse_refresh_token');

      if (!refreshToken) {
        // No refresh token available, logout immediately
        localStorage.removeItem('carepulse_access_token');
        localStorage.removeItem('carepulse_refresh_token');
        localStorage.removeItem('carepulse_user');
        window.dispatchEvent(new Event('carepulse_auth_logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('carepulse_access_token', newAccessToken);

        if (response.data.refresh) {
          localStorage.setItem('carepulse_refresh_token', response.data.refresh);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('carepulse_access_token');
        localStorage.removeItem('carepulse_refresh_token');
        localStorage.removeItem('carepulse_user');
        window.dispatchEvent(new Event('carepulse_auth_logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Utility to extract user-friendly error message from Django REST Framework error response
 */
export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) {
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
        return 'Network error: Unable to reach the healthcare backend server. Please verify Django is running on port 8000.';
      }
      return error.message || 'An unexpected server error occurred.';
    }

    if (typeof data === 'string') {
      return data;
    }

    // DRF 'detail' field (e.g. invalid credentials, 404, 403)
    if (data.detail) {
      return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    }

    // DRF 'non_field_errors' field
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors.join(' ');
    }

    // Field-level validation errors (e.g., {"email": ["A user with this email already exists."]})
    const messages: string[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        messages.push(`${key}: ${val.join(' ')}`);
      } else if (typeof val === 'string') {
        messages.push(`${key}: ${val}`);
      }
    }

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
