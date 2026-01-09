<template>
  <div class="w-full sticky top-0 z-50">
    <!-- Top navy bar -->
    <header
      class="relative w-full md:w-screen bg-byu-navy text-white py-4 shadow-md"
    >
      <div class="px-6 flex items-center justify-between">
        <!-- Left: BYU Logo + Title -->
        <div class="flex items-center">
          <a
            ref="logoRef"
            href="https://www.byu.edu"
            target="_blank"
            rel="noopener noreferrer"
            class="mr-4 border-r-[1px] border-byu-royal"
          >
            <img
              src="@/assets/BYU_monogram_white.svg"
              alt="BYU"
              class="h-10 w-auto"
            />
          </a>

          <h1 class="pl-4 text-2xl">ECE Secretary Dashboard</h1>
        </div>

        <!-- Right: user + mobile hamburger -->
        <div class="flex items-center gap-3 pr-6 text-base font-b">
          <span class="hidden sm:inline">{{ user.name }}</span>
          <span
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-white text-byu-navy shadow-sm ring-1 ring-white/20"
            aria-hidden="true"
          >
            <i class="pi pi-user text-[16px] leading-none"></i>
          </span>

          <button
            type="button"
            @click="onSignOut"
            class="hidden sm:inline text-white/90 underline underline-offset-4 decoration-white/60 hover:text-white hover:decoration-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--byu-navy)] active:opacity-80"
          >
            Sign out
          </button>

          <!-- Mobile menu toggle -->
          <button
            class="inline-flex items-center justify-center p-2 rounded md:hidden hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            :aria-expanded="mobileOpen.toString()"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            @click="mobileOpen = !mobileOpen"
          >
            <!-- close icon -->
            <svg
              v-if="mobileOpen"
              viewBox="0 0 24 24"
              class="h-5 w-5 fill-current"
            >
              <path
                d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.18 12 2.89 5.71 4.3 4.3 10.59 10.6 16.89 4.3z"
              />
            </svg>
            <!-- hamburger icon -->
            <svg v-else viewBox="0 0 24 24" class="h-5 w-5 fill-current">
              <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
          </button>
        </div>
      </div>
      <!-- crisp bottom hairline like your "want" -->
      <div class="absolute inset-x-0 bottom-0 h-px bg-black/10"></div>
    </header>

    <!-- Mobile dropdown -->
    <div
      v-if="mobileOpen"
      id="mobile-menu"
      class="md:hidden w-full bg-white text-byu-navy shadow border-t"
    >
      <nav class="flex flex-col py-2">
        <RouterLink
          to="/test"
          class="px-6 py-4 hover:bg-gray-50"
          @click="mobileOpen = false"
        >
          Test Link
        </RouterLink>
      </nav>
    </div>

    <!-- White nav bar – desktop only -->
    <nav class="hidden md:block w-full bg-white text-byu-navy shadow">
      <div
        class="flex text-base font-medium px-6"
        :style="{ paddingLeft: navPadLeft + 'px' }"
      >
        <RouterLink
          :to="{ name: 'Home' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Home
        </RouterLink>
        <RouterLink
          :to="{ name: 'Students' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Students
        </RouterLink>
        <RouterLink
          :to="{ name: 'Lockers' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Lockers
        </RouterLink>
        <RouterLink
          :to="{ name: 'DoorCodes' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Door Codes
        </RouterLink>
        <RouterLink
          :to="{ name: 'Desks' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Desks
        </RouterLink>
        <RouterLink
          :to="{ name: 'Keys' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Keys
        </RouterLink>
        <RouterLink
          :to="{ name: 'AdminPanel' }"
          class="px-8 py-4 hover:bg-[#FAFAFA] rounded-md block nav-link-hover"
        >
          Admin Panel
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { RouterLink } from "vue-router";

const user = { name: "Demo User" };
const mobileOpen = ref(false);

// measure logo block so desktop white links align with title
const logoRef = ref(null);
const navPadLeft = ref(128); // fallback

const updatePad = () => {
  const el = logoRef.value;
  if (!el) return;
  const rem =
    parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const mr4 = 1 * rem; // matches mr-4 spacing on the logo link
  navPadLeft.value = el.offsetWidth + mr4;
};

onMounted(async () => {
  await nextTick();
  updatePad();
  window.addEventListener("resize", updatePad);
});
onBeforeUnmount(() => window.removeEventListener("resize", updatePad));
</script>
