<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { uploadImage } from '@/services/upload';

const authStore = useAuthStore();
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });
const copyButtonText = ref('Copy Code');

const profileForm = ref({
  full_name: '',
  time_zone: '',
  learning_goals: '',
  profile_picture_url: '',
});

onMounted(() => {
  if (authStore.user) {
    profileForm.value.full_name = authStore.user.full_name;
    profileForm.value.time_zone = authStore.user.time_zone || '';
    profileForm.value.learning_goals = authStore.user.learning_goals || '';
    profileForm.value.profile_picture_url = authStore.user.profile_picture_url || '';
  }
});

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    isSubmitting.value = true;
    message.value = { type: 'info', text: 'Uploading image...' };
    try {
      const imageURL = await uploadImage(file);
      profileForm.value.profile_picture_url = imageURL;
      message.value = { type: 'success', text: 'Image uploaded! Click "Save Changes" to apply.' };
    } catch (error) {
      console.log(error);
      message.value = { type: 'error', text: 'Image upload failed. Please try again.' };
    } finally {
      isSubmitting.value = false;
    }
  }
};

const handleUpdateProfile = async () => {
  isSubmitting.value = true;
  message.value = { type: '', text: '' };

  const result = await authStore.updateProfile(profileForm.value);

  isSubmitting.value = false;
  message.value = { type: result.success ? 'success' : 'error', text: result.message };
};

const copyCode = () => {
  if (authStore.user?.referral_code) {
    navigator.clipboard.writeText(authStore.user.referral_code);
    copyButtonText.value = 'Copied!';
    setTimeout(() => {
      copyButtonText.value = 'Copy Code';
    }, 2000);
  }
};
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="bg-white p-8 rounded-lg shadow-md">
        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
          <div v-if="message.text" :class="['p-3 text-sm rounded-md',
            {'bg-green-100 text-green-700': message.type === 'success'},
            {'bg-red-100 text-red-700': message.type === 'error'},
            {'bg-blue-100 text-blue-700': message.type === 'info'}
          ]">
            {{ message.text }}
          </div>

          <div class="flex items-center space-x-6">
            <img :src="profileForm.profile_picture_url || 'https://via.placeholder.com/150'" class="w-24 h-24 rounded-full object-cover" alt="Profile Picture" />
            <div>
              <label for="profile-picture-upload" class="cursor-pointer px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                Upload New Image
              </label>
              <input id="profile-picture-upload" type="file" @change="onFileChange" class="hidden" accept="image/png, image/jpeg" />
              <p class="text-xs text-gray-500 mt-2">PNG or JPG. Max 5MB.</p>
            </div>
          </div>

          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input v-model="profileForm.full_name" id="fullName" type="text" required class="w-full mt-1 input-field" />
          </div>

          <div>
            <label for="timeZone" class="block text-sm font-medium text-gray-700">Time Zone</label>
            <input v-model="profileForm.time_zone" id="timeZone" type="text" placeholder="e.g., Africa/Nairobi" class="w-full mt-1 input-field" />
          </div>

          <div>
            <label for="learningGoals" class="block text-sm font-medium text-gray-700">Learning Goals</label>
            <textarea v-model="profileForm.learning_goals" id="learningGoals" rows="4" class="w-full mt-1 input-field" placeholder="e.g., 'Become fluent in conversational Spanish.'"></textarea>
          </div>

          <div>
            <button type="submit" :disabled="isSubmitting" class="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
              <span v-if="isSubmitting">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-800">Your Referral Code</h2>
        <p class="text-gray-600 mt-2">Share this code with your friends. When they make their first purchase, you'll get a $5.00 credit!</p>
        <div class="mt-4 flex items-center p-3 bg-gray-100 rounded-md border-2 border-dashed">
          <span class="text-2xl font-mono tracking-widest text-indigo-700 flex-grow">{{ authStore.user?.referral_code }}</span>
          <button @click="copyCode" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 w-24">
            {{ copyButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500;
}
</style>
