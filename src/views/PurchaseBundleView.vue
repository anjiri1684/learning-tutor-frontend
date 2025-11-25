<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrencyStore } from '@/stores/currency';
import api from '@/services/api';

interface Bundle {
  ID: string;
  Name: string;
  Price: number;
  NumberOfClasses: number;
  language: {
    Name: string;
  };
}

const bundles = ref<Bundle[]>([]);
const isLoading = ref(true);
const showPaymentModal = ref(false);
const selectedBundle = ref<Bundle | null>(null);
const paymentProvider = ref('mpesa');
const mpesaPhoneNumber = ref('');
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });
const router = useRouter();
const currencyStore = useCurrencyStore();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const paypal: any;

const selectedBundlePriceKES = computed(() => {
  if (selectedBundle.value && currencyStore.usdToKesRate) {
    return selectedBundle.value.Price * currencyStore.usdToKesRate;
  }
  return 0;
});

onMounted(async () => {
  try {
    const response = await api.get('/bundles');
    bundles.value = response.data;
  } catch (error) {
    console.error('Failed to fetch bundles:', error);
    message.value = { type: 'error', text: 'Could not load bundles.' };
  } finally {
    isLoading.value = false;
  }
});

const openPaymentModal = (bundle: Bundle) => {
  selectedBundle.value = bundle;
  paymentProvider.value = 'mpesa';
  message.value = { type: '', text: '' };
  mpesaPhoneNumber.value = '';
  isSubmitting.value = false;
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const handleMpesaPurchase = async () => {
  if (!selectedBundle.value) return;
  isSubmitting.value = true;
  message.value = { type: '', text: '' };

  try {
    const response = await api.post(`/bundles/${selectedBundle.value.ID}/purchase`, {
      payment_provider: 'mpesa',
      mpesa_phone_number: mpesaPhoneNumber.value,
    });
    message.value = { type: 'success', text: response.data.customer_message || 'Request sent! Check your phone to complete payment.' };
    setTimeout(() => {
      closePaymentModal();
      router.push('/my-bundles');
    }, 4000);
  } catch (error: any) {
    message.value = { type: 'error', text: error.response?.data?.error || 'M-Pesa purchase failed.' };
  } finally {
    isSubmitting.value = false;
  }
};

const renderPayPalButton = () => {
  if (!selectedBundle.value) return;

  const buttonContainer = document.getElementById('paypal-button-container');
  if (buttonContainer) {
    buttonContainer.innerHTML = '';
    paypal.Buttons({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createOrder: async (_: any, actions: any) => {
        void(_);
        void(actions);
        try {
          const purchaseResponse = await api.post(`/bundles/${selectedBundle.value!.ID}/purchase`, {
            payment_provider: 'paypal',
          });
          const paymentId = purchaseResponse.data.payment_id;
          const orderResponse = await api.post(`/payments/paypal/create-order/${paymentId}`);
          return orderResponse.data.orderID;
        } catch (error) {
          console.log('Failed to initiate PayPal transaction:', error);
          message.value = { type: 'error', text: 'Could not initiate PayPal transaction.' };
          return '';
        }
      },
      // FIXED: Renamed second argument from '_' to 'actions' so void(actions) works
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onApprove: async (data: any, actions: any) => {
        void(actions);
        isSubmitting.value = true;
        message.value = { type: 'info', text: 'Finalizing payment...' };
        try {
          await api.post('/payments/paypal/capture-order', {
            orderID: data.orderID,
          });
          message.value = { type: 'success', text: 'Purchase successful! Your bundle is now active.' };
          setTimeout(() => {
            closePaymentModal();
            router.push('/my-bundles');
          }, 3000);
        } catch (error) {
          console.error('Failed to finalize payment:', error);
          message.value = { type: 'error', text: 'Failed to finalize payment.' };
        } finally {
          isSubmitting.value = false;
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        console.error('PayPal button error:', err);
        message.value = { type: 'error', text: 'An error occurred with the PayPal payment.' };
      }
    }).render('#paypal-button-container');
  }
};

const getPriceInKES = (priceUSD: number) => {
  if (currencyStore.usdToKesRate) {
    return priceUSD * currencyStore.usdToKesRate;
  }
  return 0;
};

const selectPayPal = () => {
  paymentProvider.value = 'paypal';
  nextTick(() => {
    renderPayPalButton();
  });
};
</script>

<template>
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Purchase a Class Bundle</h1>

      <div v-if="isLoading" class="flex justify-center items-center h-64 bg-gray-900/40 rounded-2xl border border-white/5">
         <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-400">Loading bundles...</span>
         </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="bundle in bundles"
          :key="bundle.ID"
          class="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
        >
          <div class="absolute -right-12 -top-12 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors"></div>

          <h2 class="text-2xl font-bold text-white mb-1 relative z-10">{{ bundle.Name }}</h2>
          <p class="text-sm text-purple-400 font-medium mb-6 relative z-10 uppercase tracking-wide">{{ bundle.language.Name }}</p>

          <div class="my-6 flex-grow border-t border-b border-white/5 py-6">
            <div class="flex items-baseline">
               <span class="text-4xl font-bold text-white">${{ bundle.Price.toFixed(2) }}</span>
               <span class="text-gray-400 ml-2">USD</span>
            </div>
            <p v-if="getPriceInKES(bundle.Price) > 0" class="text-sm text-gray-500 mt-1 font-mono">
              ≈ KES {{ getPriceInKES(bundle.Price).toFixed(2) }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-gray-300">
               <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span class="font-semibold">{{ bundle.NumberOfClasses }} Classes</span>
            </div>
          </div>

          <button
            @click="openPaymentModal(bundle)"
            class="w-full py-3 font-bold text-white bg-purple-600 rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-500 hover:shadow-purple-500/50 transition-all mt-auto"
          >
            Purchase Now
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-white">
        <div class="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl shadow-purple-900/40 w-full max-w-md overflow-hidden transform transition-all scale-100">
          <div class="p-8">
            <h3 class="text-xl font-bold text-white mb-2">Complete Purchase</h3>
            <p class="text-gray-400 text-sm mb-6">You are purchasing: <strong class="text-white">{{ selectedBundle?.Name }}</strong></p>

            <div v-if="message.text" :class="['p-4 text-sm rounded-xl mb-6 flex items-start gap-3 border',
              message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' :
              message.type === 'error' ? 'bg-red-900/30 border-red-500/30 text-red-300' :
              'bg-blue-900/30 border-blue-500/30 text-blue-300'
            ]">
               <svg v-if="message.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
               <svg v-if="message.type === 'error'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span>{{ message.text }}</span>
            </div>

            <div class="space-y-4">
              <div
                @click="paymentProvider = 'mpesa'"
                class="p-4 border rounded-xl cursor-pointer transition-all group bg-black/20"
                :class="paymentProvider === 'mpesa' ? 'border-green-500/50 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/10 hover:border-white/30'"
              >
                <div class="flex justify-between items-center mb-2">
                   <h3 class="font-bold text-green-400">Pay with M-Pesa</h3>
                   <span class="text-xs font-mono text-gray-400">KES {{ selectedBundlePriceKES.toFixed(2) }}</span>
                </div>

                <form v-if="paymentProvider === 'mpesa'" @submit.prevent="handleMpesaPurchase" class="mt-4 animate-fade-in" @click.stop>
                  <label for="phone" class="block text-xs font-medium text-gray-400 mb-1">Phone Number (254...)</label>
                  <div class="flex">
                    <input
                      v-model="mpesaPhoneNumber"
                      id="phone"
                      type="tel"
                      required
                      placeholder="254712345678"
                      class="flex-grow bg-black/50 border border-gray-700 text-white rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-600"
                    />
                    <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="px-4 font-bold text-white bg-green-600 rounded-r-lg hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed transition-all"
                    >
                      <span v-if="isSubmitting" class="flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span>
                      <span v-else>Pay</span>
                    </button>
                  </div>
                </form>
              </div>

              <div
                @click="selectPayPal"
                class="p-4 border rounded-xl cursor-pointer transition-all bg-black/20"
                :class="paymentProvider === 'paypal' ? 'border-blue-500/50 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/30'"
              >
                <div class="flex justify-between items-center">
                   <h3 class="font-bold text-blue-400">Pay with PayPal</h3>
                   <span class="text-xs font-mono text-gray-400">USD ${{ selectedBundle?.Price.toFixed(2) }}</span>
                </div>
                <div v-if="paymentProvider === 'paypal'" id="paypal-button-container" class="mt-4 animate-fade-in min-h-[40px]"></div>
              </div>
            </div>

            <div class="mt-8 pt-4 border-t border-gray-800 flex justify-end">
              <button @click="closePaymentModal" class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
