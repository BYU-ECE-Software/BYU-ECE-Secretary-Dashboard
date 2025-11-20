<template>
  <div class="p-6">
    <!-- Toolbar (stays on page) -->
    <div
      class="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left: button group -->
      <div class="flex items-center gap-4">
        <!-- Create new Key Button -->
        <PrimaryButton label="Create new key" @click="openCreate">
          <template #icon>
            <PlusIcon class="h-4 w-4" />
          </template>
        </PrimaryButton>

        <!-- Assign Key Button -->
        <PrimaryButton label="Assign Key" @click="openAssign">
          <template #icon>
            <UserPlusIcon class="h-4 w-4" />
          </template>
        </PrimaryButton>
      </div>

      <!-- Right: Search Bar -->
      <SearchInput
        v-model="search"
        placeholder="Search…"
        widthClass="w-full sm:w-80"
        @input="onSearchInput"
      />
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex gap-6" aria-label="Tabs">
        <!-- Show keys by Professor/Staff Assignment -->
        <button
          class="relative pb-3 text-sm font-medium transition cursor-pointer"
          :class="
            activeTab === 'professors'
              ? 'text-byu-navy'
              : 'text-gray-500 hover:text-byu-navy'
          "
          @click="activeTab = 'professors'"
        >
          By Professor/Staff
          <span
            class="absolute left-0 -bottom-px h-0.5 w-full"
            :class="
              activeTab === 'professors' ? 'bg-byu-royal' : 'bg-transparent'
            "
          ></span>
        </button>

        <!-- Show all keys in numeric order -->
        <button
          class="relative pb-3 text-sm font-medium transition cursor-pointer"
          :class="
            activeTab === 'all'
              ? 'text-byu-navy'
              : 'text-gray-500 hover:text-byu-navy'
          "
          @click="activeTab = 'all'"
        >
          All Keys
          <span
            class="absolute left-0 -bottom-px h-0.5 w-full"
            :class="activeTab === 'all' ? 'bg-byu-royal' : 'bg-transparent'"
          ></span>
        </button>
      </nav>
    </div>

    <!-- Show loading/error -->
    <div v-if="loading" class="text-sm text-gray-600 mb-4">Loading keys…</div>
    <div v-else-if="error" class="text-sm text-red-600 mb-4">{{ error }}</div>

    <!-- Below the tabs: just swap components -->
    <!-- Table showing Keys by the Professor they are assigned to -->
    <KeysByProfessorTable
      v-if="activeTab === 'professors'"
      :keys="keys"
      @unassign="handleUnassign"
      @delete="handleDelete"
    />

    <!-- Table showing all keys -->
    <AllKeysTable
      v-else
      :keys="keys"
      v-model:status="status"
      @assign="handleAssignFromKey"
      @unassign="handleUnassign"
      @delete="handleDelete"
    />

    <!-- Pop up modal to create a new key -->
    <CreateKeyModal
      :open="showCreateKeyModal"
      @close="showCreateKeyModal = false"
      @saved="onCreateSaved"
    />

    <!-- Pop up modal to assign a professor to a key -->
    <KeyAssignModal
      :open="showAssignModal"
      :key-item="assignKeyItem"
      @close="showAssignModal = false"
      @saved="onAssignSaved"
    />

    <!-- Confirm Unassign Key Modal -->
    <ConfirmModal
      :open="showUnassignConfirm"
      :busy="unassignBusy"
      variant="primary"
      title="Unassign key?"
      :message="
        unassignKeyItem
          ? `This will unassign ${unassignKeyItem.user.firstName} ${unassignKeyItem.user.lastName} from Key #${unassignKeyItem.number}.`
          : ''
      "
      confirmLabel="Unassign"
      cancelLabel="Cancel"
      busyLabel="Unassigning…"
      @confirm="confirmUnassign"
      @cancel="showUnassignConfirm = false"
    />

    <!-- Confirm Delete Key Modal -->
    <ConfirmModal
      :open="showDeleteConfirm"
      :busy="deleteBusy"
      variant="primary"
      title="Delete key?"
      :message="
        deleteKeyItem
          ? `This will permanently delete Key #${deleteKeyItem.number}. This cannot be undone.`
          : ''
      "
      confirmLabel="Delete"
      cancelLabel="Cancel"
      busyLabel="Deleting…"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { PlusIcon, UserPlusIcon } from "@heroicons/vue/24/solid";
import { fetchKeys, updateKey, deleteKey } from "@/api/key";
import KeysByProfessorTable from "@/components/key/KeysByProfessorTable.vue";
import AllKeysTable from "@/components/key/AllKeysTable.vue";
import CreateKeyModal from "./CreateKeyModal.vue";
import PrimaryButton from "../PrimaryButton.vue";
import SearchInput from "../SearchInput.vue";
import KeyAssignModal from "./KeyAssignModal.vue";
import ConfirmModal from "../ConfirmModal.vue";

// --- Core UI state: tabs, search, filters, data, async flags ---
const activeTab = ref("professors");
const search = ref("");
const status = ref("all");

