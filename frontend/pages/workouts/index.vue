<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Workout History</h1>
      <NuxtLink to="/workouts/add" class="btn">
        Log New Workout
      </NuxtLink>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="workouts.length === 0" class="card p-8 text-center">
      <div class="text-gray-400 mb-4">
        <svg class="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14V16M12 8V10M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
      <p class="text-gray-600 mb-4">Start tracking your fitness journey by logging your first workout.</p>
      <NuxtLink to="/workouts/add" class="btn">
        Log Your First Workout
      </NuxtLink>
    </div>
    
    <!-- Workout List -->
    <div v-else class="space-y-4">
      <div v-for="workout in workouts" :key="workout.id" class="card hover:shadow-lg transition-shadow duration-200">
        <NuxtLink :to="`/workouts/${workout.id}`" class="block">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold">
                {{ formatDate(workout.date) }}
              </h3>
              <div v-if="workout.duration_minutes" class="text-gray-600 mb-2">
                Duration: {{ workout.duration_minutes }} minutes
              </div>
            </div>
            <div class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
              {{ workout.exercise_logs.length }} exercises
            </div>
          </div>
          
          <div v-if="workout.notes" class="text-gray-600 mt-2">
            {{ workout.notes }}
          </div>
          
          <div v-if="workout.exercise_logs.length > 0" class="mt-4 border-t border-gray-100 pt-4">
            <ul class="space-y-2">
              <li v-for="log in workout.exercise_logs.slice(0, 3)" :key="log.id" class="flex justify-between">
                <span>{{ log.exercise_name }}</span>
                <span class="text-gray-600">{{ log.sets }} × {{ log.reps }} @ {{ log.weight }}kg</span>
              </li>
              <li v-if="workout.exercise_logs.length > 3" class="text-gray-500 text-sm italic">
                + {{ workout.exercise_logs.length - 3 }} more exercises...
              </li>
            </ul>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useWorkoutsStore } from '~/stores/workouts';

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Store instance
const workoutsStore = useWorkoutsStore();

// Computed properties
const loading = computed(() => workoutsStore.loading);
const workouts = computed(() => workoutsStore.sortedWorkouts);

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Load workouts on component mount
onMounted(() => {
  workoutsStore.fetchWorkouts();
});
</script>