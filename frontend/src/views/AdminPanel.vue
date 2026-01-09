<template>
  <main class="max-w-xl mx-auto p-6 space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold text-byu-navy">
        Admin – Important Dates
      </h1>
      <p class="text-sm text-gray-600">
        Quick demo form to create a new important date.
      </p>
    </header>

    <!-- Status messages -->
    <div
      v-if="successMessage"
      class="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800"
    >
      {{ successMessage }}
    </div>
    <div
      v-if="errorMessage"
      class="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800"
    >
      {{ errorMessage }}
    </div>

    <!-- Simple form -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-byu-navy mb-1">
          Description
        </label>
        <input
          v-model="description"
          type="text"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
          placeholder="e.g., End of Fall Semester 2025"
        />
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-byu-navy mb-1">
          Date
        </label>
        <input
          v-model="assignedDate"
          type="date"
          class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
        />
      </div>

      <!-- Current Option (boolean) -->
      <div class="flex items-center gap-2">
        <input
          id="currentOption"
          v-model="currentOption"
          type="checkbox"
          class="h-4 w-4 border-gray-300 rounded"
        />
        <label for="currentOption" class="text-sm text-byu-navy">
          Mark this as the current active option
        </label>
      </div>

      <!-- Submit button -->
      <div>
        <button
          type="submit"
          :disabled="isSaving"
          class="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-byu-royal hover:bg-[#003C9E] disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <span v-if="!isSaving">Create Important Date</span>
          <span v-else>Saving…</span>
        </button>
      </div>
    </form>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { createImportantDate } from "@/api/importantDate";
import { ymdToUtcIso } from "@/utils/formatDate";

// simple form state
const description = ref("");
const assignedDate = ref("");
const currentOption = ref(false);

// ui state
const isSaving = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// basic submit handler to call the API
async function handleSubmit() {
  successMessage.value = "";
  errorMessage.value = "";

  // super light validation (just to avoid empty submits)
  if (!description.value.trim() || !assignedDate.value) {
    errorMessage.value = "Please enter a description and choose a date.";
    return;
  }

  // ✅ convert "YYYY-MM-DD" → ISO at UTC midnight, same pattern you use elsewhere
  const isoAssignedDate = ymdToUtcIso(assignedDate.value);
  if (!isoAssignedDate) {
    errorMessage.value = "Invalid date. Please pick a valid calendar date.";
    return;
  }

  try {
    isSaving.value = true;

    await createImportantDate({
      description: description.value.trim(),
      assignedDate: isoAssignedDate, // ✅ send ISO string, not raw YYYY-MM-DD
      currentOption: currentOption.value,
    });

    successMessage.value = "Important date created successfully!";
    // reset form
    description.value = "";
    assignedDate.value = "";
    currentOption.value = false;
  } catch (e) {
    console.error(e);
    errorMessage.value =
      e?.response?.data?.error || e?.message || "Failed to create date.";
  } finally {
    isSaving.value = false;
  }
}
</script>
