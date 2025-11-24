<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const mobileMenuOpen = ref(false);
const openFaq = ref<number | null>(null);

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};

const faqs = [
  {q: 'How long is a lesson?', a: 'Standard lessons are 45 minutes long, giving you ample time for conversation, practice, and feedback. Extended 60-minute sessions are available upon request.'},
  {q: 'What if I miss a class?', a: 'You can request to reschedule a class up to 24 hours in advance via our app or website. Missed classes without prior notice may not be refundable.'},
  {q: 'What languages do you offer?', a: 'We support over 50 languages, including popular ones like English, Spanish, French, Mandarin, and Arabic, as well as less common languages like Swahili and Korean.'},
  {q: 'Are tutors certified?', a: 'Yes, all our tutors are certified professionals with teaching experience. They undergo a rigorous vetting process, including background checks.'},
  {q: 'Can I change tutors?', a: 'Absolutely! If a tutor isn\'t the right fit, you can switch at any time without penalties. We encourage trying multiple tutors.'},
  {q: 'What technical requirements are needed?', a: 'You need a stable internet connection, a webcam, and microphone. Our platform works on desktops, tablets, and mobiles via browser or our app.'}
];

const testimonials = [
  {
    content: "This platform changed everything. I went from knowing zero Spanish to holding full conversations in just three months. My tutor, Maria, was incredible!",
    author: "Ken Omondi",
    role: "Learning Spanish",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    content: "Preparing for my IELTS exam felt overwhelming, but the mock tests and targeted feedback from my tutor made all the difference. I got the score I needed!",
    author: "Aisha Njeri",
    role: "IELTS Student",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    content: "As a busy professional, the flexibility is a game-changer. I can book lessons early in the morning or late at night. It's the only way I could have learned French.",
    author: "John Smith",
    role: "Learning French",
    image: "https://randomuser.me/api/portraits/men/86.jpg"
  },
  {
    content: "The AI practice tools between lessons kept me engaged and helped reinforce what I learned. Highly recommend for anyone serious about languages.",
    author: "Maria Gonzalez",
    role: "Learning English",
    image: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    content: "From beginner to conversational in Mandarin in six months. The resource library is a goldmine! I'm finally ready for my business trip to Beijing.",
    author: "Li Wei",
    role: "Learning Mandarin",
    image: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    content: "Great community support and excellent tutors. I've made friends while learning German and we practice together every weekend.",
    author: "Anna Müller",
    role: "Learning German",
    image: "https://randomuser.me/api/portraits/women/28.jpg"
  },
];
</script>

