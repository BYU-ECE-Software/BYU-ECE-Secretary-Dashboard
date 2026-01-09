<template>
  <main class="p-6">
    <!-- Toolbar -->
    <div
      class="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <!-- Left: button group -->
      <div class="flex items-center gap-4">
        <!-- Create new Key Button -->
        <PrimaryButton label="Add new Student" @click="openCreateStudent">
          <template #icon>
            <PlusIcon class="h-4 w-4" />
          </template>
        </PrimaryButton>

        <PrimaryButton
          label="Delete"
          :disabled="!hasSelection"
          class="bg-white border border-byu-royal text-byu-royal hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-400 disabled:bg-white disabled:hover:bg-white"
          @click="onClickDelete"
        >
          <template #icon>
            <TrashIcon class="h-4 w-4" />
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

    <!-- Error message -->
    <div
      v-if="error"
      class="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <!-- Students table -->
    <StudentsTable
      :students="students"
      :loading="loading"
      :selected-ids="selectedStudentIds"
      @edit="openEditStudent"
      @selection-change="selectedStudentIds = $event"
    />

    <!-- Create/Edit Student Modal -->
    <CreateEditStudentModal
      :open="showCreateStudent"
      :mode="modalMode"
      :student="editingStudent"
      @close="showCreateStudent = false"
      @saved="onStudentSaved"
    />
    <!-- Confirm Student Deletion Modal -->
    <ConfirmModal
      :open="showDeleteConfirm"
      title="Confirm deletion"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      variant="danger"
      :confirmDisabled="deleteProblems.length > 0"
      :busy="deleteBusy"
      :busyLabel="'Deleting…'"
      :closeOnBackdrop="!deleteBusy"
      @cancel="onCancelDelete"
      @confirm="onConfirmDelete"
    >
      <template #body>
        <p class="text-sm text-gray-700 mb-3">
          {{ deleteBaseMessage }}
        </p>

        <div v-if="deleteProblems.length">
          <p class="text-sm font-medium text-gray-800 mb-1">
            The following issues need to be resolved before deletion can take
            place:
          </p>

          <ul class="space-y-2">
            <li
              v-for="(p, i) in deleteProblems"
              :key="i"
              class="flex items-start justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2"
            >
              <div class="text-sm text-red-800">
                <!-- show problem text -->
                <span class="leading-5">{{ p.text }}</span>
              </div>

              <!-- action buttons -->
              <div class="flex flex-col gap-2 shrink-0">
                <!-- Locker only for now -->
                <button
                  v-if="p.type === 'locker'"
                  type="button"
                  class="px-2 py-1 rounded-md text-xs font-medium border border-byu-royal text-byu-royal bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  :disabled="resolvingLockerForUserId === p.userId"
                  @click="onResolveLocker(p)"
                >
                  {{
                    resolvingLockerForUserId === p.userId
                      ? "Removing…"
                      : "Remove locker assignment"
                  }}
                </button>

                <button
                  type="button"
                  class="px-2 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                  @click="onSkipDeleteStudent(p)"
                >
                  Do not delete student
                </button>
              </div>
            </li>
          </ul>
        </div>
      </template>
    </ConfirmModal>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import StudentsTable from "@/components/student/StudentsTable.vue";
import {
  fetchUsers,
  getUserDeleteCheck,
  deleteUser,
  deleteUsersBulk,
} from "@/api/user";
import { updateLocker } from "@/api/locker";
import PrimaryButton from "../PrimaryButton.vue";
import SearchInput from "../SearchInput.vue";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
import CreateEditStudentModal from "./CreateEditStudentModal.vue";
import ConfirmModal from "../ConfirmModal.vue";

const students = ref([]);
const loading = ref(false);
const error = ref("");

// modal state
const showCreateStudent = ref(false);
const modalMode = ref("create");
const editingStudent = ref(null);

// search state
const search = ref("");
let searchTimer = null;

// state to store selected (by checkbox) Student Ids
const selectedStudentIds = ref([]);
const hasSelection = computed(() => selectedStudentIds.value.length > 0); // True when at least one student is selected in the table

