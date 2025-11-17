<template>
  <BaseEditModal
    :open="open"
    :title="headerTitle"
    :saving="saving"
    saveLabel="Save"
    size="md"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <!-- ===================== MODE: CREATE ===================== -->
    <template v-if="mode === 'create'">
      <div class="flex flex-col gap-2.5">
        <label class="text-sm font-medium text-byu-navy"
          >Enter key number</label
        >
        <input
          type="number"
          class="w-full border border-byu-navy rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
          v-model="create_number"
          placeholder="Key number"
          min="1"
        />

        <p class="text-sm text-byu-navy">
          If you would like to assign a professor to this key, click the arrow
          button. Otherwise, you can save this key as is.
        </p>

        <div class="flex justify-end pt-1">
          <button
            type="button"
            class="px-2 py-1 rounded-lg border border-byu-navy bg-byu-navy/15 text-byu-navy text-sm hover:bg-byu-navy/20 transition cursor-pointer inline-flex items-center justify-center"
            @click="confirmCreateAndContinue"
          >
            <ArrowRightIcon class="h-4 w-4 ml-1" />
          </button>
        </div>
        <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
      </div>
    </template>

    <!-- ===================== MODE: ASSIGN ===================== -->
    <template v-else>
      <!-- ===== STEP 1: Enter & confirm key ===== -->
      <template v-if="step === 'pickKey'">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-byu-navy"
            >Enter key number</label
          >

          <input
            type="number"
            class="w-full border border-byu-navy rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            v-model="assign_number"
            placeholder="Key number"
            min="1"
            @keydown.enter.prevent="goDetailsExact"
          />

          <div class="flex justify-end pt-1">
            <button
              type="button"
              class="px-2 py-1 rounded-lg border border-byu-navy bg-byu-navy/15 text-byu-navy text-sm hover:bg-byu-navy/20 transition cursor-pointer inline-flex items-center justify-center"
              :class="safeInt(assign_number) ? 'visible' : 'invisible'"
              @click="goDetailsExact"
              aria-label="Continue"
            >
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </div>

          <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </template>

      <!-- ===== STEP 1.5: Key not found → confirm create or go back ===== -->
      <template v-else-if="step === 'confirmCreate'">
        <div class="flex flex-col gap-4">
          <div class="text-sm text-byu-navy leading-5">
            <p class="font-medium">
              Key #{{ chosenKeyNumber }} doesn’t currently exist.
            </p>
            <p class="mt-4 text-sm">
              Would you like to create a new key and continue, or go back and
              choose a different key?
            </p>
          </div>

          <div
            class="pt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <!-- Back button -->
            <button
              type="button"
              class="px-2 py-0.5 rounded-lg border border-byu-navy bg-byu-navy/15 text-byu-navy text-sm hover:bg-byu-navy/20 transition cursor-pointer inline-flex items-center justify-center"
              @click="goBackToPick"
            >
              <ArrowLeftIcon class="h-4 w-4 mr-1" />
              Go back
            </button>

            <!-- Continue/create button -->
            <button
              type="button"
              class="px-2 py-0.5 rounded-lg border border-byu-navy bg-byu-navy/15 text-byu-navy text-sm hover:bg-byu-navy/20 transition cursor-pointer inline-flex items-center justify-center"
              @click="confirmCreateAndContinue"
            >
              Create key #{{ chosenKeyNumber }}
              <ArrowRightIcon class="h-4 w-4 ml-1" />
            </button>
          </div>

          <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </template>

      <!-- ===== STEP 2: Assign/Unassign professor ===== -->
      <template v-else-if="step === 'details'">
        <div class="mb-4 text-sm">
          <span class="font-medium text-byu-navy"
            >Assigning Professor to Key #{{ chosenKeyNumber }}</span
          >
        </div>

        <!-- Existing professor (if any) -->
        <div
          v-if="existingProfessor"
          class="border border-byu-navy/20 rounded-xl p-3 bg-white/80 shadow-sm text-sm mb-2"
        >
          <div class="flex items-start justify-between gap-3">
            <!-- Left side: label + name + email -->
            <div class="min-w-0">
              <div
                class="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-1"
              >
                Currently assigned to
              </div>

              <div class="font-semibold text-byu-navy leading-5">
                {{ existingProfessor.firstName }}
                {{ existingProfessor.lastName }}
              </div>

              <div
                class="text-xs text-gray-600 truncate"
                :title="existingProfessor.email"
              >
                {{ existingProfessor.email }}
              </div>
            </div>

            <!-- Right side: Remove button -->
            <button
              type="button"
              class="shrink-0 px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
              @click="markRemoveExisting"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Professor picker (shown if no existing OR after remove) -->
        <div v-if="showProfessorPicker" class="flex flex-col gap-2">
          <div v-if="!selectedProfessor" class="relative">
            <SearchInput
              v-model="profQuery"
              placeholder="Search professor…"
              type="search"
              widthClass="w-full"
              autocomplete="off"
              @focus="openProfList"
              @input="onProfQueryInput"
              @keydown.enter.prevent
              @keydown.esc="showProfList = false"
            />

            <!-- Results -->
            <div
              v-if="showProfList && profResults.length"
              class="absolute z-10 mt-1 w-full border rounded-lg bg-white shadow-lg overflow-hidden"
            >
              <div class="max-h-60 overflow-auto divide-y">
                <button
                  v-for="u in profResults"
                  :key="u.id"
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-gray-50"
                  @click="selectProfessor(u)"
                >
                  <div class="text-sm font-medium text-byu-navy">
                    {{ u.firstName }} {{ u.lastName }}
                  </div>
                  <div class="text-xs text-gray-500">{{ u.email }}</div>
                </button>
              </div>
            </div>

            <!-- No matches -->
            <div
              v-if="showProfList && !profResults.length && profQuery.trim()"
              class="text-sm text-gray-500 p-0.5 mt-1"
            >
              No professors found.
            </div>
          </div>

          <!-- Selected professor -->
          <div
            v-else
            class="border border-byu-navy/20 rounded-xl p-3 bg-white/80 shadow-sm text-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <!-- Left side: name + email -->
              <div class="min-w-0">
                <div class="font-semibold text-byu-navy leading-5">
                  {{ selectedProfessor.firstName }}
                  {{ selectedProfessor.lastName }}
                </div>

                <div
                  class="text-xs text-gray-600 truncate"
                  :title="selectedProfessor.email"
                >
                  {{ selectedProfessor.email }}
                </div>
              </div>

              <!-- Right side: Change button -->
              <button
                type="button"
                class="shrink-0 px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
                @click="clearProfessor"
              >
                Change
              </button>
            </div>
          </div>

          <!-- Add new professor -->
          <div class="mt-3" v-if="!selectedProfessor">
            <button
              type="button"
              class="inline-flex items-center px-2.5 py-1 rounded-lg bg-byu-royal text-white text-sm hover:bg-[#003C9E] shadow-sm transition cursor-pointer"
              @click.prevent="toggleCreateProfessor"
            >
              {{
                showCreateProfessor
                  ? "Cancel new professor"
                  : "+ Add new professor"
              }}
            </button>
          </div>

          <!-- Inline new professor form -->
          <div
            v-if="showCreateProfessor"
            class="mt-1 border border-byu-navy rounded-lg p-3 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-byu-navy"
                >First name *</label
              >
              <input
                v-model="newProfessor.firstName"
                type="text"
                placeholder="First name"
                class="border border-byu-navy rounded-md px-3 py-2 bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-byu-navy"
                >Last name *</label
              >
              <input
                v-model="newProfessor.lastName"
                type="text"
                placeholder="Last name"
                class="border border-byu-navy rounded-md px-3 py-2 bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
              />
            </div>
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-sm font-medium text-byu-navy">Email *</label>
              <input
                v-model="newProfessor.email"
                type="email"
                placeholder="Email"
                class="border border-byu-navy rounded-md px-3 py-2 w-full bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
              />
            </div>
          </div>
        </div>

        <div
          class="pt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <!-- Back button -->
          <button
            type="button"
            class="px-2 py-1 rounded-lg border border-byu-navy bg-byu-navy/15 text-byu-navy text-sm hover:bg-byu-navy/20 transition cursor-pointer inline-flex items-center justify-center"
            @click="goBackToPick"
            aria-label="Go back"
          >
            <ArrowLeftIcon class="h-4 w-4" />
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
      </template>
    </template>
  </BaseEditModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import BaseEditModal from "../BaseEditModal.vue";
