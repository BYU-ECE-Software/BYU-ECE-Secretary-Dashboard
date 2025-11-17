<template>
  <BaseEditModal
    :open="open"
    :title="'Assign Key to a Professor'"
    :saving="saving"
    :submitDisabled="!canSave"
    saveLabel="Save"
    size="md"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="flex flex-col gap-4">
      <!-- SECTION A: KEY NUMBER -->
      <section class="space-y-2">
        <h3 class="text-sm font-semibold text-byu-navy flex items-center gap-2">
          <span>Lookup key assignment</span>
        </h3>

        <div class="flex items-start gap-2">
          <KeyNumberInput
            v-model="number"
            class="flex-1"
            placeholder="Enter key number"
            @valid="onNumberValid"
            @invalid="onNumberInvalid"
          />
          <button
            type="button"
            class="px-3 py-2 rounded-lg border border-byu-navy/40 text-byu-navy text-sm hover:bg-byu-navy/5 cursor-pointer"
            :disabled="!numberInt || checking"
            @click="manualCheck"
          >
            <span v-if="!checking">Lookup</span>
            <span v-else class="opacity-60">Checking…</span>
          </button>
        </div>

        <!-- Missing key notice -->
        <div
          v-if="showMissingBanner"
          class="rounded-lg border border-amber-300 bg-amber-50 p-3 mt-4"
        >
          <div class="flex items-start gap-2">
            <!-- tiny warning icon, no extra imports -->
            <ExclamationTriangleIcon
              class="h-5 w-5 text-amber-600"
              aria-hidden="true"
            />

            <div class="flex-1">
              <div class="text-sm font-semibold text-byu-navy">
                Key #{{ numberInt }} doesn’t currently exist
              </div>
              <p class="text-sm text-byu-navy/90 mt-0.5">
                Would you like to create this key and continue the assignment
                process?
              </p>

              <label
                class="mt-2 inline-flex items-center gap-2 text-sm text-byu-navy"
              >
                <input
                  type="checkbox"
                  class="rounded border-gray-300"
                  v-model="willCreateKey"
                />
                <span>Create Key #{{ numberInt }} on "Save"</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION B: PROFESSOR (only after key is resolved) -->
      <section
        class="space-y-2 overflow-visible"
        v-if="resolved === 'found' || (resolved === 'missing' && willCreateKey)"
      >
        <hr class="border-t border-gray-200" />

        <!-- If we’re keeping the existing assignment, show the PersonCard -->
        <PersonCard
          v-if="keepExisting"
          :person="existingProfessor"
          label="Currently Assigned to"
        >
          <template #actions>
            <button
              type="button"
              class="px-2.5 py-1 rounded-lg border border-byu-navy/30 text-byu-navy text-[11px] hover:bg-byu-navy/5 transition cursor-pointer"
              @click="removingExisting = true"
            >
              Clear
            </button>
          </template>
        </PersonCard>

        <!-- Otherwise show the picker (either they cleared, or there was no assignee) -->

        <ProfessorPicker
          v-else
          :key="pickerKey"
          v-model:selected="selectedProfessor"
          v-model:newPerson="newProfessor"
          :position-id="2"
          class="mt-4"
        />

        <p v-if="error" class="text-sm text-red-600 pt-1">{{ error }}</p>
      </section>
    </div>
  </BaseEditModal>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import BaseEditModal from "@/components/BaseEditModal.vue";
import KeyNumberInput from "@/components/key/KeyNumberInput.vue";
import PersonCard from "@/components/common/PersonCard.vue";
import ProfessorPicker from "@/components/common/ProfessorPicker.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

import { getKeyByNumber, createKey, updateKey } from "@/api/key";
import { createUser } from "@/api/user";

/* Props / Emits */
const props = defineProps({
  open: { type: Boolean, required: true },
  keyItem: { type: Object, default: null }, // { number, user? } (optional prefill)
});
const emit = defineEmits(["close", "saved"]);

