<template>
  <BaseEditModal
    :open="props.open"
    :title="
      props.mode === 'edit'
        ? `Assign Student to Locker #${props.locker?.number}`
        : 'Create Locker'
    "
    :saving="saving"
    saveLabel="Save"
    size="md"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <!-- Create-mode: locker number + assign toggle -->
    <div v-if="props.mode === 'create'" class="flex flex-col gap-2.5">
      <!-- Locker number -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-byu-navy">Locker number</label>
        <input
          type="number"
          class="w-full border border-byu-navy rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
          v-model="lockerNumber"
          placeholder="e.g. 123"
          min="1"
        />
      </div>

      <!-- Assign user now toggle -->
      <div class="flex items-center gap-2.5 mt-1.5">
        <button
          type="button"
          role="switch"
          :aria-checked="assignNow ? 'true' : 'false'"
          @click="assignNow = !assignNow"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
          :class="assignNow ? 'bg-byu-royal' : 'bg-gray-300'"
        >
          <span
            class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
            :class="assignNow ? 'translate-x-5' : 'translate-x-1'"
          ></span>
        </button>

        <span class="text-sm text-byu-navy">Assign a user to this locker</span>
      </div>
    </div>

    <!-- User search / picker -->
    <template v-if="showAssign">
      <div class="flex flex-col gap-2" :class="assignNow ? 'mt-2' : ''">
        <label class="text-sm font-medium text-byu-navy">Select Student</label>

        <!-- Search box and results -->
        <div ref="wrapperEl" class="flex flex-col gap-2.5" v-if="!showCreate">
          <div class="relative">
            <SearchInput
              v-model="query"
              placeholder="Search name or email…"
              type="search"
              widthClass="w-full"
              autocomplete="off"
              @focus="openList"
              @input="onQueryInput"
              @keydown.enter.prevent
              @keydown.esc="showUserList = false"
            />

            <!-- Results dropdown -->
            <div
              v-if="showUserList && results.length"
              class="absolute z-10 mt-1 w-full border rounded-lg bg-white shadow-lg overflow-hidden"
            >
              <div class="max-h-60 overflow-auto divide-y">
                <button
                  v-for="u in results"
                  :key="u.id"
                  type="button"
                  class="w-full text-left px-3.5 py-2 hover:bg-gray-50"
                  @click="selectUser(u)"
                >
                  <div class="text-sm font-medium text-byu-navy">
                    {{ u.firstName }} {{ u.lastName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    [{{ u.netId }}] – {{ u.byuId }} – {{ u.email }}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- No matches -->
          <div
            v-if="showUserList && !results.length && query.trim()"
            class="text-sm text-gray-500 p-0.5"
          >
            No users found.
          </div>

          <!-- Selected user card -->
          <div
            v-if="selectedUser"
            class="border border-byu-navy/20 rounded-xl p-3 bg-white/80 shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <!-- Avatar + text -->
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="h-10 w-10 shrink-0 rounded-full bg-byu-royal/15 text-byu-royal grid place-items-center font-semibold"
                  :aria-label="`${selectedUser.firstName} ${selectedUser.lastName}`"
                >
                  {{ userInitials }}
                </div>

                <div class="min-w-0 flex flex-col gap-1">
                  <div class="font-semibold text-byu-navy leading-5">
                    {{ selectedUser.firstName }}
                    {{ selectedUser.lastName }}
                  </div>

                  <div
                    class="text-sm text-gray-600 truncate"
                    :title="selectedUser.email"
                  >
                    {{ selectedUser.email }}
                  </div>

                  <div class="flex flex-wrap items-center gap-2.5">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-byu-royal/10 text-byu-navy"
                    >
                      <span class="opacity-70">NetID:</span>
                      {{ selectedUser.netId }}
                    </span>

                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-byu-royal/10 text-byu-navy"
                    >
                      <span class="opacity-70">BYU ID:</span>
                      {{ selectedUser.byuId }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <button
                type="button"
                class="shrink-0 px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-xs hover:bg-byu-navy/5 transition cursor-pointer"
                @click="clearUser"
                aria-label="Clear selected student"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Add New Student Button-->
        <div class="mt-3" v-if="!showCreate && !selectedUser">
          <button
            type="button"
            class="inline-flex items-center px-2.5 py-1 rounded-lg bg-byu-royal text-white text-sm hover:bg-[#003C9E] shadow-sm transition cursor-pointer"
            @click.prevent="startCreate"
          >
            + Add new student
          </button>
        </div>

        <!-- New Student form -->
        <div
          v-if="showCreate"
          class="mt-1 border border-byu-navy rounded-lg p-3 bg-gray-50 flex flex-col gap-3"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <!-- Name fields -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-byu-navy"
                >First name</label
              >
              <input
                v-model="newUser.firstName"
                type="text"
                class="border border-byu-navy rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition bg-byu-white"
                placeholder="First name"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-byu-navy">Last name</label>
              <input
                v-model="newUser.lastName"
                type="text"
                class="border border-byu-navy rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition bg-byu-white"
                placeholder="Last name"
              />
            </div>

            <!-- IDs (middle row) -->
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-byu-navy">BYU ID</label>
              <input
                v-model="newUser.byuId"
                type="text"
                class="border border-byu-navy rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition bg-byu-white"
                placeholder="BYU ID"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-byu-navy">NetID</label>
              <input
                v-model="newUser.netId"
                type="text"
                class="border border-byu-navy rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition bg-byu-white"
                placeholder="NetID"
              />
            </div>

            <!-- Email (full width, last row) -->
            <div class="flex flex-col gap-1 sm:col-span-2">
              <label class="text-sm font-medium text-byu-navy">Email</label>
              <input
                v-model="newUser.email"
                type="email"
                class="border border-byu-navy rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition bg-byu-white"
                placeholder="Email"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border border-byu-navy bg-byu-navy/5 text-byu-navy hover:bg-byu-navy/10 hover:shadow-sm transition cursor-pointer"
              @click="cancelCreate"
            >
              Clear
            </button>
          </div>

          <p v-if="createError" class="text-red-600 mt-2">
            {{ createError }}
          </p>
        </div>
      </div>
    </template>

    <template v-if="showAssign">
      <!-- Two-up grid for Class / End Date -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
        <!-- Class -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-byu-navy"> Class </label>
          <input
            type="text"
            class="w-full border border-byu-navy rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            v-model="className"
            placeholder="ex. ECE 100"
          />
        </div>

        <!-- End Date -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-byu-navy">End Date</label>

          <div class="space-y-1">
            <label
              v-for="d in activeDates"
              :key="d.id"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                class="accent-byu-royal"
                :value="d.id"
                v-model="endDateSelection"
              />
              <span class="text-sm">{{ d.description }} </span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                class="accent-byu-royal"
                value="other"
                v-model="endDateSelection"
              />
              <span class="text-sm">Other</span>
            </label>
          </div>

          <!-- Manual date only when "Other" is selected -->
          <input
            v-if="endDateSelection === 'other'"
            type="date"
            class="w-full border border-byu-navy rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition cursor-text"
            v-model="endDateLocal"
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>
    </template>

    <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>
  </BaseEditModal>
</template>

<script setup>
import { ref, watch, reactive, computed } from "vue";
import { searchUsers, createUser } from "@/api/user";
import { toYMDUTC } from "@/utils/formatDate";
import { updateLocker, createLocker } from "@/api/locker";
import { fetchDates } from "@/api/importantDate";
import SearchInput from "../SearchInput.vue";
import BaseEditModal from "../BaseEditModal.vue";

// Props: whether open, and the locker being edited
const props = defineProps({
  open: { type: Boolean, default: false },
  locker: { type: Object, default: null },
  mode: {
    type: String,
    default: "edit",
    validator: (v) => ["edit", "create"].includes(v),
  },
});
// "close" closes the modal and "saved" tells the parent that update is complete and to refresh
const emit = defineEmits(["close", "saved"]);

// variables for create mode
const lockerNumber = ref("");
const assignNow = ref(false);
const showAssign = computed(() => props.mode === "edit" || assignNow.value); //gate for showing/hiding the assign student inputs

// variables for the search student functionality
const query = ref("");
const showUserList = ref(false);
const selectedUser = ref(null);
const results = ref([]);
const isSearching = ref(false); // currently we don't have an isSearching spinner. will need to either add one or take out this ref
const wrapperEl = ref(null); // a DOM ref to the container around the input + dropdown, used to detect outside clicks.
let controller; // AbortController for canceling prior searches
let timer; // debounce timer

// variables for the create student functionality
const showCreate = ref(false);
const createError = ref(null);
const saving = ref(false);

// variables for the end date connection to the db
const dateOptions = ref([]);
const activeDates = computed(() =>
  dateOptions.value.filter((d) => d.currentOption)
);

const newUser = reactive({
  firstName: "",
  lastName: "",
  email: "",
  byuId: "",
  netId: "",
});

// locker fields
const className = ref("");
const endDateLocal = ref(""); // "YYYY-MM-DD" when using "Other"
const endDateSelection = ref(null); // 'fallSemester' | 'winterSemester' | 'other'
const error = ref(null); // message shown if the form submit fails

// selected user initials
const userInitials = computed(() => {
  const f = selectedUser.value?.firstName?.[0] || "";
  const l = selectedUser.value?.lastName?.[0] || "";
  return (f + l).toUpperCase();
});

// returns YYYY-MM-DD for <input type="date">
const toInputDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Open/close modal lifecycle
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      // reset everything
      error.value = null;
      showUserList.value = false;
      query.value = "";
      results.value = [];
      showCreate.value = false;
      resetCreateForm();
      // prefill from locker
      className.value = props.locker?.className ?? "";
      selectedUser.value = props.locker?.user ?? null;

      // create-mode init
      assignNow.value = props.mode === "edit" ? true : false; // edit always assigns; create starts unchecked
      lockerNumber.value =
        props.mode === "create" ? "" : props.locker?.number ?? "";

      // fetch date options from the important dates db
      try {
        dateOptions.value = await fetchDates();
      } catch (e) {
        console.error("Failed to load dates", e);
        dateOptions.value = [];
      }

      // Determine end-date mode from existing value
      const existing = props.locker?.endDate
        ? toInputDate(props.locker.endDate)
        : "";
      // If no existing date, leave blank
      // If no existing date: no radio selected, no manual date
      if (!existing) {
        endDateSelection.value = null; // <- none selected
        endDateLocal.value = "";
      } else {
        const match = activeDates.value.find(
          (d) => toYMDUTC(d.assignedDate) === existing
        );
        if (match) {
          endDateSelection.value = match.id;
          endDateLocal.value = "";
        } else {
          endDateSelection.value = "other";
          endDateLocal.value = existing;
        }
      }

      // click outside to close user list
      document.addEventListener("pointerdown", onGlobalPointerDown);
    } else {
      document.removeEventListener("pointerdown", onGlobalPointerDown);
      controller?.abort?.();
      clearTimeout(timer);
    }
  },
  { immediate: true }
);

