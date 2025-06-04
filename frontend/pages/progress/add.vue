<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Upload Progress Photo</h1>
    
    <div class="card max-w-2xl mx-auto">
      <form @submit.prevent="submitForm">
        <!-- Photo Upload -->
        <div class="mb-6">
          <label for="photo" class="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          
          <div 
            v-if="!previewImage"
            class="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary-500 transition-colors duration-200 cursor-pointer"
            @click="$refs.fileInput.click()"
            :class="{ 'border-red-300': fileError }"
          >
            <input 
              ref="fileInput"
              type="file"
              id="photo"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
              :disabled="loading"
            />
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm mb-1">Click to upload your progress photo</p>
              <p class="text-xs text-gray-400">JPG, PNG, GIF up to 5MB</p>
            </div>
          </div>
          
          <div 
            v-else
            class="relative overflow-hidden rounded-md"
          >
            <img :src="previewImage" alt="Preview" class="w-full h-64 object-cover" />
            <button 
              type="button"
              @click="clearImage"
              class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
              :disabled="loading"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p v-if="fileError" class="mt-1 text-sm text-red-600">{{ fileError }}</p>
        </div>
        
        <!-- Date & Time -->
        <div class="mb-4">
          <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
          <input 
            v-model="form.timestamp"
            id="date"
            type="datetime-local"
            class="form-input w-full rounded-md border-gray-300"
            required
            :disabled="loading"
          />
        </div>
        
        <!-- Body Part Tags -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Body Part Tags</label>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="tag in bodyPartOptions" :key="tag.value" class="flex items-center">
              <input 
                type="checkbox"
                :id="'tag-' + tag.value"
                v-model="form.bodyPartTags"
                :value="tag.value"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                :disabled="loading"
              />
              <label :for="'tag-' + tag.value" class="ml-2 block text-sm text-gray-700">
                {{ tag.label }}
              </label>
            </div>
          </div>
          <p v-if="bodyPartTagsError" class="mt-1 text-sm text-red-600">{{ bodyPartTagsError }}</p>
        </div>
        
        <!-- Notes Input -->
        <div class="mb-6">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea 
            v-model="form.notes"
            id="notes"
            rows="3"
            class="form-textarea w-full rounded-md border-gray-300"
            placeholder="Any additional information about this photo..."
            :disabled="loading"
          ></textarea>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <!-- Form Buttons -->
        <div class="flex items-center justify-between">
          <NuxtLink to="/progress" class="btn-secondary">
            Cancel
          </NuxtLink>
          
          <button 
            type="submit" 
            class="btn flex items-center"
            :disabled="loading || !imageFile"
          >
            <span v-if="loading" class="mr-2">
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            {{ loading ? 'Uploading...' : 'Upload Photo' }}
          </button>
        </div>
      </form>
    </div>
    
    <div class="mt-8 bg-blue-50 p-4 rounded-md text-blue-800 max-w-2xl mx-auto">
      <h3 class="font-medium mb-2">Tips for Progress Photos</h3>
      <ul class="list-disc ml-5 space-y-1">
        <li>Use the same lighting, background, and pose for each photo</li>
        <li>Take photos from multiple angles (front, side, back)</li>
        <li>Wear the same or similar clothing each time</li>
        <li>Take photos at regular intervals (weekly or monthly)</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useHealthStore } from '~/stores/health';
import type { BodyPartTag } from '~/types/models';

// Page middleware
definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

// Store
const healthStore = useHealthStore();

// Initialize health store
healthStore.init();

// Current date and time in ISO format
const now = new Date();
const localISOString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// Body part tag options
const bodyPartOptions = [
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'back', label: 'Back' },
  { value: 'stomach', label: 'Stomach' },
  { value: 'legs', label: 'Legs' },
  { value: 'full_body', label: 'Full Body' }
];

// Form state
const form = reactive({
  timestamp: localISOString, // Current date/time as default
  notes: '',
  bodyPartTags: [] as BodyPartTag[]
});

// File handling
const fileInput = ref(null);
const imageFile = ref(null);
const previewImage = ref(null);
const fileError = ref(null);
const bodyPartTagsError = ref(null);

// Computed properties
const loading = computed(() => healthStore.loading);
const error = computed(() => healthStore.error);

// Methods
const handleFileChange = (e) => {
  fileError.value = null;
  const file = e.target.files[0];
  
  if (!file) {
    return;
  }
  
  // Validate file type
  if (!file.type.match('image.*')) {
    fileError.value = 'Please select an image file (JPEG, PNG, etc.)';
    return;
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    fileError.value = 'File size must be less than 5MB';
    return;
  }
  
  imageFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  imageFile.value = null;
  previewImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const submitForm = async () => {
  // Reset error messages
  fileError.value = null;
  bodyPartTagsError.value = null;
  
  // Validate image
  if (!imageFile.value) {
    fileError.value = 'Please select an image to upload';
    return;
  }
  
  // Validate body part tags
  if (form.bodyPartTags.length === 0) {
    bodyPartTagsError.value = 'Please select at least one body part tag';
    return;
  }
  
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('image', imageFile.value);
    formData.append('timestamp', new Date(form.timestamp).toISOString());
    
    // Add notes if provided
    if (form.notes) {
      formData.append('notes', form.notes);
    }
    
    // Add body part tags as JSON string
    formData.append('body_part_tags', JSON.stringify(form.bodyPartTags));
    
    // Submit to API
    const result = await healthStore.addProgressPhoto(formData);
    
    if (result) {
      // Navigate back to progress photos page
      navigateTo('/progress');
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-200;
}
</style>