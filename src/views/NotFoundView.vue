<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-black relative isolate overflow-hidden text-center px-4 py-8 font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
    </div>

    <div class="relative mb-8 group">
      <h1 class="text-8xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-600 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse">
        404
      </h1>

      <div class="absolute -top-4 -right-4 w-12 h-12 bg-purple-500/30 rounded-full animate-bounce blur-sm border border-purple-400/20"></div>
      <div class="absolute -bottom-4 -left-4 w-8 h-8 bg-indigo-500/30 rounded-full animate-bounce delay-150 blur-sm border border-indigo-400/20"></div>
    </div>

    <h2 class="text-3xl sm:text-4xl font-bold text-white mt-4">Oops! Page Not Found</h2>
    <p class="text-lg sm:text-xl text-gray-400 mt-3 max-w-md">It looks like this page took a wrong turn. Don’t worry, let’s get you back on track to learning a new language!</p>

    <div class="mt-8 flex flex-col sm:flex-row items-center gap-4">
      <RouterLink
        to="/"
        class="px-8 py-3.5 font-bold text-white bg-purple-600 rounded-full shadow-lg shadow-purple-500/40 hover:bg-purple-500 hover:shadow-purple-500/60 hover:-translate-y-1 transition-all duration-300"
      >
        Go Back Home
      </RouterLink>
      <RouterLink
        to="/contact"
        class="px-8 py-3.5 font-bold text-gray-300 bg-gray-900/50 border border-white/10 rounded-full hover:bg-gray-800 hover:text-white hover:border-purple-500/50 transition-all duration-300"
      >
        Contact Support
      </RouterLink>
    </div>

    <div class="mt-12 border-t border-white/5 pt-8 w-full max-w-lg">
      <p class="text-gray-500 text-sm sm:text-base uppercase tracking-widest font-semibold">Explore popular pages</p>
      <div class="mt-4 flex flex-col sm:flex-row justify-center gap-6 text-sm sm:text-base">
        <a href="/#how-it-works" class="text-purple-400 hover:text-purple-300 transition-colors hover:underline underline-offset-4">How It Works</a>
        <a href="/#pricing" class="text-purple-400 hover:text-purple-300 transition-colors hover:underline underline-offset-4">Pricing</a>
        <a href="/#testimonials" class="text-purple-400 hover:text-purple-300 transition-colors hover:underline underline-offset-4">Testimonials</a>
      </div>
    </div>

    <div class="mt-12 relative">
       <div class="w-64 h-40 mx-auto bg-gray-900 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 to-transparent"></div>
          <svg class="w-20 h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
          <div class="absolute bottom-2 text-xs text-gray-500 font-mono">MAP NOT FOUND</div>
       </div>
      <p class="text-gray-600 text-sm mt-4">Looks like we're lost in translation!</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.animate-bounce {
  animation: bounce 3s infinite ease-in-out;
}

.delay-150 {
  animation-delay: 1.5s;
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; text-shadow: 0 0 20px rgba(168,85,247,0.4); }
  50% { opacity: 0.8; text-shadow: 0 0 10px rgba(168,85,247,0.1); }
}
</style>
