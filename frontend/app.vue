<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useHealthStore } from '~/stores/health';
import { useWorkoutsStore } from '~/stores/workouts';

// Initialize all stores to ensure arrays are properly set
onMounted(() => {
  const healthStore = useHealthStore();
  const workoutsStore = useWorkoutsStore();
  
  healthStore.init();
  workoutsStore.init();
});
</script>

<style>
/* Form styling using Tailwind classes directly */
.form-input-styling {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm;
}
</style>