<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Health Metrics</h1>
      <div class="flex space-x-3">
        <NuxtLink to="/health/weight/add" class="btn flex items-center">
          <span class="i-heroicons-plus-circle-20-solid mr-1"></span>
          Add Weight
        </NuxtLink>
        <NuxtLink to="/health/bp/add" class="btn flex items-center">
          <span class="i-heroicons-plus-circle-20-solid mr-1"></span>
          Add BP Reading
        </NuxtLink>
      </div>
    </div>
    
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Weight Chart Card -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Weight History</h2>
          <NuxtLink to="/health/weight/add" class="text-primary-600 hover:underline text-sm">
            Add Entry
          </NuxtLink>
        </div>
        
        <div v-if="weightEntries.length === 0 && !loading" class="py-8 text-center text-gray-500">
          No weight entries yet. Start tracking your weight to see trends over time.
        </div>
        
        <div v-else>
          <!-- Latest Weight -->
          <div class="flex justify-between items-baseline mb-4">
            <span class="text-gray-600">Current Weight:</span>
            <span class="text-3xl font-bold">{{ latestWeight?.weight_kg || 'N/A' }} {{ latestWeight?.weight_kg ? 'kg' : '' }}</span>
          </div>
          
          <!-- Chart -->
          <div class="h-64 mb-4">
            <LineChart v-if="weightChartData.datasets[0].data.length > 0" :data="weightChartData" :options="chartOptions" />
          </div>
          
          <!-- Weight Table -->
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-2">Recent Entries</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="entry in weightEntries.slice(0, 5)" :key="entry.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(entry.timestamp) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ entry.weight_kg }} kg</td>
                    <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{{ entry.notes || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button @click="confirmDeleteWeight(entry)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="weightEntries.length === 0">
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No entries available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Blood Pressure Chart Card -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Blood Pressure History</h2>
          <NuxtLink to="/health/bp/add" class="text-primary-600 hover:underline text-sm">
            Add Reading
          </NuxtLink>
        </div>
        
        <div v-if="bpReadings.length === 0 && !loading" class="py-8 text-center text-gray-500">
          No blood pressure readings yet. Start tracking your blood pressure to monitor your cardiovascular health.
        </div>
        
        <div v-else>
          <!-- Latest Reading -->
          <div class="flex justify-between items-baseline mb-4">
            <span class="text-gray-600">Latest Reading:</span>
            <div class="text-right">
              <span class="text-3xl font-bold">{{ latestBP?.systolic || 'N/A' }}{{ latestBP?.systolic ? '/' + latestBP?.diastolic : '' }}</span>
              <span v-if="latestBP?.systolic" class="text-gray-500 text-sm ml-2">mmHg</span>
            </div>
          </div>
          
          <!-- Chart -->
          <div class="h-64 mb-4">
            <LineChart v-if="bpChartData.datasets[0].data.length > 0" :data="bpChartData" :options="chartOptions" />
          </div>
          
          <!-- BP Table -->
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-2">Recent Readings</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Systolic</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diastolic</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulse</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="reading in bpReadings.slice(0, 5)" :key="reading.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(reading.timestamp) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ reading.systolic }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ reading.diastolic }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ reading.pulse || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button @click="confirmDeleteBP(reading)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="bpReadings.length === 0">
                    <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No readings available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Weight Confirmation Modal -->
    <div v-if="weightToDelete" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-3">Delete Weight Entry</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to delete this weight entry from {{ formatDate(weightToDelete.timestamp) }}? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="weightToDelete = null" 
            class="btn-secondary"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="deleteWeight" 
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
    
    <!-- Delete BP Confirmation Modal -->
    <div v-if="bpToDelete" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium mb-3">Delete BP Reading</h3>
        <p class="text-gray-600 mb-4">
          Are you sure you want to delete this blood pressure reading from {{ formatDate(bpToDelete.timestamp) }}? This action cannot be undone.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="bpToDelete = null" 
            class="btn-secondary"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="deleteBP" 
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
import { ref, computed, onMounted } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useHealthStore } from '~/stores/health';
import { useSafeArray } from '~/composables/useSafeArray';
import type { WeightEntry, BloodPressureReading } from '~/types/models';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define route middleware
definePageMeta({
  middleware: 'auth'
});

// Store instance
const healthStore = useHealthStore();

// Local state
const weightToDelete = ref<WeightEntry | null>(null);
const bpToDelete = ref<BloodPressureReading | null>(null);
const deleting = ref(false);

// Computed properties
const loading = computed(() => healthStore.loading);

// Use the safe array composable to handle potential null/undefined arrays
const { safeArray: weightEntries, first: latestWeight } = useSafeArray(computed(() => healthStore.sortedWeightEntries));
const { safeArray: bpReadings, first: latestBP } = useSafeArray(computed(() => healthStore.sortedBPReadings));

const weightChartData = computed(() => healthStore.weightChartData);
const bpChartData = computed(() => healthStore.bpChartData);

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };
});

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const confirmDeleteWeight = (entry: WeightEntry) => {
  weightToDelete.value = entry;
};

const confirmDeleteBP = (reading: BloodPressureReading) => {
  bpToDelete.value = reading;
};

const deleteWeight = async () => {
  if (!weightToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await healthStore.deleteWeightEntry(weightToDelete.value.id);
    weightToDelete.value = null;
  } catch (error) {
    console.error('Error deleting weight entry:', error);
  } finally {
    deleting.value = false;
  }
};

const deleteBP = async () => {
  if (!bpToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await healthStore.deleteBPReading(bpToDelete.value.id);
    bpToDelete.value = null;
  } catch (error) {
    console.error('Error deleting BP reading:', error);
  } finally {
    deleting.value = false;
  }
};

// Initialize store before component mounts
healthStore.init();

// Load data on component mount
onMounted(async () => {
  // Ensure store is initialized
  healthStore.init();
  
  try {
    await Promise.all([
      healthStore.fetchWeightEntries(),
      healthStore.fetchBPReadings()
    ]);
  } catch (error) {
    console.error('Error loading health data:', error);
  }
});
</script>