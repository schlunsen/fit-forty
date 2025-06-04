<template>
  <div>
    <!-- Dashboard Header -->
    <header class="mb-8">
      <h1 class="text-2xl font-bold" style="color: var(--color-text)">Dashboard</h1>
      <p style="color: var(--color-text-secondary)">Welcome back, {{ userName }}!</p>
    </header>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Recent Weight -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text)">Weight Tracking</h2>
        
        <div v-if="latestWeight" class="mb-4">
          <div class="flex justify-between items-center">
            <span style="color: var(--color-text-secondary)">Current Weight:</span>
            <span class="text-xl font-bold">{{ latestWeight.weight_kg }} kg</span>
          </div>
          <div class="text-xs text-right" style="color: var(--color-text-muted)">
            {{ formatDate(latestWeight.timestamp) }}
          </div>
        </div>
        <p v-else class="mb-4" style="color: var(--color-text-muted)">No weight entries yet</p>
        
        <div class="h-48">
          <LineChart v-if="hasWeightData" :data="weightChartData" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center" style="color: var(--color-text-muted)">
            Add weight entries to see your chart
          </div>
        </div>
        
        <div class="mt-4 flex justify-between items-center">
          <NuxtLink to="/health" class="text-sm text-primary-600 hover:underline">
            View all entries
          </NuxtLink>
          <NuxtLink to="/health/weight/add" class="btn text-sm">
            Add Entry
          </NuxtLink>
        </div>
      </div>
      
      <!-- Recent Blood Pressure -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text)">Blood Pressure</h2>
        
        <div v-if="latestBP" class="mb-4">
          <div class="flex justify-between items-center">
            <span style="color: var(--color-text-secondary)">Current Reading:</span>
            <span class="text-xl font-bold">{{ latestBP.systolic }}/{{ latestBP.diastolic }}</span>
          </div>
          <div v-if="latestBP.pulse" class="flex justify-between items-center">
            <span style="color: var(--color-text-secondary)">Pulse:</span>
            <span>{{ latestBP.pulse }} bpm</span>
          </div>
          <div class="text-xs text-right" style="color: var(--color-text-muted)">
            {{ formatDate(latestBP.timestamp) }}
          </div>
        </div>
        <p v-else class="mb-4" style="color: var(--color-text-muted)">No blood pressure readings yet</p>
        
        <div class="h-48">
          <LineChart v-if="hasBPData" :data="bpChartData" :options="chartOptions" />
          <div v-else class="h-full flex items-center justify-center" style="color: var(--color-text-muted)">
            Add readings to see your chart
          </div>
        </div>
        
        <div class="mt-4 flex justify-between items-center">
          <NuxtLink to="/health" class="text-sm text-primary-600 hover:underline">
            View all readings
          </NuxtLink>
          <NuxtLink to="/health/bp/add" class="btn text-sm">
            Add Reading
          </NuxtLink>
        </div>
      </div>
      
      <!-- Recent Workouts -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text)">Recent Workouts</h2>
        
        <div v-if="recentWorkouts.length > 0" class="space-y-3 mb-4">
          <div v-for="workout in recentWorkouts" :key="workout.id" class="border-b pb-2 last:border-0" style="border-color: var(--color-border)">
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ formatDate(workout.date) }}</span>
              <span class="text-sm" style="color: var(--color-text-muted)">{{ workout.exercise_logs.length }} exercises</span>
            </div>
            <div v-if="workout.duration_minutes" class="text-sm" style="color: var(--color-text-secondary)">
              {{ workout.duration_minutes }} minutes
            </div>
            <div v-if="workout.notes" class="text-sm truncate" style="color: var(--color-text-secondary)">
              {{ workout.notes }}
            </div>
          </div>
        </div>
        <p v-else class="mb-4" style="color: var(--color-text-muted)">No workouts logged yet</p>
        
        <div class="mt-4 flex justify-between items-center">
          <NuxtLink to="/workouts" class="text-sm text-primary-600 hover:underline">
            View all workouts
          </NuxtLink>
          <NuxtLink to="/workouts/add" class="btn text-sm">
            Log Workout
          </NuxtLink>
        </div>
      </div>
      
      <!-- Progress Photos -->
      <div class="card md:col-span-2 lg:col-span-3">
        <h2 class="text-lg font-semibold mb-4" style="color: var(--color-text)">Progress Photos</h2>
        
        <div v-if="recentPhotos.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div v-for="photo in recentPhotos" :key="photo.id" class="relative aspect-square">
            <img :src="photo.image_url" :alt="formatDate(photo.timestamp)" class="object-cover w-full h-full rounded-md" />
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md">
              {{ formatDate(photo.timestamp) }}
            </div>
          </div>
        </div>
        <p v-else class="mb-4" style="color: var(--color-text-muted)">No progress photos uploaded yet</p>
        
        <div class="mt-4 flex justify-between items-center">
          <NuxtLink to="/progress" class="text-sm text-primary-600 hover:underline">
            View all photos
          </NuxtLink>
          <NuxtLink to="/progress/add" class="btn text-sm">
            Upload Photo
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useAuthStore } from '~/stores/auth';
import { useWorkoutsStore } from '~/stores/workouts';
import { useHealthStore } from '~/stores/health';
import { useSafeArray } from '~/composables/useSafeArray';
import type { WeightEntry, BloodPressureReading, ProgressPhoto, WorkoutLog } from '~/types/models';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Store instances
const authStore = useAuthStore();
const workoutsStore = useWorkoutsStore();
const healthStore = useHealthStore();

// Initialize health store to ensure arrays exist
healthStore.init();

// Local state
const isLoading = ref(true);

// Initialize the workouts store
workoutsStore.init();

// Computed properties
const userName = computed(() => {
  return authStore.userFullName || 'User';
});

// Use safe array access
const { first: latestWeight } = useSafeArray(computed(() => healthStore.sortedWeightEntries));
const { first: latestBP } = useSafeArray(computed(() => healthStore.sortedBPReadings));

// Safe array for workouts
const { safeArray: sortedWorkouts, slice: workoutsSlice } = useSafeArray(computed(() => workoutsStore.sortedWorkouts));
const recentWorkouts = computed<WorkoutLog[]>(() => {
  return workoutsSlice(0, 5);
});

// Safe array for photos
const { safeArray: sortedPhotos, slice: photosSlice } = useSafeArray(computed(() => healthStore.sortedProgressPhotos));
const recentPhotos = computed<ProgressPhoto[]>(() => {
  return photosSlice(0, 5);
});

const hasWeightData = computed(() => {
  return healthStore.weightEntries && healthStore.weightEntries.length > 0;
});

const hasBPData = computed(() => {
  return healthStore.bloodPressureReadings && healthStore.bloodPressureReadings.length > 0;
});

const weightChartData = computed(() => {
  return healthStore.weightChartData;
});

const bpChartData = computed(() => {
  return healthStore.bpChartData;
});

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };
});

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Load data on component mount
onMounted(async () => {
  isLoading.value = true;
  
  try {
    // Initialize stores
    healthStore.init();
    workoutsStore.init();
    
    await Promise.all([
      healthStore.fetchWeightEntries(),
      healthStore.fetchBPReadings(),
      healthStore.fetchProgressPhotos(),
      workoutsStore.fetchWorkouts()
    ].map(p => p.catch(err => {
      console.error('API request failed:', err);
      return null; // Prevent one failed request from breaking everything
    })));
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>