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
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Exam Management</h1>

      <div class="border-b border-gray-800 mb-8">
        <nav class="flex space-x-6" aria-label="Tabs">
          <button
            @click="activeTab = 'questions'"
            :class="[
              'py-4 px-2 font-semibold text-sm border-b-2 outline-none transition-all duration-300',
              activeTab === 'questions'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            ]"
          >
            Question Bank
          </button>
          <button
            @click="activeTab = 'tests'"
            :class="[
              'py-4 px-2 font-semibold text-sm border-b-2 outline-none transition-all duration-300',
              activeTab === 'tests'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            ]"
          >
            Mock Tests
          </button>
        </nav>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading data...</span>
         </div>
      </div>

      <div v-else class="transition-opacity duration-300 ease-in-out">

        <div v-if="activeTab === 'questions'">
          <div class="flex justify-end mb-6">
            <button
              @click="openAddQuestionModal"
              class="px-6 py-2.5 font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
               Add New Question
            </button>
          </div>
          <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left whitespace-nowrap">
                <thead>
                   <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                      <th class="p-4 font-semibold w-1/2">Question Text</th>
                      <th class="p-4 font-semibold">Type</th>
                      <th class="p-4 font-semibold text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                   <tr v-for="q in questions" :key="q.ID" class="hover:bg-white/5 transition-colors group">
                      <td class="p-4 text-sm text-gray-300">
                         <span class="line-clamp-2 block">{{ q.question_text || 'No question text provided' }}</span>
                      </td>
                      <td class="p-4">
                         <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700 capitalize">
                            {{ q.question_type ? q.question_type.replace('_', ' ') : 'Unknown' }}
                         </span>
                      </td>
                      <td class="p-4 text-right space-x-3">
                         <button @click="openEditQuestionModal(q)" class="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
                         <button @click="handleDeleteQuestion(q.ID)" class="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </td>
                   </tr>
                   <tr v-if="questions.length === 0">
                      <td colspan="3" class="p-8 text-center text-gray-500">No questions found.</td>
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
               class="px-6 py-2.5 font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
               Create New Test
            </button>
          </div>
          <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-900/10 border border-white/10 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left whitespace-nowrap">
                <thead>
                   <tr class="bg-white/5 text-gray-300 text-sm uppercase tracking-wider border-b border-gray-700">
                      <th class="p-4 font-semibold">Title</th>
                      <th class="p-4 font-semibold text-center"># Questions</th>
                      <th class="p-4 font-semibold">Duration</th>
                      <th class="p-4 font-semibold text-right">Actions</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                   <tr v-for="t in tests" :key="t.ID" class="hover:bg-white/5 transition-colors group">
                      <td class="p-4 font-medium text-white">{{ t.Title }}</td>
                      <td class="p-4 text-center">
                         <span class="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700 font-mono">
                            {{ t.Questions ? t.Questions.length : 0 }}
                         </span>
                      </td>
                      <td class="p-4 text-gray-300">{{ t.DurationMinutes }} min</td>
                      <td class="p-4 text-right space-x-3">
                         <button @click="openEditTestModal(t)" class="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">Edit</button>
                         <button @click="handleDeleteTest(t.ID)" class="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </td>
                   </tr>
                   <tr v-if="tests.length === 0">
                      <td colspan="4" class="p-8 text-center text-gray-500">No mock tests found.</td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showQuestionModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-800">
             <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Edit Question' : 'Add New Question' }}</h3>
          </div>
          <div class="p-6 overflow-y-auto custom-scrollbar">
             <form @submit.prevent="handleSaveQuestion" class="space-y-5">
                <div>
                   <label class="block text-sm font-medium text-gray-300 mb-2">Question Text</label>
                   <textarea
                      v-model="currentQuestion.question_text"
                      required
                      rows="3"
                      class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                   ></textarea>
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-300 mb-2">Options (JSON Array)</label>
                   <textarea
                      v-model="currentQuestion.options"
                      required
                      rows="3"
                      class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-purple-300 font-mono text-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                      placeholder='["Option A", "Option B", "Correct Option C"]'
                   ></textarea>
                   <p class="mt-1 text-xs text-gray-500">Format must be a valid JSON array of strings.</p>
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-300 mb-2">Correct Answer</label>
                   <input
                      v-model="currentQuestion.correct_answer"
                      required
                      class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600"
                      placeholder="Matches one option exactly"
                   />
                </div>

                <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
                   <button type="button" @click="showQuestionModal=false" class="px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">Cancel</button>
                   <button type="submit" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all">Save Question</button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showTestModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-gray-800">
             <h3 class="text-xl font-bold text-white">{{ isEditing ? 'Edit Test' : 'Create New Test' }}</h3>
          </div>
          <div class="p-6 overflow-y-auto custom-scrollbar">
             <form @submit.prevent="handleSaveTest" class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-300 mb-2">Test Title</label>
                      <input v-model="currentTest.Title" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600" />
                   </div>
                   <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <input v-model="currentTest.Description" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600" />
                   </div>
                   <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                      <input v-model.number="currentTest.DurationMinutes" type="number" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-600" />
                   </div>
                </div>

                <div>
                   <label class="block text-sm font-medium text-gray-300 mb-2">Select Questions</label>
                   <div class="max-h-60 overflow-y-auto border border-gray-700 rounded-xl p-3 bg-black/30 custom-scrollbar space-y-2">
                      <div v-for="q in questions" :key="q.ID" class="flex items-start p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" @click="!currentTest.QuestionIDs?.includes(q.ID) ? currentTest.QuestionIDs?.push(q.ID) : currentTest.QuestionIDs = currentTest.QuestionIDs.filter(id => id !== q.ID)">
                         <input type="checkbox" :id="`q-${q.ID}`" :value="q.ID" v-model="currentTest.QuestionIDs" class="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900 pointer-events-none" />
                         <label :for="`q-${q.ID}`" class="ml-3 text-sm text-gray-300 cursor-pointer select-none">
                            {{ q.question_text || 'No text' }}
                         </label>
                      </div>
                   </div>
                   <p class="text-xs text-gray-500 mt-2 text-right">Selected: {{ currentTest.QuestionIDs?.length || 0 }}</p>
                </div>

                <div class="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
                   <button type="button" @click="showTestModal=false" class="px-4 py-2.5 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">Cancel</button>
                   <button type="submit" class="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all">Save Test</button>
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
