// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  id: number;
  user: User;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'M' | 'F' | 'O';
  goals: string;
  created_at: string;
  updated_at: string;
}

// Workout related types
export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscles_targeted: string;
  equipment_type: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseLog {
  id: number;
  exercise: number;
  exercise_name?: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: number;
  user: number;
  date: string;
  notes?: string;
  duration_minutes?: number;
  exercise_logs: ExerciseLog[];
  created_at: string;
  updated_at: string;
}

// Health related types
export interface WeightEntry {
  id: number;
  user: number;
  weight_kg: number;
  timestamp: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BloodPressureReading {
  id: number;
  user: number;
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BodyPartTag = 'shoulders' | 'upper_body' | 'back' | 'stomach' | 'legs' | 'full_body';

export interface ProgressPhoto {
  id: number;
  user: number;
  image: string;
  image_url: string;
  timestamp: string;
  notes?: string;
  body_part_tags: BodyPartTag[];
  created_at: string;
  updated_at: string;
}

// API response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth related types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}