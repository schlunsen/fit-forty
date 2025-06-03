<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Add Blood Pressure Reading</h1>
    
    <div class="card max-w-xl mx-auto">
      <form @submit.prevent="submitForm">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Systolic Input -->
          <div>
            <label for="systolic" class="block text-sm font-medium text-gray-700 mb-1">Systolic (mmHg)</label>
            <input 
              v-model.number="form.systolic"
              id="systolic"
              type="number"
              min="70"
              max="220"
              class="form-input w-full rounded-md border-gray-300"
              required
              :disabled="loading"
            />
          </div>
          
          <!-- Diastolic Input -->
          <div>
            <label for="diastolic" class="block text-sm font-medium text-gray-700 mb-1">Diastolic (mmHg)</label>
            <input 
              v-model.number="form.diastolic"
              id="diastolic"
              type="number"
              min="40"
              max="130"
              class="form-input w-full rounded-md border-gray-300"
              required
              :disabled="loading"
            />
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Pulse Input -->
          <div>
            <label for="pulse" class="block text-sm font-medium text-gray-700 mb-1">Pulse (bpm) (optional)</label>
            <input 
              v-model.number="form.pulse"
              id="pulse"
              type="number"
              min="40"
              max="220"
              class="form-input w-full rounded-md border-gray-300"
              :disabled="loading"
            />
          </div>
          
          <!-- Date/Time Input -->
          <div>
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
        
        <!-- Blood Pressure Category -->
        <div class="mb-6 p-4 rounded-md" :class="bpCategoryColorClass">
          <h3 class="font-bold text-lg mb-1">{{ bpCategory.name }}</h3>
          <p>{{ bpCategory.description }}</p>
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
            {{ loading ? 'Saving...' : 'Save Reading' }}
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
  systolic: null as number | null,
  diastolic: null as number | null,
  pulse: null as number | null,
  timestamp: localISOString, // Current date/time as default
  notes: '',
});

// Form submission state
const loading = computed(() => healthStore.loading);
const error = computed(() => healthStore.error);
const submitted = ref(false);

// Blood pressure category logic
const bpCategory = computed(() => {
  const { systolic, diastolic } = form;
  
  // If either value is missing, return normal category
  if (!systolic || !diastolic) {
    return { 
      name: 'Waiting for Input', 
      description: 'Enter your blood pressure values above.',
      colorClass: 'bg-gray-100 text-gray-700'
    };
  }
  
  // Normal: systolic < 120 AND diastolic < 80
  if (systolic < 120 && diastolic < 80) {
    return { 
      name: 'Normal', 
      description: 'Your blood pressure is in the normal range.',
      colorClass: 'bg-green-100 text-green-800'
    };
  }
  
  // Elevated: systolic 120-129 AND diastolic < 80
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return { 
      name: 'Elevated', 
      description: 'Your blood pressure is slightly elevated. Consider lifestyle changes.',
      colorClass: 'bg-blue-100 text-blue-800' 
    };
  }
  
  // Hypertension Stage 1: systolic 130-139 OR diastolic 80-89
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { 
      name: 'Hypertension Stage 1', 
      description: 'Your blood pressure is in the hypertension stage 1 range. Consider talking to your doctor.',
      colorClass: 'bg-yellow-100 text-yellow-800'
    };
  }
  
  // Hypertension Stage 2: systolic >= 140 OR diastolic >= 90
  if (systolic >= 140 || diastolic >= 90) {
    return { 
      name: 'Hypertension Stage 2', 
      description: 'Your blood pressure is in the hypertension stage 2 range. Consult with your doctor.',
      colorClass: 'bg-orange-100 text-orange-800'
    };
  }
  
  // Hypertensive Crisis: systolic > 180 OR diastolic > 120
  if (systolic > 180 || diastolic > 120) {
    return { 
      name: 'Hypertensive Crisis', 
      description: 'Your blood pressure is very high. Seek medical attention immediately.',
      colorClass: 'bg-red-100 text-red-800'
    };
  }
  
  return { 
    name: 'Unknown', 
    description: 'Unable to categorize blood pressure with the given values.',
    colorClass: 'bg-gray-100 text-gray-700'
  };
});

const bpCategoryColorClass = computed(() => bpCategory.value.colorClass);

// Methods
const submitForm = async () => {
  if (!form.systolic || !form.diastolic) {
    return;
  }
  
  try {
    // Submit form data to store
    const result = await healthStore.addBPReading({
      systolic: form.systolic,
      diastolic: form.diastolic,
      pulse: form.pulse || null,
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
    console.error('Failed to submit blood pressure reading:', err);
  }
};
</script>

<style scoped>
.card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-200;
}
</style>