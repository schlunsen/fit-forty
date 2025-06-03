<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <!-- Logo -->
          <NuxtLink to="/" class="text-xl font-bold text-primary-600">
            FIT <span style="color: black !important">FORTY</span>
          </NuxtLink>
          
          <!-- Navigation -->
          <nav v-if="authStore.isAuthenticated" class="hidden md:flex space-x-6">
            <NuxtLink to="/" class="nav-link">Dashboard</NuxtLink>
            <NuxtLink to="/workouts" class="nav-link">Workouts</NuxtLink>
            <NuxtLink to="/exercises" class="nav-link">Exercises</NuxtLink>
            <NuxtLink to="/health" class="nav-link">Health</NuxtLink>
            <NuxtLink to="/progress" class="nav-link">Progress Photos</NuxtLink>
          </nav>
          
          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="flex items-center">
            <div class="relative" ref="userMenuRef">
              <button @click="isUserMenuOpen = !isUserMenuOpen" class="flex items-center space-x-2 focus:outline-none">
                <span class="text-sm font-medium">{{ authStore.userFullName }}</span>
                <div class="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-600">
                  <img 
                    v-if="profilePictureUrl" 
                    :src="profilePictureUrl"
                    :alt="authStore.userFullName"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>
                    {{ authStore.user?.username.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </button>
              
              <!-- Dropdown Menu -->
              <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </NuxtLink>
                <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <!-- Login/Register Links -->
          <div v-else class="flex items-center space-x-4">
            <NuxtLink to="/login" class="text-sm font-medium text-gray-600 hover:text-primary-600">
              Sign In
            </NuxtLink>
            <NuxtLink to="/register" class="btn text-sm">
              Sign Up
            </NuxtLink>
          </div>
          
          <!-- Mobile Menu Button -->
          <button v-if="authStore.isAuthenticated" @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden focus:outline-none">
            <svg class="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Mobile Menu -->
        <div v-if="isMobileMenuOpen && authStore.isAuthenticated" class="md:hidden mt-3 space-y-2">
          <NuxtLink to="/" class="block py-2 text-gray-600 hover:text-primary-600">Dashboard</NuxtLink>
          <NuxtLink to="/workouts" class="block py-2 text-gray-600 hover:text-primary-600">Workouts</NuxtLink>
          <NuxtLink to="/exercises" class="block py-2 text-gray-600 hover:text-primary-600">Exercises</NuxtLink>
          <NuxtLink to="/health" class="block py-2 text-gray-600 hover:text-primary-600">Health</NuxtLink>
          <NuxtLink to="/progress" class="block py-2 text-gray-600 hover:text-primary-600">Progress Photos</NuxtLink>
          <NuxtLink to="/profile" class="block py-2 text-gray-600 hover:text-primary-600">Profile</NuxtLink>
          <button @click="logout" class="block w-full text-left py-2 text-gray-600 hover:text-primary-600">
            Sign Out
          </button>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 flex-grow">
      <slot />
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-50 border-t border-gray-200 py-4">
      <div class="container mx-auto px-4 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} WorkoutTracker. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const isUserMenuOpen = ref(false);
const isMobileMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

// Get profile picture URL
const profilePictureUrl = computed(() => {
  const currentPicture = authStore.profile?.current_profile_picture;
  if (currentPicture?.image) {
    // If the image URL is already absolute, use it as is
    if (currentPicture.image.startsWith('http')) {
      return currentPicture.image;
    }
    // Otherwise, prepend the backend URL
    return `http://localhost:8000${currentPicture.image}`;
  }
  return null;
});

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

// Logout function
const logout = () => {
  authStore.logout();
};

// Initialize auth
onMounted(() => {
  authStore.initAuth();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-primary-600 font-medium;
}
</style>