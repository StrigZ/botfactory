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

// Store access token in memory (more secure than localStorage for the access token)
let accessToken: string | null = null;

// Functions to manage access token
export const setAccessToken = (token: string): void => {
  accessToken = token;
  // Also store in localStorage as backup (in case of page refresh)
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getAccessToken = (): string | null => {
  // If not in memory, try to restore from localStorage
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

// Request interceptor - Add access token to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Token ${token}`;
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
  reject: (error: Error) => void;
}

// Response interceptor - Handle token refresh on 401 errors
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Define the shape of auth responses from Django
interface TokenRefreshResponse {
  access: string;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse<{ token?: string }>) => {
    // If the response contains an access token (login/register responses), store it
    if (response.data?.token) {
      setAccessToken(response.data.token);
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
              originalRequest.headers.Authorization = `Token ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err: string) => {
            return Promise.reject(new Error(err));
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the access token using the refresh token in httpOnly cookie
        const response = await axios.post<TokenRefreshResponse>(
          `${API_BASE_URL}/auth/jwt/refresh/`,
          {},
          {
            withCredentials: true, // This sends the refresh token cookie
          },
        );

        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);

        // Process all queued requests with the new token
        processQueue(new Error(), newAccessToken);

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Token ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(new Error(refreshError as string), null);
        clearAccessToken();

        // Redirect to login page if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(new Error(refreshError as string));
      } finally {
        isRefreshing = false;
      }
    }

    // For any other error, just reject
    return Promise.reject(error);
  },
);
