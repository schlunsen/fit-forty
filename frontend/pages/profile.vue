<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="card">
      <h1 class="text-3xl font-bold mb-8" style="color: var(--color-text)">Profile</h1>
      
      <!-- Profile Picture Section -->
      <div class="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div class="flex flex-col items-center">
          <div class="w-32 h-32 rounded-full overflow-hidden mb-4" style="background-color: var(--color-surface)">
            <img 
              v-if="profile?.current_profile_picture?.image" 
              :src="getImageUrl(profile.current_profile_picture.image)"
              alt="Profile picture"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center" style="color: var(--color-text-secondary)">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
          
          <!-- Upload Profile Picture -->
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            class="hidden"
            @change="handleFileUpload"
          />
          <button 
            @click="$refs.fileInput.click()"
            :disabled="uploading"
            class="btn"
          >
            {{ uploading ? 'Uploading...' : 'Change Picture' }}
          </button>
        </div>
        
        <!-- Profile Info -->
        <div class="flex-1">
          <div v-if="!editing" class="space-y-4">
            <div>
              <h2 class="text-xl font-semibold" style="color: var(--color-text)">{{ profile?.user.first_name }} {{ profile?.user.last_name }}</h2>
              <p style="color: var(--color-text-secondary)">@{{ profile?.user.username }}</p>
              <p style="color: var(--color-text-secondary)">{{ profile?.user.email }}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Age</label>
                <p style="color: var(--color-text)">{{ profile?.age || 'Not specified' }}</p>
              </div>
              <div>
                <label class="label">Gender</label>
                <p style="color: var(--color-text)">{{ getGenderLabel(profile?.gender) }}</p>
              </div>
              <div>
                <label class="label">Weight</label>
                <p style="color: var(--color-text)">{{ profile?.weight ? `${profile.weight} kg` : 'Not specified' }}</p>
              </div>
              <div>
                <label class="label">Height</label>
                <p style="color: var(--color-text)">{{ profile?.height ? `${profile.height} cm` : 'Not specified' }}</p>
              </div>
            </div>
            
            <div>
              <label class="label">Goals</label>
              <p style="color: var(--color-text)">{{ profile?.goals || 'No goals set' }}</p>
            </div>
            
            <button 
              @click="startEditing"
              class="btn"
            >
              Edit Profile
            </button>
          </div>
          
          <!-- Edit Form -->
          <form v-else @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Age</label>
                <input 
                  v-model.number="editForm.age"
                  type="number"
                  min="1"
                  max="120"
                  class="form-input"
                />
              </div>
              <div>
                <label class="label">Gender</label>
                <select 
                  v-model="editForm.gender"
                  class="form-select"
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label class="label">Weight (kg)</label>
                <input 
                  v-model.number="editForm.weight"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  class="form-input"
                />
              </div>
              <div>
                <label class="label">Height (cm)</label>
                <input 
                  v-model.number="editForm.height"
                  type="number"
                  step="0.1"
                  min="50"
                  max="300"
                  class="form-input"
                />
              </div>
            </div>
            
            <div>
              <label class="label">Goals</label>
              <textarea 
                v-model="editForm.goals"
                rows="3"
                class="form-textarea"
                placeholder="Describe your fitness goals..."
              ></textarea>
            </div>
            
            <div class="flex gap-2">
              <button 
                type="submit"
                :disabled="saving"
                class="btn"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button 
                type="button"
                @click="cancelEditing"
                class="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Profile Picture History -->
      <div v-if="profile?.profile_pictures && profile.profile_pictures.length > 1" class="mt-8">
        <h3 class="text-lg font-semibold mb-4" style="color: var(--color-text)">Profile Picture History</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div 
            v-for="picture in profile.profile_pictures" 
            :key="picture.id"
            class="relative group"
          >
            <div class="w-20 h-20 rounded-lg overflow-hidden" style="background-color: var(--color-surface)">
              <img 
                :src="getImageUrl(picture.image)"
                alt="Profile picture"
                class="w-full h-full object-cover cursor-pointer"
                @click="setCurrentPicture(picture.id)"
              />
            </div>
            <div v-if="picture.is_current" class="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
              Current
            </div>
            <p class="text-xs mt-1" style="color: var(--color-text-secondary)">{{ formatDate(picture.uploaded_at) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Theme Settings Section -->
    <div class="card mt-8">
      <ThemeSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { UserProfile } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const api = useApi()
const profile = ref<UserProfile | null>(null)
const editing = ref(false)
const uploading = ref(false)
const saving = ref(false)

const editForm = ref({
  age: null as number | null,
  weight: null as number | null,
  height: null as number | null,
  gender: '' as string,
  goals: '' as string
})

const fileInput = ref<HTMLInputElement | null>(null)

const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `http://localhost:8000${imagePath}`
}

const getGenderLabel = (gender?: string) => {
  switch (gender) {
    case 'M': return 'Male'
    case 'F': return 'Female'
    case 'O': return 'Other'
    default: return 'Not specified'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const fetchProfile = async () => {
  try {
    const response = await api.get('/profiles/my_profile/')
    profile.value = response
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  }
}

const startEditing = () => {
  if (profile.value) {
    editForm.value = {
      age: profile.value.age || null,
      weight: profile.value.weight || null,
      height: profile.value.height || null,
      gender: profile.value.gender || '',
      goals: profile.value.goals || ''
    }
    editing.value = true
  }
}

const cancelEditing = () => {
  editing.value = false
  editForm.value = {
    age: null,
    weight: null,
    height: null,
    gender: '',
    goals: ''
  }
}

const saveProfile = async () => {
  if (!profile.value) return
  
  saving.value = true
  try {
    const updateData = {
      age: editForm.value.age,
      weight: editForm.value.weight,
      height: editForm.value.height,
      gender: editForm.value.gender || null,
      goals: editForm.value.goals
    }
    
    await api.patch(`/profiles/${profile.value.id}/`, updateData)
    
    await fetchProfile()
    editing.value = false
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    saving.value = false
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    
    await api.uploadFile('/profiles/upload_profile_picture/', formData)
    
    await fetchProfile()
  } catch (error) {
    console.error('Failed to upload profile picture:', error)
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const setCurrentPicture = async (pictureId: number) => {
  try {
    await api.post('/profiles/set_current_picture/', { picture_id: pictureId })
    
    await fetchProfile()
  } catch (error) {
    console.error('Failed to set current picture:', error)
  }
}

onMounted(() => {
  fetchProfile()
})
</script>