// delete modal state
const showDeleteConfirm = ref(false);
const deleteTargetIds = ref([]); // store which ids we're about to delete (for now: just show message)
const deleteBusy = ref(false);
const deleteBaseMessage = ref("");
const deleteProblems = ref([]);
const resolvingLockerForUserId = ref(null);

// delete can only happen if there are no problems with the users set to be deleted
const canConfirmDelete = computed(() => deleteProblems.value.length === 0);

// Initial load and reset load. Load only students (positionId = 1)
const loadStudents = async () => {
  loading.value = true;
  error.value = "";

  try {
    // Full load: positionId = 1 (students)
    const data = await fetchUsers(1);
    students.value = data;
  } catch (err) {
    console.error("Failed to load students:", err);
    error.value = "Failed to load students. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Search-only loader
const searchStudents = async () => {
  const q = search.value.trim();
  error.value = "";

  try {
    // assuming fetchUsers(positionId, q)
    const data = await fetchUsers(1, q || undefined);
    students.value = data;
  } catch (err) {
    console.error("Failed to search students:", err);
    error.value = "Failed to load students. Please try again.";
    // notice: we do NOT touch `loading` here
  }
};

onMounted(() => {
  loadStudents();
});

// called whenever the user types in the search box
const onSearchInput = () => {
  clearTimeout(searchTimer);

  const q = search.value.trim();

  // If search is cleared → reload full list with the normal loader
  if (!q) {
    loadStudents();
    return;
  }

  // Debounce: only fire after user stops typing for ~250ms
  searchTimer = setTimeout(() => {
    searchStudents(); // smooth update: only students.value changes
  }, 250);
};

// open modal in CREATE mode
const openCreateStudent = () => {
  modalMode.value = "create";
  editingStudent.value = null;
  showCreateStudent.value = true;
};

// open modal in EDIT mode with a student
const openEditStudent = (student) => {
  modalMode.value = "edit";
  editingStudent.value = student;
  showCreateStudent.value = true;
};

// when the edit/create modal successfully saves
const onStudentSaved = () => {
  showCreateStudent.value = false;

  // refresh list to include the new student (full reload, with loader once)
  loadStudents();
};

// build a message warning user that student to be deleted has current connections (locker, grad lab, etc) to ensure safe/informed deletion
function buildDeleteCheckMessage(check, totalCount) {
  const c = check.connections;
  const problems = [];

  if (c.locker) {
    problems.push({
      type: "locker",
      userId: check.user.id,
      userName: check.user.name,
      lockerNumber: c.locker.number,
      text: `${check.user.name} is currently assigned to Locker #${c.locker.number}.`,
    });
  }

  /*if (c.deskAsStudent) {
    problems.push(
      `${check.user.name} is assigned to Desk #${c.deskAsStudent.number} (student).`
    );
  }

  if (c.desksAsProfessor?.length) {
    problems.push(
      `${check.user.name} is assigned to Desk(s) ${c.desksAsProfessor
        .map((d) => `#${d.number}`)
        .join(", ")} (professor).`
    );
  }

  if (c.keysCount > 0) {
    problems.push(`${check.user.name} has ${c.keysCount} key(s) assigned.`);
  }

  if (c.roomAccessCount > 0) {
    problems.push(
      `${check.user.name} has ${c.roomAccessCount} room access assignment(s).`
    );
  }*/

  return {
    baseMessage: `This will permanently delete ${totalCount} ${
      totalCount === 1 ? "student" : "students"
    } from the current list.`,
    problems,
  };
}

// when delete button is pushed, show any potential connections the student has first to ensure safe deletion
const onClickDelete = async () => {
  if (!hasSelection.value) return;

  // For now: if multiple selected, show checks for ALL of them
  const ids = [...selectedStudentIds.value];
  deleteTargetIds.value = ids;

  try {
    deleteBusy.value = true;

    const checks = await Promise.all(ids.map((id) => getUserDeleteCheck(id)));

    // Total Number of Student records set to be deleted
    const totalCount = checks.length;

    // Build message
    const results = checks.map((check) =>
      buildDeleteCheckMessage(check, totalCount)
    );

    deleteBaseMessage.value = results[0].baseMessage;
    deleteProblems.value = results.flatMap((r) => r.problems);

    showDeleteConfirm.value = true;
  } catch (err) {
    console.error("Failed to fetch delete-check:", err);
    error.value = "Could not check connections for selected student(s).";
  } finally {
    deleteBusy.value = false;
  }
};

// refresh the Delete Confirmation Modal whenever a button is pushed
const refreshDeletePreflight = async () => {
  const ids = [...deleteTargetIds.value];
  if (!ids.length) return;

  const checks = await Promise.all(ids.map((id) => getUserDeleteCheck(id)));
  const totalCount = checks.length;

  const results = checks.map((check) =>
    buildDeleteCheckMessage(check, totalCount)
  );

  deleteBaseMessage.value = results[0]?.baseMessage || "";
  deleteProblems.value = results.flatMap((r) => r.problems);
};

// Resolve a locker assignment from within the delete modal
const onResolveLocker = async (problem) => {
  try {
    resolvingLockerForUserId.value = problem.userId;

    await updateLocker(problem.lockerNumber, {
      userId: null,
      className: null,
      endDate: null,
    });

    // Re-run preflight so the modal reflects the cleared assignment
    await refreshDeletePreflight();
  } catch (e) {
    console.error(e);
    alert(
      e?.response?.data?.error ||
        e?.message ||
        "Failed to remove the student from this locker."
    );
  } finally {
    resolvingLockerForUserId.value = null;
  }
};

// Remove a student from the list of students to be deleted
const onSkipDeleteStudent = async (problem) => {
  const idToRemove = problem.userId;

  // 1) Remove from the delete modal's target ids
  deleteTargetIds.value = deleteTargetIds.value.filter(
    (id) => id !== idToRemove
  );

  // 2) Remove from the table selection too (keeps UI consistent)
  selectedStudentIds.value = selectedStudentIds.value.filter(
    (id) => id !== idToRemove
  );

  // 3) If nothing left to delete, close modal and clear modal state
  if (deleteTargetIds.value.length === 0) {
    showDeleteConfirm.value = false;
    deleteBaseMessage.value = "";
    deleteProblems.value = [];
    resolvingLockerForUserId.value = null;
    return;
  }

  // 4) Otherwise, refresh the modal contents immediately
  await refreshDeletePreflight();
};

// Reset Delete Modal when it is closed
function resetDeleteModalState() {
  showDeleteConfirm.value = false;
  deleteTargetIds.value = [];
  deleteBaseMessage.value = "";
  deleteProblems.value = [];
  resolvingLockerForUserId.value = null;
}

// Adjust student list after students are deleted
async function refreshStudentListAfterDelete() {
  // Keep the user in their current search context if they were searching
  const q = search.value.trim();
  if (q) await searchStudents();
  else await loadStudents();
}

// When Cancel Button is Pushed on Delete Modal
const onCancelDelete = () => {
  // don’t allow cancel while the delete request is running
  if (deleteBusy.value) return;
  resetDeleteModalState();
};

// Delete one to many students
const onConfirmDelete = async () => {
  // Safety checks: modal should already prevent this via confirmDisabled
  if (deleteBusy.value) return;
  if (deleteProblems.value.length > 0) return;

  const ids = [...deleteTargetIds.value];
  if (!ids.length) {
    resetDeleteModalState();
    return;
  }

  try {
    deleteBusy.value = true;
    error.value = "";

    if (ids.length === 1) {
      await deleteUser(ids[0]);
    } else {
      await deleteUsersBulk(ids);
    }

    // Close + clear modal state
    resetDeleteModalState();

    // Clear selection in table (this is what removes checkmarks visually)
    selectedStudentIds.value = [];

    // Reload table data
    await refreshStudentListAfterDelete();
  } catch (err) {
    console.error("Failed to delete student(s):", err);
    error.value =
      err?.response?.data?.error ||
      err?.message ||
      "Failed to delete student(s). Please try again.";
  } finally {
    deleteBusy.value = false;
  }
};
</script>
