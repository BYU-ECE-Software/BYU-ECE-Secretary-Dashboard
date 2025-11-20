<template>
  <div class="flex flex-col gap-2">
    <!-- Optional label above the control -->
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

    <!-- B) SHOW SELECTED EXISTING PROFESSOR -->
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

    <!-- C1) CREATE NEW PROFESSOR FORM (draft not confirmed yet) -->
    <div
      v-else-if="creating && !confirmedDraft"
      class="border border-byu-navy rounded-lg p-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
    >
      <!-- First name input -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-byu-navy">First name *</label>
        <input
          v-model="draft.firstName"
          type="text"
          placeholder="First name"
          class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
        />
      </div>

      <!-- Last name input -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-byu-navy">Last name *</label>
        <input
          v-model="draft.lastName"
          type="text"
          placeholder="Last name"
          class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
        />
      </div>

      <!-- Email input -->
      <div class="flex flex-col gap-1 sm:col-span-2">
        <label class="text-sm font-medium text-byu-navy">Email *</label>
        <input
          v-model="draft.email"
          type="email"
          placeholder="Email"
          class="border border-byu-navy rounded-md px-3 py-2 text-sm w-full bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
        />
      </div>

      <!-- Create mode actions -->
      <div class="sm:col-span-2 flex items-center justify-between pt-1">
        <!-- Throw away draft and go back to search -->
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
          @click="cancelCreateBackToSearch"
        >
          Clear
        </button>

        <!-- Confirm draft and treat as "new person" for parent -->
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

    <!-- C2) CREATE NEW (confirmed) → summary card of draft person -->
    <PersonCard v-else :person="draft">
      <template #actions>
        <!-- Clear out draft and go back to search -->
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
          @click="clearToSearch"
        >
          Clear
        </button>
      </template>
    </PersonCard>

    <!-- Simple error text below the control -->
    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>

  <!-- === Teleported dropdown with search results === -->
  <Teleport to="body">
    <div
      v-if="showList && (results.length || queryTrimmed)"
      ref="menuRef"
      :style="menuStyle"
      class="border rounded-lg bg-white shadow-lg overflow-hidden"
      role="listbox"
    >
      <!-- Results list -->
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

      <!-- No results message with "add new" option -->
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

/* ========= Props & Emits ========= */

const props = defineProps({
  // Label shown above the picker
  label: { type: String, default: "Select Professor" },
  // Placeholder text inside the search input
  placeholder: { type: String, default: "Search professors…" },
  // Only show users with this position (2 = professor by default)
  positionId: { type: Number, default: 2 },
});

// Parent listens for either a selected existing user or a new person draft
const emit = defineEmits(["update:selected", "update:newPerson"]);

/* ========= Core State ========= */
// Search text typed by the user
const query = ref("");
// Matching professors returned from the API
const results = ref([]);
// Controls whether the dropdown is visible
const showList = ref(false);
// Currently selected professor (existing user)
const selectedLocal = ref(null);

// "Create new professor" mode flags and data
const creating = ref(false);
const confirmedDraft = ref(false); // true after "Confirm & continue"
const error = ref(null);
const draft = ref({ firstName: "", lastName: "", email: "" });

/* ========= Refs for positioning & DOM access ========= */

// Input element used as anchor for the dropdown
const searchRef = ref(null);
// Wrapper around the search input (used to measure position)
const anchorRef = ref(null);
// Teleported dropdown element
const menuRef = ref(null);
// Inline style for dropdown position/size
const menuStyle = ref({});

// True when there is some non-empty search text
const queryTrimmed = computed(() => query.value.trim().length > 0);

// Only enable "Confirm" when required fields are filled in
const isDraftValid = computed(
  () =>
    draft.value.firstName.trim() &&
    draft.value.lastName.trim() &&
    draft.value.email.trim()
);

/* ========= Dropdown Positioning & Teleport Helpers ========= */

// Position the dropdown under the search input and keep it on screen
function positionMenu() {
  const el = anchorRef.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  // Limit width so the menu doesn't run off the screen
  const maxWidth = Math.min(r.width, vw - 16);
  menuStyle.value = {
    position: "fixed",
    left: `${Math.max(8, Math.min(r.left, vw - 8 - maxWidth))}px`,
    top: `${r.bottom + 4}px`,
    width: `${maxWidth}px`,
    zIndex: 1000,
  };
}

// Open the list and position it after the input is painted
function openList() {
  showList.value = true;
  nextTick(positionMenu);
}

// Attach global listeners so the dropdown tracks scroll/resize
function attachGlobalPositioning() {
  window.addEventListener("scroll", positionMenu, true); // capture scroll in ancestors
  window.addEventListener("resize", positionMenu);
}

// Remove global listeners when dropdown closes
function detachGlobalPositioning() {
  window.removeEventListener("scroll", positionMenu, true);
  window.removeEventListener("resize", positionMenu);
}

// Turn scroll/resize tracking on/off based on dropdown visibility
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

/* ========= Close on Outside Click ========= */

// Close the dropdown when clicking outside the input and menu
function onGlobalPointerDown(e) {
  const a = anchorRef.value;
  const m = menuRef.value;
  if (a?.contains(e.target) || m?.contains(e.target)) return;
  showList.value = false;
}

// Start/stop global pointer listener with the component
onMounted(() => document.addEventListener("pointerdown", onGlobalPointerDown));
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onGlobalPointerDown);
  detachGlobalPositioning();
});

/* ========= Search Flow (debounced API calls) ========= */
let timer, controller;

// Run a debounced search against the user API
function debouncedSearch() {
  const q = query.value.trim();
  // Always show the list while typing
  showList.value = true;
  nextTick(positionMenu);

  // Cancel any previous search timer and request
  clearTimeout(timer);
  controller?.abort?.();
  controller = new AbortController();

  // If we are back to search mode, clear any new-person draft for the parent
  if (!creating.value) {
    emit("update:newPerson", { firstName: "", lastName: "", email: "" });
  }

  // If query is empty, just clear results and stop
  if (!q) {
    results.value = [];
    return;
  }

  // Delay search a bit so we don't hit the API on every keystroke
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

/* ========= Selection, Clear, and Create-New Logic ========= */

// When a professor from the results list is picked
function select(u) {
  selectedLocal.value = u;
  emit("update:selected", u);
  showList.value = false;
  creating.value = false;
  confirmedDraft.value = false;
  // Clear any "new person" data since we picked an existing user
  emit("update:newPerson", { firstName: "", lastName: "", email: "" });
}

// Clear selected/draft state and go back to search mode
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

// Enter "add new professor" mode from the empty-state dropdown
function startCreate() {
  creating.value = true;
  confirmedDraft.value = false;
  showList.value = false;
  selectedLocal.value = null;
  emit("update:selected", null);

  draft.value = { firstName: "", lastName: "", email: "" };
  emit("update:newPerson", { ...draft.value });
}

// Cancel create mode and return to search view
function cancelCreateBackToSearch() {
  creating.value = false;
  confirmedDraft.value = false;
  draft.value = { firstName: "", lastName: "", email: "" };
  emit("update:newPerson", { ...draft.value });

  query.value = "";
  results.value = [];
  showList.value = false;
}

// Lock in the draft as the "new person" to send up to the parent
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
