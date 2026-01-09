<template>
  <div class="w-full">
    <header class="w-screen bg-[#F6F6F8] text-[#141414] py-14 px-6">
      <div class="flex justify-center items-center">
        <h1 class="text-4xl font-bold tracking-widest">{{ title }}</h1>
      </div>
    </header>
  </div>
</template>

<script setup>
const { title } = defineProps({
  title: { type: String, required: true },
});
</script>
