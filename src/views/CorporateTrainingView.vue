<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useCurrencyStore } from '@/stores/currency';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

interface CorporateTraining {
  ID: string;
  Name: string;
  Price: number;
  NumberOfClasses: number;
  description: string;
  language: { name: string };
}

interface Language {
  ID: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const PaystackPop: any;

const router = useRouter();
const currencyStore = useCurrencyStore();
const authStore = useAuthStore();

const trainings = ref<CorporateTraining[]>([]);
const languages = ref<Language[]>([]);
const isLoading = ref(true);

const isAuthenticated = computed(() => !!authStore.token);

const getPriceInKES = (priceUSD: number) =>
  currencyStore.usdToKesRate ? priceUSD * currencyStore.usdToKesRate : 0;

onMounted(async () => {
  try {
    const [trainingRes, langRes] = await Promise.allSettled([
      api.get('/corporate-trainings'),
      api.get('/languages'),
    ]);
    if (trainingRes.status === 'fulfilled') trainings.value = trainingRes.value.data;
    if (langRes.status === 'fulfilled') languages.value = langRes.value.data;
  } catch (error) {
    console.error('Failed to load corporate trainings:', error);
  } finally {
    isLoading.value = false;
  }
});

/* ----- Purchase flow (logged-in users, reuses the bundle purchase API) ----- */
const showPaymentModal = ref(false);
const selectedTraining = ref<CorporateTraining | null>(null);
const paymentProvider = ref('mpesa');
const mpesaPhoneNumber = ref('');
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });

const selectedPriceKES = computed(() =>
  selectedTraining.value ? getPriceInKES(selectedTraining.value.Price) : 0,
);

const openPaymentModal = (training: CorporateTraining) => {
  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: '/dashboard/corporate-training' } });
    return;
  }
  selectedTraining.value = training;
  paymentProvider.value = 'mpesa';
  mpesaPhoneNumber.value = '';
  message.value = { type: '', text: '' };
  isSubmitting.value = false;
  showPaymentModal.value = true;
};

const handleMpesaPurchase = async () => {
  if (!selectedTraining.value) return;
  isSubmitting.value = true;
  message.value = { type: '', text: '' };
  try {
    const res = await api.post(`/bundles/${selectedTraining.value.ID}/purchase`, {
      payment_provider: 'mpesa',
      mpesa_phone_number: mpesaPhoneNumber.value,
    });
    message.value = {
      type: 'success',
      text: res.data.customer_message || 'Request sent! Check your phone to complete payment.',
    };
    setTimeout(() => {
      showPaymentModal.value = false;
      router.push('/dashboard/my-bundles');
    }, 4000);
  } catch (error: any) {
    message.value = { type: 'error', text: error.response?.data?.error || 'M-Pesa purchase failed.' };
  } finally {
    isSubmitting.value = false;
  }
};

const handlePaystackPayment = async () => {
  if (!selectedTraining.value) return;
  if (!authStore.user?.email) {
    message.value = { type: 'error', text: 'User email not found. Please log in again.' };
    return;
  }
  isSubmitting.value = true;
  message.value = { type: '', text: '' };
  try {
    const res = await api.post(`/bundles/${selectedTraining.value.ID}/purchase`, {
      payment_provider: 'paystack',
    });
    const paymentId = res.data.payment_id;
    const handler = PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: authStore.user.email,
      amount: Math.round(selectedPriceKES.value * 100),
      currency: 'KES',
      ref: paymentId,
      onSuccess: async function (response: { reference: string }) {
        message.value = { type: 'info', text: 'Verifying payment...' };
        try {
          await api.post('/payments/paystack/verify', { reference: response.reference });
          message.value = { type: 'success', text: 'Purchase successful! Your training package is now active.' };
          setTimeout(() => {
            showPaymentModal.value = false;
            router.push('/dashboard/my-bundles');
          }, 3000);
        } catch {
          message.value = { type: 'error', text: 'Failed to verify payment.' };
        } finally {
          isSubmitting.value = false;
        }
      },
      onClose: () => {
        isSubmitting.value = false;
      },
    });
    handler.openIframe();
  } catch (error: any) {
    message.value = { type: 'error', text: error.response?.data?.error || 'Could not initiate Paystack transaction.' };
    isSubmitting.value = false;
  }
};