import SearchInput from "../SearchInput.vue";
import { createKey, updateKey, getKeyByNumber } from "@/api/key";
import { searchUsers, createUser } from "@/api/user";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/vue/24/solid";

/** Props / Emits **/
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: {
    type: String,
    default: "create", // 'create' | 'assign'
    validator: (v) => ["create", "assign"].includes(v),
  },
  professor: { type: Object, default: null }, // optional prefill for future use
  "key-item": { type: Object, default: null }, // kebab prop → camel in script as keyItem
});
const emit = defineEmits(["close", "saved"]);
const keyItem = computed(() => props["key-item"]);

/** Shared state **/
const saving = ref(false);
const error = ref(null);

/** Header **/
const headerTitle = computed(() =>
  props.mode === "create" ? "Create Key" : "Assign Key to a Professor"
);

/** ===================== CREATE MODE STATE ===================== **/
const create_number = ref("");

/** ===================== ASSIGN MODE STATE ===================== **/
const step = ref("pickKey"); // 'pickKey' | 'confirmCreate' | 'details'

/* State for search key step */
const selectedKey = ref(null);
const willCreateKey = ref(false);
const assign_number = ref(""); // what the user types in step 1
const lookupStatus = ref(null); // 'found' | 'not-found' | null

/* Professor step */
const existingProfessor = ref(null);
const removeExisting = ref(false);

