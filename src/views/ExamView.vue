<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

interface Question {
  ID: string;
  question_text?: string;
  question_type: string;
  options: string;
  correct_answer: string;
}
interface MockTest {
  ID: string;
  Title: string;
  Description: string;
  DurationMinutes: number;
  Questions: Question[];
}

interface TestForm extends Partial<MockTest> {
  QuestionIDs: string[];
}

const activeTab = ref('questions');
const questions = ref<Question[]>([]);
const tests = ref<MockTest[]>([]);
const isLoading = ref(true);

const showQuestionModal = ref(false);
const showTestModal = ref(false);
const isEditing = ref(false);

const currentQuestion = ref<Partial<Question>>({});
const currentTest = ref<TestForm>({ QuestionIDs: [] });

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [questionsRes, testsRes] = await Promise.all([
      api.get('/admin/exams/questions'),
      api.get('/admin/exams/tests'),
    ]);
    questions.value = questionsRes.data.map((q: any) => ({
      ID: q.ID,
      question_text: q.QuestionText,
      question_type: q.QuestionType,
      options: q.Options,
      correct_answer: q.CorrectAnswer,
    }));
    tests.value = testsRes.data;
  } catch (error) {
    console.error("Failed to fetch exam data:", error);
  } finally {
    isLoading.value = false;
  }
};
onMounted(fetchData);

const openAddQuestionModal = () => {
  isEditing.value = false;
  currentQuestion.value = { question_type: 'multiple_choice', options: '[]' };
  showQuestionModal.value = true;
};
const openEditQuestionModal = (q: Question) => {
  isEditing.value = true;
  currentQuestion.value = { ...q };
  showQuestionModal.value = true;
};
const handleSaveQuestion = async () => {
  const payload = {
    ID: currentQuestion.value.ID,
    QuestionText: currentQuestion.value.question_text,
    QuestionType: currentQuestion.value.question_type,
    Options: currentQuestion.value.options,
    CorrectAnswer: currentQuestion.value.correct_answer,
  };
  try {
    if (isEditing.value) {
      await api.put(`/admin/exams/questions/${currentQuestion.value.ID}`, payload);
    } else {
      await api.post('/admin/exams/questions', payload);
    }
    showQuestionModal.value = false;
    await fetchData();
  } catch (error) {
    console.error('Failed to save question:', error);
    alert('Failed to save question.');
  }
};
const handleDeleteQuestion = async (id: string) => {
  if (confirm('Are you sure? This may affect existing tests.')) {
    await api.delete(`/admin/exams/questions/${id}`);
    await fetchData();
  }
};

