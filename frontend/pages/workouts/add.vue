<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Log New Workout</h1>
    
    <div class="card max-w-3xl mx-auto mb-8">
      <!-- Workout Info Form -->
      <form @submit.prevent="submitWorkout">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Date Input -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              v-model="form.date"
              id="date"
              type="date"
              class="form-input w-full rounded-md border-gray-300"
              required
              :disabled="submitting"
            />
          </div>
          
          <!-- Duration Input -->
          <div>
            <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input 
              v-model.number="form.duration_minutes"
              id="duration"
              type="number"
              min="1"
              max="300"
              class="form-input w-full rounded-md border-gray-300"
              :disabled="submitting"
            />
          </div>
        </div>
        
        <!-- Notes Input -->
        <div class="mb-6">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea 
            v-model="form.notes"
            id="notes"
            rows="3"
            class="form-textarea w-full rounded-md border-gray-300"
            placeholder="How was your workout? Any achievements or challenges?"
            :disabled="submitting"
          ></textarea>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <!-- Submit Button -->
        <div class="flex justify-between">
          <NuxtLink to="/workouts" class="btn-secondary">
            Cancel
          </NuxtLink>
          
          <button 
            type="submit" 
            class="btn flex items-center"
            :disabled="submitting"
          >
            <span v-if="submitting" class="mr-2">
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            {{ submitting ? 'Saving...' : 'Continue to Add Exercises' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Instructions -->
    <div class="bg-blue-50 p-4 rounded-md text-blue-800 max-w-3xl mx-auto">
      <h3 class="font-medium mb-2">How It Works</h3>
      <ol class="list-decimal ml-5 space-y-2">
        <li>Fill out the basic workout information above</li>
        <li>Click "Continue to Add Exercises"</li>
        <li>You'll be redirected to a page where you can add specific exercises to your workout</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useWorkoutsStore } from '~/stores/workouts';

// Page middleware
definePageMeta({
  middleware: 'auth'
});

// Store
const workoutsStore = useWorkoutsStore();

// Initialize store
workoutsStore.init();

// Current date in ISO format (YYYY-MM-DD)
const today = new Date().toISOString().split('T')[0];

// Form state
const form = reactive({
  date: today,
  duration_minutes: null as number | null,
  notes: '',
});

// Submission state
const submitting = ref(false);
const error = computed(() => workoutsStore.error);

// Methods
const submitWorkout = async () => {
  submitting.value = true;
  
  try {
    // Prepare workout data
    const workoutData = {
      date: form.date,
      duration_minutes: form.duration_minutes,
      notes: form.notes || ''
    };
    
    // Submit to store
    const newWorkout = await workoutsStore.createWorkout(workoutData);
    
    if (newWorkout) {
      // Navigate to workout detail page where exercises can be added
      navigateTo(`/workouts/${newWorkout.id}`);
    }
  } catch (err) {
    console.error('Failed to create workout:', err);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-200;
}
</style>