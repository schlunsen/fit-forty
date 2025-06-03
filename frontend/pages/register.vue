<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-center mb-6">Create Account</h1>
    
    <div class="card">
      <!-- Error Alert -->
      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <!-- Username -->
        <div class="mb-4">
          <label for="username" class="label">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="input"
            :disabled="loading"
            required
          />
        </div>
        
        <!-- Email -->
        <div class="mb-4">
          <label for="email" class="label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="input"
            :disabled="loading"
            required
          />
        </div>
        
        <!-- First Name -->
        <div class="mb-4">
          <label for="firstName" class="label">First Name</label>
          <input
            id="firstName"
            v-model="form.first_name"
            type="text"
            class="input"
            :disabled="loading"
          />
        </div>
        
        <!-- Last Name -->
        <div class="mb-4">
          <label for="lastName" class="label">Last Name</label>
          <input
            id="lastName"
            v-model="form.last_name"
            type="text"
            class="input"
            :disabled="loading"
          />
        </div>
        
        <!-- Password -->
        <div class="mb-4">
          <label for="password" class="label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="input"
            :disabled="loading"
            required
          />
        </div>
        
        <!-- Confirm Password -->
        <div class="mb-6">
          <label for="confirmPassword" class="label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.password_confirm"
            type="password"
            class="input"
            :disabled="loading"
            required
          />
          <div v-if="passwordMismatch" class="text-red-500 text-sm mt-1">
            Passwords don't match
          </div>
        </div>
        
        <!-- Submit Button -->
        <button
          type="submit"
          class="btn w-full flex justify-center items-center"
          :disabled="loading || passwordMismatch"
        >
          <span v-if="loading" class="mr-2">
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
      
      <div class="mt-4 text-center text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/login" class="text-primary-600 hover:underline">
          Sign in
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

// Define route middleware
definePageMeta({
  middleware: 'guest'
});

// Store instance
const authStore = useAuthStore();

// Form state
const form = reactive({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: ''
});

// Computed values
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);
const passwordMismatch = computed(() => 
  form.password !== '' && 
  form.password_confirm !== '' && 
  form.password !== form.password_confirm
);

// Handle form submission
const handleSubmit = async () => {
  if (passwordMismatch.value) {
    return;
  }
  
  const success = await authStore.register(form);
  
  if (success) {
    navigateTo('/');
  }
};
</script>