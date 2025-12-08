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
      @edit="openEditStudent"
    />

    <!-- Create/Edit Student Modal -->
    <CreateEditStudentModal
      :open="showCreateStudent"
      :mode="modalMode"
      :student="editingStudent"
      @close="showCreateStudent = false"
      @saved="onStudentSaved"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import StudentsTable from "@/components/student/StudentsTable.vue";
import { fetchUsers } from "@/api/user";
import PrimaryButton from "../PrimaryButton.vue";
import SearchInput from "../SearchInput.vue";
import { PlusIcon } from "@heroicons/vue/24/solid";
import CreateEditStudentModal from "./CreateEditStudentModal.vue";

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
</script>
