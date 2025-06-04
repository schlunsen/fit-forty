<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Log New Workout</h1>
    
    <!-- Workout Info Form -->
    <div class="card max-w-3xl mx-auto mb-8">
      <h2 class="text-lg font-semibold mb-4">Workout Details</h2>
      
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
      <div class="mb-4">
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
    </div>

    <!-- Exercise Logs Section -->
    <div class="card max-w-3xl mx-auto mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Exercises</h2>
        <button 
          @click="addExerciseRow" 
          class="btn-secondary"
          :disabled="submitting"
        >
          + Add Exercise
        </button>
      </div>

      <div v-if="exerciseLogs.length === 0" class="text-center py-8 text-gray-500">
        <p>No exercises added yet. Click "Add Exercise" to get started.</p>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="(log, index) in exerciseLogs" 
          :key="`exercise-${index}`"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-sm font-medium text-gray-700">Exercise {{ index + 1 }}</h3>
            <button 
              @click="removeExerciseRow(index)"
              class="text-red-600 hover:text-red-800 text-sm"
              :disabled="submitting"
            >
              Remove
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- Exercise Selection -->
            <div class="lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Exercise</label>
              <select 
                v-model="log.exercise"
                class="form-select w-full rounded-md border-gray-300"
                required
                :disabled="submitting"
              >
                <option value="" disabled>Select exercise</option>
                <option v-for="exercise in exercises" :key="exercise.id" :value="exercise.id">
                  {{ exercise.name }}
                </option>
              </select>
            </div>

            <!-- Sets -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sets</label>
              <input 
                v-model.number="log.sets"
                type="number"
                min="1"
                max="20"
                class="form-input w-full rounded-md border-gray-300"
                required
                :disabled="submitting"
              />
            </div>

            <!-- Reps -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input 
                v-model.number="log.reps"
                type="number"
                min="1"
                max="100"
                class="form-input w-full rounded-md border-gray-300"
                required
                :disabled="submitting"
              />
            </div>

            <!-- Weight -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input 
                v-model.number="log.weight"
                type="number"
                min="0"
                step="0.5"
                class="form-input w-full rounded-md border-gray-300"
                required
                :disabled="submitting"
              />
            </div>
          </div>

          <!-- Notes for this exercise -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input 
              v-model="log.notes"
              type="text"
              class="form-input w-full rounded-md border-gray-300"
              placeholder="Any notes for this exercise..."
              :disabled="submitting"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md max-w-3xl mx-auto">
      {{ error }}
    </div>

    <!-- Submit Button -->
    <div class="flex justify-between max-w-3xl mx-auto">
      <NuxtLink to="/workouts" class="btn-secondary">
        Cancel
      </NuxtLink>
      
      <button 
        @click="submitWorkout"
        class="btn flex items-center"
        :disabled="submitting || exerciseLogs.length === 0"
      >
        <span v-if="submitting" class="mr-2">
          <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </span>
        {{ submitting ? 'Saving...' : 'Save Workout' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useWorkoutsStore } from '~/stores/workouts';
import type { Exercise } from '~/types/models';

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

// Exercise logs array
const exerciseLogs = ref<Array<{
  exercise: number | '';
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}>>([]);

// Submission state
const submitting = ref(false);
const error = computed(() => workoutsStore.error);

// Exercises from store
const exercises = computed<Exercise[]>(() => {
  return workoutsStore.exercises || [];
});

// Methods
const addExerciseRow = () => {
  exerciseLogs.value.push({
    exercise: '',
    sets: 3,
    reps: 10,
    weight: 0,
    notes: ''
  });
};

const removeExerciseRow = (index: number) => {
  exerciseLogs.value.splice(index, 1);
};

const submitWorkout = async () => {
  if (exerciseLogs.value.length === 0) {
    alert('Please add at least one exercise to your workout.');
    return;
  }

  // Validate that all exercises are selected
  const hasUnselectedExercise = exerciseLogs.value.some(log => !log.exercise);
  if (hasUnselectedExercise) {
    alert('Please select an exercise for all exercise logs.');
    return;
  }

  submitting.value = true;
  
  try {
    // Prepare workout data
    const workoutData = {
      date: form.date,
      duration_minutes: form.duration_minutes,
      notes: form.notes || ''
    };
    
    // Create the workout first
    const newWorkout = await workoutsStore.createWorkout(workoutData);
    
    if (newWorkout) {
      // Add each exercise log to the workout
      for (const exerciseLog of exerciseLogs.value) {
        await workoutsStore.addExerciseLog(newWorkout.id, {
          exercise: exerciseLog.exercise as number,
          sets: exerciseLog.sets,
          reps: exerciseLog.reps,
          weight: exerciseLog.weight,
          notes: exerciseLog.notes || null
        });
      }
      
      // Navigate to the workout detail page
      navigateTo(`/workouts/${newWorkout.id}`);
    }
  } catch (err) {
    console.error('Failed to create workout:', err);
  } finally {
    submitting.value = false;
  }
};

// Load exercises on mount
onMounted(async () => {
  await workoutsStore.fetchExercises();
  // Add one exercise row by default
  addExerciseRow();
});
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-200;
}
</style>