<template>
  <div class="bg-white min-h-screen font-sans text-gray-900">

    <header class="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <nav class="flex items-center justify-between p-4 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="#" class="-m-1.5 p-1.5 flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">L</div>
            <span class="text-xl font-bold tracking-tight text-gray-900">LanguageTutor</span>
          </a>
        </div>
        <div class="flex lg:hidden">
          <button type="button" @click="mobileMenuOpen = !mobileMenuOpen" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 transition">
            <span class="sr-only">Open main menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" v-if="!mobileMenuOpen" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" v-else />
            </svg>
          </button>
        </div>
        <div class="hidden lg:flex lg:gap-x-10">
          <a href="#how-it-works" class="text-sm font-medium leading-6 text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#features" class="text-sm font-medium leading-6 text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#testimonials" class="text-sm font-medium leading-6 text-gray-600 hover:text-indigo-600 transition-colors">Testimonials</a>
          <a href="#pricing" class="text-sm font-medium leading-6 text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
           <RouterLink to="/login" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 py-2">Log in</RouterLink>
           <RouterLink to="/register" class="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all">Get Started</RouterLink>
        </div>
      </nav>

      <div v-if="mobileMenuOpen" class="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg z-40">
        <div class="flex flex-col px-6 py-6 space-y-4">
          <a href="#how-it-works" @click="mobileMenuOpen = false" class="block text-base font-semibold leading-7 text-gray-900 hover:text-indigo-600">How It Works</a>
          <a href="#features" @click="mobileMenuOpen = false" class="block text-base font-semibold leading-7 text-gray-900 hover:text-indigo-600">Features</a>
          <a href="#testimonials" @click="mobileMenuOpen = false" class="block text-base font-semibold leading-7 text-gray-900 hover:text-indigo-600">Testimonials</a>
          <a href="#pricing" @click="mobileMenuOpen = false" class="block text-base font-semibold leading-7 text-gray-900 hover:text-indigo-600">Pricing</a>
          <hr class="border-gray-100 my-2">
          <div class="flex flex-col gap-3">
            <RouterLink to="/login" @click="mobileMenuOpen = false" class="text-base font-semibold leading-7 text-gray-900">Log in</RouterLink>
            <RouterLink to="/register" @click="mobileMenuOpen = false" class="inline-flex justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-indigo-500">Get started</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main class="isolate pt-14">
      <div class="relative isolate overflow-hidden bg-white">
        <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"></div>
        </div>

        <div class="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-32">
          <div class="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-center">
            <div class="max-w-2xl text-center lg:text-left">
              <div class="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10 mb-6">
                 New: AI Conversation Partner 🚀
              </div>
              <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Master Any Language, <br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">One Conversation at a Time</span>
              </h1>
              <p class="mt-6 text-lg leading-8 text-gray-600">Connect with certified tutors from 50+ countries. Personalized lessons, flexible scheduling, and a proven path to fluency await you.</p>
              <div class="mt-10 flex items-center justify-center lg:justify-start gap-x-6">
                <RouterLink to="/register" class="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 hover:-translate-y-1 transition-all duration-200">Start Learning</RouterLink>
                <a href="#how-it-works" class="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 group">
                  Learn more <span aria-hidden="true" class="group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            <div class="mt-16 sm:mt-24 lg:mt-0 relative">



               <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80" alt="Students learning together" class="rounded-2xl shadow-2xl ring-1 ring-gray-900/10 w-full object-cover h-[400px] lg:h-[500px]" />
               <div class="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl ring-1 ring-gray-900/5 animate-bounce" style="animation-duration: 3s;">
                  <div class="flex items-center gap-3">
                     <div class="bg-green-100 p-2 rounded-full text-green-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                     </div>
                     <div>
                        <p class="text-sm font-bold text-gray-900">Lesson Complete!</p>
                        <p class="text-xs text-gray-500">You mastered 15 words.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <section id="how-it-works" class="py-24 sm:py-32 bg-gray-50">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-base font-semibold leading-7 text-indigo-600 uppercase tracking-wide">Simple Process</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Start Learning in 3 Steps</p>
          </div>

          <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div class="relative pl-16 group">
                <div class="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">1</div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                    <dt class="text-xl font-bold leading-7 text-gray-900">Find Your Tutor</dt>
                    <dd class="mt-2 text-base leading-7 text-gray-600">Browse certified tutors from 50 countries. Filter by language, price, and reviews to find your perfect match.</dd>
                </div>
              </div>
              <div class="relative pl-16 group">
                <div class="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">2</div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                    <dt class="text-xl font-bold leading-7 text-gray-900">Book Instantly</dt>
                    <dd class="mt-2 text-base leading-7 text-gray-600">Select a time on the calendar. Secure payments via M-Pesa, PayPal, or card with easy rescheduling.</dd>
                </div>
              </div>
              <div class="relative pl-16 group">
                <div class="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">3</div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                    <dt class="text-xl font-bold leading-7 text-gray-900">Start Speaking</dt>
                    <dd class="mt-2 text-base leading-7 text-gray-600">Join your video lesson. Get personalized feedback, recording access, and track your progress.</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="py-24 sm:py-32 bg-white">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center mb-16">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to succeed</h2>
            <p class="mt-6 text-lg leading-8 text-gray-600">Powerful tools designed to accelerate your fluency.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="flex flex-col p-8 bg-gray-50 rounded-3xl transition-all hover:-translate-y-1 hover:bg-indigo-50/50 hover:shadow-lg">
              <div class="h-10 w-10 text-indigo-600 mb-6 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">HD Video Lessons</h3>
              <p class="mt-2 text-gray-600 leading-relaxed">Crystal clear video calls with integrated screen sharing and digital whiteboards.</p>
            </div>

             <div class="flex flex-col p-8 bg-gray-50 rounded-3xl transition-all hover:-translate-y-1 hover:bg-indigo-50/50 hover:shadow-lg">
              <div class="h-10 w-10 text-indigo-600 mb-6 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Smart Tracking</h3>
              <p class="mt-2 text-gray-600 leading-relaxed">Visualize your improvements with detailed analytics and achievement milestones.</p>
            </div>

             <div class="flex flex-col p-8 bg-gray-50 rounded-3xl transition-all hover:-translate-y-1 hover:bg-indigo-50/50 hover:shadow-lg">
              <div class="h-10 w-10 text-indigo-600 mb-6 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Resource Vault</h3>
              <p class="mt-2 text-gray-600 leading-relaxed">Unlimited access to worksheets, vocabulary lists, and audio files.</p>
            </div>

             <div class="flex flex-col p-8 bg-gray-50 rounded-3xl transition-all hover:-translate-y-1 hover:bg-indigo-50/50 hover:shadow-lg">
              <div class="h-10 w-10 text-indigo-600 mb-6 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">AI Chatbot</h3>
              <p class="mt-2 text-gray-600 leading-relaxed">Practice your conversation skills 24/7 with our advanced AI tutor.</p>
            </div>

             <div class="flex flex-col p-8 bg-gray-50 rounded-3xl transition-all hover:-translate-y-1 hover:bg-indigo-50/50 hover:shadow-lg">
              <div class="h-10 w-10 text-indigo-600 mb-6 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0-12l5 5m5-5l-5 5" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Community</h3>
              <p class="mt-2 text-gray-600 leading-relaxed">Join language clubs and forums to connect with fellow learners.</p>
            </div>

             <div class="flex flex-col p-8 bg-gray-50 rounded-3xl transition-all hover:-translate-y-1 hover:bg-indigo-50/50 hover:shadow-lg">
              <div class="h-10 w-10 text-indigo-600 mb-6 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900">Verified Pros</h3>
              <p class="mt-2 text-gray-600 leading-relaxed">Every tutor is vetted, interviewed, and certified before joining.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" class="py-24 sm:py-32 bg-white relative">
        <div class="absolute inset-0 -z-10 overflow-hidden">
          <svg class="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" stroke-width="0" fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
          </svg>
        </div>

        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-xl text-center">
            <h2 class="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Community Stories</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loved by 10,000+ Learners</p>
          </div>

          <div class="mx-auto mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            <div v-for="(testimonial, index) in testimonials" :key="index"
                 class="relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

              <div class="mb-4 text-indigo-200">
                <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0547 15.3738 14.5029 16.9602 14.3496C17.2001 14.3262 17.3828 14.1256 17.3828 13.8863V12.1934C17.3828 12.0169 17.2657 11.8617 17.0934 11.8211C15.3533 11.4116 14.4393 9.68943 14.4393 7.82812V6C14.4393 4.89543 15.3348 4 16.4393 4H19.4393C20.5439 4 21.4393 4.89543 21.4393 6V11C21.4393 15.655 17.8681 21 14.017 21ZM5 21L5 18C5 16.0547 6.35683 14.5029 7.94317 14.3496C8.1831 14.3262 8.36579 14.1256 8.36579 13.8863V12.1934C8.36579 12.0169 8.24867 11.8617 8.07636 11.8211C6.33629 11.4116 5.42229 9.68943 5.42229 7.82812V6C5.42229 4.89543 6.31772 4 7.42229 4H10.4223C11.5269 4 12.4223 4.89543 12.4223 6V11C12.4223 15.655 8.85107 21 5 21Z"/></svg>
              </div>

              <blockquote class="text-gray-900 leading-relaxed">
                <p>“{{ testimonial.content }}”</p>
              </blockquote>

              <div class="mt-6 flex items-center gap-x-4 border-t border-gray-100 pt-4">
                <img class="h-10 w-10 rounded-full bg-gray-50 object-cover ring-2 ring-white" :src="testimonial.image" :alt="testimonial.author">
                <div>
                  <div class="font-semibold text-gray-900">{{ testimonial.author }}</div>
                  <div class="text-sm leading-6 text-gray-600">{{ testimonial.role }}</div>
                </div>
                <div class="ml-auto flex gap-0.5 text-yellow-400">
                   <svg v-for="i in 5" :key="i" class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
        <div class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.500),theme(colors.gray.900))] opacity-20"></div>

        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Transparent Pricing</h2>
            <p class="mt-6 text-lg leading-8 text-gray-300">No hidden fees. Just world-class learning.</p>
          </div>
          <div class="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3 lg:items-center">

            <div class="bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 ring-1 ring-white/10 xl:p-10">
              <h3 class="text-lg font-semibold leading-8 text-white">Pay As You Go</h3>
              <p class="mt-4 text-sm leading-6 text-gray-300">For flexible learners.</p>
              <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-white">$10</span>
                <span class="text-sm font-semibold leading-6 text-gray-300">/lesson</span>
              </p>
              <RouterLink to="/register" class="mt-6 block rounded-full bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-white/20 transition">Get started</RouterLink>
              <ul class="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                <li class="flex gap-x-3">✓ Single 45-min lesson</li>
                <li class="flex gap-x-3">✓ Any language</li>
                <li class="flex gap-x-3">✓ Basic resources</li>
              </ul>
            </div>

            <div class="bg-indigo-600 rounded-3xl p-8 ring-1 ring-indigo-500 xl:p-10 relative shadow-2xl scale-105 transform z-10">
              <div class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-indigo-600 uppercase tracking-wide">Most Popular</div>
              <h3 class="text-lg font-semibold leading-8 text-white">Class Bundles</h3>
              <p class="mt-4 text-sm leading-6 text-indigo-100">For committed students.</p>
              <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-white">Save 20%</span>
              </p>
              <RouterLink to="/bundles" class="mt-6 block rounded-full bg-white px-3 py-2 text-center text-sm font-semibold text-indigo-600 hover:bg-gray-50 transition shadow-md">Get Bundles</RouterLink>
              <ul class="mt-8 space-y-3 text-sm leading-6 text-white">
                <li class="flex gap-x-3">✓ 5, 10, or 20 pack</li>
                <li class="flex gap-x-3">✓ Lock in rates</li>
                <li class="flex gap-x-3">✓ Priority scheduling</li>
                <li class="flex gap-x-3">✓ Bonus materials</li>
              </ul>
            </div>

            <div class="bg-gray-800/60 backdrop-blur-sm rounded-3xl p-8 ring-1 ring-white/10 xl:p-10">
              <h3 class="text-lg font-semibold leading-8 text-white">Monthly Sub</h3>
              <p class="mt-4 text-sm leading-6 text-gray-300">For rapid fluency.</p>
              <p class="mt-6 flex items-baseline gap-x-1">
                <span class="text-4xl font-bold tracking-tight text-white">$99</span>
                <span class="text-sm font-semibold leading-6 text-gray-300">/month</span>
              </p>
              <RouterLink to="/subscribe" class="mt-6 block rounded-full bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-white/20 transition">Subscribe</RouterLink>
              <ul class="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                <li class="flex gap-x-3">✓ Unlimited lessons</li>
                <li class="flex gap-x-3">✓ All AI tools included</li>
                <li class="flex gap-x-3">✓ Personal plan</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <section id="faq" class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 class="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Common Questions</h2>

          <div class="mt-10 space-y-4">
             <div v-for="(item, index) in faqs" :key="index" class="border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden transition-all duration-300" :class="{'ring-2 ring-indigo-500 bg-white': openFaq === index}">
                <button @click="toggleFaq(index)" class="flex w-full items-start justify-between text-left p-6 focus:outline-none">
                  <span class="text-base font-semibold leading-7 text-gray-900">{{ item.q }}</span>
                  <span class="ml-6 flex h-7 items-center transition-transform duration-300" :class="{'rotate-45': openFaq === index}">
                    <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </span>
                </button>
                <div v-show="openFaq === index" class="px-6 pb-6 pr-12 text-gray-600 leading-7">
                  {{ item.a }}
                </div>
             </div>
          </div>
        </div>
      </section>

      <section class="bg-indigo-600 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8 relative z-10">
          <div class="max-w-2xl">
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to get fluent?</h2>
            <p class="mt-4 text-lg text-indigo-100">Join thousands of learners today and unlock your language potential.</p>
          </div>
          <div class="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <RouterLink to="/register" class="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all">Create free account</RouterLink>
            <a href="#contact" class="text-sm font-semibold leading-6 text-white hover:text-indigo-100">Contact us <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>
