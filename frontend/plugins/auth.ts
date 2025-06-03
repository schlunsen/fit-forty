import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Skip on server side
  if (process.server) return;
  
  // Get the auth store
  const authStore = useAuthStore();
  
  // Initialize auth from localStorage on app startup
  await authStore.initAuth();
  
  // Add debug log
  console.log('Auth plugin initialized, authenticated:', authStore.isAuthenticated);
  
  // Add event listener for storage changes (for multi-tab support)
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' || event.key === 'refreshToken') {
      // Re-initialize auth when tokens change in another tab
      authStore.initAuth();
    }
  });
  
  // Add a global auth guard
  nuxtApp.hook('page:start', () => {
    // Re-check authentication on each page navigation
    if (!authStore.isAuthenticated) {
      const route = useRoute();
      
      // Skip for login and register pages
      if (route.path !== '/login' && route.path !== '/register') {
        console.log('Auth check failed, redirecting to login');
        navigateTo('/login');
      }
    }
  });
  
  // Add helpers to check auth status
  return {
    provide: {
      isAuthenticated: () => authStore.isAuthenticated,
      userFullName: () => authStore.userFullName,
    }
  };
});