const profQuery = ref("");
const showProfList = ref(false);
const profResults = ref([]);
const selectedProfessor = ref(null);
const showCreateProfessor = ref(false);
const newProfessor = reactive({ firstName: "", lastName: "", email: "" });
let profTimer, profController;

/** Helpers **/
const safeInt = (s) => {
  const n = Number.parseInt(String(s), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const chosenKeyNumber = computed(
  () => selectedKey.value?.number ?? safeInt(assign_number.value)
);

/** Open/close lifecycle **/
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    saving.value = false;
    error.value = null;

    // create mode reset
    create_number.value = "";

    // assign mode reset
    step.value = "pickKey";
    assign_number.value = "";
    lookupStatus.value = null;
    selectedKey.value = null;
    willCreateKey.value = false;

    existingProfessor.value = null;
    removeExisting.value = false;

    profQuery.value = "";
    showProfList.value = false;
    profResults.value = [];
    selectedProfessor.value = null;
    showCreateProfessor.value = false;

    // optional: if you opened the modal from a specific key row
    if (props.mode === "assign" && keyItem.value) {
      selectedKey.value = keyItem.value;
      assign_number.value = String(keyItem.value.number);
      lookupStatus.value = "found";
      existingProfessor.value = keyItem.value.user || null;
      step.value = "details"; // skip step 1 in that case
    }
  },
  { immediate: true }
);

/** ===== Key search (assign) ===== */
async function goDetailsExact() {
  // 1. validate the number they typed
  const n = safeInt(assign_number.value);
  if (!n) {
    error.value = "Please enter a valid key number.";
    return;
  }

  // 2. reset any previous status
  error.value = null;
  lookupStatus.value = null;
  selectedKey.value = null;
  existingProfessor.value = null;
  willCreateKey.value = false;
  removeExisting.value = false;

  // reset professor picker state for this new key
  selectedProfessor.value = null;
  showCreateProfessor.value = false;
  newProfessor.firstName = "";
  newProfessor.lastName = "";
  newProfessor.email = "";

  profQuery.value = "";
  profResults.value = [];
  showProfList.value = false;

  // 3. try to fetch that exact key from the backend
  let keyData = null;
  try {
    keyData = await getKeyByNumber(n); // returns key object or null on 404
  } catch (e) {
    // if this threw something OTHER than a 404/null case, surface the error and don't advance
    error.value =
      e?.response?.data?.error || e?.message || "Failed to look up that key.";
    return;
  }

  if (keyData) {
    // key exists already in DB
    selectedKey.value = keyData;
    lookupStatus.value = "found";

    // does it already have a professor assigned?
    existingProfessor.value = keyData.user || null;
    removeExisting.value = false;
    willCreateKey.value = false;

    step.value = "details";
  } else {
    // key not found, offer to create on Save
    lookupStatus.value = "not-found";
    existingProfessor.value = null;
    removeExisting.value = false;
    willCreateKey.value = true;

    step.value = "confirmCreate";
  }
}

