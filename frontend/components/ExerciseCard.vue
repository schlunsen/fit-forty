<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
    <NuxtLink :to="`/exercises/${exercise.id}`" class="block">
      <div class="h-48 bg-gray-100 relative">
        <img 
          :src="exerciseImage" 
          :alt="exercise.name" 
          class="w-full h-full object-cover"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 class="text-white font-semibold text-lg">{{ exercise.name }}</h3>
        </div>
        
        <!-- Equipment Badge -->
        <div class="absolute top-3 right-3 bg-white/90 text-gray-800 rounded-full px-2 py-1 text-xs font-medium">
          {{ getEquipmentLabel(exercise.equipment_type) }}
        </div>
      </div>
      
      <div class="p-4">
        <div class="flex items-center mb-2">
          <span class="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium">
            {{ exercise.muscles_targeted }}
          </span>
        </div>
        
        <p class="text-gray-600 text-sm line-clamp-2 mb-3">{{ exercise.description }}</p>
        
        <div class="flex justify-between items-center">
          <div class="flex items-center text-xs text-gray-500">
            <span v-if="showDifficulty" class="mr-2">
              {{ getDifficultyLabel() }}
            </span>
          </div>
          <span class="text-primary-600 text-sm font-medium">View Details →</span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Exercise } from '~/types/models';

// Props
const props = defineProps<{
  exercise: Exercise;
  showDifficulty?: boolean;
}>();

// Equipment mapping
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

// Default image based on exercise type
const exerciseImage = computed(() => {
  // Use placeholder images for now
  // In a real app, you would use exercise.image if available
  const muscleGroup = props.exercise.muscles_targeted.toLowerCase();
  
  if (muscleGroup.includes('chest')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('back')) {
    return 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('leg')) {
    return 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('shoulder')) {
    return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('arm')) {
    return 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('core')) {
    return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  } else if (muscleGroup.includes('cardio')) {
    return 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  }
  
  // Default image
  return 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
});

// Get difficulty label based on exercise properties
const getDifficultyLabel = () => {
  const name = props.exercise.name.toLowerCase();
  const description = props.exercise.description?.toLowerCase() || '';
  
  // Check for explicit difficulty mentions
  if (name.includes('advanced') || description.includes('advanced')) {
    return 'Advanced';
  } else if (name.includes('intermediate') || description.includes('intermediate')) {
    return 'Intermediate';
  } else if (name.includes('beginner') || description.includes('beginner')) {
    return 'Beginner';
  }
  
  // Assign difficulty based on exercise complexity
  if (name.includes('plank') || name.includes('basic') || 
      name.includes('simple') || name.includes('beginner')) {
    return 'Beginner';
  } else if (name.includes('jump') || name.includes('turkish') || 
             name.includes('complex')) {
    return 'Advanced';
  }
  
  // Default to intermediate
  return 'Intermediate';
};
</script>