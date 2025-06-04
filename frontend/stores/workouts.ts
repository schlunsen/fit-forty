import { defineStore } from 'pinia';
import { useApi } from '~/composables/useApi';
import type { WorkoutLog, Exercise, ExerciseLog } from '~/types/models';

export const useWorkoutsStore = defineStore('workouts', {
  state: () => ({
    workouts: [] as WorkoutLog[],
    currentWorkout: null as WorkoutLog | null,
    exercises: [] as Exercise[],
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    getWorkoutById: (state) => (id: number) => {
      if (!state.workouts || !Array.isArray(state.workouts)) {
        return null;
      }
      return state.workouts.find(workout => workout.id === id) || null;
    },
    getExerciseById: (state) => (id: number) => {
      if (!state.exercises || !Array.isArray(state.exercises)) {
        return null;
      }
      return state.exercises.find(exercise => exercise.id === id) || null;
    },
    sortedWorkouts: (state) => {
      if (!state.workouts || !Array.isArray(state.workouts)) {
        return [];
      }
      return [...state.workouts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  },
  
  actions: {
    // Initialize store to ensure arrays exist
    init() {
      if (!this.workouts || !Array.isArray(this.workouts)) {
        this.workouts = [];
      }
      if (!this.exercises || !Array.isArray(this.exercises)) {
        this.exercises = [];
      }
    },
    
    // Fetch all workouts
    async fetchWorkouts() {
      this.loading = true;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        const response = await api.get('/workouts/');
        
        // Handle paginated response
        if (response && typeof response === 'object' && 'results' in response) {
          this.workouts = Array.isArray(response.results) ? response.results : [];
        } else if (Array.isArray(response)) {
          // Handle direct array response (for backwards compatibility)
          this.workouts = response;
        } else {
          this.workouts = [];
        }
        
        return this.workouts;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch workouts';
        console.error('Error fetching workouts:', error);
        this.workouts = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // Fetch single workout
    async fetchWorkout(id: number) {
      this.loading = true;
      
      try {
        const api = useApi();
        const workout = await api.get<WorkoutLog>(`/workouts/${id}/`);
        
        // Update in workouts array
        const index = this.workouts.findIndex(w => w.id === id);
        if (index !== -1) {
          this.workouts[index] = workout;
        } else {
          this.workouts.push(workout);
        }
        
        this.currentWorkout = workout;
        return workout;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch workout';
        console.error('Error fetching workout:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Create new workout
    async createWorkout(workoutData: Partial<WorkoutLog>) {
      this.loading = true;
      
      try {
        const api = useApi();
        const newWorkout = await api.post<WorkoutLog>('/workouts/', workoutData);
        this.workouts.push(newWorkout);
        this.currentWorkout = newWorkout;
        return newWorkout;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to create workout';
        console.error('Error creating workout:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Update workout
    async updateWorkout(id: number, workoutData: Partial<WorkoutLog>) {
      this.loading = true;
      
      try {
        const api = useApi();
        const updatedWorkout = await api.patch<WorkoutLog>(`/workouts/${id}/`, workoutData);
        
        // Update in workouts array
        const index = this.workouts.findIndex(w => w.id === id);
        if (index !== -1) {
          this.workouts[index] = updatedWorkout;
        }
        
        if (this.currentWorkout?.id === id) {
          this.currentWorkout = updatedWorkout;
        }
        
        return updatedWorkout;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update workout';
        console.error('Error updating workout:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Delete workout
    async deleteWorkout(id: number) {
      this.loading = true;
      
      try {
        const api = useApi();
        await api.delete(`/workouts/${id}/`);
        
        // Remove from workouts array
        this.workouts = this.workouts.filter(w => w.id !== id);
        
        if (this.currentWorkout?.id === id) {
          this.currentWorkout = null;
        }
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete workout';
        console.error('Error deleting workout:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Fetch all exercises
    async fetchExercises() {
      this.loading = true;
      this.init(); // Ensure arrays are initialized
      
      try {
        const api = useApi();
        const response = await api.get('/exercises/');
        
        // Handle paginated response
        if (response && typeof response === 'object' && 'results' in response) {
          this.exercises = Array.isArray(response.results) ? response.results : [];
        } else if (Array.isArray(response)) {
          // Handle direct array response (for backwards compatibility)
          this.exercises = response;
        } else {
          this.exercises = [];
        }
        
        return this.exercises;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to fetch exercises';
        console.error('Error fetching exercises:', error);
        this.exercises = [];
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // Add exercise log to workout
    async addExerciseLog(workoutId: number, exerciseLogData: Partial<ExerciseLog>) {
      this.loading = true;
      
      try {
        const api = useApi();
        const newExerciseLog = await api.post<ExerciseLog>('/exercise-logs/', {
          ...exerciseLogData,
          workout: workoutId,
        });
        
        // Refresh the workout to get updated exercise logs
        await this.fetchWorkout(workoutId);
        
        return newExerciseLog;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to add exercise log';
        console.error('Error adding exercise log:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Update exercise log
    async updateExerciseLog(id: number, exerciseLogData: Partial<ExerciseLog>) {
      this.loading = true;
      
      try {
        const api = useApi();
        const updatedExerciseLog = await api.patch<ExerciseLog>(`/exercise-logs/${id}/`, exerciseLogData);
        
        // Refresh the workout if needed
        if (this.currentWorkout && updatedExerciseLog) {
          await this.fetchWorkout(this.currentWorkout.id);
        }
        
        return updatedExerciseLog;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to update exercise log';
        console.error('Error updating exercise log:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // Delete exercise log
    async deleteExerciseLog(id: number) {
      this.loading = true;
      
      try {
        const api = useApi();
        await api.delete(`/exercise-logs/${id}/`);
        
        // Refresh the workout if needed
        if (this.currentWorkout) {
          await this.fetchWorkout(this.currentWorkout.id);
        }
        
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.detail || 'Failed to delete exercise log';
        console.error('Error deleting exercise log:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});