// Go back to Step 1 - picking a key
function goBackToPick() {
  // user said "Go back"
  step.value = "pickKey";
  // keep assign_number.value as-is so they can just tweak it
  // keep willCreateKey.value (doesn't really matter here yet)
  lookupStatus.value = null;
  error.value = null;
}

// Confirm creation of a new key and move forward to step 2
function confirmCreateAndContinue() {
  // user said "yes, treat this as a brand-new key"
  // willCreateKey.value is ALREADY true from goDetailsExact()
  step.value = "details";
}

/** ===== Professor search/create (assign) ===== */
function openProfList() {
  showProfList.value = true;
}
function onProfQueryInput() {
  const q = profQuery.value.trim();
  showProfList.value = true;
  clearTimeout(profTimer);
  profController?.abort?.();
  profController = new AbortController();
  if (!q) {
    profResults.value = [];
    return;
  }
  profTimer = setTimeout(async () => {
    try {
      const { results } = await searchUsers(q, {
        limit: 20,
        positionId: 2, // Professors only
        signal: profController.signal,
      });
      profResults.value = results || [];
    } catch {
      profResults.value = [];
    }
  }, 250);
}
function selectProfessor(u) {
  selectedProfessor.value = u;
  profQuery.value = `${u.firstName} ${u.lastName}`;
  showProfList.value = false;
}
function clearProfessor() {
  selectedProfessor.value = null;
  profQuery.value = "";
}
function toggleCreateProfessor() {
  showCreateProfessor.value = !showCreateProfessor.value;
  if (showCreateProfessor.value) {
    selectedProfessor.value = null;
    showProfList.value = false;
    profQuery.value = "";
    profResults.value = [];
  } else {
    newProfessor.firstName = "";
    newProfessor.lastName = "";
    newProfessor.email = "";
  }
}
function markRemoveExisting() {
  removeExisting.value = true;
  existingProfessor.value = null;
}

const showProfessorPicker = computed(
  () => !existingProfessor.value || removeExisting.value
);

/** ===== Submit ===== */
async function handleSubmit() {
  if (saving.value) return;

  try {
    saving.value = true;
    error.value = null;

    if (props.mode === "create") {
      // create-mode: just create a bare key with a number
      const num = Number(create_number.value);
      if (!Number.isInteger(num) || num <= 0) {
        error.value = "Please enter a valid key number.";
        return;
      }
      await createKey({ number: num });
      emit("saved");
      return;
    }

    // assign-mode submit:
    // 1. figure out which key number we're finalizing
    const number = chosenKeyNumber.value;
    if (!number) {
      error.value = "Please enter a valid key number.";
      return;
    }

    // 2. if this is a new key (user typed a number we didn't find), create it first
    if (willCreateKey.value) {
      await createKey({ number }); // this just creates { number, userId: null }
    }

    // 3. resolve which professor ID should end up assigned to that key
    let finalProfessorId = null;

    const creatingNewProfessor =
      showCreateProfessor.value &&
      newProfessor.firstName.trim() &&
      newProfessor.lastName.trim() &&
      newProfessor.email.trim();

    if (creatingNewProfessor) {
      // we are in the "Add new professor" path
      const created = await createUser({
        ...newProfessor,
        positionId: 2,
        byuId: null,
        netId: null,
      });
      finalProfessorId = created.id;
    } else if (selectedProfessor.value) {
      // user picked a professor from the search list
      finalProfessorId = selectedProfessor.value.id;
    } else if (existingProfessor.value && !removeExisting.value) {
      // keep the currently assigned professor
      finalProfessorId = existingProfessor.value.id;
    } else {
      // either there was an existing professor and we hit "Remove professor"
      // OR there just wasn't one to begin with
      finalProfessorId = null;
    }

    // 4. apply the assignment (or unassignment) to the key
    await updateKey(number, { userId: finalProfessorId });

    // 5. tell parent to close modal + refresh table
    emit("saved");
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || "Failed to save";
  } finally {
    saving.value = false;
  }
}
</script>
