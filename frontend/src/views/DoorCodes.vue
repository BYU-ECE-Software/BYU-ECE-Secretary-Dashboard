<template>
  <main
    class="min-h-screen flex flex-col items-center px-4 pt-16 pb-10 bg-gradient-to-br from-byu-royal/10 via-white to-byu-navy/10"
  >
    <!-- WIP badge -->
    <span
      class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-byu-navy/90 text-white text-xs tracking-wide uppercase mb-4 shadow-sm"
    >
      <span class="h-2 w-2 rounded-full bg-amber-300 animate-pulse"></span>
      Work in progress
    </span>

    <!-- Big title -->
    <h1
      class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-byu-navy text-center tracking-tight"
    >
      {{ pageName }} page is
      <span class="text-byu-royal"> coming soon </span> ✨
    </h1>

    <!-- Fun subtext -->
    <p class="mt-4 text-base sm:text-lg text-byu-navy/80 text-center max-w-xl">
      The wizards are still wiring up this section of the Secretary Dashboard.
      Check back later for more magical features. 🧙‍♀️⚡
    </p>

    <!-- Little footer note -->
    <p class="mt-6 text-xs text-gray-500 text-center">
      (In the meantime, feel free to explore the other pages that are already
      live.)
    </p>
  </main>
</template>

<script setup>
const pageName = "Door Codes"; // Change per page: "Lockers", "Keys", etc.
</script>
