import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // If user is not authenticated, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});