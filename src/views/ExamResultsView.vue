<script setup lang="ts">
import { useExamStore } from '@/stores/exam';
import { RouterLink } from 'vue-router';
const examStore = useExamStore();
</script>

<template>
  <div class="min-h-screen bg-black text-white relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="flex flex-col items-center justify-center min-h-screen p-6">

      <div class="relative w-full max-w-lg bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-purple-900/20 text-center overflow-hidden">

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div class="relative z-10 mx-auto w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
           <svg class="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
           </svg>
        </div>

        <h1 class="relative z-10 text-3xl font-bold text-white mb-2">Test Completed!</h1>
        <p class="relative z-10 text-gray-400 mb-10">Your results have been processed.</p>

        <div class="relative z-10 mb-12">
           <p class="text-sm font-bold text-purple-400 uppercase tracking-widest mb-2">Final Score</p>
           <div class="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-purple-300 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              {{ examStore.finalResult?.score.toFixed(1) }}<span class="text-4xl text-purple-500 align-top">%</span>
           </div>
        </div>

        <div class="relative z-10">
          <RouterLink
            to="/dashboard/exams"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 w-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Exams
          </RouterLink>
        </div>

      </div>
    </div>
  </div>
</template>
