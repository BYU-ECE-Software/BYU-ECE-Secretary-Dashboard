<template>
  <div class="p-6">
    <!-- Status messages -->
    <div v-if="loading">Loading lockers...</div>
    <div v-else-if="error" class="text-byu-red-bright">Error: {{ error }}</div>

    <!-- Main content: toolbar + list/empty state -->
    <div class="flex flex-col gap-4">
      <!-- Toolbar is always visible -->
      <div
        class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- Add button -->
        <PrimaryButton label="Create locker" @click="openCreate">
          <template #icon>
            <PlusIcon class="h-4 w-4" />
          </template>
        </PrimaryButton>

        <!-- Search -->
        <SearchInput
          v-model="search"
          placeholder="Search lockers…"
          widthClass="w-full sm:w-80"
          @input="onSearchInput"
        />
      </div>

      <!-- Empty state (only when not loading/error and no lockers) -->
      <div
        v-if="!loading && !error && (!lockers || !lockers.length)"
        class="text-gray-500"
      >
        No lockers yet. Click
        <span class="font-medium">"Create locker"</span> to add the first one.
      </div>

      <!-- Card grid (only when we have lockers) -->
      <div
        v-else-if="lockers && lockers.length"
        class="grid gap-8 sm:grid-cols-4 lg:grid-cols-8"
      >
        <div
          v-for="l in lockers"
          :key="l.number"
          class="rounded-2xl border border-byu-navy shadow-sm overflow-hidden bg-white flex flex-col"
        >
          <!-- Header strip -->
          <div class="h-2 bg-byu-royal"></div>

          <div class="p-4 flex flex-col flex-1">
            <!-- Row 1: "Locker" (left) + kebab (right) -->
            <div class="flex items-center justify-between relative">
              <div class="text-sm text-gray-500">Locker</div>

              <!-- Wrap the button + menu in a relative container -->
              <div class="relative" @keydown.esc.stop="openMenu = null">
                <button
                  class="p-1.5 rounded-full focus:outline-none text-gray-700 cursor-pointer"
                  @click.stop="toggleMenu(l.number)"
                  :aria-expanded="openMenu === l.number ? 'true' : 'false'"
                  aria-haspopup="menu"
                  aria-label="More options"
                >
                  <!-- 3 vertical dots -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <circle cx="10" cy="4" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="10" cy="16" r="1.5" />
                  </svg>
                </button>

                <!-- Dropdown -->
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95"
                >
                  <div
                    v-if="openMenu === l.number"
                    class="absolute right-0 mt-2 z-20 w-44 origin-top-right rounded-xl bg-white text-xs shadow-lg ring-1 ring-black/5 border border-gray-100 p-1"
                    role="menu"
                    tabindex="-1"
                    @click.outside="openMenu = null"
                  >
                    <button
                      class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-gray-800 flex items-center gap-2 cursor-pointer"
                      role="menuitem"
                      @click="
                        l.user ? onEditStudent(l) : onAddStudent(l);
                        openMenu = null;
                      "
                    >
                      <component
                        :is="l.user ? PencilSquareIcon : UserPlusIcon"
                        class="h-4 w-4 text-gray-800"
                        aria-hidden="true"
                      />
                      <span>{{
                        l.user ? "Edit reservation info" : "Add student"
                      }}</span>
                    </button>

                    <button
                      class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-gray-800 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      role="menuitem"
                      @click="
                        askRemoveStudent(l);
                        openMenu = null;
                      "
                      :disabled="!l.user"
                    >
                      <UserMinusIcon
                        class="h-4 w-4 text-gray-800"
                        aria-hidden="true"
                      />
                      <span>{{
                        removingId === l.number ? "Removing…" : "Remove student"
                      }}</span>
                    </button>

                    <div class="my-1 h-px bg-gray-100"></div>

                    <button
                      class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-red-50 active:bg-red-100 text-red-600 flex items-center gap-2 cursor-pointer"
                      role="menuitem"
                      @click="
                        askDeleteLocker(l);
                        openMenu = null;
                      "
                    >
                      <TrashIcon class="h-4 w-4" aria-hidden="true" />
                      <span>Delete locker</span>
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Row 2: Locker number (left) + status pill (right) -->
            <div class="flex items-center justify-between mt-1">
              <div class="text-2xl font-bold text-byu-navy">
                #{{ l.number }}
              </div>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="statusClass(l.endDate)"
              >
                {{ statusLabel(l.endDate) }}
              </span>
            </div>

            <!-- Add Student if Locker is Empty -->
            <div class="flex-1 flex flex-col pt-2">
              <div
                v-if="!l.user"
                class="flex-1 flex items-center justify-center"
              >
                <PrimaryButton label="Add Student" @click="openEdit(l)">
                  <template #icon>
                    <PlusIcon class="h-4 w-4" />
                  </template>
                </PrimaryButton>
              </div>

              <div class="text-sm" v-if="l.user">
                <div class="text-gray-500">Assigned To:</div>
                <div class="font-medium">
                  {{ l.user.firstName }} {{ l.user.lastName }}
                </div>
              </div>

              <div class="text-sm" v-if="l.className">
                <div class="text-gray-500">Class:</div>
                <div class="font-medium">
                  {{ l.className }}
                </div>
              </div>

              <div class="text-sm" v-if="l.endDate">
                <div class="text-gray-500">End Date:</div>
                <div class="font-medium">
                  {{ toYMDUTC(l.endDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals stay the same -->
    <EditLockerModal
      v-if="editOpen"
      :open="editOpen"
      :locker="editing"
      :mode="modalMode"
      @close="editOpen = false"
      @saved="handleSaved"
    />

    <ConfirmModal
      :open="confirmOpen"
      :title="
        confirmCtx?.kind === 'unassign'
          ? 'Remove student from locker?'
          : 'Delete this locker?'
      "
      :message="
        confirmCtx?.kind === 'unassign'
          ? `This will remove ${confirmCtx.locker?.user?.firstName} ${confirmCtx.locker?.user?.lastName} and the other locker assignment information from Locker #${confirmCtx.locker?.number}.`
          : confirmCtx?.kind === 'delete-locker'
          ? `This will permanently delete locker #${confirmCtx.locker?.number} from the list along with any associated student assignment information.`
          : ''
      "
      :confirm-label="confirmCtx?.kind === 'unassign' ? 'Remove' : 'Delete'"
      cancel-label="Cancel"
      :busy="
        confirmCtx?.kind === 'unassign'
          ? removingId === confirmCtx?.locker?.number
          : deletingId === confirmCtx?.locker?.number
      "
      :busy-label="confirmCtx?.kind === 'unassign' ? 'Removing…' : 'Deleting…'"
      variant="primary"
      @cancel="closeConfirm"
      @confirm="handleConfirmation"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { fetchLockers, updateLocker, deleteLocker } from "@/api/locker";
import { toYMDUTC } from "@/utils/formatDate";
import EditLockerModal from "./EditLockerModal.vue";
import ConfirmModal from "../ConfirmModal.vue";
import {
  UserPlusIcon,
  PencilSquareIcon,
  UserMinusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { PlusIcon } from "@heroicons/vue/24/solid";
import PrimaryButton from "../PrimaryButton.vue";
import SearchInput from "../SearchInput.vue";

const lockers = ref([]);
const loading = ref(false);
const error = ref(null);

// search functionality variables
const search = ref("");
let searchTimer;
let lockersController;

// modal state
const editOpen = ref(false);
const editing = ref(null);
const modalMode = ref("edit");

// state for confirmation modal
const confirmOpen = ref(false); // modal visibility flag
const confirmCtx = ref(null); // context for what's being performed. shape: { kind: 'unassign', locker: l }
const removingId = ref(null); // shows spinner when unassigning
const deletingId = ref(null); // shows spinner when deleting

// loading up lockers
async function loadLockers() {
  try {
    lockersController?.abort?.(); // cancel previous load if any
    lockersController = new AbortController(); // new controller for this load
    const q = search.value.trim() || undefined; // undefined -> no ?q sent
    lockers.value = await fetchLockers(
      { q },
      { signal: lockersController.signal }
    );
  } catch (e) {
    if (e.name !== "CanceledError" && e.name !== "AbortError") {
      console.error(e);
      error.value = e?.message || "Failed to load lockers";
    }
  } finally {
    loading.value = false;
  }
}

// what to do when the user searches for a locker
function onSearchInput() {
  clearTimeout(searchTimer);
  lockersController?.abort?.(); // cancel the previous request

  // slight debounce
  searchTimer = setTimeout(async () => {
    try {
      lockersController = new AbortController();
      lockers.value = await fetchLockers(
        { q: search.value.trim() || undefined },
        { signal: lockersController.signal }
      );
    } catch (e) {
      if (e.name !== "CanceledError" && e.name !== "AbortError") {
        console.error(e);
        error.value = e?.message || "Failed to search lockers";
      }
    }
  }, 250);
}

// open edit modal for the selected locker
function openEdit(locker) {
  modalMode.value = "edit";
  editing.value = locker;
  editOpen.value = true;
  openMenu.value = null; // if you want to close the kebab, keep this (define openMenu if using it)
}

// open create modal to add a new locker
function openCreate() {
  modalMode.value = "create";
  editing.value = null;
  editOpen.value = true;
}

// menu state for the kebab (3-dots)
const openMenu = ref(null);

function toggleMenu(num) {
  openMenu.value = openMenu.value === num ? null : num;
}

// Close kebab on outside click or esc
function handleDocClick(e) {
  // close if click is anywhere except for inside the menu or on the trigger button
  const isMenu = e.target.closest('[role="menu"]');
  const isTrigger = e.target.closest('[aria-haspopup="menu"]');
  if (!isMenu && !isTrigger) openMenu.value = null;
}

function handleKeydown(e) {
  if (e.key === "Escape") openMenu.value = null;
}

// hook kebab actions (wire real logic later)
function onAddStudent(l) {
  openMenu.value = null;
  openEdit(l); // reuse your modal opener
}

function onEditStudent(l) {
  openMenu.value = null;
  openEdit(l);
}

// launch the confirmation modal for removing a student
function askRemoveStudent(l) {
  if (!l?.user) return; // no modal if locker has no user
  confirmCtx.value = { kind: "unassign", locker: l }; // store action + target
  confirmOpen.value = true; // show modal
}

// launch the confirmation modal for deleting a locker
function askDeleteLocker(l) {
  confirmCtx.value = { kind: "delete-locker", locker: l };
  confirmOpen.value = true;
}

// dismiss the confirmation modal without doing anything
function closeConfirm() {
  confirmOpen.value = false;
  confirmCtx.value = null;
}

// Perform the confirmed action (remove student or delete locker)
async function handleConfirmation() {
  // read the current confirmation context
  const ctx = confirmCtx.value;
  // bail if no context
  if (!ctx) return;

  // different options depending on what action is being done
  switch (ctx.kind) {
    // when a student is being removed from a locker
    case "unassign": {
      const l = ctx.locker;
      try {
        // mark this locker as "busy" for UI feedback
        removingId.value = l.number;

        // call API to clear student locker info on backend
        await updateLocker(l.number, {
          userId: null,
          className: null,
          endDate: null,
        });

        // update the local item so the UI reflects the change immediately
        l.user = null;
        l.className = null;
        l.endDate = null;

        // close the confirmation modal and the kebab/dropdown
        closeConfirm();
        openMenu.value = null;
      } catch (e) {
        console.error(e);
        alert(
          e?.response?.data?.error ||
            e?.message ||
            "Failed to remove the student from this locker."
        );
      } finally {
        // clear "busy" state regardless of success/failure
        removingId.value = null;
      }
      break;
    }

    // when a locker is being deleted
    case "delete-locker": {
      const l = ctx.locker;
      try {
        // mark this locker as "deleting" for UI feedback
        deletingId.value = l.number;

        // Call API to delete locker
        await deleteLocker(l.number);

        // Remove the locker from the local list so the UI updates immediately
        lockers.value = lockers.value.filter((x) => x.number !== l.number);

        // close the confirmation modal and the kebab/dropdown
        closeConfirm();
        openMenu.value = null;
      } catch (e) {
        console.error(e);
        alert(
          e?.response?.data?.error ||
            e?.message ||
            "Failed to delete this locker."
        );
      } finally {
        deletingId.value = null;
      }
      break;
    }

    default:
      // close modal for any unknown/unsupported action
      closeConfirm();
  }
}

// after save, close + refresh
async function handleSaved() {
  editOpen.value = false;
  loading.value = true;
  await loadLockers(); // reloads with whatever is in `search`
}

onMounted(async () => {
  loading.value = true;
  await loadLockers();
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handleDocClick);
  document.removeEventListener("keydown", handleKeydown);
});

// --- tiny helpers ---

function daysLeft(date) {
  if (!date) return "∞";
  const end = new Date(date).getTime();
  const now = Date.now();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function statusLabel(date) {
  const d = daysLeft(date);
  if (date == null) return "Available";
  if (d <= 0) return "Expired";
  if (d <= 7) return "Expiring";
  return "In Use";
}

function statusClass(date) {
  const d = daysLeft(date);
  if (date == null) return "bg-green-100 text-green-700";
  if (d <= 0) return "bg-red-100 text-byu-red-bright";
  if (d <= 7) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}
</script>
