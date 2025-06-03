import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { AuthTokens, LoginCredentials, RegisterData, User, UserProfile } from '~/types/models';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as User | null,
    profile: null as UserProfile | null,
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    userFullName: (state) => {
      if (!state.user) return '';
      return state.user.first_name && state.user.last_name
        ? `${state.user.first_name} ${state.user.last_name}`
        : state.user.username;
    },
  },
  
  actions: {
    // Load tokens from localStorage on app initialization
    async initAuth() {
      if (process.client) {
        console.log('Initializing auth from localStorage');
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token && refreshToken) {
          console.log('Found token in localStorage');
          this.token = token;
          this.refreshToken = refreshToken;
          
          try {
            // Try to validate token by fetching user profile
            await this.fetchUserProfile();
            console.log('Authentication successful, user profile loaded');
            return true;
          } catch (error) {
            console.error('Token validation failed, trying to refresh');
            try {
              // Try to refresh the token if profile fetch fails
              await this.refreshAuthToken();
              console.log('Token refreshed successfully');
              
              // Try to fetch profile again with new token
              await this.fetchUserProfile();
              console.log('Profile loaded after token refresh');
              return true;
            } catch (refreshError) {
              console.error('Token refresh failed, clearing auth');
              this.clearAuth();
              return false;
            }
          }
        } else {
          console.log('No tokens found in localStorage');
          return false;
        }
      }
      return false;
    },
    
    // Store tokens in localStorage
    setTokens(tokens: AuthTokens) {
      this.token = tokens.access;
      this.refreshToken = tokens.refresh;
      
      if (process.client) {
        localStorage.setItem('token', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
      }
    },
    
    // Clear auth state and localStorage
    clearAuth() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.profile = null;
      
      if (process.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
    
    // Login user
    async login(credentials: LoginCredentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const api = useApi();
        const tokens = await api.post<AuthTokens>('/token/', credentials);
        this.setTokens(tokens);
        await this.fetchUserProfile();
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Register user
    async register(data: RegisterData) {
      this.loading = true;
      this.error = null;
      
      try {
        const api = useApi();
        await api.post('/registration/register/', data);
        return await this.login({
          username: data.username,
          password: data.password,
        });
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Logout user
    logout() {
      this.clearAuth();
      navigateTo('/login');
    },
    
    // Refresh JWT token
    async refreshAuthToken() {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      try {
        const api = useApi();
        const tokens = await api.post<AuthTokens>('/token/refresh/', {
          refresh: this.refreshToken,
        });
        this.setTokens(tokens);
        return true;
      } catch (error) {
        this.clearAuth();
        throw error;
      }
    },
    
    // Fetch user profile
    async fetchUserProfile() {
      if (!this.token) return;
      
      try {
        this.loading = true;
        const api = useApi();
        const profileData = await api.get<UserProfile>('/profiles/my_profile/');
        this.profile = profileData;
        this.user = profileData.user;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Update user profile
    async updateProfile(profileData: Partial<UserProfile>) {
      if (!this.profile) return;
      
      try {
        this.loading = true;
        const api = useApi();
        const updatedProfile = await api.patch<UserProfile>(`/profiles/${this.profile.id}/`, profileData);
        this.profile = updatedProfile;
        return true;
      } catch (error) {
        console.error('Failed to update profile:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});