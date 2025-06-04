<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6" style="color: var(--color-text)">Exercise Library</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else>
      <!-- Exercise Categories -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="card hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          <NuxtLink :to="`/exercises/categories/${category.id}`" class="block">
            <div class="h-40 bg-gray-200 relative overflow-hidden">
              <img 
                :src="category.image" 
                :alt="category.name" 
                class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <h3 class="text-white text-xl font-semibold p-4">{{ category.name }}</h3>
              </div>
            </div>
            <div class="p-4">
              <p class="text-sm mb-2" style="color: var(--color-text-secondary)">{{ category.description }}</p>
              <div class="flex justify-between items-center">
                <span class="text-sm" style="color: var(--color-text-secondary)">{{ category.exerciseCount }} exercises</span>
                <span class="text-sm font-medium" style="color: var(--color-primary)">View All →</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
      
      <!-- Featured Exercises -->
      <h2 class="text-xl font-semibold mb-4" style="color: var(--color-text)">Featured Home Workouts</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ExerciseCard 
          v-for="exercise in featuredExercises" 
          :key="exercise.id" 
          :exercise="exercise"
        />
      </div>
      
      <!-- Search Box -->
      <div class="mt-6 mb-10">
        <h2 class="text-xl font-semibold mb-4" style="color: var(--color-text)">Search Exercises</h2>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by name, muscle group, or equipment..." 
              class="form-input"
              @keyup.enter="searchExercises"
            />
          </div>
          <button 
            @click="searchExercises" 
            class="btn"
          >
            Search
          </button>
        </div>
        
        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="mt-4">
          <h3 class="text-lg font-medium mb-2" style="color: var(--color-text)">Search Results</h3>
          <div class="card overflow-hidden">
            <div class="grid grid-cols-1 divide-y" style="border-color: var(--color-border)">
              <div 
                v-for="exercise in searchResults" 
                :key="exercise.id" 
                class="p-4 transition-colors duration-200"
                @mouseover="$event.target.style.backgroundColor = 'var(--color-background)'" 
                @mouseleave="$event.target.style.backgroundColor = 'transparent'"
              >
                <NuxtLink :to="`/exercises/${exercise.id}`" class="block">
                  <div class="flex items-center">
                    <div class="h-12 w-12 rounded-md overflow-hidden mr-4" style="background-color: var(--color-surface)">
                      <img 
                        :src="getExerciseImage(exercise)" 
                        :alt="exercise.name" 
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div class="flex-1">
                      <h4 class="font-medium" style="color: var(--color-text)">{{ exercise.name }}</h4>
                      <div class="flex items-center text-sm" style="color: var(--color-text-secondary)">
                        <span>{{ exercise.muscles_targeted }}</span>
                        <span class="mx-2">•</span>
                        <span>{{ getEquipmentLabel(exercise.equipment_type) }}</span>
                      </div>
                    </div>
                    <div style="color: var(--color-text-secondary)">
                      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useWorkoutsStore } from '~/stores/workouts';
import type { Exercise } from '~/types/models';
import ExerciseCard from '~/components/ExerciseCard.vue';

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Store
const workoutsStore = useWorkoutsStore();

// Data
const loading = ref(true);
const searchQuery = ref('');
const searchResults = ref<Exercise[]>([]);

// Exercise categories
const categories = ref([
  {
    id: 'bodyweight',
    name: 'Bodyweight Exercises',
    description: 'No equipment needed, just your body weight',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    exerciseCount: 0
  },
  {
    id: 'dumbbell',
    name: 'Dumbbell Workouts',
    description: 'Exercises using dumbbells for resistance',
    image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    exerciseCount: 0
  },
  {
    id: 'resistance-band',
    name: 'Resistance Band',
    description: 'Workouts using resistance bands',
    image: 'https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    exerciseCount: 0
  },
  {
    id: 'cardio',
    name: 'Cardio',
    description: 'Heart-pumping exercises to burn calories',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    exerciseCount: 0
  },
  {
    id: 'stretching',
    name: 'Stretching & Mobility',
    description: 'Improve flexibility and joint mobility',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    exerciseCount: 0
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell Exercises',
    description: 'Dynamic workouts with kettlebells',
    image: 'https://images.unsplash.com/photo-1604247584233-99c80a9e9fd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    exerciseCount: 0
  }
]);

// Featured exercises (will be replaced with API data)
const featuredExercises = computed(() => {
  if (!workoutsStore.exercises.length) return [];
  // Get up to 8 exercises for the featured section
  return workoutsStore.exercises.slice(0, 8);
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

const getExerciseImage = (exercise: Exercise) => {
  // Default image based on muscle group
  const muscleGroup = exercise.muscles_targeted.toLowerCase();
  
  if (muscleGroup.includes('chest')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('back')) {
    return 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('leg')) {
    return 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  }
  
  // Default image
  return 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
};

const searchExercises = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  const query = searchQuery.value.toLowerCase();
  searchResults.value = workoutsStore.exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(query) ||
    exercise.muscles_targeted.toLowerCase().includes(query) ||
    getEquipmentLabel(exercise.equipment_type).toLowerCase().includes(query) ||
    (exercise.description && exercise.description.toLowerCase().includes(query))
  );
};

// Update category exercise counts
const updateCategoryCounts = () => {
  const exercises = workoutsStore.exercises;
  
  // Count bodyweight exercises
  categories.value[0].exerciseCount = exercises.filter(e => e.equipment_type === 'BW').length;
  
  // Count dumbbell exercises
  categories.value[1].exerciseCount = exercises.filter(e => e.equipment_type === 'DB').length;
  
  // Resistance band would be in "Other" category in our model
  categories.value[2].exerciseCount = exercises.filter(e => 
    e.equipment_type === 'OT' && e.description?.toLowerCase().includes('band')
  ).length;
  
  // Cardio - based on description
  categories.value[3].exerciseCount = exercises.filter(e => 
    e.description?.toLowerCase().includes('cardio') || 
    e.muscles_targeted.toLowerCase().includes('cardio')
  ).length;
  
  // Stretching - based on description
  categories.value[4].exerciseCount = exercises.filter(e => 
    e.description?.toLowerCase().includes('stretch') || 
    e.description?.toLowerCase().includes('mobility')
  ).length;
  
  // Kettlebell exercises
  categories.value[5].exerciseCount = exercises.filter(e => e.equipment_type === 'KB').length;
};

// Lifecycle hooks
onMounted(async () => {
  loading.value = true;
  
  try {
    await workoutsStore.fetchExercises();
    updateCategoryCounts();
  } catch (error) {
    console.error('Error loading exercises:', error);
  } finally {
    loading.value = false;
  }
});
</script>