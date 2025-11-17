<template>
  <div class="p-6">
    <!-- Toolbar (stays on page) -->
    <div
      class="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left: button group -->
      <div class="flex items-center gap-4">
        <PrimaryButton label="Create new key" @click="openCreate">
          <template #icon>
            <PlusIcon class="h-4 w-4" />
          </template>
        </PrimaryButton>

        <PrimaryButton label="Assign Key" @click="openAssign">
          <template #icon>
            <UserPlusIcon class="h-4 w-4" />
          </template>
        </PrimaryButton>
      </div>

      <!-- Right: Search -->
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
        <button
          class="relative pb-3 text-sm font-medium transition cursor-pointer"
          :class="
            activeTab === 'professors'
              ? 'text-byu-navy'
              : 'text-gray-500 hover:text-byu-navy'
          "
          @click="activeTab = 'professors'"
        >
          By Professor
          <span
            class="absolute left-0 -bottom-px h-0.5 w-full"
            :class="
              activeTab === 'professors' ? 'bg-byu-royal' : 'bg-transparent'
            "
          ></span>
        </button>

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
    <KeysByProfessorTable
      v-if="activeTab === 'professors'"
      :keys="keys"
      @assign="handleAssign"
      @unassign="handleUnassign"
    />

    <AllKeysTable
      v-else
      :keys="keys"
      v-model:status="status"
      @assign="handleAssignFromKey"
      @unassign="handleUnassign"
    />

    <CreateKeyModal
      :open="showCreateKeyModal"
      @close="showCreateKeyModal = false"
      @saved="onCreateSaved"
    />

    <KeyAssignModal
      :open="showAssignModal"
      :key-item="assignKeyItem"
      @close="showAssignModal = false"
      @saved="onAssignSaved"
    />

    <!-- ===== Confirm Unassign Modal ===== -->
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { PlusIcon, UserPlusIcon } from "@heroicons/vue/24/solid";
import { fetchKeys, updateKey } from "@/api/key";
import KeysByProfessorTable from "@/components/key/KeysByProfessorTable.vue";
import AllKeysTable from "@/components/key/AllKeysTable.vue";
import CreateKeyModal from "./CreateKeyModal.vue";
import PrimaryButton from "../PrimaryButton.vue";
import SearchInput from "../SearchInput.vue";
import KeyAssignModal from "./KeyAssignModal.vue";
import ConfirmModal from "../ConfirmModal.vue";

// UI state for tabs, search text, and status filter
const activeTab = ref("professors");
const search = ref("");
const status = ref("all");

// Async lifecycle state and loaded data
const loading = ref(false);
const error = ref(null);
const keys = ref([]);

// modals
const showKeysModal = ref(false);
const showCreateKeyModal = ref(false);
const showAssignModal = ref(false);
const assignKeyItem = ref(null); // prefill with a specific key

// ===== Confirm Unassign modal state =====
const showUnassignConfirm = ref(false);
const unassignBusy = ref(false);
const unassignKeyItem = ref(null);
const unassignError = ref(""); // (optional) if you want to show any error

// refresh helper
async function refreshKeys() {
  loading.value = true;
  error.value = null;
  try {
    keys.value = await fetchKeys();
  } catch (e) {
    console.error(e);
    error.value = e?.message || "Failed to load keys";
  } finally {
    loading.value = false;
  }
}

// Fetch/refresh keys on mount
onMounted(refreshKeys);

function onSearchInput() {
  /* wire later */
}

// Create a new key
function openCreate() {
  showCreateKeyModal.value = true;
}

// Assign a key to a professor
function openAssign() {
  assignKeyItem.value = null;
  showAssignModal.value = true;
}

function handleAssignFromKey(k) {
  // Pass the minimal shape the modal expects. user is optional.
  assignKeyItem.value = { number: k.number, user: k.user ?? null };
  showAssignModal.value = true;
}

function handleUnassign(k) {
  // guard: only open if currently assigned
  if (!k?.user) return;
  unassignKeyItem.value = k;
  unassignError.value = "";
  showUnassignConfirm.value = true;
}

async function confirmUnassign() {
  if (!unassignKeyItem.value) return;
  unassignBusy.value = true;
  unassignError.value = "";

  try {
    const keyNumber = unassignKeyItem.value.number;

    await updateKey(keyNumber, { userId: null });

    showUnassignConfirm.value = false;
    unassignKeyItem.value = null;
    await refreshKeys(); // make sure UI updates
  } catch (e) {
    console.error(e);
    unassignError.value =
      e?.response?.data?.error || e?.message || "Unassign failed";
  } finally {
    unassignBusy.value = false;
  }
}

// Save info in the modal. Refresh the key tables
function onModalSaved() {
  showKeysModal.value = false;
  refreshKeys(); // pull latest after create/assign
}

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

function onAssignSaved() {
  showAssignModal.value = false;
  refreshKeys();
}
</script>
