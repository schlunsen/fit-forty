<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Back Button -->
    <div class="mb-4">
      <NuxtLink to="/exercises" class="text-primary-600 hover:text-primary-700 font-medium flex items-center">
        <svg class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Back to Exercise Library
      </NuxtLink>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else>
      <!-- Category Header -->
      <div class="relative rounded-xl overflow-hidden mb-8">
        <div class="h-48 md:h-64 w-full">
          <img 
            :src="categoryInfo.image" 
            :alt="categoryInfo.name" 
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div class="absolute bottom-0 left-0 p-6 text-white">
          <h1 class="text-3xl font-bold mb-2">{{ categoryInfo.name }}</h1>
          <p class="text-white/90 max-w-2xl">{{ categoryInfo.description }}</p>
        </div>
      </div>
      
      <!-- Filter Options -->
      <div class="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-shrink-0">
            <span class="font-medium text-gray-700">Filter:</span>
          </div>
          
          <div class="flex-1">
            <div class="flex flex-wrap gap-2">
              <button 
                @click="currentFilter = ''"
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  currentFilter === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                All
              </button>
              
              <button 
                v-for="muscle in muscleGroups" 
                :key="muscle"
                @click="currentFilter = muscle"
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  currentFilter === muscle 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ muscle }}
              </button>
            </div>
          </div>
          
          <!-- Sort Options -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort:</span>
            <select 
              v-model="sortOption" 
              class="form-select py-1 px-2 border border-gray-300 rounded text-sm"
            >
              <option value="name">Name</option>
              <option value="muscle">Muscle Group</option>
              <option value="difficulty">Difficulty</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Exercise List -->
      <div v-if="filteredExercises.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="exercise in filteredExercises" 
            :key="exercise.id" 
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <NuxtLink :to="`/exercises/${exercise.id}`" class="block">
              <div class="h-48 bg-gray-100 relative">
                <img 
                  :src="exercise.image || 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" 
                  :alt="exercise.name" 
                  class="w-full h-full object-cover"
                />
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 class="text-white font-semibold text-lg">{{ exercise.name }}</h3>
                </div>
                
                <!-- Difficulty Badge -->
                <div class="absolute top-3 right-3 bg-white/90 text-gray-800 rounded-full px-2 py-1 text-xs font-medium">
                  {{ getDifficultyLabel(exercise) }}
                </div>
              </div>
              
              <div class="p-4">
                <div class="flex items-center mb-2">
                  <span class="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
                    {{ exercise.muscles_targeted }}
                  </span>
                  <span class="mx-2 text-gray-300">•</span>
                  <span class="text-gray-600 text-sm">{{ getEquipmentLabel(exercise.equipment_type) }}</span>
                </div>
                
                <p class="text-gray-600 text-sm line-clamp-2 mb-3">{{ exercise.description }}</p>
                
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500">
                    {{ getSetRepRecommendation(exercise) }}
                  </span>
                  <span class="text-primary-600 text-sm font-medium">View Details →</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No exercises found</h3>
        <p class="mt-1 text-sm text-gray-500">
          Try changing your filter options or check back later.
        </p>
        <div class="mt-6">
          <button 
            @click="currentFilter = ''" 
            class="btn"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useWorkoutsStore } from '~/stores/workouts';
import type { Exercise } from '~/types/models';

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Route and stores
const route = useRoute();
const workoutsStore = useWorkoutsStore();

// State
const loading = ref(true);
const currentFilter = ref('');
const sortOption = ref('name');

// Category definitions
const categories = [
  {
    id: 'bodyweight',
    name: 'Bodyweight Exercises',
    description: 'Effective workouts that use your body weight as resistance. Perfect for home workouts with no equipment needed.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    equipmentType: 'BW'
  },
  {
    id: 'dumbbell',
    name: 'Dumbbell Workouts',
    description: 'Build strength and muscle with these dumbbell exercises you can do at home with minimal equipment.',
    image: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    equipmentType: 'DB'
  },
  {
    id: 'resistance-band',
    name: 'Resistance Band Workouts',
    description: 'Versatile and effective exercises using resistance bands to build strength and improve mobility.',
    image: 'https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    equipmentType: 'OT',
    filter: (exercise: Exercise) => 
      exercise.equipment_type === 'OT' && 
      (exercise.description?.toLowerCase().includes('band') || 
       exercise.name.toLowerCase().includes('band'))
  },
  {
    id: 'cardio',
    name: 'Cardio Workouts',
    description: 'Heart-pumping exercises to improve cardiovascular health, burn calories, and boost your endurance.',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    filter: (exercise: Exercise) => 
      exercise.description?.toLowerCase().includes('cardio') || 
      exercise.muscles_targeted.toLowerCase().includes('cardio') ||
      exercise.name.toLowerCase().includes('cardio') ||
      exercise.name.toLowerCase().includes('jumping') ||
      exercise.name.toLowerCase().includes('run')
  },
  {
    id: 'stretching',
    name: 'Stretching & Mobility',
    description: 'Improve flexibility, joint mobility, and recovery with these stretching and mobility exercises.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    filter: (exercise: Exercise) => 
      exercise.description?.toLowerCase().includes('stretch') || 
      exercise.description?.toLowerCase().includes('mobility') ||
      exercise.name.toLowerCase().includes('stretch') ||
      exercise.name.toLowerCase().includes('mobility')
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell Exercises',
    description: 'Dynamic, full-body workouts using kettlebells to build strength, power, and endurance.',
    image: 'https://images.unsplash.com/photo-1604247584233-99c80a9e9fd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    equipmentType: 'KB'
  }
];