// watcher so picking a pre set important date copies its date into endDateLocal
watch(endDateSelection, (val) => {
  if (val === "other" || val == null) return;
  const chosen = activeDates.value.find((d) => d.id === val);
  if (chosen) {
    // store as YYYY-MM-DD so your date input (if you ever show it) is consistent
    endDateLocal.value = toInputDate(chosen.assignedDate);
  }
});

// if the user clicks outside of the student dropdown list, the dropdown goes away
function onGlobalPointerDown(e) {
  if (wrapperEl.value && !wrapperEl.value.contains(e.target)) {
    showUserList.value = false;
  }
}

// student list can open immediately when the user clicks into the field
function openList() {
  showUserList.value = true;
}

// Filter users by query (firstName, lastName, email) using the HTTP GET to /user/search
async function runSearch(q) {
  try {
    isSearching.value = true;
    const { results: r } = await searchUsers(q, {
      limit: 20,
      positionId: 1, // currently hardcoded to only show students in this list. would like this to be dynamic and able to be changed by the secretaries eventually
      signal: controller.signal, // if a new request starts, the previous request is aborted so only the latest keystroke's results win
    });
    results.value = r;
  } finally {
    isSearching.value = false;
  }
}

// called for every key stroke. handles aborts and debouncing
function onQueryInput() {
  const q = query.value.trim();
  // show list when the user starts typing
  showUserList.value = true;

  clearTimeout(timer);
  controller?.abort?.();
  controller = new AbortController();

  // if the query is empty, show no results and don't call the API
  if (!q) {
    results.value = [];
    return;
  }

  // debounce ~250ms
  timer = setTimeout(() => runSearch(q), 250);
}

