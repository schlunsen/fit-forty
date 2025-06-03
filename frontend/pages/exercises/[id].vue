<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <template v-else-if="exercise">
      <!-- Back Button -->
      <div class="mb-4">
        <NuxtLink to="/exercises" class="text-primary-600 hover:text-primary-700 font-medium flex items-center">
          <svg class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Back to Exercises
        </NuxtLink>
      </div>
      
      <!-- Exercise Header -->
      <div class="flex flex-col md:flex-row gap-6 mb-8">
        <!-- Image -->
        <div class="md:w-1/3">
          <div class="bg-gray-100 rounded-lg overflow-hidden shadow-md aspect-video">
            <img 
              :src="exercise.image || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" 
              :alt="exercise.name" 
              class="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <!-- Details -->
        <div class="md:w-2/3">
          <h1 class="text-2xl font-bold mb-2">{{ exercise.name }}</h1>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ exercise.muscles_targeted }}
            </span>
            <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ getEquipmentLabel(exercise.equipment_type) }}
            </span>
          </div>
          
          <p class="text-gray-600 mb-6">{{ exercise.description }}</p>
          
          <!-- Instructions -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-3">How to Perform</h2>
            <ol class="list-decimal pl-5 space-y-2">
              <li v-for="(step, index) in exerciseInstructions" :key="index" class="text-gray-700">
                {{ step }}
              </li>
            </ol>
          </div>
          
          <!-- Video Tutorial -->
          <div v-if="exercise.video_url" class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Video Tutorial</h2>
            <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe 
                :src="getEmbedUrl(exercise.video_url)" 
                class="w-full h-full" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Log This Exercise Section -->
      <div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
        <h2 class="text-lg font-semibold mb-4">Log This Exercise</h2>
        
        <form @submit.prevent="logExercise" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="sets" class="block text-sm font-medium text-gray-700 mb-1">Sets</label>
              <input 
                id="sets"
                v-model="logForm.sets"
                type="number" 
                min="1"
                class="input"
                required
              />
            </div>
            <div>
              <label for="reps" class="block text-sm font-medium text-gray-700 mb-1">Reps</label>
              <input 
                id="reps"
                v-model="logForm.reps"
                type="number" 
                min="1"
                class="input"
                required
              />
            </div>
            <div>
              <label for="weight" class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input 
                id="weight"
                v-model="logForm.weight"
                type="number" 
                min="0"
                step="0.5"
                class="input"
                required
              />
            </div>
          </div>
          
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              id="notes"
              v-model="logForm.notes"
              rows="2"
              class="input"
              placeholder="Add any notes about this exercise..."
            ></textarea>
          </div>
          
          <div class="flex justify-end">
            <button 
              type="submit" 
              class="btn"
              :disabled="isLogging"
            >
              <span v-if="isLogging" class="mr-2">
                <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </span>
              {{ isLogging ? 'Adding...' : 'Add to Workout' }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Related Exercises -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Similar Exercises</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="relatedExercise in relatedExercises" 
            :key="relatedExercise.id" 
            class="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <NuxtLink :to="`/exercises/${relatedExercise.id}`" class="block">
              <div class="h-32 bg-gray-100">
                <img 
                  :src="relatedExercise.image || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" 
                  :alt="relatedExercise.name" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="p-3">
                <h3 class="font-medium text-gray-900 mb-1">{{ relatedExercise.name }}</h3>
                <div class="flex items-center text-xs text-gray-500">
                  <span class="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                    {{ relatedExercise.muscles_targeted }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
    
    <div v-else class="text-center py-10">
      <h2 class="text-xl font-semibold text-gray-700">Exercise not found</h2>
      <p class="text-gray-500 mt-2">The exercise you're looking for doesn't exist or has been removed.</p>
      <NuxtLink to="/exercises" class="btn mt-4 inline-block">
        Browse Exercises
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorkoutsStore } from '~/stores/workouts';
import type { Exercise } from '~/types/models';

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Route and stores
const route = useRoute();
const router = useRouter();
const workoutsStore = useWorkoutsStore();

// State
const loading = ref(true);
const isLogging = ref(false);
const logForm = ref({
  sets: 3,
  reps: 10,
  weight: 0,
  notes: ''
});

// Computed
const exerciseId = computed(() => Number(route.params.id));

const exercise = computed(() => {
  if (!exerciseId.value) return null;
  return workoutsStore.getExerciseById(exerciseId.value);
});