const openAddTestModal = () => {
  isEditing.value = false;
  currentTest.value = { Title: '', Description: '', DurationMinutes: 10, QuestionIDs: [] };
  showTestModal.value = true;
};
const openEditTestModal = (t: MockTest) => {
  isEditing.value = true;
  currentTest.value = { ...t, QuestionIDs: t.Questions.map(q => q.ID) };
  showTestModal.value = true;
};
const handleSaveTest = async () => {
  const payload = {
    title: currentTest.value.Title,
    description: currentTest.value.Description,
    duration_minutes: Number(currentTest.value.DurationMinutes),
    question_ids: currentTest.value.QuestionIDs,
  };
  try {
    if (isEditing.value) {
      await api.put(`/admin/exams/tests/${currentTest.value.ID}`, payload);
    } else {
      await api.post('/admin/exams/tests', payload);
    }
    showTestModal.value = false;
    await fetchData();
  } catch (error) {
    console.error('Failed to save test:', error);
    alert('Failed to save test.');
  }
};
const handleDeleteTest = async (id: string) => {
  if (confirm('Are you sure you want to delete this test?')) {
    await api.delete(`/admin/exams/tests/${id}`);
    await fetchData();
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">

      <div class="mb-12 relative">
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          EXAM MANAGER
        </h1>
        <div class="h-1 w-32 bg-purple-500 mt-4 rounded-full shadow-[0_0_15px_#a855f7]"></div>
      </div>

      <div class="border-b border-gray-800 mb-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'questions'"
            :class="[
              'py-4 px-2 font-bold text-base border-b-2 outline-none transition-all duration-300 tracking-wide',
              activeTab === 'questions'
                ? 'border-purple-500 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            ]"
          >
            QUESTION BANK
          </button>
          <button
            @click="activeTab = 'tests'"
            :class="[
              'py-4 px-2 font-bold text-base border-b-2 outline-none transition-all duration-300 tracking-wide',
              activeTab === 'tests'
                ? 'border-purple-500 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            ]"
          >
            MOCK TESTS
          </button>
        </nav>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400 font-mono text-sm uppercase tracking-widest">System Processing...</span>
         </div>
      </div>

      <div v-else class="transition-opacity duration-300 ease-in-out">

        <div v-if="activeTab === 'questions'">
          <div class="flex justify-end mb-6">
            <button
              @click="openAddQuestionModal"
              class="px-6 py-3 font-bold text-white bg-purple-600 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-purple-400/20"
            >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
               ADD QUESTION
            </button>
          </div>
          <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left whitespace-nowrap">
                <thead>
                   <tr class="bg-black/40 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700">
                      <th class="p-5 font-bold w-1/2">Question Text</th>
                      <th class="p-5 font-bold">Type</th>
                      <th class="p-5 font-bold text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                   <tr v-for="q in questions" :key="q.ID" class="hover:bg-white/5 transition-colors group">
                      <td class="p-5 text-sm text-gray-300 font-medium">
                         <span class="line-clamp-2 block">{{ q.question_text || 'No question text provided' }}</span>
                      </td>
                      <td class="p-5">
                         <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-800 text-gray-300 border border-gray-600">
                            {{ q.question_type ? q.question_type.replace('_', ' ') : 'Unknown' }}
                         </span>
                      </td>
                      <td class="p-5 text-right space-x-3">
                         <button @click="openEditQuestionModal(q)" class="text-sm font-bold text-purple-400 hover:text-white transition-colors">EDIT</button>
                         <button @click="handleDeleteQuestion(q.ID)" class="text-sm font-bold text-red-500 hover:text-white transition-colors">DELETE</button>
                      </td>
                   </tr>

                   <tr v-if="questions.length === 0">
                      <td colspan="3" class="p-12">
                         <div class="flex flex-col items-center justify-center text-center">
                            <div class="w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-4 shadow-inner">
                               <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h3 class="text-xl font-bold text-white mb-2">No Questions Added</h3>
                            <p class="text-gray-500 max-w-sm">The question bank is currently empty. Start by adding your first question above.</p>
                         </div>
                      </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'tests'">
          <div class="flex justify-end mb-6">
            <button
               @click="openAddTestModal"
               class="px-6 py-3 font-bold text-white bg-purple-600 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-purple-400/20"
            >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
               CREATE TEST
            </button>
          </div>
          <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left whitespace-nowrap">
                <thead>
                   <tr class="bg-black/40 text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700">
                      <th class="p-5 font-bold">Title</th>
                      <th class="p-5 font-bold text-center">Questions</th>
                      <th class="p-5 font-bold">Duration</th>
                      <th class="p-5 font-bold text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                   <tr v-for="t in tests" :key="t.ID" class="hover:bg-white/5 transition-colors group">
                      <td class="p-5 font-bold text-white text-lg">{{ t.Title }}</td>
                      <td class="p-5 text-center">
                         <span class="bg-gray-800 text-purple-300 text-xs px-3 py-1 rounded border border-purple-500/30 font-mono shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                            {{ t.Questions ? t.Questions.length : 0 }}
                         </span>
                      </td>
                      <td class="p-5 text-gray-400 font-mono">{{ t.DurationMinutes }} min</td>
                      <td class="p-5 text-right space-x-3">
                         <button @click="openEditTestModal(t)" class="text-sm font-bold text-purple-400 hover:text-white transition-colors">EDIT</button>
                         <button @click="handleDeleteTest(t.ID)" class="text-sm font-bold text-red-500 hover:text-white transition-colors">DELETE</button>
                      </td>
                   </tr>

                   <tr v-if="tests.length === 0">
                      <td colspan="4" class="p-12">
                         <div class="flex flex-col items-center justify-center text-center">
                            <div class="w-20 h-20 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center mb-4 shadow-inner">
                               <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <h3 class="text-xl font-bold text-white mb-2">No Mock Tests</h3>
                            <p class="text-gray-500 max-w-sm">You haven't created any mock tests yet. Combine your questions into a test to get started.</p>
                         </div>
                      </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showQuestionModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.2)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-800 bg-black/20">
             <h3 class="text-xl font-black tracking-wide text-white uppercase">{{ isEditing ? 'Edit Question' : 'Add New Question' }}</h3>
          </div>
          <div class="p-8 overflow-y-auto custom-scrollbar">
             <form @submit.prevent="handleSaveQuestion" class="space-y-6">
                <div>
                   <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Question Text</label>
                   <textarea
                      v-model="currentQuestion.question_text"
                      required
                      rows="3"
                      class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                   ></textarea>
                </div>
                <div>
                   <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Options (JSON Array)</label>
                   <textarea
                      v-model="currentQuestion.options"
                      required
                      rows="3"
                      class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-purple-300 font-mono text-sm rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                      placeholder='["Option A", "Option B", "Correct Option C"]'
                   ></textarea>
                   <p class="mt-2 text-xs text-gray-500 font-medium">Format: ["A", "B", "C"]</p>
                </div>
                <div>
                   <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correct Answer</label>
                   <input
                      v-model="currentQuestion.correct_answer"
                      required
                      class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                      placeholder="Exact match of the correct option"
                   />
                </div>

                <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
                   <button type="button" @click="showQuestionModal=false" class="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">CANCEL</button>
                   <button type="submit" class="px-8 py-3 text-sm font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all">SAVE</button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showTestModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.2)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-800 bg-black/20">
             <h3 class="text-xl font-black tracking-wide text-white uppercase">{{ isEditing ? 'Edit Test' : 'Create New Test' }}</h3>
          </div>
          <div class="p-8 overflow-y-auto custom-scrollbar">
             <form @submit.prevent="handleSaveTest" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="md:col-span-2">
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Test Title</label>
                      <input v-model="currentTest.Title" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600" />
                   </div>
                   <div class="md:col-span-2">
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                      <input v-model="currentTest.Description" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600" />
                   </div>
                   <div>
                      <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duration (minutes)</label>
                      <input v-model.number="currentTest.DurationMinutes" type="number" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600" />
                   </div>
                </div>

                <div>
                   <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Questions</label>
                   <div class="max-h-60 overflow-y-auto border border-gray-700 rounded-xl p-4 bg-black/30 custom-scrollbar space-y-2">
                      <div v-for="q in questions" :key="q.ID" class="flex items-start p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-700" @click="!currentTest.QuestionIDs?.includes(q.ID) ? currentTest.QuestionIDs?.push(q.ID) : currentTest.QuestionIDs = currentTest.QuestionIDs.filter(id => id !== q.ID)">
                         <div class="flex items-center h-5">
                            <input type="checkbox" :id="`q-${q.ID}`" :value="q.ID" v-model="currentTest.QuestionIDs" class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 pointer-events-none" />
                         </div>
                         <label :for="`q-${q.ID}`" class="ml-3 text-sm text-gray-300 cursor-pointer select-none font-medium leading-snug">
                            {{ q.question_text || 'No text' }}
                         </label>
                      </div>
                   </div>
                   <p class="text-xs text-purple-400 mt-2 text-right font-bold">SELECTED: {{ currentTest.QuestionIDs?.length || 0 }}</p>
                </div>

                <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
                   <button type="button" @click="showTestModal=false" class="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors">CANCEL</button>
                   <button type="submit" class="px-8 py-3 text-sm font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all">SAVE</button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>
