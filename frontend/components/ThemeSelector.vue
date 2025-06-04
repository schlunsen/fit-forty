<template>
  <div class="theme-selector-container">
    <h3 class="text-lg font-semibold mb-4">Choose Theme</h3>
    <p class="text-sm mb-6" style="color: var(--color-text-secondary);">
      Select your preferred theme to customize the app's appearance
    </p>
    
    <div class="theme-selector">
      <div
        v-for="theme in availableThemes"
        :key="theme.id"
        :class="['theme-card', { active: currentTheme === theme.id }]"
        @click="selectTheme(theme.id)"
      >
        <div
          class="theme-preview"
          :style="{ 
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)` 
          }"
        >
          <span class="text-sm font-medium">{{ theme.name }}</span>
        </div>
        
        <h4 class="font-medium mb-1" style="color: var(--color-text)">
          {{ theme.name }}
        </h4>
        <p class="text-xs mb-2" style="color: var(--color-text-secondary)">
          {{ theme.description }}
        </p>
        
        <!-- Font preview -->
        <div class="text-xs" style="color: var(--color-text-secondary)">
          <div class="mb-1">
            <span class="font-medium">Body:</span> {{ getFontDisplayName(theme.fontFamily) }}
          </div>
          <div>
            <span class="font-medium">Headings:</span> {{ getFontDisplayName(theme.fontHeading) }}
          </div>
        </div>
        
        <!-- Color preview -->
        <div class="flex space-x-1 mt-3">
          <div
            class="w-4 h-4 rounded-full border"
            :style="{ backgroundColor: theme.primary, borderColor: 'var(--color-border)' }"
            :title="`Primary: ${theme.primary}`"
          ></div>
          <div
            class="w-4 h-4 rounded-full border"
            :style="{ backgroundColor: theme.secondary, borderColor: 'var(--color-border)' }"
            :title="`Secondary: ${theme.secondary}`"
          ></div>
          <div
            class="w-4 h-4 rounded-full border"
            :style="{ backgroundColor: theme.accent, borderColor: 'var(--color-border)' }"
            :title="`Accent: ${theme.accent}`"
          ></div>
          <div
            class="w-4 h-4 rounded-full border"
            :style="{ backgroundColor: theme.background, borderColor: 'var(--color-border)' }"
            :title="`Background: ${theme.background}`"
          ></div>
        </div>
        
        <!-- Selected indicator -->
        <div v-if="currentTheme === theme.id" class="mt-3 flex items-center">
          <svg class="w-4 h-4 mr-1" :style="{ color: 'var(--color-primary)' }" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs font-medium" :style="{ color: 'var(--color-primary)' }">
            Current Theme
          </span>
        </div>
      </div>
    </div>
    
    <div class="mt-6 p-4 rounded-lg" style="background-color: var(--color-surface); border: 1px solid var(--color-border);">
      <div class="flex items-center mb-2">
        <svg class="w-5 h-5 mr-2" :style="{ color: 'var(--color-text-secondary)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h4 class="font-medium" style="color: var(--color-text)">
          Theme Preview
        </h4>
      </div>
      <p class="text-sm mb-3" style="color: var(--color-text-secondary);">
        This is how your theme will look across the app
      </p>
      
      <!-- Theme preview elements -->
      <div class="space-y-3">
        <div class="flex space-x-2">
          <button class="btn text-sm">Primary Button</button>
          <button class="btn-secondary text-sm">Secondary Button</button>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <input type="text" class="form-input text-sm" placeholder="Input field" readonly>
          <select class="form-select text-sm">
            <option>Select option</option>
          </select>
        </div>
        
        <div class="card p-3">
          <p class="text-sm">This is a card component</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore, type Theme } from '~/stores/theme';

const themeStore = useThemeStore();

const currentTheme = computed(() => themeStore.currentTheme);
const availableThemes = computed(() => themeStore.availableThemes);

const selectTheme = (themeId: Theme) => {
  themeStore.setTheme(themeId);
};

const getFontDisplayName = (fontFamily: string) => {
  // Extract the first font name from the font stack
  const firstFont = fontFamily.split(',')[0].replace(/["']/g, '').trim();
  return firstFont;
};
</script>

<style scoped>
.theme-selector-container {
  max-width: 100%;
}

.theme-card {
  min-height: 180px;
  display: flex;
  flex-direction: column;
}

.theme-preview {
  flex-shrink: 0;
}
</style>