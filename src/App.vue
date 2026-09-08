<!-- <script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useCurrencyStore } from './stores/currency';

const authStore = useAuthStore();
const currencyStore = useCurrencyStore();

onMounted(() => {
  currencyStore.fetchRate();
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>

<template>
  <div
    v-if="authStore.isImpersonating"
    class="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-black text-sm font-semibold py-2 px-4 flex items-center justify-center gap-3 shadow-lg"
  >
    <span>You're viewing as {{ authStore.user?.full_name }} ({{ authStore.user?.role }})</span>
    <button
      @click="authStore.stopImpersonation"
      class="px-3 py-1 bg-black text-yellow-400 rounded-lg font-bold hover:bg-gray-900 transition-colors"
    >
      Return to Admin
    </button>
  </div>
  <div :class="authStore.isImpersonating ? 'pt-9' : ''">
    <RouterView />
  </div>
</template>

<style scoped>
</style> -->

<template>
  <div class="scene">
    <div class="receipt">
      <div class="receipt__stamp" aria-hidden="true">UNREACHABLE</div>

      <header class="receipt__head">
        <p class="receipt__brand">SITE STATUS</p>
        <p class="receipt__sub">Automated notice — no action needed from you</p>
      </header>

      <dl class="receipt__lines">
        <div class="line">
          <dt>STATUS</dt>
          <dd>OFFLINE</dd>
        </div>
        <div class="line">
          <dt>REF</dt>
          <dd>{{ ref }}</dd>
        </div>
        <div class="line">
          <dt>TIME</dt>
          <dd>{{ time }}</dd>
        </div>
      </dl>

      <div class="receipt__tear" aria-hidden="true"></div>

      <p class="receipt__message">
        This site can't be reached right now. There's nothing to fix on your
        end — please
        <a class="receipt__link" :href="`mailto:${supportEmail}`">contact the developer or site owner</a>
        and include the reference number above.
      </p>

      <div class="receipt__barcode" aria-hidden="true">
        <span v-for="(w, i) in bars" :key="i" class="bar" :style="{ width: w + 'px' }"></span>
      </div>

      <p class="receipt__foot">Keep this reference for support.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref as vueRef, computed } from 'vue'

const supportEmail = 'info@phylanguagecenter.com'

const ref = vueRef(
  Math.random().toString(36).slice(2, 6).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase()
)

const time = new Date().toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})


const bars = computed(() => {
  const seed = ref.value.replace(/-/g, '')
  const widths = []
  for (let i = 0; i < 28; i++) {
    const code = seed.charCodeAt(i % seed.length)
    widths.push(2 + (code % 5))
  }
  return widths
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Archivo+Black&display=swap');

.scene {
  --ink: #10233b;
  --paper: #fbf8f2;
  --paper-line: #e4dcc8;
  --ink-text: #1f2a33;
  --muted: #7c8592;
  --stamp-red: #b23a2e;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink);
  background-image: radial-gradient(circle at 50% 0%, #17304d 0%, var(--ink) 60%);
  padding: 32px 16px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  box-sizing: border-box;
}

.receipt {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: var(--paper);
  color: var(--ink-text);
  padding: 36px 28px 28px;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  overflow: visible;
}

.receipt::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(-45deg, transparent 10px, var(--paper) 0),
    linear-gradient(45deg, transparent 10px, var(--paper) 0);
  background-size: 20px 20px;
  background-position: left top;
  background-repeat: repeat-x;
}

.receipt__stamp {
  position: absolute;
  top: 18px;
  right: -6px;
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(1rem, 4.5vw, 1.35rem);
  letter-spacing: 0.03em;
  color: var(--stamp-red);
  border: 3px solid var(--stamp-red);
  padding: 6px 10px;
  transform: rotate(-9deg);
  opacity: 0.85;
  mix-blend-mode: multiply;
  transform-origin: center;
  animation: stamp-in 420ms ease-out 80ms both;
}

@keyframes stamp-in {
  from {
    opacity: 0;
    transform: rotate(-9deg) scale(1.6);
  }
  to {
    opacity: 0.85;
    transform: rotate(-9deg) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .receipt__stamp {
    animation: none;
  }
}

.receipt__head {
  margin-bottom: 18px;
}

.receipt__brand {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}

.receipt__sub {
  margin: 4px 0 0;
  font-size: 0.72rem;
  color: var(--muted);
}

.receipt__lines {
  margin: 0 0 20px;
}

.line {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px dashed var(--paper-line);
  font-size: 0.82rem;
}

.line dt {
  color: var(--muted);
  font-weight: 500;
}

.line dd {
  margin: 0;
  font-weight: 700;
}

.receipt__tear {
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    var(--paper-line) 0,
    var(--paper-line) 6px,
    transparent 6px,
    transparent 12px
  );
  margin: 16px 0;
}

.receipt__message {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--ink-text);
  max-width: 34ch;
}

.receipt__link {
  color: var(--ink-text);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.receipt__link:focus-visible {
  outline: 2px solid var(--stamp-red);
  outline-offset: 2px;
}

.receipt__barcode {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 34px;
  margin: 22px 0 10px;
}

.bar {
  height: 100%;
  background: var(--ink-text);
}

.receipt__foot {
  margin: 0;
  font-size: 0.68rem;
  color: var(--muted);
  text-align: center;
}
</style>
