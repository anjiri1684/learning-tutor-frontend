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
      onApprove: async (data: any, _: any) => {
        void(_);
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
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Purchase a Class Bundle</h1>

    <div v-if="isLoading">Loading bundles...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="bundle in bundles" :key="bundle.ID" class="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h2 class="text-xl font-bold text-indigo-700">{{ bundle.Name }}</h2>
        <p class="text-sm text-gray-500">{{ bundle.language.Name }}</p>
        <div class="my-4">
          <span class="text-4xl font-bold">${{ bundle.Price.toFixed(2) }} USD</span>
          <p v-if="getPriceInKES(bundle.Price) > 0" class="text-lg text-gray-500">
            approx. KES {{ getPriceInKES(bundle.Price).toFixed(2) }}
          </p>
          <span class="text-gray-500"> / {{ bundle.NumberOfClasses }} Classes</span>
        </div>
        <button @click="openPaymentModal(bundle)" class="mt-auto w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Purchase
        </button>
      </div>
    </div>

    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold">Complete Your Purchase</h3>
        <p class="mt-2 text-gray-600">You are purchasing: <strong>{{ selectedBundle?.Name }}</strong></p>

        <div v-if="message.text" :class="['p-3 text-sm rounded-md my-4',
          {'bg-green-100 text-green-700': message.type === 'success'},
          {'bg-red-100 text-red-700': message.type === 'error'},
          {'bg-blue-100 text-blue-700': message.type === 'info'}
        ]">
          {{ message.text }}
        </div>

        <div class="mt-6 space-y-4">
          <div @click="paymentProvider = 'mpesa'" class="p-4 border rounded-lg cursor-pointer" :class="paymentProvider === 'mpesa' ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-300'">
            <h3 class="font-semibold">Pay with M-Pesa (KES {{ selectedBundlePriceKES.toFixed(2) }})</h3>
            <form v-if="paymentProvider === 'mpesa'" @submit.prevent="handleMpesaPurchase" class="mt-4">
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number (254...)</label>
              <div class="flex mt-1">
                <input v-model="mpesaPhoneNumber" id="phone" type="tel" required class="flex-grow border rounded-l-md p-2" />
                <button type="submit" :disabled="isSubmitting" class="px-4 font-semibold text-white bg-green-600 rounded-r-md disabled:bg-green-400">
                  <span v-if="isSubmitting">...</span><span v-else>Pay</span>
                </button>
              </div>
            </form>
          </div>

          <div @click="selectPayPal" class="p-4 border rounded-lg cursor-pointer" :class="paymentProvider === 'paypal' ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-300'">
            <h3 class="font-semibold">Pay with PayPal (USD ${{ selectedBundle?.Price.toFixed(2) }})</h3>
            <div v-if="paymentProvider === 'paypal'" id="paypal-button-container" class="mt-4"></div>
          </div>
        </div>

        <div class="mt-6 text-right">
          <button @click="closePaymentModal" class="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
