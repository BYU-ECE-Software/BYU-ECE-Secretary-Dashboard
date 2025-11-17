<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium mt-2 text-byu-navy">
      {{ label }}
    </label>

    <!-- A) SEARCH MODE (only when not creating and nothing selected) -->
    <div v-if="!creating && !selectedLocal" class="relative" ref="anchorRef">
      <SearchInput
        ref="searchRef"
        v-model="query"
        :placeholder="placeholder"
        type="search"
        widthClass="w-full"
        autocomplete="off"
        @focus="openList"
        @input="debouncedSearch"
        @keydown.enter.prevent
        @keydown.esc="showList = false"
      />
    </div>

    <!-- B) SELECTED EXISTING -->
    <PersonCard v-else-if="selectedLocal" :person="selectedLocal">
      <template #actions>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
          @click="clearToSearch"
        >
          Clear
        </button>
      </template>
    </PersonCard>

    <!-- C1) CREATE NEW FORM (draft not confirmed yet) -->
    <div
      v-else-if="creating && !confirmedDraft"
      class="border border-byu-navy rounded-lg p-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
    >
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-byu-navy">First name *</label>
        <input
          v-model="draft.firstName"
          type="text"
          placeholder="First name"
          class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-byu-navy">Last name *</label>
        <input
          v-model="draft.lastName"
          type="text"
          placeholder="Last name"
          class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
        />
      </div>
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="text-sm font-medium text-byu-navy">Email *</label>
        <input
          v-model="draft.email"
          type="email"
          placeholder="Email"
          class="border border-byu-navy rounded-md px-3 py-2 text-sm w-full bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
        />
      </div>

      <div class="sm:col-span-2 flex items-center justify-between pt-1">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
          @click="cancelCreateBackToSearch"
        >
          Clear
        </button>

        <button
          type="button"
          class="px-2.5 py-1 rounded-lg bg-byu-royal text-white text-sm hover:bg-[#003C9E] shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!isDraftValid"
          @click="confirmDraft"
        >
          Confirm &amp; continue
        </button>
      </div>
    </div>

    <!-- C2) CREATE NEW (confirmed) → summary card -->
    <PersonCard v-else :person="draft">
      <template #actions>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
          @click="clearToSearch"
        >
          Clear
        </button>
      </template>
    </PersonCard>

    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>

  <!-- === Teleported dropdown === -->
  <Teleport to="body">
    <div
      v-if="showList && (results.length || queryTrimmed)"
      ref="menuRef"
      :style="menuStyle"
      class="border rounded-lg bg-white shadow-lg overflow-hidden"
      role="listbox"
    >
      <!-- Results -->
      <template v-if="results.length">
        <div class="max-h-60 overflow-y-auto divide-y overscroll-contain">
          <button
            v-for="u in results"
            :key="u.id"
            type="button"
            class="w-full text-left px-3.5 py-2 hover:bg-gray-50 cursor-pointer"
            @click="select(u)"
          >
            <div class="text-sm font-medium text-byu-navy">
              {{ u.firstName }} {{ u.lastName }}
            </div>
            <div class="text-xs text-gray-500">{{ u.email }}</div>
          </button>
        </div>
      </template>

      <!-- No results -->
      <template v-else>
        <div class="p-2">
          <div class="text-sm text-gray-600">No professors found.</div>
          <div class="mt-3">
            <button
              type="button"
              class="inline-flex items-center px-2.5 py-1 rounded-lg bg-byu-royal text-white text-sm hover:bg-[#003C9E] shadow-sm transition cursor-pointer"
              @click="startCreate"
            >
              + Add new professor
            </button>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import {
  ref,
  watch,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import SearchInput from "../SearchInput.vue";
import PersonCard from "./PersonCard.vue";
import { searchUsers } from "@/api/user";

const props = defineProps({
  label: { type: String, default: "Select Professor" },
  placeholder: { type: String, default: "Search professors…" },
  positionId: { type: Number, default: 2 },
});

const emit = defineEmits(["update:selected", "update:newPerson"]);

/* --- State --- */
const query = ref("");
const results = ref([]);
const showList = ref(false);
const selectedLocal = ref(null);

const creating = ref(false);
const confirmedDraft = ref(false);
const error = ref(null);
const draft = ref({ firstName: "", lastName: "", email: "" });

const searchRef = ref(null);
const anchorRef = ref(null);
const menuRef = ref(null);
const menuStyle = ref({});

const queryTrimmed = computed(() => query.value.trim().length > 0);
const isDraftValid = computed(
  () =>
    draft.value.firstName.trim() &&
    draft.value.lastName.trim() &&
    draft.value.email.trim()
);

/* --- Positioning / Teleport helpers --- */
function positionMenu() {
  const el = anchorRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  // Keep at least 8px from viewport edges
  const vw = window.innerWidth;
  const maxWidth = Math.min(r.width, vw - 16);
  menuStyle.value = {
    position: "fixed",
    left: `${Math.max(8, Math.min(r.left, vw - 8 - maxWidth))}px`,
    top: `${r.bottom + 4}px`,
    width: `${maxWidth}px`,
    zIndex: 1000,
  };
}

function openList() {
  showList.value = true;
  nextTick(positionMenu);
}

/* Reposition on scroll/resize while open */
function attachGlobalPositioning() {
  window.addEventListener("scroll", positionMenu, true); // capture scroll in ancestors
  window.addEventListener("resize", positionMenu);
}
function detachGlobalPositioning() {
  window.removeEventListener("scroll", positionMenu, true);
  window.removeEventListener("resize", positionMenu);
}

watch(showList, (open) => {
  if (open) {
    nextTick(() => {
      positionMenu();
      attachGlobalPositioning();
    });
  } else {
    detachGlobalPositioning();
  }
});

/* Close on outside click */
function onGlobalPointerDown(e) {
  const a = anchorRef.value;
  const m = menuRef.value;
  if (a?.contains(e.target) || m?.contains(e.target)) return;
  showList.value = false;
}
onMounted(() => document.addEventListener("pointerdown", onGlobalPointerDown));
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onGlobalPointerDown);
  detachGlobalPositioning();
});

