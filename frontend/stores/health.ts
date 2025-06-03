import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { WeightEntry, BloodPressureReading, ProgressPhoto, PaginatedResponse } from '~/types/models';

export const useHealthStore = defineStore('health', {
  state: () => ({
    weightEntries: [] as WeightEntry[],
    bloodPressureReadings: [] as BloodPressureReading[],
    progressPhotos: [] as ProgressPhoto[],
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    sortedWeightEntries: (state) => {
      if (!state.weightEntries || !Array.isArray(state.weightEntries)) {
        return [];
      }
      return [...state.weightEntries].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    
    sortedBPReadings: (state) => {
      if (!state.bloodPressureReadings || !Array.isArray(state.bloodPressureReadings)) {
        return [];
      }
      return [...state.bloodPressureReadings].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    
    sortedProgressPhotos: (state) => {
      if (!state.progressPhotos || !Array.isArray(state.progressPhotos)) {
        return [];
      }
      return [...state.progressPhotos].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    
    // Get weight data for charts
    weightChartData: (state) => {
      // Check if the array is empty or undefined
      if (!state.weightEntries || state.weightEntries.length === 0) {
        return {
          labels: [],
          datasets: [{
            label: 'Weight (kg)',
            data: [],
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            tension: 0.3,
          }]
        };
      }
      
      const sorted = [...state.weightEntries].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      return {
        labels: sorted.map(entry => new Date(entry.timestamp).toLocaleDateString()),
        datasets: [{
          label: 'Weight (kg)',
          data: sorted.map(entry => entry.weight_kg),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          tension: 0.3,
        }]
      };
    },
    
    // Get BP data for charts
    bpChartData: (state) => {
      // Check if the array is empty or undefined
      if (!state.bloodPressureReadings || state.bloodPressureReadings.length === 0) {
        return {
          labels: [],
          datasets: [
            {
              label: 'Systolic',
              data: [],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              tension: 0.3,
            },
            {
              label: 'Diastolic',
              data: [],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              tension: 0.3,
            }
          ]
        };
      }
      
      const sorted = [...state.bloodPressureReadings].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      return {
        labels: sorted.map(entry => new Date(entry.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: 'Systolic',
            data: sorted.map(entry => entry.systolic),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            tension: 0.3,
          },
          {
            label: 'Diastolic',
            data: sorted.map(entry => entry.diastolic),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.3,
          }
        ]
      };
    },
  },
  
  actions: {
    // Initialize store
    init() {
      // Ensure arrays are properly initialized
      if (!this.weightEntries || !Array.isArray(this.weightEntries)) {
        this.weightEntries = [];
      }
      if (!this.bloodPressureReadings || !Array.isArray(this.bloodPressureReadings)) {
        this.bloodPressureReadings = [];
      }
      if (!this.progressPhotos || !Array.isArray(this.progressPhotos)) {
        this.progressPhotos = [];
      }
    },
    
    // Weight entries
    async fetchWeightEntries() {
      this.loading = true;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        const response = await api.get<PaginatedResponse<WeightEntry>>('/weight-entries/');
        
        // Check if the response is a paginated response
        if (response && 'results' in response) {
          // Handle Django REST Framework paginated response
          this.weightEntries = Array.isArray(response.results) ? response.results : [];
        } else if (Array.isArray(response)) {
          // Handle non-paginated array response
          this.weightEntries = response;
        } else {
          // Unknown response format
          console.error('Unknown response format for weight entries:', response);
          this.weightEntries = [];
        }
        
        return this.weightEntries;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch weight entries';
        console.error('Error fetching weight entries:', error);
        this.weightEntries = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async addWeightEntry(data: Partial<WeightEntry>) {
      this.loading = true;
      this.error = null;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        
        // Ensure data has the right format
        const formattedData = {
          weight_kg: data.weight_kg,
          timestamp: data.timestamp,
          notes: data.notes || ''
        };
        
        console.log('Submitting weight entry:', formattedData);
        
        const newEntry = await api.post<WeightEntry>('/weight-entries/', formattedData);
        
        // Ensure we have a valid array to add to
        if (!this.weightEntries || !Array.isArray(this.weightEntries)) {
          this.weightEntries = [];
        }
        
        this.weightEntries.push(newEntry);
        return newEntry;
      } catch (error: any) {
        console.error('API Error Response:', error.response?.data);
        this.error = error.response?.data?.detail || 
                    error.response?.data?.non_field_errors?.[0] || 
                    'Failed to add weight entry';
        console.error('Error adding weight entry:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateWeightEntry(id: number, data: Partial<WeightEntry>) {
      this.loading = true;
      
      try {
        const api = useApi();
        const updatedEntry = await api.patch<WeightEntry>(`/weight-entries/${id}/`, data);
        
        // Update in state
        if (!this.weightEntries) this.weightEntries = [];
        const index = this.weightEntries.findIndex(e => e.id === id);
        if (index !== -1) {
          this.weightEntries[index] = updatedEntry;
        }
        
        return updatedEntry;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update weight entry';
        console.error('Error updating weight entry:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteWeightEntry(id: number) {
      this.loading = true;
      
      try {
        const api = useApi();
        await api.delete(`/weight-entries/${id}/`);
        
        // Remove from state
        if (!this.weightEntries) this.weightEntries = [];
        this.weightEntries = this.weightEntries.filter(e => e.id !== id);
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete weight entry';
        console.error('Error deleting weight entry:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Blood pressure readings
    async fetchBPReadings() {
      this.loading = true;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        const response = await api.get<PaginatedResponse<BloodPressureReading>>('/blood-pressure/');
        
        // Check if the response is a paginated response
        if (response && 'results' in response) {
          // Handle Django REST Framework paginated response
          this.bloodPressureReadings = Array.isArray(response.results) ? response.results : [];
        } else if (Array.isArray(response)) {
          // Handle non-paginated array response
          this.bloodPressureReadings = response;
        } else {
          // Unknown response format
          console.error('Unknown response format for BP readings:', response);
          this.bloodPressureReadings = [];
        }
        
        return this.bloodPressureReadings;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch BP readings';
        console.error('Error fetching BP readings:', error);
        this.bloodPressureReadings = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async addBPReading(data: Partial<BloodPressureReading>) {
      this.loading = true;
      this.error = null;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        
        // Ensure data has the right format
        const formattedData = {
          systolic: data.systolic,
          diastolic: data.diastolic,
          pulse: data.pulse || null,
          timestamp: data.timestamp,
          notes: data.notes || ''
        };
        
        console.log('Submitting BP reading:', formattedData);
        
        const newReading = await api.post<BloodPressureReading>('/blood-pressure/', formattedData);
        
        // Ensure we have a valid array to add to
        if (!this.bloodPressureReadings || !Array.isArray(this.bloodPressureReadings)) {
          this.bloodPressureReadings = [];
        }
        
        this.bloodPressureReadings.push(newReading);
        return newReading;
      } catch (error: any) {
        console.error('API Error Response:', error.response?.data);
        this.error = error.response?.data?.detail || 
                    error.response?.data?.non_field_errors?.[0] || 
                    'Failed to add BP reading';
        console.error('Error adding BP reading:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateBPReading(id: number, data: Partial<BloodPressureReading>) {
      this.loading = true;
      
      try {
        const api = useApi();
        const updatedReading = await api.patch<BloodPressureReading>(`/blood-pressure/${id}/`, data);
        
        // Update in state
        if (!this.bloodPressureReadings) this.bloodPressureReadings = [];
        const index = this.bloodPressureReadings.findIndex(r => r.id === id);
        if (index !== -1) {
          this.bloodPressureReadings[index] = updatedReading;
        }
        
        return updatedReading;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update BP reading';
        console.error('Error updating BP reading:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteBPReading(id: number) {
      this.loading = true;
      
      try {
        const api = useApi();
        await api.delete(`/blood-pressure/${id}/`);
        
        // Remove from state
        if (!this.bloodPressureReadings) this.bloodPressureReadings = [];
        this.bloodPressureReadings = this.bloodPressureReadings.filter(r => r.id !== id);
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete BP reading';
        console.error('Error deleting BP reading:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Progress photos
    async fetchProgressPhotos() {
      this.loading = true;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        const response = await api.get<PaginatedResponse<ProgressPhoto>>('/progress-photos/');
        
        // Check if the response is a paginated response
        if (response && 'results' in response) {
          // Handle Django REST Framework paginated response
          this.progressPhotos = Array.isArray(response.results) ? response.results : [];
        } else if (Array.isArray(response)) {
          // Handle non-paginated array response
          this.progressPhotos = response;
        } else {
          // Unknown response format
          console.error('Unknown response format for progress photos:', response);
          this.progressPhotos = [];
        }
        
        return this.progressPhotos;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch progress photos';
        console.error('Error fetching progress photos:', error);
        this.progressPhotos = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async addProgressPhoto(formData: FormData) {
      this.loading = true;
      
      try {
        const api = useApi();
        const newPhoto = await api.uploadFile<ProgressPhoto>('/progress-photos/', formData);
        if (!this.progressPhotos) this.progressPhotos = [];
        this.progressPhotos.push(newPhoto);
        return newPhoto;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to upload photo';
        console.error('Error uploading photo:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProgressPhoto(id: number, formData: FormData) {
      this.loading = true;
      
      try {
        const api = useApi();
        const updatedPhoto = await api.uploadFile<ProgressPhoto>(`/progress-photos/${id}/`, formData);
        
        // Update in state
        if (!this.progressPhotos) this.progressPhotos = [];
        const index = this.progressPhotos.findIndex(p => p.id === id);
        if (index !== -1) {
          this.progressPhotos[index] = updatedPhoto;
        }
        
        return updatedPhoto;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update photo';
        console.error('Error updating photo:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteProgressPhoto(id: number) {
      this.loading = true;
      
      try {
        const api = useApi();
        await api.delete(`/progress-photos/${id}/`);
        
        // Remove from state
        if (!this.progressPhotos) this.progressPhotos = [];
        this.progressPhotos = this.progressPhotos.filter(p => p.id !== id);
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete photo';
        console.error('Error deleting photo:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});