<template>
  <BaseEditModal
    :open="open"
    :title="modalTitle"
    :saving="saving"
    :submitDisabled="!canSave"
    :saveLabel="saveLabel"
    size="md"
    @close="$emit('close')"
    @submit="handleSubmit"
  >
    <div class="mt-2 flex flex-col gap-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- First name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-byu-navy">First name *</label>
          <input
            v-model="form.firstName"
            type="text"
            class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            placeholder="First name"
          />
        </div>

        <!-- Last name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-byu-navy">Last name *</label>
          <input
            v-model="form.lastName"
            type="text"
            class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            placeholder="Last name"
          />
        </div>

        <!-- BYU ID -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-byu-navy">BYU ID *</label>
          <input
            v-model="form.byuId"
            type="text"
            class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            placeholder="BYU ID"
          />
        </div>

        <!-- NetID -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-byu-navy">NetID *</label>
          <input
            v-model="form.netId"
            type="text"
            class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            placeholder="NetID"
          />
        </div>

        <!-- Email (full width) -->
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label class="text-sm font-medium text-byu-navy">Email *</label>
          <input
            v-model="form.email"
            type="email"
            class="border border-byu-navy rounded-md px-3 py-2 text-sm bg-byu-white focus:outline-none focus:ring-1 focus:ring-byu-navy focus:border-byu-navy transition"
            placeholder="Email"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg border border-byu-navy bg-byu-navy/5 text-byu-navy text-sm hover:bg-byu-navy/10 hover:shadow-sm transition cursor-pointer"
          @click="resetForm"
        >
          Clear
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-600 mt-1">
        {{ error }}
      </p>
    </div>
  </BaseEditModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import BaseEditModal from "../BaseEditModal.vue";
import { createUser, updateUser } from "@/api/user";

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: {
    type: String,
    default: "create", // 'create' or 'edit'
    validator: (v) => ["create", "edit"].includes(v),
  },
  student: {
    type: Object,
    default: null, // existing student when editing
  },
});

const emit = defineEmits(["close", "saved"]);

const saving = ref(false);
const error = ref("");

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  byuId: "",
  netId: "",
});

// Modal Details based on if it is creating a student or editing an exisiting student
const modalTitle = computed(() =>
  props.mode === "edit" ? "Edit Student" : "Create New Student"
);
const saveLabel = computed(() => (props.mode === "edit" ? "Update" : "Save"));

// enable Save only when required fields are filled
const canSave = computed(() => {
  return (
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.byuId.trim() &&
    form.netId.trim()
  );
});

// reset the form on clear
function resetForm() {
  form.firstName = "";
  form.lastName = "";
  form.email = "";
  form.byuId = "";
  form.netId = "";
  error.value = "";
}

// fill the form with existing student info if editing
function fillFormFromStudent(student) {
  if (!student) {
    resetForm();
    return;
  }

  form.firstName = student.firstName || "";
  form.lastName = student.lastName || "";
  form.email = student.email || "";
  form.byuId = student.byuId || "";
  form.netId = student.netId || "";
}

watch(
  () => [props.open, props.mode, props.student],
  ([isOpen]) => {
    if (!isOpen) return;

    error.value = "";

    if (props.mode === "edit" && props.student) {
      fillFormFromStudent(props.student);
    } else {
      resetForm();
    }
  }
);

async function handleSubmit() {
  if (!canSave.value || saving.value) return;

  try {
    saving.value = true;
    error.value = "";

    let result;

    if (props.mode === "edit" && props.student?.id) {
      // EDIT existing student
      result = await updateUser(props.student.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        byuId: form.byuId,
        netId: form.netId,
        positionId: props.student.positionId ?? 1,
      });
    } else {
      // CREATE new student (positionId = 1)
      result = await createUser({
        ...form,
        positionId: 1,
      });
    }

    emit("saved", result);
  } catch (e) {
    console.error(e);
    error.value = e?.response?.data?.error || e?.message || "Failed to save.";
  } finally {
    saving.value = false;
  }
}
</script>
