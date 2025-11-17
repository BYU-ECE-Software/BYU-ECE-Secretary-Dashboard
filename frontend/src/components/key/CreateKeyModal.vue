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
              @valid="onRowValid(row, $event)"
              @invalid="onRowInvalid(row)"
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

      <!-- Success banner (only when we created at least one) -->
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
import { ref, computed, watch } from "vue";
import BaseEditModal from "@/components/BaseEditModal.vue";
import KeyNumberInput from "@/components/key/KeyNumberInput.vue";
import { createKey } from "@/api/key";
import { TrashIcon } from "@heroicons/vue/24/solid";
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "saved"]);

/** rows: [{ id, input, valid, value (int) }] */
let nextId = 1;
const rows = ref([{ id: nextId++, input: "", valid: false, value: null }]);

const saving = ref(false);
const error = ref(null);
const summary = ref(null);

/* ——— helpers ——— */
function resetRowsToSingleEmpty() {
  rows.value = [{ id: nextId++, input: "", valid: false, value: null }];
}

function addRow(prefill = "") {
  const str = String(prefill ?? "").trim();
  const n = parseIntSafe(str);
  rows.value.push({
    id: nextId++,
    input: str,
    valid: n != null, // pre-validate if number
    value: n,
  });
}

function removeRow(id) {
  rows.value = rows.value.filter((r) => r.id !== id);
  if (!rows.value.length) addRow();
}

function parseIntSafe(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/* KeyNumberInput hooks per row */
function onRowValid(row, numericValue) {
  row.valid = true;
  row.value = numericValue ?? parseIntSafe(row.input);
}
function onRowInvalid(row) {
  row.valid = false;
  row.value = null;
}

/* Duplicate detection within current list */
const counts = computed(() => {
  const map = new Map();
  for (const r of rows.value) {
    if (r.value != null) map.set(r.value, (map.get(r.value) || 0) + 1);
  }
  return map;
});
function isDuplicate(row) {
  return row.value != null && (counts.value.get(row.value) || 0) > 1;
}

function rowError(row) {
  if (!row.input?.trim()) return null;
  if (!row.valid) return "Enter a positive whole number.";
  if (isDuplicate(row)) return "Duplicate in list.";
  return null;
}

const validNumbers = computed(() =>
  rows.value
    .filter((r) => r.valid && r.value != null && !isDuplicate(r))
    .map((r) => r.value)
);

const canSave = computed(() => validNumbers.value.length > 0);

/* Reset on open */
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

/* Submit */
async function handleSubmit() {
  if (saving.value) return;
  error.value = null;
  summary.value = null;

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
    // Create each key (sequential for simple, readable summary)
    for (const num of nums) {
      try {
        await createKey({ number: num });
        created.push(num);
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || "Failed";
        failures.push({ num, error: msg });
      }
    }

    summary.value = { created, failures };

    resetRowsToSingleEmpty();

    // Notify parent
    emit("saved", {
      createdCount: created.length,
      failureCount: failures.length,
    });

    // Always close if fully successful; otherwise stay open to fix issues
    if (failures.length === 0) {
      emit("close");
    }
  } catch (e) {
    error.value = e?.message || "Create failed.";
  } finally {
    saving.value = false;
  }
}
</script>