// when a student is selected from the dropdown
function selectUser(u) {
  selectedUser.value = u;
  query.value = `${u.firstName} ${u.lastName}`;
  showUserList.value = false;
  showCreate.value = false;
  resetCreateForm();
}

// removes the selection and clears the input
function clearUser() {
  selectedUser.value = null;
  query.value = "";
}

// New Student Form ensures exclusivity with search/selection
function startCreate() {
  selectedUser.value = null;
  showUserList.value = false;
  query.value = "";
  results.value = [];
  showCreate.value = true;
}

// Helpers to detect completeness/partial-ness of the new-student form
function isCreateComplete() {
  return (
    newUser.firstName.trim() &&
    newUser.lastName.trim() &&
    newUser.email.trim() &&
    newUser.byuId.trim() &&
    newUser.netId.trim()
  );
}
function isCreateDirty() {
  return (
    newUser.firstName.trim() ||
    newUser.lastName.trim() ||
    newUser.email.trim() ||
    newUser.byuId.trim() ||
    newUser.netId.trim()
  );
}

// reset the create student form
function resetCreateForm() {
  createError.value = null;
  newUser.firstName = "";
  newUser.lastName = "";
  newUser.email = "";
  newUser.byuId = "";
  newUser.netId = "";
}

// cancel the create student form
function cancelCreate() {
  showCreate.value = false;
  resetCreateForm();
}

