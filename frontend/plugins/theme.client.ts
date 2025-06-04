import { useThemeStore } from '~/stores/theme';

export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore();
  
  // Initialize theme on client-side
  themeStore.initTheme();
});