<template>
  <HeaderBar />
  <PageTitle v-if="pageTitle" :title="pageTitle" />
  <div class="container">
    <router-view />
  </div>
  <FooterBar />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import FooterBar from "./components/FooterBar.vue";
import HeaderBar from "./components/HeaderBar.vue";
import PageTitle from "./components/PageTitle.vue";

const route = useRoute();
const pageTitle = computed(() => route.meta?.pageTitle ?? "");
</script>

<style></style>
