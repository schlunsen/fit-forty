<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between">
      <div>
        <NuxtLink to="/workouts" class="text-sm text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Workouts
        </NuxtLink>
        <h1 class="text-2xl font-bold">{{ workoutDate }}</h1>
      </div>
      
      <button @click="showAddExerciseModal = true" class="btn flex items-center">
        <span class="i-heroicons-plus-circle-20-solid mr-1"></span>
        Add Exercise
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else>
      <!-- Workout Summary Card -->
      <div class="card mb-6 flex flex-wrap justify-between items-start">
        <div>
          <div class="text-gray-600 mb-1">Duration</div>
          <div class="text-xl font-medium">{{ workout?.duration_minutes || 'N/A' }} minutes</div>
        </div>
        
        <div>
          <div class="text-gray-600 mb-1">Exercises</div>
          <div class="text-xl font-medium">{{ exerciseCount }}</div>
        </div>
        
        <div class="w-full mt-4" v-if="workout?.notes">
          <div class="text-gray-600 mb-1">Notes</div>
          <div class="text-gray-800 whitespace-pre-line">{{ workout.notes }}</div>
        </div>
      </div>
      
      <!-- Exercise List -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Exercises</h2>
        
        <div v-if="!hasExercises" class="p-6 text-center bg-gray-50 rounded-md">
          <p class="text-gray-600 mb-4">No exercises added to this workout yet.</p>
          <button @click="showAddExerciseModal = true" class="btn">Add Your First Exercise</button>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div v-for="log in exerciseLogs" :key="log.id" class="py-4 first:pt-0 last:pb-0">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-medium">{{ getExerciseName(log) }}</h3>
              <div class="flex space-x-2">
                <button @click="editExerciseLog(log)" class="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button @click="confirmDeleteExerciseLog(log)" class="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 text-sm mb-2">
              <div>
                <span class="text-gray-600">Sets:</span> {{ log.sets }}
              </div>
              <div>
                <span class="text-gray-600">Reps:</span> {{ log.reps }}
              </div>
              <div>
                <span class="text-gray-600">Weight:</span> {{ log.weight }} kg
              </div>
            </div>
            
            <div v-if="log.notes" class="text-gray-600 text-sm">
              {{ log.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Exercise Modal -->
    <div v-if="showAddExerciseModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-xl w-full p-6">
        <h3 class="text-lg font-medium mb-4">Add Exercise</h3>
        
        <form @submit.prevent="addExercise">
          <div class="mb-4">
            <label for="exercise" class="block text-sm font-medium text-gray-700 mb-1">Exercise</label>
            <select 
              v-model="exerciseForm.exercise_id"
              id="exercise"
              class="form-select w-full rounded-md border-gray-300"
              required
            >
              <option value="" disabled>Select an exercise</option>
              <option v-for="ex in exercises" :key="ex.id" :value="ex.id">{{ ex.name }}</option>
            </select>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="sets" class="block text-sm font-medium text-gray-700 mb-1">Sets</label>
              <input 
                v-model.number="exerciseForm.sets"
                id="sets"
                type="number"
                min="1"
                max="20"
                class="form-input w-full rounded-md border-gray-300"
                required
              />
            </div>
            
            <div>
              <label for="reps" class="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input 
                v-model.number="exerciseForm.reps"
                id="reps"
                type="number"
                min="1"
                max="100"
                class="form-input w-full rounded-md border-gray-300"
                required
              />
            </div>
            
            <div>
              <label for="weight" class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input 
                v-model.number="exerciseForm.weight"
                id="weight"
                type="number"
                min="0"
                step="0.5"
                class="form-input w-full rounded-md border-gray-300"
                required
              />
            </div>
          </div>
          
          <div class="mb-6">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea 
              v-model="exerciseForm.notes"
              id="notes"
              rows="2"
              class="form-textarea w-full rounded-md border-gray-300"
              placeholder="Any additional information..."
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showAddExerciseModal = false"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn"
              :disabled="addingExercise"
            >
              <span v-if="addingExercise" class="mr-2">
                <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </span>
              {{ addingExercise ? 'Adding...' : 'Add Exercise' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Edit Exercise Modal -->
    <div v-if="showEditModal && exerciseToEdit" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-xl w-full p-6">
        <h3 class="text-lg font-medium mb-4">Edit Exercise</h3>
        
        <form @submit.prevent="updateExercise">
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="edit-sets" class="block text-sm font-medium text-gray-700 mb-1">Sets</label>
              <input 
                v-model.number="editForm.sets"
                id="edit-sets"
                type="number"
                min="1"
                max="20"
                class="form-input w-full rounded-md border-gray-300"
                required
              />
            </div>
            
            <div>
              <label for="edit-reps" class="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input 
                v-model.number="editForm.reps"
                id="edit-reps"
                type="number"
                min="1"
                max="100"
                class="form-input w-full rounded-md border-gray-300"
                required
              />
            </div>
            
            <div>
              <label for="edit-weight" class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input 
                v-model.number="editForm.weight"
                id="edit-weight"
                type="number"
                min="0"
                step="0.5"
                class="form-input w-full rounded-md border-gray-300"
                required
              />
            </div>
          </div>
          
          <div class="mb-6">
            <label for="edit-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea 
              v-model="editForm.notes"
              id="edit-notes"
              rows="2"
              class="form-textarea w-full rounded-md border-gray-300"
              placeholder="Any additional information..."
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
              {{ updating ? 'Updating...' : 'Update Exercise' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-3">Delete Exercise</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to delete this exercise from your workout? This action cannot be undone.
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
            @click="deleteExercise" 
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
            :disabled="deleting"
          >
            <span v-if="deleting" class="mr-2">
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useWorkoutsStore } from '~/stores/workouts';
import { useRoute } from 'vue-router';
import { useSafeArray } from '~/composables/useSafeArray';
import type { WorkoutLog, ExerciseLog, Exercise } from '~/types/models';

// Page middleware
definePageMeta({
  middleware: 'auth'
});

// Stores and route
const route = useRoute();
const workoutsStore = useWorkoutsStore();

// Initialize the store
workoutsStore.init();

// Get workout ID from route
const workoutId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id) : null;
});

// State
const loading = ref(true);
const addingExercise = ref(false);
const updating = ref(false);
const deleting = ref(false);

// Modals
const showAddExerciseModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const exerciseToEdit = ref<ExerciseLog | null>(null);
const exerciseToDelete = ref<ExerciseLog | null>(null);

// Form for adding new exercise
const exerciseForm = reactive({
  exercise_id: '',
  sets: 3,
  reps: 10,
  weight: 0,
  notes: ''
});

// Form for editing exercise
const editForm = reactive({
  sets: 0,
  reps: 0,
  weight: 0,
  notes: ''
});

// Safe array handling
const { safeArray: exerciseList } = useSafeArray(computed(() => workoutsStore.exercises));

// Computed properties
const workout = computed<WorkoutLog | null>(() => {
  if (!workoutId.value) return null;
  return workoutsStore.getWorkoutById(workoutId.value);
});

const exercises = computed<Exercise[]>(() => {
  return exerciseList.value;
});

const exerciseLogs = computed<ExerciseLog[]>(() => {
  if (!workout.value || !workout.value.exercise_logs) return [];
  return [...workout.value.exercise_logs].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});

const workoutDate = computed(() => {
  if (!workout.value) return '';
  return formatDate(workout.value.date);
});

const hasExercises = computed(() => {
  return exerciseLogs.value.length > 0;
});

const exerciseCount = computed(() => {
  return exerciseLogs.value.length;
});

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getExerciseName = (exerciseLog: ExerciseLog) => {
  if (exerciseLog.exercise_name) return exerciseLog.exercise_name;
  
  const exercise = workoutsStore.getExerciseById(exerciseLog.exercise);
  return exercise ? exercise.name : `Exercise #${exerciseLog.exercise}`;
};

// Add exercise to workout
const addExercise = async () => {
  if (!workoutId.value) return;
  
  addingExercise.value = true;
  
  try {
    await workoutsStore.addExerciseLog(workoutId.value, {
      exercise: parseInt(exerciseForm.exercise_id as string),
      sets: exerciseForm.sets,
      reps: exerciseForm.reps,
      weight: exerciseForm.weight,
      notes: exerciseForm.notes || null
    });
    
    // Reset form and close modal
    exerciseForm.exercise_id = '';
    exerciseForm.sets = 3;
    exerciseForm.reps = 10;
    exerciseForm.weight = 0;
    exerciseForm.notes = '';
    showAddExerciseModal.value = false;
    
  } catch (error) {
    console.error('Error adding exercise:', error);
  } finally {
    addingExercise.value = false;
  }
};

// Edit exercise log
const editExerciseLog = (log: ExerciseLog) => {
  exerciseToEdit.value = log;
  editForm.sets = log.sets;
  editForm.reps = log.reps;
  editForm.weight = log.weight;
  editForm.notes = log.notes || '';
  showEditModal.value = true;
};

// Update exercise log
const updateExercise = async () => {
  if (!exerciseToEdit.value) return;
  
  updating.value = true;
  
  try {
    await workoutsStore.updateExerciseLog(exerciseToEdit.value.id, {
      sets: editForm.sets,
      reps: editForm.reps,
      weight: editForm.weight,
      notes: editForm.notes || null
    });
    
    showEditModal.value = false;
    exerciseToEdit.value = null;
    
  } catch (error) {
    console.error('Error updating exercise:', error);
  } finally {
    updating.value = false;
  }
};

// Confirm delete
const confirmDeleteExerciseLog = (log: ExerciseLog) => {
  exerciseToDelete.value = log;
  showDeleteModal.value = true;
};

// Delete exercise log
const deleteExercise = async () => {
  if (!exerciseToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await workoutsStore.deleteExerciseLog(exerciseToDelete.value.id);
    showDeleteModal.value = false;
    exerciseToDelete.value = null;
    
  } catch (error) {
    console.error('Error deleting exercise:', error);
  } finally {
    deleting.value = false;
  }
};

// Fetch data on component mount
onMounted(async () => {
  loading.value = true;
  
  try {
    if (workoutId.value) {
      // Load workout details and exercises in parallel
      await Promise.all([
        workoutsStore.fetchWorkout(workoutId.value),
        workoutsStore.fetchExercises()
      ]);
    }
  } catch (error) {
    console.error('Error loading workout details:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-200;
}
</style>