<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold">Progress Photos</h1>
      
      <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <!-- Filter Tags -->
        <div class="flex flex-wrap gap-2 flex-grow">
          <button 
            @click="selectedTag = null" 
            class="tag-filter"
            :class="{ 'tag-filter-active': selectedTag === null }"
          >
            All
          </button>
          
          <button 
            v-for="tag in bodyPartOptions" 
            :key="tag.value"
            @click="selectedTag = tag.value"
            class="tag-filter"
            :class="{ 'tag-filter-active': selectedTag === tag.value }"
          >
            {{ tag.label }}
          </button>
        </div>
        
        <NuxtLink to="/progress/add" class="btn whitespace-nowrap">
          Upload New Photo
        </NuxtLink>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="photos.length === 0" class="card p-8 text-center">
      <div class="text-gray-400 mb-4">
        <svg class="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 16L8.586 11.414C8.96106 11.0389 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0389 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0389 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0389 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No progress photos yet</h3>
      <p class="text-gray-600 mb-4">Upload photos to track your physical progress over time.</p>
      <NuxtLink to="/progress/add" class="btn">
        Upload Your First Photo
      </NuxtLink>
    </div>
    
    <!-- Photos Grid -->
    <div v-else>
      <!-- Group photos by month -->
      <div v-for="(monthGroup, month) in groupedPhotos" :key="month" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">{{ month }}</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="photo in monthGroup" 
            :key="photo.id" 
            class="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
          >
            <!-- Photo -->
            <img 
              :src="photo.image_url" 
              :alt="formatDate(photo.timestamp)" 
              class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            
            <!-- Tags Badge (Top right) -->
            <div class="absolute top-2 right-2 z-10">
              <span class="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {{ getBodyPartLabel(photo.body_part_tags?.[0]) }}
              </span>
            </div>
            
            <!-- Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p class="text-white font-medium">{{ formatDate(photo.timestamp) }}</p>
              
              <!-- Tags -->
              <div class="flex flex-wrap gap-1 mt-1 mb-1">
                <span 
                  v-for="tag in photo.body_part_tags" 
                  :key="tag" 
                  class="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-sm"
                >
                  {{ getBodyPartLabel(tag) }}
                </span>
              </div>
              
              <p v-if="photo.notes" class="text-white/80 text-xs line-clamp-2 mt-1">{{ photo.notes }}</p>
              
              <!-- Actions -->
              <div class="flex space-x-2 mt-2">
                <button 
                  @click.prevent="viewPhoto(photo)" 
                  class="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs"
                >
                  View
                </button>
                <button 
                  @click.prevent="confirmDelete(photo)" 
                  class="bg-red-500/70 hover:bg-red-500/90 text-white px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Photo Modal -->
    <div v-if="selectedPhoto" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div class="relative bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="font-medium">{{ formatDate(selectedPhoto.timestamp) }}</h3>
          <button @click="selectedPhoto = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4">
            <img :src="selectedPhoto.image_url" :alt="formatDate(selectedPhoto.timestamp)" class="max-h-[60vh] mx-auto" />
            
            <!-- Tags -->
            <div class="mt-4">
              <h4 class="font-medium mb-1">Body Parts</h4>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="tag in selectedPhoto.body_part_tags" 
                  :key="tag" 
                  class="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-md"
                >
                  {{ getBodyPartLabel(tag) }}
                </span>
              </div>
            </div>
            
            <!-- Notes -->
            <div v-if="selectedPhoto.notes" class="mt-4">
              <h4 class="font-medium mb-1">Notes</h4>
              <p class="text-gray-600">{{ selectedPhoto.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="photoToDelete" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-3">Delete Photo</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to delete this photo from {{ formatDate(photoToDelete.timestamp) }}? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="photoToDelete = null" 
            class="btn-secondary"
            :disabled="deletingPhoto"
          >
            Cancel
          </button>
          <button 
            @click="deletePhoto" 
            class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
            :disabled="deletingPhoto"
          >
            <span v-if="deletingPhoto" class="mr-2">
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            {{ deletingPhoto ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHealthStore } from '~/stores/health';
import type { ProgressPhoto, BodyPartTag } from '~/types/models';

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Store instance
const healthStore = useHealthStore();

// Body part tag options
const bodyPartOptions = [
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'back', label: 'Back' },
  { value: 'stomach', label: 'Stomach' },
  { value: 'legs', label: 'Legs' },
  { value: 'full_body', label: 'Full Body' }
];

// Local state
const selectedPhoto = ref<ProgressPhoto | null>(null);
const photoToDelete = ref<ProgressPhoto | null>(null);
const deletingPhoto = ref(false);
const selectedTag = ref<BodyPartTag | null>(null);

// Computed properties
const loading = computed(() => healthStore.loading);
const allPhotos = computed(() => healthStore.sortedProgressPhotos);

// Filtered photos based on selected tag
const photos = computed(() => {
  if (!selectedTag.value) {
    return allPhotos.value;
  }
  
  return allPhotos.value.filter(photo => 
    photo.body_part_tags && photo.body_part_tags.includes(selectedTag.value as BodyPartTag)
  );
});

// Group photos by month
const groupedPhotos = computed(() => {
  const groups: Record<string, ProgressPhoto[]> = {};
  
  photos.value.forEach(photo => {
    const date = new Date(photo.timestamp);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(photo);
  });
  
  return groups;
});

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const getBodyPartLabel = (tagValue: BodyPartTag | undefined): string => {
  if (!tagValue) return 'Unknown';
  
  const option = bodyPartOptions.find(opt => opt.value === tagValue);
  return option ? option.label : 'Unknown';
};

const viewPhoto = (photo: ProgressPhoto) => {
  selectedPhoto.value = photo;
};

const confirmDelete = (photo: ProgressPhoto) => {
  photoToDelete.value = photo;
};

const deletePhoto = async () => {
  if (!photoToDelete.value) return;
  
  deletingPhoto.value = true;
  
  try {
    await healthStore.deleteProgressPhoto(photoToDelete.value.id);
    photoToDelete.value = null;
  } catch (error) {
    console.error('Error deleting photo:', error);
  } finally {
    deletingPhoto.value = false;
  }
};

// Load photos on component mount
onMounted(() => {
  healthStore.fetchProgressPhotos();
});
</script>

<style scoped>
.tag-filter {
  @apply px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors;
}

.tag-filter-active {
  @apply bg-primary-50 border-primary-300 text-primary-700 font-medium;
}
</style>