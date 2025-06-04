<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold" style="color: var(--color-text)">Workout History</h1>
      <NuxtLink to="/workouts/add" class="btn">
        Log New Workout
      </NuxtLink>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style="border-color: var(--color-primary); border-top-color: transparent; border-bottom-color: transparent"></div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="workouts.length === 0" class="card p-8 text-center">
      <div class="mb-4" style="color: var(--color-text-secondary)">
        <svg class="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14V16M12 8V10M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium mb-2" style="color: var(--color-text)">No workouts yet</h3>
      <p class="mb-4" style="color: var(--color-text-secondary)">Start tracking your fitness journey by logging your first workout.</p>
      <NuxtLink to="/workouts/add" class="btn">
        Log Your First Workout
      </NuxtLink>
    </div>
    
    <!-- Workout List -->
    <div v-else class="space-y-4">
      <div v-for="workout in workouts" :key="workout.id" class="card hover:shadow-lg transition-shadow duration-200">
        <div class="flex justify-between items-start mb-4">
          <NuxtLink :to="`/workouts/${workout.id}`" class="flex-1">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold">
                  {{ formatDate(workout.date) }}
                </h3>
                <div v-if="workout.duration_minutes" class="mb-2" style="color: var(--color-text-secondary)">
                  Duration: {{ workout.duration_minutes }} minutes
                </div>
              </div>
              <div class="text-sm px-2 py-1 rounded-md" style="background-color: var(--color-primary-light); color: var(--color-primary-dark)">
                {{ workout.exercise_logs.length }} exercises
              </div>
            </div>
            
            <div v-if="workout.notes" class="mt-2" style="color: var(--color-text-secondary)">
              {{ workout.notes }}
            </div>
            
            <div v-if="workout.exercise_logs.length > 0" class="mt-4 pt-4" style="border-top: 1px solid var(--color-border)">
              <ul class="space-y-2">
                <li v-for="log in workout.exercise_logs.slice(0, 3)" :key="log.id" class="flex justify-between">
                  <span>{{ log.exercise_name }}</span>
                  <span style="color: var(--color-text-secondary)">{{ log.sets }} × {{ log.reps }} @ {{ log.weight }}kg</span>
                </li>
                <li v-if="workout.exercise_logs.length > 3" class="text-sm italic" style="color: var(--color-text-muted)">
                  + {{ workout.exercise_logs.length - 3 }} more exercises...
                </li>
              </ul>
            </div>
          </NuxtLink>
          
          <!-- Action Buttons -->
          <div class="flex space-x-2 ml-4">
            <button 
              @click="editWorkout(workout)"
              class="p-2 rounded-md transition-colors duration-200"
              style="color: var(--color-primary)"
              @mouseover="$event.target.style.backgroundColor = 'var(--color-primary-light)'"
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
              title="Edit workout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            
            <button 
              @click="confirmDeleteWorkout(workout)"
              class="p-2 rounded-md transition-colors duration-200"
              style="color: var(--color-secondary)"
              @mouseover="$event.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'"
              @mouseleave="$event.target.style.backgroundColor = 'transparent'"
              title="Delete workout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Workout Modal -->
    <div v-if="showEditModal && workoutToEdit" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="rounded-lg max-w-md w-full p-6" style="background-color: var(--color-surface)">
        <h3 class="text-lg font-medium mb-4" style="color: var(--color-text)">Edit Workout</h3>
        
        <form @submit.prevent="updateWorkout">
          <div class="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label class="label">Date</label>
              <input 
                v-model="editForm.date"
                type="date"
                class="form-input w-full"
                required
              />
            </div>
            
            <div>
              <label class="label">Duration (minutes)</label>
              <input 
                v-model.number="editForm.duration_minutes"
                type="number"
                min="1"
                max="300"
                class="form-input w-full"
              />
            </div>
          </div>
          
          <div class="mb-6">
            <label class="label">Notes</label>
            <textarea 
              v-model="editForm.notes"
              rows="3"
              class="form-textarea w-full"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showEditModal = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn"
              :disabled="updating"
            >
              <span v-if="updating" class="mr-2">
                <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </span>
              {{ updating ? 'Updating...' : 'Update Workout' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal && workoutToDelete" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="rounded-lg max-w-md w-full p-6" style="background-color: var(--color-surface)">
        <h3 class="text-lg font-medium mb-3" style="color: var(--color-text)">Delete Workout</h3>
        <p class="mb-4" style="color: var(--color-text-secondary)">
          Are you sure you want to delete the workout from {{ formatDate(workoutToDelete.date) }}? 
          This will also delete all associated exercise logs. This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false" 
            class="btn-secondary"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="deleteWorkout" 
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
            :disabled="deleting"
          >
            <span v-if="deleting" class="mr-2">
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            {{ deleting ? 'Deleting...' : 'Delete Workout' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useWorkoutsStore } from '~/stores/workouts';
import type { WorkoutLog } from '~/types/models';

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Store instance
const workoutsStore = useWorkoutsStore();

// Modal state
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const workoutToEdit = ref<WorkoutLog | null>(null);
const workoutToDelete = ref<WorkoutLog | null>(null);
const updating = ref(false);
const deleting = ref(false);

// Edit form
const editForm = reactive({
  date: '',
  duration_minutes: null as number | null,
  notes: ''
});

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

const editWorkout = (workout: WorkoutLog) => {
  workoutToEdit.value = workout;
  editForm.date = workout.date.split('T')[0]; // Convert to YYYY-MM-DD format
  editForm.duration_minutes = workout.duration_minutes;
  editForm.notes = workout.notes || '';
  showEditModal.value = true;
};

const updateWorkout = async () => {
  if (!workoutToEdit.value) return;
  
  updating.value = true;
  
  try {
    await workoutsStore.updateWorkout(workoutToEdit.value.id, {
      date: editForm.date,
      duration_minutes: editForm.duration_minutes,
      notes: editForm.notes
    });
    
    showEditModal.value = false;
    workoutToEdit.value = null;
  } catch (error) {
    console.error('Error updating workout:', error);
  } finally {
    updating.value = false;
  }
};

const confirmDeleteWorkout = (workout: WorkoutLog) => {
  workoutToDelete.value = workout;
  showDeleteModal.value = true;
};

const deleteWorkout = async () => {
  if (!workoutToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await workoutsStore.deleteWorkout(workoutToDelete.value.id);
    showDeleteModal.value = false;
    workoutToDelete.value = null;
  } catch (error) {
    console.error('Error deleting workout:', error);
  } finally {
    deleting.value = false;
  }
};

// Load workouts on component mount
onMounted(() => {
  workoutsStore.fetchWorkouts();
});
</script>