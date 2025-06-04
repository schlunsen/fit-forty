import { defineStore } from 'pinia';

export type Theme = 'light' | 'dark' | 'midnight' | 'forest' | 'ocean';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  fontFamily: string;
  fontHeading: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright theme',
    primary: '#3B82F6',
    secondary: '#EF4444',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontHeading: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Modern dark theme',
    primary: '#60A5FA',
    secondary: '#F87171',
    accent: '#34D399',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    fontFamily: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    fontHeading: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, sans-serif'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blue midnight theme',
    primary: '#818CF8',
    secondary: '#F472B6',
    accent: '#FBBF24',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    border: '#334155',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
    fontFamily: '"Fira Code", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    fontHeading: '"Orbitron", "Exo 2", "Space Grotesk", sans-serif'
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Nature-inspired dark green theme',
    primary: '#22D3EE',
    secondary: '#FB7185',
    accent: '#A3E635',
    background: '#0F1A0F',
    surface: '#1A2E1A',
    text: '#F0FDF4',
    textSecondary: '#BBF7D0',
    border: '#15803D',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
    fontFamily: '"Cabin", "Nunito Sans", "Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
    fontHeading: '"Righteous", "Fredoka One", "Comfortaa", cursive'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep ocean blue theme',
    primary: '#06B6D4',
    secondary: '#EC4899',
    accent: '#84CC16',
    background: '#0C1B2A',
    surface: '#1B3A4D',
    text: '#E0F7FA',
    textSecondary: '#B2EBF2',
    border: '#0E7490',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
    fontFamily: '"Poppins", "Raleway", "Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontHeading: '"Oswald", "Bebas Neue", "Anton", sans-serif'
  }
};

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'light' as Theme,
    isLoaded: false
  }),
  
  getters: {
    theme: (state) => themes[state.currentTheme],
    availableThemes: () => Object.values(themes),
    isDark: (state) => state.currentTheme !== 'light'
  },
  
  actions: {
    setTheme(theme: Theme) {
      this.currentTheme = theme;
      this.applyTheme();
      this.saveTheme();
    },
    
    applyTheme() {
      const theme = this.theme;
      const root = document.documentElement;
      
      // Apply CSS custom properties
      root.style.setProperty('--color-primary', theme.primary);
      root.style.setProperty('--color-secondary', theme.secondary);
      root.style.setProperty('--color-accent', theme.accent);
      root.style.setProperty('--color-background', theme.background);
      root.style.setProperty('--color-surface', theme.surface);
      root.style.setProperty('--color-text', theme.text);
      root.style.setProperty('--color-text-secondary', theme.textSecondary);
      root.style.setProperty('--color-border', theme.border);
      root.style.setProperty('--shadow', theme.shadow);
      root.style.setProperty('--font-family', theme.fontFamily);
      root.style.setProperty('--font-heading', theme.fontHeading);
      
      // Add theme class to body
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${theme.id}`);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme.background);
      }
    },
    
    saveTheme() {
      if (process.client) {
        localStorage.setItem('workout-app-theme', this.currentTheme);
      }
    },
    
    loadTheme() {
      if (process.client) {
        const savedTheme = localStorage.getItem('workout-app-theme') as Theme;
        if (savedTheme && themes[savedTheme]) {
          this.currentTheme = savedTheme;
        }
        this.applyTheme();
        this.isLoaded = true;
      }
    },
    
    initTheme() {
      if (!this.isLoaded) {
        this.loadTheme();
      }
    }
  }
});