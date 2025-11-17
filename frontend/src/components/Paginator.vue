<template>
  <div
    class="flex flex-col md:flex-row justify-center items-center mt-6 gap-4 flex-wrap"
  >
    <!-- Page navigation buttons -->
    <div class="flex items-center gap-2">
      <button
        type="button"
        @click="handleClick(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <!-- Page numbers + ellipses -->
      <template v-for="item in pageItems" :key="item.key">
        <button
          v-if="item.type === 'page'"
          type="button"
          :aria-current="item.n === currentPage ? 'page' : undefined"
          @click="handleClick(item.n)"
          class="px-3 py-1 rounded-md text-sm border transition"
          :class="
            item.n === currentPage
              ? 'bg-byu-navy text-white border-byu-navy font-semibold'
              : 'bg-white border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white'
          "
        >
          {{ item.n }}
        </button>

        <span v-else class="px-2 text-gray-400">…</span>
      </template>

      <button
        type="button"
        @click="handleClick(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded-md text-sm bg-white border border-byu-navy text-byu-navy hover:bg-byu-navy hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>

    <!-- Go to page -->
    <div class="flex items-center gap-2">
      <label for="goToPage" class="text-sm text-byu-navy">Go to page:</label>
      <input
        id="goToPage"
        type="number"
        :min="1"
        :max="totalPages"
        v-model="inputPage"
        @keydown.enter="goToInputPage"
        class="w-20 border border-byu-navy text-byu-navy rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-navy"
      />
    </div>

    <!-- Page size selector -->
    <div class="flex items-center gap-2">
      <label for="pageSize" class="text-sm text-byu-navy font-normal"
        >Orders per page:</label
      >
      <select
        id="pageSize"
        :value="pageSize"
        @change="onPageSizeChange"
        class="border border-byu-navy text-byu-navy bg-white rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-byu-navy transition"
      >
        <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  pageSize: { type: Number, required: true },
});

/**
 * Emits:
 * - update:currentPage (so parent can use v-model:currentPage)
 * - update:pageSize    (so parent can use v-model:pageSize)
 * - page-change        (optional convenience event)
 */
const emit = defineEmits([
  "update:currentPage",
  "update:pageSize",
  "page-change",
]);

const inputPage = ref("");

// click a page button (prev/next or numeric)
const handleClick = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("update:currentPage", page);
    emit("page-change", page);
  }
};

// enter number in "Go to page"
const goToInputPage = () => {
  const n = Number(inputPage.value);
  if (Number.isFinite(n) && n >= 1 && n <= props.totalPages) {
    handleClick(n);
    inputPage.value = "";
  }
};

// change page size (reset to page 1 like your React code)
const onPageSizeChange = (e) => {
  const size = Number(e.target.value);
  if (Number.isFinite(size)) {
    emit("update:pageSize", size);
    emit("update:currentPage", 1);
    emit("page-change", 1);
  }
};

// build page buttons + ellipses (always show 1, last, current ±1)
const pageItems = computed(() => {
  const items = [];
  const { currentPage, totalPages } = props;
  const delta = 1;

  const shouldShow = (i) =>
    i === 1 ||
    i === totalPages ||
    (i >= currentPage - delta && i <= currentPage + delta);

  let lastWasEllipsis = false;
  for (let i = 1; i <= totalPages; i++) {
    if (shouldShow(i)) {
      items.push({ type: "page", n: i, key: `p-${i}` });
      lastWasEllipsis = false;
    } else if (!lastWasEllipsis) {
      items.push({ type: "ellipsis", key: `e-${i}` });
      lastWasEllipsis = true;
    }
  }
  return items;
});
</script>
