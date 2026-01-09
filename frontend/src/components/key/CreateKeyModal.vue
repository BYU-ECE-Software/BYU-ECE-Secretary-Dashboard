<template>
  <BaseEditModal
    :open="open"
    title="Create Keys"
    :saving="saving"
    saveLabel="Create"
    size="md"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="flex flex-col gap-4">
      <!-- Top helper -->
      <h3 class="text-sm font-semibold text-byu-navy flex items-center gap-2">
        <span>Add one or multiple keys</span>
      </h3>

      <!-- Rows -->
      <div class="space-y-2">
        <div v-for="row in rows" :key="row.id" class="flex items-start gap-2">
          <div class="shrink-0 w-36 sm:w-56">
            <KeyNumberInput
              v-model="row.input"
              placeholder="Enter key number..."
            />
          </div>

          <!-- Trash icon only when more than one row -->
          <button
            v-if="rows.length > 1"
            type="button"
            class="inline-flex items-center justify-center h-9 w-5 rounded-lg text-byu-navy transition cursor-pointer"
            @click="removeRow(row.id)"
            aria-label="Remove row"
            title="Remove"
          >
            <TrashIcon class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Add controls -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center px-2.5 py-1 rounded-lg bg-byu-royal text-white text-sm hover:bg-[#003C9E] shadow-sm transition cursor-pointer"
          @click="addRow()"
        >
          + Add another key
        </button>
      </div>

      <!-- Submit errors -->
      <div v-if="error" class="rounded-lg border border-red-300 bg-red-50 p-3">
        <div class="flex items-start gap-2">
          <ExclamationCircleIcon
            class="h-5 w-5 text-red-600"
            aria-hidden="true"
          />
          <div class="flex-1">
            <div class="text-sm font-semibold text-red-800">Create failed</div>
            <p class="text-sm text-red-700 mt-0.5">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Success banner (only shows when at least one key was created but another key threw an error) -->
      <div
        v-if="summary && summary.created?.length"
        class="rounded-lg border border-emerald-300 bg-emerald-50 p-3"
      >
        <div class="flex items-start gap-2">
          <CheckCircleIcon
            class="h-5 w-5 text-emerald-600"
            aria-hidden="true"
          />
          <div class="flex-1">
            <div class="text-sm font-semibold text-byu-navy">
              {{ summary.created.length }} key{{
                summary.created.length > 1 ? "s" : ""
              }}
              created
            </div>
            <p class="text-sm text-byu-navy/90 mt-0.5">
              {{ summary.created.join(", ") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Failure banner (duplicates / server rejects, etc.) -->
      <div
        v-if="summary && summary.failures?.length"
        class="rounded-lg border border-amber-300 bg-amber-50 p-3"
      >
        <div class="flex items-start gap-2">
          <ExclamationTriangleIcon
            class="h-5 w-5 text-amber-600"
            aria-hidden="true"
          />
          <div class="flex-1">
            <div class="text-sm font-semibold text-byu-navy">
              Some keys weren’t created ({{ summary.failures.length }})
            </div>
            <ul class="mt-1 text-sm text-byu-navy/90 list-disc ml-5">
              <li v-for="f in summary.failures" :key="f.num">
                {{ f.num }} - {{ f.error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </BaseEditModal>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseEditModal from "@/components/BaseEditModal.vue";
import KeyNumberInput from "@/components/key/KeyNumberInput.vue";
import { createKey } from "@/api/key";
import { TrashIcon } from "@heroicons/vue/24/solid";
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

// Control open state from parent; emit when closed or after save.
const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "saved"]);

// Each row represents one key number entry: { id, input, valid, value (int) }.
let nextId = 1;
const rows = ref([{ id: nextId++, input: "" }]);

// Global UI state for the modal (saving flag, error, and summary of results).
const saving = ref(false);
const error = ref(null);
const summary = ref(null);

// Safely parse a positive integer; return null if invalid.
function parseIntSafe(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Reset the UI back to a single empty row after a successful save.
function resetRowsToSingleEmpty() {
  rows.value = [{ id: nextId++, input: "", valid: false, value: null }];
}

// Add a new row, optionally prefilled (e.g., when pasting a list).
function addRow(prefill = "") {
  const str = String(prefill ?? "").trim();
  const n = parseIntSafe(str);
  rows.value.push({
    id: nextId++,
    input: str,
    valid: n != null, // pre-validate if it looks like a valid number
    value: n,
  });
}

// Remove a row by id; always keep at least one row visible.
function removeRow(id) {
  rows.value = rows.value.filter((r) => r.id !== id);
  if (!rows.value.length) addRow();
}

// Whenever the modal opens, clear errors/summary and ensure at least one row.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    error.value = null;
    summary.value = null;
    if (!rows.value.length) {
      rows.value = [{ id: nextId++, input: "", valid: false, value: null }];
    }
  }
);

// Validate all inputs, call API to create keys, and emit back a summary.
async function handleSubmit() {
  if (saving.value) return;
  error.value = null;
  summary.value = null;

  // Parse all inputs and dedupe before sending to the backend.
  const parsed = rows.value
    .map((r) => parseIntSafe(r.input))
    .filter((n) => n != null);
  const nums = Array.from(new Set(parsed)); // dedupe

  if (!nums.length) {
    error.value = "Add at least one valid, non-duplicate key number.";
    return;
  }

  saving.value = true;
  const created = [];
  const failures = [];

  try {
    // Create each key sequentially to build a clear success/failure summary.
    for (const num of nums) {
      try {
        await createKey({ number: num });
        created.push(num);
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || "Failed";
        failures.push({ num, error: msg });
      }
    }

    // Store a summary for the UI (which keys worked vs failed).
    summary.value = { created, failures };

    // Reset the form back to a single blank row after submission.
    resetRowsToSingleEmpty();

    // Notify parent how many keys were created/failed.
    emit("saved", {
      createdCount: created.length,
      failureCount: failures.length,
    });

    // Close only if everything succeeded; otherwise stay open for fixes.
    if (failures.length === 0) {
      emit("close");
    }
  } catch (e) {
    // Fallback error if something unexpected happens.
    error.value = e?.message || "Create failed.";
  } finally {
    // Always clear the saving flag so UI can re-enable buttons.
    saving.value = false;
  }
}
</script>