// Send the upadate to the db on submit
async function handleSubmit() {
  if (saving.value) return;
  saving.value = true;
  error.value = null;

  try {
    // Only enforce student rules if we're assigning
    if (showAssign.value) {
      const hasSelected = !!selectedUser.value;
      const createOpen = showCreate.value;
      const createComplete = isCreateComplete();
      const createDirty = isCreateDirty();

      if (hasSelected && createOpen && createComplete) {
        error.value =
          "Please choose either an existing student OR fill out the new-student form, not both.";
        return;
      }
      if (!hasSelected && !(createOpen && createComplete)) {
        error.value =
          createOpen && createDirty && !createComplete
            ? "The new-student form is incomplete. Either finish all fields or clear them and select an existing student."
            : "Please select an existing student or fill out all new-student fields.";
        return;
      }
      if (hasSelected && createOpen && createDirty) {
        error.value =
          "You selected an existing student but also started the new-student form. Please choose either an existing student OR completely fill out the new-student form, not both.";
        return;
      }
    }

    // Resolve user + end date (only if assigning)
    let userId = null;
    let selectedEndDate = null;

    if (showAssign.value) {
      if (selectedUser.value) {
        userId = selectedUser.value.id;
      } else {
        // new-student path
        const created = await createUser({ ...newUser, positionId: 1 });
        userId = created.id;
        selectedUser.value = created;
        query.value = `${created.firstName} ${created.lastName}`;
        showUserList.value = false;
        showCreate.value = false;
        resetCreateForm();
      }

      // End date (YYYY-MM-DD for <input type="date">)
      if (endDateSelection.value === "other") {
        selectedEndDate = endDateLocal.value || null;
      } else if (endDateSelection.value != null) {
        const chosen = activeDates.value.find(
          (d) => d.id === endDateSelection.value
        );
        selectedEndDate = chosen ? toInputDate(chosen.assignedDate) : null;
      } else {
        selectedEndDate = null;
      }
    }

    // Create vs Edit
    if (props.mode === "create") {
      // basic locker number validation
      const num = Number(lockerNumber.value);
      if (!Number.isInteger(num) || num <= 0) {
        error.value = "Please enter a valid locker number.";
        return;
      }

      const payload = { number: num };
      if (showAssign.value) {
        payload.userId = userId;
        payload.className = className.value || null;
        payload.endDate = selectedEndDate;
      }

      await createLocker(payload);
    } else {
      // Edit behaves like before (always assigning in edit mode)
      const payload = {
        userId,
        className: className.value || null,
        endDate: selectedEndDate,
      };
      await updateLocker(props.locker.number, payload);
    }

    emit("saved");
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || "Failed to save";
  } finally {
    saving.value = false;
  }
}
</script>
<style scoped>
:deep(input[type="date"]::-webkit-calendar-picker-indicator) {
  cursor: pointer;
}
</style>
