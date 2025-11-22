<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 text-center px-4 py-8">
    <!-- Animated 404 Graphic -->
    <div class="relative mb-8">
      <h1 class="text-8xl sm:text-9xl font-extrabold text-indigo-600 animate-pulse">404</h1>
      <div class="absolute -top-4 -right-4 w-12 h-12 bg-indigo-200 rounded-full animate-bounce"></div>
      <div class="absolute -bottom-4 -left-4 w-8 h-8 bg-indigo-300 rounded-full animate-bounce delay-150"></div>
    </div>

    <!-- Main Content -->
    <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mt-4">Oops! Page Not Found</h2>
    <p class="text-lg sm:text-xl text-gray-600 mt-3 max-w-md">It looks like this page took a wrong turn. Don’t worry, let’s get you back on track to learning a new language!</p>

    <!-- Call to Actions -->
    <div class="mt-8 flex flex-col sm:flex-row items-center gap-4">
      <RouterLink
        to="/"
        class="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300"
      >
        Go Back Home
      </RouterLink>
      <RouterLink
        to="/contact"
        class="px-6 py-3 font-semibold text-indigo-600 bg-white rounded-lg shadow-md hover:bg-indigo-50 transition-all duration-300"
      >
        Contact Support
      </RouterLink>
    </div>

    <div class="mt-10">
      <p class="text-gray-600 text-sm sm:text-base">Or explore these popular pages:</p>
      <div class="mt-4 flex flex-col sm:flex-row justify-center gap-4 text-sm sm:text-base">
        <a href="#how-it-works" class="text-indigo-600 hover:text-indigo-800 transition-colors">How It Works</a>
        <a href="#pricing" class="text-indigo-600 hover:text-indigo-800 transition-colors">Pricing</a>
        <a href="#testimonials" class="text-indigo-600 hover:text-indigo-800 transition-colors">Testimonials</a>
      </div>
    </div>

    <div class="mt-12">
      <img
        src="https://via.placeholder.com/300x200?text=Lost+Traveler"
        alt="Lost Traveler Illustration"
        class="max-w-xs w-full mx-auto opacity-90"
      />
      <p class="text-gray-500 text-sm mt-2">Looks like we're lost in translation!</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

.delay-150 {
  animation-delay: 0.15s;
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