// Generate random instructions based on the exercise type
const exerciseInstructions = computed(() => {
  if (!exercise.value) return [];
  
  const instructionSets = {
    bodyweight: [
      "Stand with feet shoulder-width apart, maintaining good posture.",
      "Engage your core muscles throughout the movement.",
      "Perform the movement with controlled tempo.",
      "Focus on proper form rather than speed.",
      "Breathe out during exertion and in during the return phase."
    ],
    dumbbell: [
      "Select an appropriate weight for your fitness level.",
      "Maintain a neutral spine throughout the exercise.",
      "Keep your wrists straight and firm during the movement.",
      "Control the weight during both lifting and lowering phases.",
      "Avoid using momentum to complete the movement."
    ],
    kettlebell: [
      "Start with the kettlebell on the floor in front of you.",
      "Maintain a hip-hinge position with a flat back.",
      "Keep the kettlebell close to your body during the movement.",
      "Use your hips to generate power, not your arms or back.",
      "Control the kettlebell throughout the entire range of motion."
    ]
  };
  
  let instructions;
  if (exercise.value.equipment_type === 'BW') {
    instructions = instructionSets.bodyweight;
  } else if (exercise.value.equipment_type === 'DB') {
    instructions = instructionSets.dumbbell;
  } else if (exercise.value.equipment_type === 'KB') {
    instructions = instructionSets.kettlebell;
  } else {
    // Mix instructions for other equipment types
    instructions = [
      ...instructionSets.bodyweight.slice(0, 2),
      ...instructionSets.dumbbell.slice(0, 3)
    ];
  }
  
  return instructions;
});

const relatedExercises = computed(() => {
  if (!exercise.value) return [];
  
  // Find exercises targeting the same muscle groups
  return workoutsStore.exercises
    .filter(ex => 
      ex.id !== exercise.value?.id && 
      ex.muscles_targeted === exercise.value?.muscles_targeted
    )
    .slice(0, 4);
});

// Methods
const getEquipmentLabel = (code: string) => {
  const equipmentMap: Record<string, string> = {
    'BB': 'Barbell',
    'DB': 'Dumbbell',
    'KB': 'Kettlebell',
    'BW': 'Bodyweight',
    'MC': 'Machine',
    'CB': 'Cable',
    'OT': 'Other'
  };
  return equipmentMap[code] || code;
};

const getEmbedUrl = (url: string) => {
  // Convert YouTube URLs to embed format
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Convert YouTube short URLs
  if (url.includes('youtu.be/')) {
    const videoId = url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // For other URLs, return as is
  return url;
};

const logExercise = async () => {
  if (!exercise.value) return;
  
  isLogging.value = true;
  
  try {
    // First check if there's an active workout
    let workoutId = localStorage.getItem('activeWorkoutId');
    
    if (!workoutId) {
      // Create a new workout
      const newWorkout = await workoutsStore.createWorkout({
        date: new Date().toISOString(),
        notes: 'Created from exercise library',
        exercise_logs_data: []
      });
      
      if (newWorkout) {
        workoutId = String(newWorkout.id);
        localStorage.setItem('activeWorkoutId', workoutId);
      } else {
        throw new Error('Failed to create workout');
      }
    }
    
    // Add exercise log to the workout
    await workoutsStore.addExerciseLog(Number(workoutId), {
      exercise: exercise.value.id,
      sets: logForm.value.sets,
      reps: logForm.value.reps,
      weight: logForm.value.weight,
      notes: logForm.value.notes
    });
    
    // Success notification
    alert('Exercise added to your workout!');
    
    // Reset form
    logForm.value = {
      sets: 3,
      reps: 10,
      weight: 0,
      notes: ''
    };
  } catch (error) {
    console.error('Error logging exercise:', error);
    alert('Failed to add exercise to workout. Please try again.');
  } finally {
    isLogging.value = false;
  }
};

// Lifecycle hooks
onMounted(async () => {
  loading.value = true;
  
  try {
    // Load exercises if not already loaded
    if (workoutsStore.exercises.length === 0) {
      await workoutsStore.fetchExercises();
    }
    
    // If exercise doesn't exist, redirect back to exercises page
    if (exerciseId.value && !exercise.value) {
      router.push('/exercises');
    }
  } catch (error) {
    console.error('Error loading exercise:', error);
  } finally {
    loading.value = false;
  }
});
</script>