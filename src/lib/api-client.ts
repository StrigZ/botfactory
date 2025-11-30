// import axios, {
//   type AxiosError,
//   type AxiosResponse,
//   type InternalAxiosRequestConfig,
// } from 'axios';

// const API_BASE_URL = process.env.API_URL ?? 'http://localhost:8000/api';

// // Create axios instance with base configuration
// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true,
// });

// // Store both access and refresh tokens in memory
// let accessToken: string | null = null;
// let refreshToken: string | null = null;

// // Functions to manage tokens
// export const setTokens = (access: string, refresh: string): void => {
//   accessToken = access;
//   refreshToken = refresh;

//   if (typeof window !== 'undefined') {
//     localStorage.setItem('access_token', access);
//     localStorage.setItem('refresh_token', refresh); // Store refresh token
//   }
// };

// export const getAccessToken = (): string | null => {
//   if (!accessToken && typeof window !== 'undefined') {
//     accessToken = localStorage.getItem('access_token');
//   }
//   return accessToken;
// };

// export const getRefreshToken = (): string | null => {
//   if (!refreshToken && typeof window !== 'undefined') {
//     refreshToken = localStorage.getItem('refresh_token');
//   }
//   return refreshToken;
// };

// export const clearTokens = (): void => {
//   accessToken = null;
//   refreshToken = null;
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//   }
// };

// // Request interceptor - Add JWT to all requests
// apiClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = getAccessToken();
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   },
// );

// // Types for the queue of failed requests during token refresh
// interface QueueItem {
//   resolve: (token: string | null) => void;
//   reject: (error: unknown) => void;
// }

// // Response interceptor - Handle token refresh on 401 errors
// let isRefreshing = false;
// let failedQueue: QueueItem[] = [];

// const processQueue = (error: unknown, token: string | null = null): void => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// // Define the shape of JWT responses from Django
// interface TokenResponse {
//   access: string;
//   refresh?: string; // refresh token only returned on login/register
// }

// apiClient.interceptors.response.use(
//   (response: AxiosResponse<{ access?: string; refresh?: string }>) => {
//     // If response contains tokens (login/register/google), store them
//     if (response.data?.access) {
//       const access = response.data.access;
//       const refresh = response.data.refresh;

//       if (refresh) {
//         // Login/register returns both tokens
//         setTokens(access, refresh);
//       } else {
//         // Refresh endpoint only returns access token
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('access_token', access);
//         }
//         accessToken = access;
//       }
//     }
//     return response;
//   },
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     // If error is 401 and we haven't tried to refresh yet
//     if (
//       error.response?.status === 401 &&
//       originalRequest &&
//       !originalRequest._retry
//     ) {
//       if (isRefreshing) {
//         // If already refreshing, queue this request
//         return new Promise<string | null>((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             if (token && originalRequest.headers) {
//               originalRequest.headers.Authorization = `Bearer ${token}`;
//             }
//             return apiClient(originalRequest);
//           })
//           .catch((err: Error) => {
//             return Promise.reject(err);
//           });
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         const currentRefreshToken = getRefreshToken();

//         if (!currentRefreshToken) {
//           throw new Error('No refresh token available');
//         }

//         // Try to refresh the access token - SEND REFRESH TOKEN IN BODY
//         const response = await axios.post<TokenResponse>(
//           `${API_BASE_URL}/auth/jwt/refresh/`,
//           {
//             refresh: currentRefreshToken, // ← Send in body
//           },
//         );

//         const newAccessToken = response.data.access;

//         // Update access token (refresh token stays the same)
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('access_token', newAccessToken);
//         }
//         accessToken = newAccessToken;

//         // Process all queued requests with the new token
//         processQueue(null, newAccessToken);

//         // Retry the original request with new token
//         if (originalRequest.headers) {
//           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         }
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         // Refresh failed - clear tokens and redirect to login
//         processQueue(refreshError, null);
//         clearTokens();

//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }

//         return Promise.reject(refreshError as Error);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     // For any other error, just reject
//     return Promise.reject(error);
//   },
// );