/* ----- Custom quote enquiry ----- */
const enquiry = ref({
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  team_size: 5,
  language_id: '',
  message: '',
});
const enquirySubmitting = ref(false);
const enquiryMessage = ref({ type: '', text: '' });

const submitEnquiry = async () => {
  enquirySubmitting.value = true;
  enquiryMessage.value = { type: '', text: '' };
  try {
    const payload = { ...enquiry.value, team_size: Number(enquiry.value.team_size) };
    const res = await api.post('/corporate-enquiries', payload);
    enquiryMessage.value = { type: 'success', text: res.data.message || 'Thank you. Our team will be in touch shortly.' };
    enquiry.value = { company_name: '', contact_name: '', email: '', phone: '', team_size: 5, language_id: '', message: '' };
  } catch (error: any) {
    enquiryMessage.value = { type: 'error', text: error.response?.data?.error || 'Failed to submit enquiry.' };
  } finally {
    enquirySubmitting.value = false;
  }
};

const benefits = [
  { title: 'Team-based curriculum', body: 'Lessons designed around your industry vocabulary and real workplace scenarios.' },
  { title: 'Progress reporting', body: 'Regular attendance and proficiency reports delivered to your L&D or HR team.' },
  { title: 'Flexible scheduling', body: 'Sessions arranged around your team’s working hours and time zones.' },
  { title: 'Dedicated tutors', body: 'Vetted, certified tutors assigned consistently to your cohort.' },
];
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-wide text-purple-400">For teams &amp; organizations</p>
        <h1 class="mt-2 text-4xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Corporate Language Training</h1>
        <p class="mt-4 text-lg text-gray-400">
          Upskill your workforce with structured group language programs. Choose a ready-made package
          below, or request a custom quote tailored to your team size and goals.
        </p>
      </div>

      <!-- Benefits -->
      <div class="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="b in benefits" :key="b.title" class="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <h3 class="font-bold text-white">{{ b.title }}</h3>
          <p class="mt-2 text-sm text-gray-400 leading-relaxed">{{ b.body }}</p>
        </div>
      </div>

      <!-- Packages -->
      <h2 class="mt-16 text-2xl font-bold text-white">Training Packages</h2>

      <div v-if="isLoading" class="mt-6 flex justify-center items-center h-48 bg-gray-900/40 rounded-2xl border border-white/5">
        <svg class="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <div v-else-if="trainings.length === 0" class="mt-6 bg-gray-900/40 rounded-2xl border border-white/5 p-8 text-center text-gray-400">
        No standard packages are published yet. Please request a custom quote below.
      </div>

      <div v-else class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="t in trainings"
          :key="t.ID"
          class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <h3 class="text-2xl font-bold text-white">{{ t.Name }}</h3>
          <p class="text-sm text-purple-400 font-medium mt-1 uppercase tracking-wide">{{ t.language?.name }}</p>
          <p v-if="t.description" class="mt-4 text-sm text-gray-400 leading-relaxed">{{ t.description }}</p>

          <div class="my-6 flex-grow border-t border-b border-white/5 py-6">
            <div class="flex items-baseline">
              <span class="text-4xl font-bold text-white">${{ t.Price.toFixed(2) }}</span>
              <span class="text-gray-400 ml-2">USD</span>
            </div>
            <p v-if="getPriceInKES(t.Price) > 0" class="text-sm text-gray-500 mt-1 font-mono">
              &#8776; KES {{ getPriceInKES(t.Price).toFixed(2) }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-gray-300">
              <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span class="font-semibold">{{ t.NumberOfClasses }} sessions</span>
            </div>
          </div>

          <button
            @click="openPaymentModal(t)"
            class="w-full py-3 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 transition-all mt-auto"
          >
            {{ isAuthenticated ? 'Purchase Package' : 'Sign in to Purchase' }}
          </button>
        </div>
      </div>

      <!-- Custom quote -->
      <div class="mt-16 bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10">
        <h2 class="text-2xl font-bold text-white">Request a Custom Quote</h2>
        <p class="mt-2 text-gray-400">Larger team or specific requirements? Tell us what you need and we&#8217;ll design a program for you.</p>

        <div
          v-if="enquiryMessage.text"
          :class="['mt-6 p-4 text-sm rounded-xl flex items-start gap-3 border',
            enquiryMessage.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' : 'bg-red-900/30 border-red-500/30 text-red-300']"
        >
          <span>{{ enquiryMessage.text }}</span>
        </div>

        <form @submit.prevent="submitEnquiry" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Company name</label>
            <input v-model="enquiry.company_name" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Contact name</label>
            <input v-model="enquiry.contact_name" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Work email</label>
            <input v-model="enquiry.email" type="email" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Phone <span class="text-gray-500">(optional)</span></label>
            <input v-model="enquiry.phone" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Team size</label>
            <input v-model.number="enquiry.team_size" type="number" min="1" required class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Language <span class="text-gray-500">(optional)</span></label>
            <select v-model="enquiry.language_id" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
              <option value="">Not sure yet</option>
              <option v-for="l in languages" :key="l.ID" :value="l.ID">{{ l.name }}</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-2">What are your goals?</label>
            <textarea v-model="enquiry.message" rows="4" class="w-full px-4 py-3 bg-black/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
          </div>
          <div class="md:col-span-2">
            <button type="submit" :disabled="enquirySubmitting" class="px-6 py-3 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed transition-all">
              {{ enquirySubmitting ? 'Submitting...' : 'Submit Enquiry' }}
            </button>
          </div>
        </form>
      </div>

      <p class="mt-8 text-sm text-gray-500">
        <RouterLink to="/" class="text-purple-400 hover:text-purple-300">&larr; Back to home</RouterLink>
      </p>
    </div>

    <!-- Payment modal -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden">
          <div class="p-8">
            <h3 class="text-xl font-bold text-white mb-2">Complete Purchase</h3>
            <p class="text-gray-400 text-sm mb-6">You are purchasing: <strong class="text-white">{{ selectedTraining?.Name }}</strong></p>

            <div
              v-if="message.text"
              :class="['p-4 text-sm rounded-xl mb-6 flex items-start gap-3 border',
                message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' :
                message.type === 'error' ? 'bg-red-900/30 border-red-500/30 text-red-300' :
                'bg-blue-900/30 border-blue-500/30 text-blue-300']"
            >
              <span>{{ message.text }}</span>
            </div>

            <div class="space-y-4">
              <div
                @click="paymentProvider = 'mpesa'"
                class="p-4 border rounded-xl cursor-pointer transition-all bg-black/20"
                :class="paymentProvider === 'mpesa' ? 'border-green-500/50 bg-green-900/10' : 'border-white/10 hover:border-white/30'"
              >
                <div class="flex justify-between items-center mb-2">
                  <h4 class="font-bold text-green-400">Pay with M-Pesa</h4>
                  <span class="text-xs font-mono text-gray-400">KES {{ selectedPriceKES.toFixed(2) }}</span>
                </div>
                <form v-if="paymentProvider === 'mpesa'" @submit.prevent="handleMpesaPurchase" class="mt-4" @click.stop>
                  <label class="block text-xs font-medium text-gray-400 mb-1">Phone Number (254...)</label>
                  <div class="flex">
                    <input v-model="mpesaPhoneNumber" type="tel" required placeholder="254712345678" class="flex-grow bg-black/50 border border-gray-700 text-white rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500" />
                    <button type="submit" :disabled="isSubmitting" class="px-4 font-bold text-white bg-green-600 rounded-r-lg hover:bg-green-500 disabled:bg-green-800 transition-all">Pay</button>
                  </div>
                </form>
              </div>

              <div
                @click="paymentProvider = 'paystack'"
                class="p-4 border rounded-xl cursor-pointer transition-all bg-black/20"
                :class="paymentProvider === 'paystack' ? 'border-blue-500/50 bg-blue-900/10' : 'border-white/10 hover:border-white/30'"
              >
                <div class="flex justify-between items-center">
                  <h4 class="font-bold text-blue-400">Pay with Paystack</h4>
                  <span class="text-xs font-mono text-gray-400">KES {{ selectedPriceKES.toFixed(2) }}</span>
                </div>
                <div v-if="paymentProvider === 'paystack'" class="mt-4">
                  <button @click.stop="handlePaystackPayment" :disabled="isSubmitting" class="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-blue-800 transition-all">
                    {{ isSubmitting ? 'Processing...' : 'Pay with Paystack' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-4 border-t border-gray-800 flex justify-end">
              <button @click="showPaymentModal = false" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