// Computed
const categoryId = computed(() => route.params.id as string);

const categoryInfo = computed(() => {
  const category = categories.find(c => c.id === categoryId.value);
  if (!category) {
    // Default category if not found
    return {
      name: 'Exercise Category',
      description: 'Browse exercises in this category',
      image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
    };
  }
  return category;
});

const categoryExercises = computed(() => {
  const category = categories.find(c => c.id === categoryId.value);
  if (!category) return [];
  
  if (category.equipmentType) {
    return workoutsStore.exercises.filter(exercise => 
      exercise.equipment_type === category.equipmentType
    );
  } else if (category.filter) {
    return workoutsStore.exercises.filter(category.filter);
  }
  
  return [];
});

const muscleGroups = computed(() => {
  const muscles = new Set<string>();
  categoryExercises.value.forEach(exercise => {
    if (exercise.muscles_targeted) {
      muscles.add(exercise.muscles_targeted);
    }
  });
  return Array.from(muscles);
});

const filteredExercises = computed(() => {
  // Apply muscle group filter
  let filtered = currentFilter.value
    ? categoryExercises.value.filter(ex => ex.muscles_targeted === currentFilter.value)
    : categoryExercises.value;
  
  // Apply sorting
  return [...filtered].sort((a, b) => {
    if (sortOption.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption.value === 'muscle') {
      return a.muscles_targeted.localeCompare(b.muscles_targeted);
    } else if (sortOption.value === 'difficulty') {
      return getDifficultyValue(a) - getDifficultyValue(b);
    }
    return 0;
  });
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

// Determine difficulty based on exercise properties
const getDifficultyValue = (exercise: Exercise): number => {
  const name = exercise.name.toLowerCase();
  const description = exercise.description?.toLowerCase() || '';
  
  // Check for explicit difficulty mentions
  if (name.includes('advanced') || description.includes('advanced')) {
    return 3;
  } else if (name.includes('intermediate') || description.includes('intermediate')) {
    return 2;
  } else if (name.includes('beginner') || description.includes('beginner')) {
    return 1;
  }
  
  // Assign difficulty based on exercise complexity
  if (name.includes('plank') || name.includes('pushup') || name.includes('squat')) {
    return 1;
  } else if (name.includes('jump') || name.includes('lunge') || name.includes('burpee')) {
    return 2;
  } else if (name.includes('pistol') || name.includes('muscle up') || name.includes('handstand')) {
    return 3;
  }
  
  // Default to intermediate
  return 2;
};

const getDifficultyLabel = (exercise: Exercise): string => {
  const difficulty = getDifficultyValue(exercise);
  return ['Beginner', 'Intermediate', 'Advanced'][difficulty - 1];
};

// Get recommendation for sets and reps
const getSetRepRecommendation = (exercise: Exercise): string => {
  const difficulty = getDifficultyValue(exercise);
  
  if (exercise.equipment_type === 'BW') {
    // Bodyweight recommendations
    if (difficulty === 1) return '3 sets × 10-12 reps';
    if (difficulty === 2) return '3 sets × 8-10 reps';
    return '4 sets × 6-8 reps';
  } else if (exercise.equipment_type === 'DB' || exercise.equipment_type === 'KB') {
    // Dumbbell/Kettlebell recommendations
    if (difficulty === 1) return '3 sets × 12-15 reps';
    if (difficulty === 2) return '4 sets × 8-12 reps';
    return '5 sets × 5-8 reps';
  }
  
  // Default recommendation
  return '3 sets × 10 reps';
};

// Lifecycle hooks
onMounted(async () => {
  loading.value = true;
  
  try {
    // Load exercises if not already loaded
    if (workoutsStore.exercises.length === 0) {
      await workoutsStore.fetchExercises();
    }
  } catch (error) {
    console.error('Error loading exercises:', error);
  } finally {
    loading.value = false;
  }
});
</script>