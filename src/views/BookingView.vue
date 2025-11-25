<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useBookingStore } from '@/stores/booking';
import { useCurrencyStore } from '@/stores/currency';
import { useRouter } from 'vue-router';
import api from '@/services/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  <div class="min-h-screen bg-black text-white p-6 relative isolate overflow-hidden font-sans selection:bg-purple-500 selection:text-white">

    <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
      <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#a855f7] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>

    <div class="max-w-2xl mx-auto" v-if="bookingStore.selectedSlot">
      <h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] mb-8">Confirm Your Booking</h1>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl mb-8 relative overflow-hidden">
        <div class="absolute top-0 bottom-0 left-3/4 border-l-2 border-dashed border-gray-700 hidden sm:block"></div>
        <div class="absolute -top-3 left-3/4 w-6 h-6 bg-black rounded-full transform -translate-x-1/2 hidden sm:block"></div>
        <div class="absolute -bottom-3 left-3/4 w-6 h-6 bg-black rounded-full transform -translate-x-1/2 hidden sm:block"></div>

        <div class="flex flex-col sm:flex-row gap-8 relative z-10">
           <div class="flex-grow space-y-4">
              <div>
                 <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teacher</p>
                 <p class="text-xl font-bold text-white">{{ bookingStore.selectedTeacher?.user.full_name }}</p>
              </div>
              <div>
                 <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date</p>
                 <p class="text-gray-300 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {{ new Date(bookingStore.selectedSlot.start_time).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) }}
                 </p>
              </div>
              <div>
                 <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Time</p>
                 <p class="text-gray-300 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {{ formatTime(bookingStore.selectedSlot.start_time) }} - {{ formatTime(bookingStore.selectedSlot.end_time) }}
                 </p>
              </div>
           </div>

           <div class="sm:w-1/4 flex flex-col justify-center items-start sm:items-center sm:pl-8">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Price</p>
              <p class="text-3xl font-bold text-purple-400">${{ price.toFixed(2) }}</p>
              <p v-if="priceInKES > 0" class="text-xs text-gray-500 mt-1 font-mono">~ KES {{ priceInKES.toFixed(2) }}</p>
           </div>
        </div>
      </div>

      <div class="bg-gray-900/60 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl">
        <h2 class="text-xl font-bold text-white mb-6">Complete Payment</h2>

        <div v-if="message.text" :class="['p-4 mb-6 text-sm rounded-xl flex items-start gap-3 border',
          message.type === 'success' ? 'bg-green-900/30 border-green-500/30 text-green-300' :
          message.type === 'error' ? 'bg-red-900/30 border-red-500/30 text-red-300' :
          'bg-blue-900/30 border-blue-500/30 text-blue-300'
        ]">
           <svg v-if="message.type === 'success'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <svg v-if="message.type === 'error'" class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           <span>{{ message.text }}</span>
        </div>

        <div class="space-y-4">

          <div
            @click="paymentProvider = 'mpesa'"
            class="p-5 border rounded-xl cursor-pointer transition-all group bg-black/20"
            :class="paymentProvider === 'mpesa' ? 'border-green-500/50 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/10 hover:border-white/30'"
          >
            <div class="flex justify-between items-center mb-2">
               <h3 class="font-bold text-green-400 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span> M-Pesa
               </h3>
               <span class="text-xs font-mono text-gray-400">KES {{ priceInKES.toFixed(2) }}</span>
            </div>

            <form v-if="paymentProvider === 'mpesa'" @submit.prevent="handleMpesaBooking" class="mt-4 animate-fade-in" @click.stop>
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
            class="p-5 border rounded-xl cursor-pointer transition-all bg-black/20"
            :class="paymentProvider === 'paypal' ? 'border-blue-500/50 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/10 hover:border-white/30'"
          >
            <div class="flex justify-between items-center">
               <h3 class="font-bold text-blue-400 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-blue-500"></span> PayPal
               </h3>
               <span class="text-xs font-mono text-gray-400">USD ${{ price.toFixed(2) }}</span>
            </div>
            <div v-if="paymentProvider === 'paypal'" id="paypal-button-container" class="mt-4 animate-fade-in min-h-[40px]"></div>
          </div>

        </div>
      </div>
    </div>
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