/* State */
const number = ref("");
const numberInt = computed(() => {
  const n = parseInt(number.value, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
});

const checking = ref(false);
const keyFound = ref(false); // keep for internal logic
const willCreateKey = ref(false); // toggled in missing case

// current assignee info
const existingProfessor = ref(null);
const removingExisting = ref(false);
const currentAssigneeId = computed(() => existingProfessor.value?.id ?? null);

const selectedProfessor = ref(null);
const newProfessor = ref({ firstName: "", lastName: "", email: "" });

const error = ref(null);
const saving = ref(false);

// 'found' | 'missing' | null
const resolved = ref(null);
const showMissingBanner = computed(() => resolved.value === "missing");

const lastCheckedNumber = ref(null); // number that produced current resolved state

const pickerKey = computed(() => {
  // Change this if your notion of “context” differs.
  // Using the last checked number + resolved state is a good reset trigger.
  return `${resolved.value ?? "unset"}:${numberInt.value || ""}`;
});

// --- Save gating ---
// user provided a professor (existing or new)
const newProfFilled = computed(
  () =>
    (newProfessor.value.firstName || "").trim() &&
    (newProfessor.value.lastName || "").trim() &&
    (newProfessor.value.email || "").trim()
);

// when a key is found AND it has a user AND user hasn’t clicked “clear”
const keepExisting = computed(
  () =>
    resolved.value === "found" &&
    !!existingProfessor.value &&
    !removingExisting.value &&
    !selectedProfessor.value &&
    !newProfFilled.value
);

const hasProfessor = computed(
  () => keepExisting.value || !!selectedProfessor.value || !!newProfFilled.value
);

// valid key path = number checked + (found OR (missing & opted to create))
const hasKey = computed(
  () =>
    numberInt.value > 0 &&
    (resolved.value === "found" ||
      (resolved.value === "missing" && willCreateKey.value === true))
);

// final gate for Save (per your requirement: professor is required in this modal)
const canSave = computed(
  () => hasKey.value && hasProfessor.value && !checking.value
);

/* Lifecycle: open/reset */
watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;

    // reset form
    number.value = "";
    checking.value = false;
    keyFound.value = false;
    willCreateKey.value = false;

    existingProfessor.value = null;
    removingExisting.value = false;

    selectedProfessor.value = null;
    newProfessor.value = { firstName: "", lastName: "", email: "" };

    error.value = null;
    resolved.value = null;

    // Prefill from a key row (optional)
    if (props.keyItem && props.keyItem.number) {
      number.value = String(props.keyItem.number);
      await lookup(numberInt.value); // <— triggers “found” and shows Section B
    }
  }
);

/* Number input handlers */
async function onNumberValid(n) {
  await lookup(n);
}
function onNumberInvalid() {
  resolved.value = null;
  keyFound.value = false;
  willCreateKey.value = false;
  existingProfessor.value = null;
  removingExisting.value = false;

  // also clear selection since key changed back to invalid
  clearProfessor();
}

async function manualCheck() {
  if (!numberInt.value) return;
  await lookup(numberInt.value);
}

watch(willCreateKey, (checked) => {
  if (!checked && resolved.value === "missing") {
    clearProfessor(); // hide + reset picker selection when they uncheck
  }
});

watch(number, () => {
  // If they’re editing, hide any prior result/banner immediately
  resolved.value = null; // hides the missing banner
  willCreateKey.value = false; // uncheck the “create on save”
  keyFound.value = false;
  error.value = null;

  // also reset professor UI because key context changed
  clearProfessor();
  removingExisting.value = false;

  // We’re now “between states” until Lookup/Enter/blur triggers a new check
});

async function lookup(n) {
  checking.value = true;
  error.value = null;

  clearProfessor();
  removingExisting.value = false;

  try {
    const key = await getKeyByNumber(n).catch(() => null);
    lastCheckedNumber.value = n;

    if (key) {
      resolved.value = "found";
      keyFound.value = true;
      willCreateKey.value = false;
      existingProfessor.value = key.user ?? null;
      removingExisting.value = false;
    } else {
      resolved.value = "missing";
      keyFound.value = false;
      willCreateKey.value = false;
      existingProfessor.value = null;
    }
  } catch (e) {
    resolved.value = null;
    error.value =
      e?.response?.data?.error || e?.message || "Failed to check key.";
    keyFound.value = false;
    willCreateKey.value = false;
    existingProfessor.value = null;
  } finally {
    checking.value = false;
  }
}

function clearProfessor() {
  selectedProfessor.value = null;
  newProfessor.value = { firstName: "", lastName: "", email: "" };
}

/* Submit */
async function handleSubmit() {
  if (saving.value) return;
  error.value = null;

  if (!canSave.value) {
    error.value = !hasKey.value
      ? "Enter a valid key and (if missing) check 'Create this key on Save'."
      : "Pick a professor or add a new one.";
    return;
  }

  const n = numberInt.value;

  try {
    saving.value = true;

    // create key if needed
    if (!keyFound.value && willCreateKey.value) {
      await createKey({ number: n });
      keyFound.value = true;
    }

    // --- resolve the professor id for the assignment ---
    const creatingNewProfessor =
      (newProfessor.value.firstName || "").trim() &&
      (newProfessor.value.lastName || "").trim() &&
      (newProfessor.value.email || "").trim();

    let finalProfessorId = null;

    if (keepExisting.value && currentAssigneeId.value) {
      // ✅ keep the current assignment
      finalProfessorId = currentAssigneeId.value;
    } else if (creatingNewProfessor) {
      const created = await createUser({
        ...newProfessor.value,
        positionId: 2,
        byuId: null,
        netId: null,
      });
      finalProfessorId = created.id;
    } else if (selectedProfessor.value) {
      finalProfessorId = selectedProfessor.value.id;
    } else {
      // safety (shouldn’t happen because canSave = true)
      throw new Error("No professor selected.");
    }

    // Optional no-op short-circuit: don’t call API if nothing changed
    if (
      resolved.value === "found" &&
      currentAssigneeId.value === finalProfessorId
    ) {
      emit("saved");
      return;
    }

    await updateKey(n, { userId: finalProfessorId });
    emit("saved");
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || "Failed to save.";
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
hr {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
</style>
