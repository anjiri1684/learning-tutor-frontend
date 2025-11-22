<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExamStore } from '@/stores/exam';

const route = useRoute();
const router = useRouter();
const examStore = useExamStore();

const isLoading = ref(true);
const timeRemaining = ref('');
let timerInterval: number;

onMounted(async () => {
  const testId = route.params.id as string;
  const result = await examStore.startTest(testId);
  if (!result.success) {
    router.push('/dashboard/exams');
  } else {
    startTimer(examStore.testDetails!.duration);
    isLoading.value = false;
  }
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const startTimer = (durationMinutes: number) => {
  let seconds = durationMinutes * 60;
  timerInterval = setInterval(() => {
    seconds--;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    timeRemaining.value = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    if (seconds <= 0) {
      clearInterval(timerInterval);
      handleSubmit();
    }
  }, 1000);
};

const handleSubmit = async () => {
  clearInterval(timerInterval);
  const result = await examStore.submitTest();
  if (result.success) {
    router.push('/dashboard/exam/results');
  }
};
</script>

<template>
  <div class="container mx-auto p-8">
    <div v-if="isLoading">Starting test...</div>
    <div v-else-if="examStore.testDetails">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">{{ examStore.testDetails.title }}</h1>
        <div class="text-2xl font-bold text-red-500 bg-white p-3 rounded-lg shadow-md">{{ timeRemaining }}</div>
      </div>

      <div class="space-y-8">
        <div v-for="(question, index) in examStore.questions" :key="question.id" class="bg-white p-6 rounded-lg shadow-md">
          <p class="font-semibold mb-4">{{ index + 1 }}. {{ question.question_text }}</p>
          <div class="space-y-2">
            <div v-for="option in JSON.parse(question.options)" :key="option">
              <label class="flex items-center">
                <input type="radio" :name="`question-${question.id}`" :value="option" v-model="examStore.userAnswers[question.id]" class="mr-2" />
                {{ option }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <button @click="handleSubmit" class="mt-8 w-full px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
        Submit Test
      </button>
    </div>
  </div>
</template>
