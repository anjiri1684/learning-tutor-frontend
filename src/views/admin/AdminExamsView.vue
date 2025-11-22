<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';

// --- Interfaces ---
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

// --- Component State ---
const activeTab = ref('questions');
const questions = ref<Question[]>([]);
const tests = ref<MockTest[]>([]);
const isLoading = ref(true);

// Modal State
const showQuestionModal = ref(false);
const showTestModal = ref(false);
const isEditing = ref(false);

// Form Data
const currentQuestion = ref<Partial<Question>>({});
const currentTest = ref<TestForm>({ QuestionIDs: [] });

// --- Data Fetching ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    const [questionsRes, testsRes] = await Promise.all([
      api.get('/admin/exams/questions'),
      api.get('/admin/exams/tests'),
    ]);
    // Map backend response to match Question interface
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

// --- Question Methods ---
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
  // Map frontend question to backend format
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

// --- Test Methods ---
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
  <div>
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Exam Management</h1>

    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-4">
        <button @click="activeTab = 'questions'" :class="['py-2 px-4 font-semibold outline-none', activeTab === 'questions' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-500']">
          Question Bank
        </button>
        <button @click="activeTab = 'tests'" :class="['py-2 px-4 font-semibold outline-none', activeTab === 'tests' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-500']">
          Mock Tests
        </button>
      </nav>
    </div>

    <div v-if="isLoading">Loading data...</div>
    <div v-else>
      <div v-if="activeTab === 'questions'">
        <div class="flex justify-end mb-4"><button @click="openAddQuestionModal" class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900">Add New Question</button></div>
        <div class="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table class="w-full text-left">
            <thead><tr class="bg-gray-50 border-b"><th class="p-3 w-1/2">Question Text</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody><tr v-for="q in questions" :key="q.ID" class="border-b hover:bg-gray-50"><td class="p-3 text-sm text-gray-700">{{ q.question_text ? q.question_text.substring(0, 100) : 'No question text' }}<span v-if="q.question_text && q.question_text.length > 100">...</span></td><td class="capitalize text-sm">{{ q.question_type ? q.question_type.replace('_', ' ') : 'Unknown' }}</td><td class="space-x-3"><button @click="openEditQuestionModal(q)" class="text-indigo-600 hover:underline">Edit</button><button @click="handleDeleteQuestion(q.ID)" class="text-red-600 hover:underline">Delete</button></td></tr></tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'tests'">
        <div class="flex justify-end mb-4"><button @click="openAddTestModal" class="px-6 py-2 font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900">Create New Test</button></div>
        <div class="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table class="w-full text-left"><thead><tr class="bg-gray-50 border-b"><th class="p-3">Title</th><th># Questions</th><th>Duration</th><th>Actions</th></tr></thead><tbody><tr v-for="t in tests" :key="t.ID" class="border-b hover:bg-gray-50"><td class="p-3 font-semibold">{{ t.Title }}</td><td>{{ t.Questions.length }}</td><td>{{ t.DurationMinutes }} min</td><td class="space-x-3"><button @click="openEditTestModal(t)" class="text-indigo-600 hover:underline">Edit</button><button @click="handleDeleteTest(t.ID)" class="text-red-600 hover:underline">Delete</button></td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showQuestionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Question' : 'Add New Question' }}</h3>
        <form @submit.prevent="handleSaveQuestion" class="space-y-4">
          <div><label class="block text-sm font-medium">Question Text</label><textarea v-model="currentQuestion.question_text" required rows="3" class="w-full mt-1 p-2 border rounded-md"></textarea></div>
          <div><label class="block text-sm font-medium">Options (JSON Array)</label><textarea v-model="currentQuestion.options" required rows="3" class="w-full mt-1 p-2 border rounded-md font-mono" placeholder='["Option A", "Option B", "Correct Option C"]'></textarea></div>
          <div><label class="block text-sm font-medium">Correct Answer</label><input v-model="currentQuestion.correct_answer" required class="w-full mt-1 p-2 border rounded-md" placeholder="Correct Option C" /></div>
          <div class="mt-6 flex justify-end space-x-4"><button type="button" @click="showQuestionModal=false" class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button><button type="submit" class="px-4 py-2 bg-gray-800 text-white rounded-md">Save Question</button></div>
        </form>
      </div>
    </div>

    <div v-if="showTestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl">
        <h3 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Test' : 'Create New Test' }}</h3>
        <form @submit.prevent="handleSaveTest" class="space-y-4">
          <div><label class="block text-sm font-medium">Test Title</label><input v-model="currentTest.Title" required class="w-full mt-1 p-2 border rounded-md" /></div>
          <div><label class="block text-sm font-medium">Description</label><input v-model="currentTest.Description" class="w-full mt-1 p-2 border rounded-md" /></div>
          <div><label class="block text-sm font-medium">Duration (minutes)</label><input v-model.number="currentTest.DurationMinutes" type="number" required class="w-full mt-1 p-2 border rounded-md" /></div>
          <div>
            <label class="block text-sm font-medium mb-2">Select Questions</label>
            <div class="max-h-64 overflow-y-auto border rounded-md p-2 space-y-2">
              <div v-for="q in questions" :key="q.ID" class="flex items-center">
                <input type="checkbox" :id="`q-${q.ID}`" :value="q.ID" v-model="currentTest.QuestionIDs" class="h-4 w-4 rounded" />
                <label :for="`q-${q.ID}`" class="ml-2 text-sm text-gray-700">{{ q.question_text ? q.question_text.substring(0,80) : 'No question text' }}<span v-if="q.question_text && q.question_text.length > 80">...</span></label>
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-4"><button type="button" @click="showTestModal=false" class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button><button type="submit" class="px-4 py-2 bg-gray-800 text-white rounded-md">Save Test</button></div>
        </form>
      </div>
    </div>
  </div>
</template>
