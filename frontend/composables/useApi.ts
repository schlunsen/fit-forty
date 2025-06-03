import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '~/stores/auth';

export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  
  const apiClient: AxiosInstance = axios.create({
    baseURL: config.public.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add authentication token to requests
  apiClient.interceptors.request.use(
    (config) => {
      const token = authStore.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Handle 401 responses (token expired)
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          await authStore.refreshAuthToken();
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${authStore.token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout and redirect to login
          authStore.logout();
          navigateTo('/login');
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  // API methods
  return {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.get(url, config).then((response: AxiosResponse<T>) => response.data);
    },
    
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.post(url, data, config).then((response: AxiosResponse<T>) => response.data);
    },
    
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.put(url, data, config).then((response: AxiosResponse<T>) => response.data);
    },
    
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.patch(url, data, config).then((response: AxiosResponse<T>) => response.data);
    },
    
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.delete(url, config).then((response: AxiosResponse<T>) => response.data);
    },
    
    // Special method for file uploads
    uploadFile<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
      return apiClient.post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      }).then((response: AxiosResponse<T>) => response.data);
    }
  };
};