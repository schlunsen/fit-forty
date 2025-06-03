<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Add Weight Entry</h1>
    
    <div class="card max-w-xl mx-auto">
      <form @submit.prevent="submitForm">
        <!-- Weight Input -->
        <div class="mb-4">
          <label for="weight" class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input 
            v-model.number="form.weight_kg"
            id="weight"
            type="number"
            step="0.1"
            min="30"
            max="300"
            class="form-input w-full rounded-md border-gray-300"
            required
            :disabled="loading"
          />
        </div>
        
        <!-- Date/Time Input -->
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
        
        <!-- Notes Input -->
        <div class="mb-6">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea 
            v-model="form.notes"
            id="notes"
            rows="3"
            class="form-textarea w-full rounded-md border-gray-300"
            placeholder="Any additional information..."
            :disabled="loading"
          ></textarea>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <!-- Form Buttons -->
        <div class="flex items-center justify-between">
          <NuxtLink to="/health" class="btn-secondary">
            Cancel
          </NuxtLink>
          
          <button 
            type="submit" 
            class="btn flex items-center"
            :disabled="loading"
          >
            <span v-if="loading" class="mr-2">
              <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </span>
            {{ loading ? 'Saving...' : 'Save Entry' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useHealthStore } from '~/stores/health';

// Page middleware
definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

// Store
const healthStore = useHealthStore();

// Current date and time in ISO format
const now = new Date();
const localISOString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// Form state
const form = reactive({
  weight_kg: null as number | null,
  timestamp: localISOString, // Current date/time as default
  notes: '',
});

// Form submission state
const loading = computed(() => healthStore.loading);
const error = computed(() => healthStore.error);
const submitted = ref(false);

// Methods
const submitForm = async () => {
  if (!form.weight_kg) {
    return;
  }
  
  try {
    // Submit form data to store
    const result = await healthStore.addWeightEntry({
      weight_kg: form.weight_kg,
      timestamp: new Date(form.timestamp).toISOString(),
      notes: form.notes || null,
    });
    
    // Handle success
    if (result) {
      submitted.value = true;
      // Navigate back to health page
      navigateTo('/health');
    }
  } catch (err) {
    console.error('Failed to submit weight entry:', err);
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-200;
}
</style>