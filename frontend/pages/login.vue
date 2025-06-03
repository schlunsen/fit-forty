<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-center mb-6">Sign In</h1>
    
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
        
        <!-- Password -->
        <div class="mb-6">
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
        
        <!-- Submit Button -->
        <button
          type="submit"
          class="btn w-full flex justify-center items-center"
          :disabled="loading"
        >
          <span v-if="loading" class="mr-2">
            <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="mt-4 text-center text-sm text-gray-600">
        Don't have an account?
        <NuxtLink to="/register" class="text-primary-600 hover:underline">
          Sign up
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
  password: ''
});

// Computed values
const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

// Handle form submission
const handleSubmit = async () => {
  const success = await authStore.login({
    username: form.username,
    password: form.password
  });
  
  if (success) {
    navigateTo('/');
  }
};
</script>