<template>
  <section
    class="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-6xl xl:max-w-7xl mx-auto"
  >
    <!-- Header row -->
    <div
      class="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
    >
      <h2 class="text-base font-semibold text-byu-navy">All Students</h2>
      <p class="text-xs text-gray-500">
        {{ students.length }} student<span v-if="students.length !== 1">s</span>
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="px-6 py-8 text-center text-sm text-gray-600">
      Loading students…
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!students.length"
      class="px-6 py-8 text-center text-sm text-gray-600"
    >
      No students found.
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full text-sm text-byu-navy">
        <!-- Header -->
        <thead class="bg-slate-50 text-[13px] tracking-wide text-gray-500">
          <tr>
            <th class="px-6 py-5 text-left whitespace-nowrap">
              <input
                ref="headerCheckboxEl"
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="h-4 w-4 rounded border-gray-300 text-byu-royal focus:ring-byu-royal"
              />
            </th>
            <th class="px-6 py-5 text-left whitespace-nowrap">Name</th>
            <th class="px-6 py-3 text-left whitespace-nowrap">BYU ID Number</th>
            <th class="px-6 py-3 text-left whitespace-nowrap">Net ID</th>
            <th class="px-6 py-3 text-left whitespace-nowrap">Email</th>
            <th class="px-6 py-3 text-left whitespace-nowrap">Locker</th>
            <th class="px-6 py-3 text-left whitespace-nowrap">Grad Lab Desk</th>
            <th class="px-6 py-3 text-left whitespace-nowrap">
              Door Code Access
            </th>
            <th class="px-6 py-3 text-left whitespace-nowrap"></th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <tr
            v-for="student in students"
            :key="student.id"
            class="hover:bg-byu-royal/10 transition-colors"
          >
            <!-- Multi Select Checkbox -->
            <td class="px-6 py-4 align-middle">
              <input
                type="checkbox"
                :checked="selectedIds.has(student.id)"
                @change="toggleRow(student.id)"
                class="h-4 w-4 rounded border-gray-300 text-byu-royal focus:ring-byu-royal"
              />
            </td>
            <!-- Name -->
            <td class="px-6 py-4 align-middle">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-byu-navy">
                  {{ student.firstName + " " + student.lastName }}
                </span>
              </div>
            </td>

            <!-- BYU ID -->
            <td class="px-6 py-3 align-middle text-gray-700 whitespace-nowrap">
              {{ student.byuId || "—" }}
            </td>

            <!-- Net ID -->
            <td class="px-6 py-3 align-middle text-gray-700 whitespace-nowrap">
              {{ student.netId || "—" }}
            </td>

            <!-- Email -->
            <td class="px-6 py-3 align-middle text-gray-700">
              <span class="text-xs break-all">{{ student.email }}</span>
            </td>

            <!-- Locker -->
            <td class="px-6 py-3 align-middle">
              <!-- Has locker -->
              <div v-if="student.locker" class="whitespace-nowrap">
                <span
                  class="inline-flex items-center text-[11px]"
                  :class="lockerChipWrapperClass(student.locker.endDate)"
                >
                  <span class="font-semibold">
                    #{{ student.locker.number }}
                    {{ lockerVerb(student.locker.endDate) }}
                    {{ formatDate(student.locker.endDate) }}
                  </span>
                </span>
              </div>
            </td>
            <!-- Grad Lab Desk Space -->
            <td
              class="px-6 py-3 align-middle text-gray-700 whitespace-nowrap"
            ></td>
            <!-- Door Code Access -->
            <td
              class="px-6 py-3 align-middle text-gray-700 whitespace-nowrap"
            ></td>
            <!-- Edit Button -->
            <td class="px-6 py-3 align-middle">
              <div class="flex justify-center">
                <button
                  class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md text-gray-800 text-[11px] cursor-pointer"
                  role="menuitem"
                  @click="emit('edit', student)"
                >
                  <PencilSquareIcon
                    class="h-4 w-4 text-byu-royal"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { toYMDUTC } from "@/utils/formatDate";
import { PencilSquareIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  students: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
});

// emits
const emit = defineEmits(["edit", "selection-change"]);

/** ---- Student Selection state ---- */

// IDs of students that are currently selected (checked)
const selectedIds = ref(new Set());

// keep internal set of selected student ids in sync when parent changes selection
watch(
  () => props.selectedIds,
  (ids) => {
    selectedIds.value = new Set(ids);
  },
  { immediate: true }
);

// Returns "true" when every student row checkbox is checked
const allSelected = computed(() => {
  return (
    props.students.length > 0 &&
    selectedIds.value.size === props.students.length
  );
});

// Returns "true" when some (but not all) student rows are selected
const someSelected = computed(() => {
  return (
    selectedIds.value.size > 0 && selectedIds.value.size < props.students.length
  );
});

// Show a dash in the header checkbox when some but not all rows are checked
const headerCheckboxEl = ref(null);
watch([someSelected, allSelected], () => {
  if (headerCheckboxEl.value) {
    headerCheckboxEl.value.indeterminate =
      someSelected.value && !allSelected.value;
  }
});

// give the parent StudentsPage the selected student IDs every time a checkbox changes
function emitSelection() {
  emit("selection-change", Array.from(selectedIds.value));
}

// Select or deselect all student rows when the header checkbox is toggled
function toggleSelectAll(e) {
  const checked = e.target.checked;

  if (checked) {
    const next = new Set();
    for (const s of props.students) next.add(s.id);
    selectedIds.value = next;
  } else {
    selectedIds.value = new Set();
  }

  emitSelection();
}

// Toggle selection for a single student row
function toggleRow(id) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;

  emitSelection();
}

//If the list of students changes (filtering/paging), keep selection in sync
watch(
  () => props.students,
  (students) => {
    const valid = new Set(students.map((s) => s.id));
    const next = new Set([...selectedIds.value].filter((id) => valid.has(id)));
    selectedIds.value = next;
  },
  { deep: true }
);

// UTC-safe days-left calculation
const daysLeft = (date) => {
  if (!date) return null;

  const endUTC = toYMDUTC(date); // e.g. "12/05/2025"
  if (!endUTC) return null;

  const end = new Date(endUTC + " UTC");

  const today = new Date();
  const todayStr = toYMDUTC(today);
  const todayUTC = new Date(todayStr + " UTC");

  const diffMs = end - todayUTC;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Decide how the wrapper span should look
const lockerChipWrapperClass = (endDate) => {
  const d = daysLeft(endDate);

  if (d <= 0) {
    // Expired → red rounded rectangle
    return "rounded-md px-1.5 py-1 font-medium bg-red-50 text-byu-red-bright";
  }

  if (d <= 7) {
    // Expiring soon → amber rounded rectangle
    return "rounded-md px-1.5 py-1 font-medium bg-amber-50 text-amber-700";
  }

  // In use, not close to expiring → simple gray text, no pill
  return "px-1.5 text-gray-600";
};

const lockerVerb = (endDate) => {
  const d = daysLeft(endDate);

  // If we somehow don't have a date, default to "Expires"
  if (d === null) return "Expires";

  // Today or in the past
  if (d <= 0) return "Expired";

  // Future date
  return "Expires";
};

// Use UTC-safe formatter for the date string
const formatDate = (date) => {
  const formatted = toYMDUTC(date);
  return formatted || "N/A";
};
</script>
