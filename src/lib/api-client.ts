import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: sends httpOnly cookies with requests
});

// Store access token in memory
let accessToken: string | null = null;

// Functions to manage access token
export const setAccessToken = (token: string): void => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
};

export const clearAccessToken = (): void => {
  accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

// Request interceptor - Add JWT to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      // Always use Bearer for JWT
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Types for the queue of failed requests during token refresh
interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

// Response interceptor - Handle token refresh on 401 errors
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Define the shape of JWT responses from Django
interface TokenResponse {
  access: string;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse<{ access?: string }>) => {
    // If response contains access token (login/register/google), store it
    if (response.data?.access) {
      setAccessToken(response.data.access);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err: Error) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the access token
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/auth/jwt/refresh/`,
          {},
          {
            withCredentials: true, // Sends refresh token cookie
          },
        );

        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError, null);
        clearAccessToken();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError as Error);
      } finally {
        isRefreshing = false;
      }
    }

    // For any other error, just reject
    return Promise.reject(error);
  },
);
