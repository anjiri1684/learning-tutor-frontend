<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useBookingStore } from '@/stores/booking';
import { useCurrencyStore } from '@/stores/currency';
import { useRouter } from 'vue-router';
import api from '@/services/api';

declare const paypal: any;

const bookingStore = useBookingStore();
const currencyStore = useCurrencyStore();
const router = useRouter();
const paymentProvider = ref('mpesa');
const mpesaPhoneNumber = ref('');
const isSubmitting = ref(false);
const message = ref({ type: '', text: '' });

const price = computed(() => {
  if (!bookingStore.selectedSlot || !bookingStore.languages) return 0;
  const language = bookingStore.languages.find(lang => lang.ID === bookingStore.selectedSlot!.language_id);
  return language ? language.PricePerSession : 0;
});

const priceInKES = computed(() => {
  if (price.value && currencyStore.usdToKesRate) {
    return price.value * currencyStore.usdToKesRate;
  }
  return 0;
});


onMounted(() => {
  if (!bookingStore.selectedSlot) {
    router.push('/dashboard/find-teachers');
  }
});

const handleMpesaBooking = async () => {
  isSubmitting.value = true;
  message.value = { type: '', text: '' };
  try {
    const response = await bookingStore.createBooking({
      payment_provider: 'mpesa',
      mpesa_phone_number: mpesaPhoneNumber.value
    });
    if (response.success) {
      message.value = { type: 'success', text: response.data.customer_message || 'Request sent! Check your phone to complete payment.' };
      setTimeout(() => router.push('/my-classes'), 4000);
    } else {
      throw new Error(response.message);
    }
  } catch (error: any) {
    message.value = { type: 'error', text: error.message || 'M-Pesa booking failed.' };
  } finally {
    isSubmitting.value = false;
  }
};

const renderPayPalButton = () => {
  const buttonContainer = document.getElementById('paypal-button-container');
  if (buttonContainer) {
    buttonContainer.innerHTML = '';
    paypal.Buttons({
      createOrder: async () => {
        message.value = { type: 'info', text: 'Connecting to PayPal...' };
        try {
          const bookingResponse = await bookingStore.createBooking({
            payment_provider: 'paypal'
          });
          if (!bookingResponse.success) {
            throw new Error(bookingResponse.message || 'Could not create booking record.');
          }
          const paymentId = bookingResponse.data.payment_id;

          const orderResponse = await api.post(`/payments/paypal/create-order/${paymentId}`);
          if (!orderResponse.data.orderID) {
            throw new Error('Failed to retrieve PayPal Order ID from server.');
          }
          return orderResponse.data.orderID;
        } catch (error: any) {
          message.value = { type: 'error', text: error.message || 'Could not initiate PayPal transaction.' };
          return '';
        }
      },
      onApprove: async (data: { orderID: string }) => {
        isSubmitting.value = true;
        message.value = { type: 'info', text: 'Finalizing payment...' };
        try {
          await api.post('/payments/paypal/capture-order', { orderID: data.orderID });
          message.value = { type: 'success', text: 'Booking successful! Your class is confirmed.' };
          setTimeout(() => router.push('/my-classes'), 3000);
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

const selectPayPal = () => {
  paymentProvider.value = 'paypal';
  nextTick(() => {
    renderPayPalButton();
  });
};

const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
</script>

<template>
  <div class="container mx-auto p-4 sm:p-8">
    <div v-if="bookingStore.selectedSlot" class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Confirm Your Booking</h1>

      <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-xl font-bold mb-2">Booking Details</h2>
            <div class="space-y-3 text-gray-700">
              <p><strong>Teacher:</strong> {{ bookingStore.selectedTeacher?.user.full_name }}</p>
              <p><strong>Date:</strong> {{ new Date(bookingStore.selectedSlot.start_time).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) }}</p>
              <p><strong>Time:</strong> {{ formatTime(bookingStore.selectedSlot.start_time) }} - {{ formatTime(bookingStore.selectedSlot.end_time) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Price</p>
            <p class="text-2xl font-bold text-indigo-600">${{ price.toFixed(2) }} USD</p>
            <p v-if="priceInKES > 0" class="text-md text-gray-500">approx. KES {{ priceInKES.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Complete Your Payment</h2>

        <div v-if="message.text" :class="['p-3 text-sm rounded-md my-4',
          {'bg-green-100 text-green-700': message.type === 'success'},
          {'bg-red-100 text-red-700': message.type === 'error'},
          {'bg-blue-100 text-blue-700': message.type === 'info'}
        ]">
          {{ message.text }}
        </div>

        <div class="space-y-4">
          <div @click="paymentProvider = 'mpesa'" class="p-4 border rounded-lg cursor-pointer" :class="paymentProvider === 'mpesa' ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-300'">
            <h3 class="font-semibold">Pay with M-Pesa (KES {{ priceInKES.toFixed(2) }})</h3>
            <form v-if="paymentProvider === 'mpesa'" @submit.prevent="handleMpesaBooking" class="mt-4">
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number (254...)</label>
              <div class="flex mt-1">
                <input v-model="mpesaPhoneNumber" id="phone" type="tel" required class="flex-grow p-2 border rounded-l-md" />
                <button type="submit" :disabled="isSubmitting" class="px-4 font-semibold text-white bg-green-600 rounded-r-md disabled:bg-green-400">
                  <span v-if="isSubmitting">...</span><span v-else>Pay</span>
                </button>
              </div>
            </form>
          </div>

          <div @click="selectPayPal" class="p-4 border rounded-lg cursor-pointer" :class="paymentProvider === 'paypal' ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-300'">
            <h3 class="font-semibold">Pay with PayPal (USD ${{ price.toFixed(2) }})</h3>
            <div v-if="paymentProvider === 'paypal'" id="paypal-button-container" class="mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