const loading = ref(false);
const error = ref(null);
const keys = ref([]);

let searchTimer;
let keysController;

// --- Modal state ---
const showCreateKeyModal = ref(false);
const showAssignModal = ref(false);
const assignKeyItem = ref(null); // prefill with a specific key

// --- Confirm Unassign modal state ---
const showUnassignConfirm = ref(false);
const unassignBusy = ref(false);
const unassignKeyItem = ref(null);

// --- Confirm Delete modal state ---
const showDeleteConfirm = ref(false);
const deleteBusy = ref(false);
const deleteKeyItem = ref(null);

// Load the latest list of keys from the server
async function refreshKeys() {
  loading.value = true;
  error.value = null;

  const q = search.value.trim();

  try {
    // cancel any in-flight request
    keysController?.abort?.();
    keysController = new AbortController();

    // If q is empty, backend returns all keys
    keys.value = await fetchKeys(q ? { q } : {}, {
      signal: keysController.signal,
    });
  } catch (e) {
    if (e.name === "CanceledError" || e.name === "AbortError") {
      return;
    }
    console.error(e);
    error.value = e?.message || "Failed to load keys";
  } finally {
    loading.value = false;
  }
}

// Fetch/refresh keys on mount
onMounted(refreshKeys);

// --- Search handling ---
function onSearchInput() {
  const q = search.value.trim();

  // If search is cleared → reset list with full load (show loading once)
  if (!q) {
    clearTimeout(searchTimer);
    keysController?.abort?.();
    refreshKeys();
    return;
  }

  const isNumeric = /^\d+$/.test(q);

  // If it's purely a number → All Keys tab
  // If it has any letters → By Professor tab
  activeTab.value = isNumeric ? "all" : "professors";

  // When searching numerically, default All Keys to "all" statuses
  if (isNumeric && status.value !== "all") {
    status.value = "all";
  }

  // Debounced search: cancel previous timer + request
  clearTimeout(searchTimer);
  keysController?.abort?.();

  searchTimer = setTimeout(async () => {
    try {
      const currentQ = search.value.trim();
      keysController = new AbortController();

      // do NOT touch loading.value here, to avoid flicker
      keys.value = await fetchKeys(currentQ ? { q: currentQ } : {}, {
        signal: keysController.signal,
      });
    } catch (e) {
      if (e.name === "CanceledError" || e.name === "AbortError") return;
      console.error(e);
      error.value = e?.message || "Failed to load keys";
    }
  }, 250);
}

// Open Create Key Modal
function openCreate() {
  showCreateKeyModal.value = true;
}

// Open Assign Key Modal
function openAssign() {
  assignKeyItem.value = null;
  showAssignModal.value = true;
}

// Open the assign modal prefilled with this key’s number and current user (if applicable)
function handleAssignFromKey(k) {
  assignKeyItem.value = { number: k.number, user: k.user ?? null };
  showAssignModal.value = true;
}

// Open the unassign confirmation for this key
function handleUnassign(k) {
  // guard: only open if currently assigned
  if (!k?.user) return;
  unassignKeyItem.value = k;
  showUnassignConfirm.value = true;
}

// Remove the professor from this key and refresh the list
async function confirmUnassign() {
  if (!unassignKeyItem.value) return;
  unassignBusy.value = true;

  try {
    const keyNumber = unassignKeyItem.value.number;

    await updateKey(keyNumber, { userId: null });

    showUnassignConfirm.value = false;
    unassignKeyItem.value = null;
    await refreshKeys(); // make sure UI updates
  } catch (e) {
    console.error(e);
  } finally {
    unassignBusy.value = false;
  }
}

// Load this key into the delete dialog and open the confirmation modal
function handleDelete(k) {
  if (!k) return;

  // Normalize to the full key object from the main keys list
  const keyNumber = k.number;
  const fullKey = keys.value.find((key) => key.number === keyNumber) || k;

  deleteKeyItem.value = fullKey;
  showDeleteConfirm.value = true;
}

// Permanently delete the selected key on the server and refresh the list
async function confirmDelete() {
  if (!deleteKeyItem.value) return;
  deleteBusy.value = true;

  try {
    const keyNumber = deleteKeyItem.value.number;

    await deleteKey(keyNumber);

    showDeleteConfirm.value = false;
    deleteKeyItem.value = null;
    await refreshKeys();
  } catch (e) {
    console.error(e);
  } finally {
    deleteBusy.value = false;
  }
}

// Saving a Created Key
function onCreateSaved(payload = { createdCount: 0, failureCount: 0 }) {
  const { createdCount, failureCount } = payload;

  // Refresh the list if anything was created
  if (createdCount > 0) {
    // Optional: jump to All Keys so it's visible
    if (activeTab.value !== "all") activeTab.value = "all";
    refreshKeys();
  }

  // Close the modal only when everything succeeded
  if (failureCount === 0) {
    showCreateKeyModal.value = false;
  }
}

// Saving a new Key Assignment
function onAssignSaved() {
  showAssignModal.value = false;
  refreshKeys();
}
</script>