/* --- Search flow --- */
let timer, controller;

function debouncedSearch() {
  const q = query.value.trim();
  showList.value = true;
  nextTick(positionMenu);

  clearTimeout(timer);
  controller?.abort?.();
  controller = new AbortController();

  if (!creating.value) {
    emit("update:newPerson", { firstName: "", lastName: "", email: "" });
  }

  if (!q) {
    results.value = [];
    return;
  }
  timer = setTimeout(async () => {
    try {
      const { results: r } = await searchUsers(q, {
        limit: 20,
        positionId: props.positionId,
        signal: controller.signal,
      });
      results.value = r || [];
      nextTick(positionMenu); // recalc height if list size changed
    } catch {
      results.value = [];
    }
  }, 250);
}

/* --- Selection / clear / create --- */
function select(u) {
  selectedLocal.value = u;
  emit("update:selected", u);
  showList.value = false;
  creating.value = false;
  confirmedDraft.value = false;
  emit("update:newPerson", { firstName: "", lastName: "", email: "" });
}

function clearToSearch() {
  creating.value = false;
  draft.value = { firstName: "", lastName: "", email: "" };
  emit("update:newPerson", { ...draft.value });

  selectedLocal.value = null;
  emit("update:selected", null);

  query.value = "";
  results.value = [];
  showList.value = false;

  nextTick(() => searchRef.value?.focus());
}

function startCreate() {
  creating.value = true;
  confirmedDraft.value = false;
  showList.value = false;
  selectedLocal.value = null;
  emit("update:selected", null);

  draft.value = { firstName: "", lastName: "", email: "" };
  emit("update:newPerson", { ...draft.value });
}

function cancelCreateBackToSearch() {
  creating.value = false;
  confirmedDraft.value = false;
  draft.value = { firstName: "", lastName: "", email: "" };
  emit("update:newPerson", { ...draft.value });

  query.value = "";
  results.value = [];
  showList.value = false;
}

function confirmDraft() {
  confirmedDraft.value = true;
  selectedLocal.value = null;
  emit("update:selected", null);
  emit("update:newPerson", { ...draft.value });
}
</script>

<style scoped>
/* keep momentum & prevent the page from scrolling while in the list */
:global(.overscroll-contain) {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
