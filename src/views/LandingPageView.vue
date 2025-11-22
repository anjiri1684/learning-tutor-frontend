<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const mobileMenuOpen = ref(false);
const openFaq = ref<number | null>(null);

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};
</script>

<template>
  <div class="bg-white min-h-screen">
    <header class="fixed inset-x-0 top-0 z-50 bg-white shadow-md transition-shadow duration-300">
      <nav class="flex items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="#" class="-m-1.5 p-1.5 flex items-center">
            <span class="text-2xl font-bold text-indigo-600">LanguageTutor</span>
          </a>
        </div>
        <div class="flex lg:hidden">
          <button type="button" @click="mobileMenuOpen = !mobileMenuOpen" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
            <span class="sr-only">Open main menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" v-if="!mobileMenuOpen" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" v-else />
            </svg>
          </button>
        </div>
        <div class="hidden lg:flex lg:gap-x-12">
          <a href="#how-it-works" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">How It Works</a>
          <a href="#features" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Features</a>
          <a href="#testimonials" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Testimonials</a>
          <a href="#pricing" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Pricing</a>
          <a href="#contact" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Contact</a>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <RouterLink to="/login" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Log in <span aria-hidden="true">&rarr;</span></RouterLink>
        </div>
      </nav>
      <div v-if="mobileMenuOpen" class="lg:hidden bg-white shadow-md">
        <div class="flex flex-col px-6 py-4 space-y-4">
          <a href="#how-it-works" @click="mobileMenuOpen = false" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">How It Works</a>
          <a href="#features" @click="mobileMenuOpen = false" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">Features</a>
          <a href="#testimonials" @click="mobileMenuOpen = false" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">Testimonials</a>
          <a href="#pricing" @click="mobileMenuOpen = false" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">Pricing</a>
          <a href="#contact" @click="mobileMenuOpen = false" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">Contact</a>
          <RouterLink to="/login" @click="mobileMenuOpen = false" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600">Log in <span aria-hidden="true">&rarr;</span></RouterLink>
        </div>
      </div>
    </header>

    <main class="isolate pt-20">
      <div class="relative pt-14 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden">
        <div class="absolute inset-0 opacity-50" style="background-image: url('https://via.placeholder.com/1920x1080?text=Language+Learning'); background-size: cover; background-position: center;"></div>
        <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 relative z-10">
          <div class="text-center px-4">
            <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">Master Any Language, One Conversation at a Time</h1>
            <p class="mt-6 text-lg leading-8 text-gray-600 max-w-xl mx-auto">Connect with the best language tutors from around the world. Personalized lessons, flexible scheduling, interactive tools, and a proven path to fluency await you.</p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <RouterLink to="/register" class="rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-colors">Get started</RouterLink>
              <a href="#how-it-works" class="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition-colors">Learn more <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </div>
      </div>

      <section id="how-it-works" class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl lg:text-center">
            <h2 class="text-base font-semibold leading-7 text-indigo-600">Simple & Effective</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Start Learning in 3 Easy Steps</p>
            <p class="mt-6 text-lg leading-8 text-gray-600">Our streamlined process makes it effortless to begin your language journey, whether you're a beginner or advanced learner.</p>
          </div>
          <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl class="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
              <div class="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xl">1</div>
                  Find Your Tutor
                </dt>
                <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p class="flex-auto">Browse our diverse community of certified tutors from over 50 countries. Filter by language, expertise level, price, availability, and student reviews to find your perfect match.</p>
                </dd>
              </div>
              <div class="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xl">2</div>
                  Book a Lesson
                </dt>
                <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p class="flex-auto">Select a time that fits your schedule using our intuitive calendar. Book instantly with secure payments via M-Pesa, PayPal, or credit card. Get reminders and easy rescheduling options.</p>
                </dd>
              </div>
              <div class="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xl">3</div>
                  Start Learning
                </dt>
                <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p class="flex-auto">Join your live, one-on-one video lesson via our integrated platform. Receive personalized feedback, access interactive learning materials, recorded sessions, and progress tracking anytime.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="features" class="bg-gray-50 py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl lg:text-center">
            <h2 class="text-base font-semibold leading-7 text-indigo-600">Powerful Tools</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Features That Accelerate Your Learning</p>
            <p class="mt-6 text-lg leading-8 text-gray-600">Discover the advanced features that make LanguageTutor the ultimate platform for language mastery.</p>
          </div>
          <div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div class="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-600 mb-4">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Interactive Video Lessons</h3>
              <p class="mt-2 text-base text-gray-600">High-quality video calls with screen sharing, whiteboards, and real-time collaboration tools.</p>
            </div>
            <div class="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-600 mb-4">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Progress Tracking Dashboard</h3>
              <p class="mt-2 text-base text-gray-600">Monitor your improvement with detailed reports, goal setting, and achievement badges.</p>
            </div>
            <div class="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-600 mb-4">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0-12l5 5m5-5l-5 5" /></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Resource Library</h3>
              <p class="mt-2 text-base text-gray-600">Access thousands of worksheets, audio files, vocabulary lists, and cultural insights.</p>
            </div>
            <div class="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-600 mb-4">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 4.96L15.5 10l4.5-4.5" /></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">AI-Powered Practice</h3>
              <p class="mt-2 text-base text-gray-600">Use our AI chatbot for daily conversation practice between lessons.</p>
            </div>
            <div class="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-600 mb-4">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Community Forums</h3>
              <p class="mt-2 text-base text-gray-600">Join language-specific groups to practice with peers and share experiences.</p>
            </div>
            <div class="flex flex-col p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="text-indigo-600 mb-4">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Certified Tutors</h3>
              <p class="mt-2 text-base text-gray-600">All tutors are vetted, certified, and native speakers with years of teaching experience.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-xl text-center">
            <h2 class="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Testimonials</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Our Students Say</p>
            <p class="mt-6 text-lg leading-8 text-gray-600">Hear from real learners who have transformed their language skills with LanguageTutor.</p>
          </div>
          <div class="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div class="text-center">
                <figure class="rounded-2xl bg-gray-50 p-8 text-sm leading-6 shadow-sm hover:shadow-md transition-shadow">
                  <blockquote class="text-gray-900"><p>“This platform changed everything. I went from knowing zero Spanish to holding full conversations in just three months. My tutor, Maria, was incredible!”</p></blockquote>
                  <figcaption class="mt-6 flex items-center justify-center gap-x-4"><img class="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt=""><div class="font-semibold text-gray-900">Ken Omondi</div></figcaption>
                </figure>
              </div>
              <div class="text-center">
                <figure class="rounded-2xl bg-gray-50 p-8 text-sm leading-6 shadow-sm hover:shadow-md transition-shadow">
                  <blockquote class="text-gray-900"><p>“Preparing for my IELTS exam felt overwhelming, but the mock tests and targeted feedback from my tutor made all the difference. I got the score I needed for university!”</p></blockquote>
                  <figcaption class="mt-6 flex items-center justify-center gap-x-4"><img class="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt=""><div class="font-semibold text-gray-900">Aisha Njeri</div></figcaption>
                </figure>
              </div>
              <div class="text-center">
                <figure class="rounded-2xl bg-gray-50 p-8 text-sm leading-6 shadow-sm hover:shadow-md transition-shadow">
                  <blockquote class="text-gray-900"><p>“As a busy professional, the flexibility is a game-changer. I can book lessons early in the morning or late at night. It's the only way I could have learned French.”</p></blockquote>
                  <figcaption class="mt-6 flex items-center justify-center gap-x-4"><img class="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt=""><div class="font-semibold text-gray-900">John Smith</div></figcaption>
                </figure>
              </div>
              <div class="text-center">
                <figure class="rounded-2xl bg-gray-50 p-8 text-sm leading-6 shadow-sm hover:shadow-md transition-shadow">
                  <blockquote class="text-gray-900"><p>“The AI practice tools between lessons kept me engaged and helped reinforce what I learned. Highly recommend for anyone serious about languages.”</p></blockquote>
                  <figcaption class="mt-6 flex items-center justify-center gap-x-4"><img class="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt=""><div class="font-semibold text-gray-900">Maria Gonzalez</div></figcaption>
                </figure>
              </div>
              <div class="text-center">
                <figure class="rounded-2xl bg-gray-50 p-8 text-sm leading-6 shadow-sm hover:shadow-md transition-shadow">
                  <blockquote class="text-gray-900"><p>“From beginner to conversational in Mandarin in six months. The resource library is a goldmine!”</p></blockquote>
                  <figcaption class="mt-6 flex items-center justify-center gap-x-4"><img class="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt=""><div class="font-semibold text-gray-900">Li Wei</div></figcaption>
                </figure>
              </div>
              <div class="text-center">
                <figure class="rounded-2xl bg-gray-50 p-8 text-sm leading-6 shadow-sm hover:shadow-md transition-shadow">
                  <blockquote class="text-gray-900"><p>“Great community support and excellent tutors. I've made friends while learning German.”</p></blockquote>
                  <figcaption class="mt-6 flex items-center justify-center gap-x-4"><img class="h-10 w-10 rounded-full" src="https://via.placeholder.com/40" alt=""><div class="font-semibold text-gray-900">Anna Müller</div></figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" class="bg-gray-900 py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, Transparent Pricing</h2>
            <p class="mt-6 text-lg leading-8 text-gray-300">Choose a plan that works for you. Pay per lesson, save with bundles, or subscribe for unlimited access. No hidden fees.</p>
          </div>
          <div class="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-x-6">
            <div class="relative bg-white p-8 shadow-xl rounded-2xl lg:z-10">
              <h3 class="text-lg font-semibold leading-8 text-indigo-600">Pay As You Go</h3>
              <p class="mt-4 text-base leading-7 text-gray-600">Perfect for trying out a new tutor or for a flexible schedule.</p>
              <p class="mt-6 flex items-baseline gap-x-1"><span class="text-4xl font-bold tracking-tight text-gray-900">Starting from $10</span><span class="text-sm font-semibold leading-6 text-gray-600">/lesson</span></p>
              <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li class="flex gap-x-3">✓ Pay per individual 45-minute lesson</li>
                <li class="flex gap-x-3">✓ Choose any tutor, any language</li>
                <li class="flex gap-x-3">✓ Ideal for occasional learners</li>
                <li class="flex gap-x-3">✓ Access to basic resources</li>
              </ul>
              <RouterLink to="/register" class="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">Get started today</RouterLink>
            </div>
            <div class="relative bg-indigo-600 p-8 shadow-xl rounded-2xl text-white lg:z-20 ring-2 ring-white">
              <h3 class="text-lg font-semibold leading-8">Class Bundles</h3>
              <p class="mt-4 text-base leading-7">Save money by purchasing a package of classes upfront. Most popular choice.</p>
              <p class="mt-6 flex items-baseline gap-x-1"><span class="text-4xl font-bold tracking-tight">Save up to 20%</span></p>
              <ul role="list" class="mt-8 space-y-3 text-sm leading-6">
                <li class="flex gap-x-3">✓ Packages of 5, 10, or 20 classes</li>
                <li class="flex gap-x-3">✓ Lock in a great rate with your favorite tutor</li>
                <li class="flex gap-x-3">✓ The best value for committed students</li>
                <li class="flex gap-x-3">✓ Priority scheduling and bonus resources</li>
              </ul>
              <RouterLink to="/bundles" class="mt-8 block rounded-md bg-white text-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm hover:bg-gray-100 transition-colors">Explore Bundles</RouterLink>
            </div>
            <div class="relative bg-white p-8 shadow-xl rounded-2xl lg:z-10">
              <h3 class="text-lg font-semibold leading-8 text-indigo-600">Monthly Subscription</h3>
              <p class="mt-4 text-base leading-7 text-gray-600">Unlimited lessons for serious learners aiming for rapid progress.</p>
              <p class="mt-6 flex items-baseline gap-x-1"><span class="text-4xl font-bold tracking-tight text-gray-900">$99</span><span class="text-sm font-semibold leading-6 text-gray-600">/month</span></p>
              <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li class="flex gap-x-3">✓ Unlimited 45-minute lessons</li>
                <li class="flex gap-x-3">✓ Access to all tutors and languages</li>
                <li class="flex gap-x-3">✓ Full resource library and AI tools</li>
                <li class="flex gap-x-3">✓ Personalized learning plans</li>
              </ul>
              <RouterLink to="/subscribe" class="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">Subscribe Now</RouterLink>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" class="bg-white py-24 sm:py-32">
        <div class="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 class="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
          <p class="mt-6 text-center text-lg leading-8 text-gray-600">Find answers to common questions about our platform and services.</p>
          <dl class="mt-10 space-y-6 divide-y divide-gray-200">
            <div v-for="(item, index) in [
              {q: 'How long is a lesson?', a: 'Standard lessons are 45 minutes long, giving you ample time for conversation, practice, and feedback. Extended 60-minute sessions are available upon request.'},
              {q: 'What if I miss a class?', a: 'You can request to reschedule a class up to 24 hours in advance via our app or website. Missed classes without prior notice may not be refundable, but we offer flexible policies for emergencies.'},
              {q: 'What languages do you offer?', a: 'We support over 50 languages, including popular ones like English, Spanish, French, Mandarin, and Arabic, as well as less common languages like Swahili, Korean, and Russian.'},
              {q: 'Are tutors certified?', a: 'Yes, all our tutors are certified professionals with teaching experience. They undergo a rigorous vetting process, including background checks and demo lessons.'},
              {q: 'Can I change tutors?', a: 'Absolutely! If a tutor isn\'t the right fit, you can switch at any time without penalties. We encourage trying multiple tutors to find your ideal match.'},
              {q: 'What technical requirements are needed?', a: 'You need a stable internet connection, a webcam, and microphone. Our platform works on desktops, tablets, and mobiles via browser or our app.'}
            ]" :key="index" class="pt-6">
              <dt>
                <button @click="toggleFaq(index)" type="button" class="flex w-full items-start justify-between text-left text-gray-900">
                  <span class="text-base font-semibold leading-7">{{ item.q }}</span>
                  <span class="ml-6 flex h-7 items-center text-xl">{{ openFaq === index ? '-' : '+' }}</span>
                </button>
              </dt>
              <dd v-if="openFaq === index" class="mt-2 pr-12">
                <p class="text-base leading-7 text-gray-600">{{ item.a }}</p>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="bg-indigo-700">
        <div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to get started?<br>Join thousands of learners today and unlock your language potential.</h2>
          <div class="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <RouterLink to="/register" class="rounded-md bg-white px-4 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors">Create an account</RouterLink>
            <a href="#contact" class="text-sm font-semibold leading-6 text-white hover:text-gray-200 transition-colors">Contact us <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
