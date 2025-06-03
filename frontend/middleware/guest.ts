import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server side
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // If user is authenticated, redirect to home page
  if (authStore.isAuthenticated) {
    return navigateTo('/');
  }
});