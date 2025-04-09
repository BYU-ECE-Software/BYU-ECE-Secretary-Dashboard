<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Card from 'primevue/card';
import Select from 'primevue/select';
import { TabMenu } from 'primevue';
import MultiSelect from 'primevue/multiselect';


// const toast = useToast();

//Boo we hate global variables
const editable = ref(false);

const activeTab = ref('students');
const tabs = ref([
  { label: 'Students', command: () => (activeTab.value = 'students') },
  { label: 'Lockers', command: () => (activeTab.value = 'lockers') },
  { label: 'Door Codes', command: () => (activeTab.value = 'doorcodes') },
  { label: 'Overleaf', command: () => (activeTab.value = 'overleaf') },
  { label: 'JupyterHub', command: () => (activeTab.value = 'jupyterhub') },
]);

// Reactive state for courses
const coursesList = ref([]);
const selectedCourses = ref([]);

const student = ref({
  name: '',
  netid: '',
  email: '',
  gradDate: '',
  locker: '',
  rooms: [],
  overleafStatus: '',
  overleafProfessor: '',
  jupyterhubStatus: '',
  jupyterhubClass: ''
});

const doorcode = ref({
  room: '',
  code: ''
});

const course = ref({
  name: '',
  description: '',
  lockers: [],
  students: [],
  skills: [],
  relatedCourses: [],
  offered: '',
  imageUrl: ''
});


const professorList = ref([
  'None', 'Hansen', 'Schooley', 'Usevitch'
]);
const softwareStatusList = ref([
  'Not requested', 'Requested', 'Provisioned', 'Retired'
]);

const studentDialog = ref(false);
const studentSubmitted = ref(false);

const doorcodeDialog = ref(false);
const doorcodeSubmitted = ref(false);

// Lists from API
const studentsList = ref([]);
const lockersList = ref([]);
const doorcodesList = ref([]);

watch(
  () => [student.name, student.overleafProfessor],
  ([name, professor]) => {
    if (name && professor) {
      student.overleafStatus = "Requested";
    }
  }
);

const filteredOverleafStudentsList = computed({
  get() {
    return this.studentsList.filter(student => student.overleafStatus !== "Not Requested");
  }
});


const editedStudents = ref(new Set());

const onCellEditComplete = (event) => {
  const { data, field, newValue } = event;

  if (field === "overleafProfessor" || field === "overleafStatus") {
    data[field] = newValue;
    editedStudents.value.add(data._id); // Track modified entries
  }
};

const saveStudentOverleafTableChanges = async () => {
  try {
    const updates = studentsList.value
      .filter(student => editedStudents.value.has(student._id))
      .map(({ _id, overleafProfessor, overleafStatus }) => ({
        _id,
        overleafProfessor,
        overleafStatus
      }));

    await axios.put('/api/students/update', updates);
    alert("Updated successfully!");
    editedStudents.value.clear();
  } catch (error) {
    console.error("Failed to update:", error);
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const fetchData = async () => {
  try {
    const [studentsRes, lockersRes, doorcodesRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_BASE_URI}/students`),
      axios.get(`${import.meta.env.VITE_API_BASE_URI}/lockers`),
      axios.get(`${import.meta.env.VITE_API_BASE_URI}/doorcodes`),
    ]);

    studentsList.value = studentsRes.data
    lockersList.value = lockersRes.data
    doorcodesList.value = doorcodesRes.data
  } catch (error) {
    console.error("Error fetching lists:", error);
  }
};


const getLockerNames = (lockerIds) => {
  if (!lockerIds || !Array.isArray(lockerIds)) return "-";

  return lockerIds
    .map(id => {
      const locker = lockersList.value.find(m => m._id === id);
      return locker ? locker.name : "Unknown";
    })
    .join(", ");
};

const getStudentNames = (studentIds) => {
  if (!studentIds || !Array.isArray(studentIds)) return "-";

  return studentIds
    .map(id => {
      const student = studentsList.value.find(i => i._id === id);
      return student ? student.name : "Unknown";
    })
    .join(", ");
};

const getDoorcodeRooms = (doorcodeIds) => {
  if (!doorcodeIds || !Array.isArray(doorcodeIds)) return "-";

  return doorcodeIds
    .map(id => {
      const doorcode = doorcodesList.value.find(i => i._id === id);
      return doorcode ? doorcode.room : "Unknown";
    })
    .join(", ");
};

// const lockers = ref([]);
const newLocker = ref({
  name: '',
  available: '',
  assignment: ''
});

const fetchLockers = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URI}/lockers`);
    lockersList.value = response.data
  } catch (error) {
    console.error("Error fetching lockers:", error);
  }
};

const addLocker = async () => {
  if (!newLocker.value.name) return;

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URI}/lockers`, { name: newLocker.value.name }); //remove for UI beta
    console.log("Posted");
    fetchLockers();
    newLocker.value.name = ''; // Clear input
  } catch (error) {
    console.error("Error adding locker:", error);
  }
};

const removeLocker = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URI}/lockers/${id}`); //remove for ui beta

    fetchLockers();
  } catch (error) {
    console.error("Error deleting locker:", error);
  }
};

const newDoorcode = ref({
  room: '',
  code: ''
});

const fetchDoorcodes = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URI}/doorcodes`);
    doorcodesList.value = response.data
  } catch (error) {
    console.error("Error fetching doorcodes:", error);
  }
};

const addDoorcode = async () => {
  if (!newDoorcode.value.room) return;

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URI}/doorcodes`, { room: newDoorcode.value.room, code: newDoorcode.value.code }); //Removed for beta UI test
    fetchDoorcodes();
    newDoorcode.value.room = ''; // Clear input
    newDoorcode.value.code = ''; // Clear input
  } catch (error) {
    console.error("Error adding doorcode:", error);
  }
};

const removeDoorcode = async (id) => {
  try {

    await axios.delete(`${import.meta.env.VITE_API_BASE_URI}/doorcodes/${id}`); //remove from ui beta test

    fetchDoorcodes();
  } catch (error) {
    console.error("Error deleting doorcode:", error);
  }
};


const fetchStudents = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URI}/students`);
    studentsList.value = response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
};

const removeStudent = async (selected) => {
  try {

    await axios.delete(`${import.meta.env.VITE_API_BASE_URI}/students/${selected._id}`); //remove for UI beta

    fetchStudents();
  } catch (error) {
    console.error("Error deleting student:", error);
  }
};


// Filters for DataTable search
const filters = reactive({
  global: { value: '' },
});


// Open new course dialog
const openNewDoorcodeDialog = () => {
  doorcode.value = {};
  doorcodeSubmitted.value = false;
  doorcodeDialog.value = true;
};

const openNewStudentDialog = () => {
  student.value = {};
  studentSubmitted.value = false;
  studentDialog.value = true;
}

// const updatedDoorcode = {};

// Save course (New or Edit)
const saveDoorcode = async () => {
  doorcodeSubmitted.value = true;

  if (!doorcode.value.room) return;

  try {
    const updatedDoorcode = { ...doorcode.value };

    // FIXED: Check `updatedCourse.id`, not `updatedCourse.value.id`
    if (updatedDoorcode._id != null) {
      await axios.put(`${import.meta.env.VITE_API_BASE_URI}/doorcodes/${updatedDoorcode._id}`, updatedDoorcode); //remove for UI beta
      // toast.add({ severity: 'success', summary: 'Success', detail: 'Course updated', life: 3000 });
    } else {
      // FIXED: Should use `updatedCourse`, not `updateCourse.value`

      await axios.post(`${import.meta.env.VITE_API_BASE_URI}/doorcodes`, updatedDoorcode); //remove for ui beta
      // toast.add({ severity: 'success', summary: 'Success', detail: 'Course added', life: 3000 });
    }

    doorcodeDialog.value = false;
    fetchDoorcodes(); // Refresh course list after saving
  } catch (error) {
    console.error("Error saving Doorcode:", error);
  }
};


// Save course (New or Edit)
const saveStudent = async () => {
  studentSubmitted.value = true;

  if (!student.value.name) return;

  try {
    const updatedStudent = { ...student.value };

    if (updatedStudent.locker) {
      updatedStudent.locker = updatedStudent.locker.map(name => {
        const locker = lockersList.value.find(l => l.name === name);
        return locker ? locker._id : name; // Use _id if found, otherwise keep the name
      });
    }
    if (updatedStudent.doorcodes) {
      updatedStudent.doorcodes = updatedStudent.doorcodes.map(room => {
        const doorcodes = doorcodesList.value.find(d => d.room === room);
        return doorcodes ? doorcodes._id : room;
      });
    }



    // FIXED: Check `updatedCourse.id`, not `updatedCourse.value.id`
    if (updatedStudent._id != null) {
      await axios.put(`${import.meta.env.VITE_API_BASE_URI}/students/${updatedStudent._id}`, updatedStudent); //remove for UI beta
      // toast.add({ severity: 'success', summary: 'Success', detail: 'Course updated', life: 3000 });
    } else {
      // FIXED: Should use `updatedCourse`, not `updateCourse.value`
      await axios.post(`${import.meta.env.VITE_API_BASE_URI}/students`, updatedStudent); //remove for UI beta
      // toast.add({ severity: 'success', summary: 'Success', detail: 'Course added', life: 3000 });
    }

    studentDialog.value = false;
    student.value = {};
    fetchStudents(); // Refresh course list after saving
  } catch (error) {
    console.error("Error saving course:", error);
  }
};

// Edit student
const editStudent = (selected) => {
  student.value = { ...selected };

  if (student.value.locker) {
    student.value.locker = student.value.locker.map(id => {
      const locker = lockersList.value.find(l => l._id === id);
      return locker ? locker.name : id //fallback to ID if not found
    })
  }

  if (student.value.doorcodes) {
    student.value.doorcodes = student.value.doorcodes.map(id => {
      const doorcode = doorcodesList.value.find(c => c._id === id);
      return doorcode ? doorcode.room : id //fallback to ID if not found
    })
  }

  studentDialog.value = true;
};


const editDoorcode = (selected) => {
  doorcode.value = { ...selected };
  doorcodeSubmitted.value = false;
  doorcodeDialog.value = true;

}

// Hide Dialog
const hideDoorcodeDialog = () => {
  doorcodeDialog.value = false;
};

const hideStudentDialog = () => {
  studentDialog.value = false;
};


// Fetch courses on load
onMounted(fetchData);

</script>


<template>
  <div class="min-h-screen">
    <!--Navbar-->
    <TabMenu class="px-4" :model="tabs" />

    <div v-if="activeTab === 'students'">
      <div class="card">
        <Toolbar class="mb-6">
          <template #start>
            <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNewCourseDialog" />
            <!-- <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
              :disabled="!selectedCourses || !selectedCourses.length" /> -->
          </template>

          <!-- <template #end>
            <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
          </template> -->
        </Toolbar>

        <DataTable class="px-4" ref="dt" v-model:selection="selectedCourses" :value="coursesList" dataKey="id"
          :paginator="true" :rows="10" :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses">
          <template #header>
            <div class="flex flex-wrap gap-2 items-center justify-between">
              <h4 class="m-0">Manage Courses</h4>
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText v-model="filters.global.value" placeholder="Search..." />
              </IconField>
            </div>
          </template>


          <!-- <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column> -->
          <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
          <Column field="gradDate" header="Expected Graduation Date" sortable style="min-width: 16rem"></Column>
          <Column field="lockers" header="Lockers" sortable style="min-width: 16rem">
            <template #body="slotProps">
              <span v-if="slotProps.data.lockers && slotProps.data.lockers.length">
                {{ getLockerNames(slotProps.data.lockers) }}
              </span>
              <span v-else>-</span>
            </template>
          </Column>
          <Column field="doorcodes" header="Doorcodes" sortable style="min-width: 16rem">
            <template #body="slotProps">
              <span v-if="slotProps.data.doorcodes && slotProps.data.doorcodes.length">
                {{ getDoorcodeRooms(slotProps.data.doorcodes) }}
              </span>
              <span v-else>-</span>
            </template>
          </Column>
          <Column :exportable="false" style="min-width: 12rem">
            <template #body="slotProps">
              <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editCourse(slotProps.data)" />
              <Button icon="pi pi-trash" outlined rounded severity="danger"
                @click="confirmDeleteCourse(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Lockers Tab -->
    <div v-if="activeTab === 'lockers'" class="p-4">
      <Card class="mb-4 shadow-md">
        <template #content>
          <h4 class="mb-3">Add a New Locker</h4>
          <div class="flex flex-col md:flex-row gap-3 items-center">
            <InputText v-model="newLocker.name" placeholder="Enter locker number"
              class="w-full md:w-auto p-inputtext-lg" />
            <Button label="Add Locker" icon="pi pi-plus" class="p-button-success p-button-lg" @click="addLocker"
              :disabled="!newLocker.name.trim()" />
          </div>
        </template>
      </Card>

      <h4 class="mb-3 py-2">Existing Lockers</h4>
      <DataTable :value="lockersList" class="p-datatable-sm" stripedRows responsiveLayout="scroll">
        <Column field="name" header="Locker Number" class="p-text-lg"></Column>

        <Column header="Actions" class="text-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm"
                @click="removeLocker(slotProps.data._id)" v-tooltip.bottom="'Delete Locker'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Doorcode Tab -->
    <div v-if="activeTab === 'doorcodes'" class="p-4">
      <Card class="mb-4 shadow-md">
        <template #content>
          <h4 class="mb-3">Add a New Doorcode</h4>
          <div class="flex flex-col md:flex-row gap-3 items-center">
            <InputText v-model="newDoorcode.room" placeholder="Enter Room" class="w-full md:w-auto p-inputtext-lg" />
            <InputText v-model="newDoorcode.code" placeholder="Enter Code" class="w-full md:w-auto p-inputtext-lg" />
            <Button label="Add Doorcode" icon="pi pi-plus" class="p-button-success p-button-lg" @click="saveDoorcode"
              :disabled="!newDoorcode.room.trim() || !newDoorcode.code.trim()" />
          </div>
        </template>
      </Card>

      <h4 class="mb-3 py-2">Existing Doorcodes</h4>
      <DataTable :value="doorcodesList" class="p-datatable-sm" stripedRows responsiveLayout="scroll">
        <Column field="room" header="Room" class="p-text-lg"></Column>
        <Column field="code" header="Code" class="p-text-lg"></Column>


        <Column header="Actions" class="text-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-button-sm"
                @click="editDoorcode(slotProps.data)" v-tooltip.bottom="'Edit Doorcode'" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm"
                @click="removeDoorcode(slotProps.data._id)" v-tooltip.bottom="'Delete Doorcode'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Overleaf Tab -->
    <div v-if="activeTab === 'overleaf'" class="p-4">
      <Card class="mb-4 shadow-md">
        <template #content>
          <h4 class="mb-3">Add a New Overleaf User</h4>
          <div class="flex flex-col md:flex-row gap-3 items-center">
            <Select v-model="student.name" editable filter showClear :options="studentsList.map(l => l.name)"
              placeholder="Select Student" />

            <Select v-model="student.overleafProfessor" editable filter showClear :options="professorList"
              placeholder="Professor Responsible" />

            <Button label="Add Account" icon="pi pi-plus" class="p-button-success p-button-lg"
              @click="saveStudentOverleafTableChanges" :disabled="!student.name || !student.overleafProfessor" />
          </div>
        </template>
      </Card>

      <h4 class="mb-3 py-2">Existing Overleaf Users</h4>
      <DataTable :value="studentsList" class="p-datatable-sm" stripedRows responsiveLayout="scroll" editMode="cell"
        @cell-edit-complete="onCellEditComplete">
        <Column field="name" header="Name" class="p-text-lg"></Column>
        <Column field="netid" header="NetID" class="p-text-lg"></Column>
        <Column field="overleafProfessor" header="Professor" class="p-text-lg">
          <Select v-model="student.overleafProfessor" editable filter showClear :options="professorList"
            placeholder="Professor Responsible" />
        </Column>

        <!-- Graduation Date (Read-only) -->
        <Column field="gradDate" header="Retirement Date" class="p-text-lg">
          <template #body="{ data }">
            {{ formatDate(data.gradDate) }}
          </template>
        </Column>

        <Column field="overleafStatus" header="Status" class="p-text-lg">
          <template #editor="{ data, field }">
            <Dropdown v-model="data[field]" :options="softwareStatusList" placeholder="Select Status" />
          </template>
        </Column>

        <Column header="Actions" class="text-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm"
                @click="removeOverleafAccount(slotProps.data._id)" v-tooltip.bottom="'Delete Retired User Account'"
                :disabled="slotProps.data.overleafStatus !== 'Retired'" />
            </div>
          </template>
        </Column>
      </DataTable>
      <Button label="Save Changes" icon="pi pi-save" class="p-mt-3" @click="saveStudentOverleafTableChanges" />
    </div>

    <!-- Jupyter Tab -->
    <div v-if="activeTab === 'jupyterhub'" class="p-4">
      <Card class="mb-4 shadow-md">
        <template #content>
          <h4 class="mb-3">Add a New JupyterHub User</h4>
          <div class="flex flex-col md:flex-row gap-3 items-center">
            <Select v-model="student.name" editable filter showClear :options="studentsList.map(l => l.name)"
              placeholder="Select Student" />
            <InputText id="jupyterhubClass" v-model="student.jupyterhubClass" placeholder="Enter Class"
              class="w-full md:w-60" />
            <Button label="Add Account" icon="pi pi-plus" class="p-button-success p-button-lg"
              @click="saveStudentJupyterHubTableChanges" :disabled="!student.name.trim()" />
          </div>
        </template>
      </Card>

      <h4 class="mb-3 py-2">Existing JupyterHub Users</h4>
      <DataTable :value="studentsList" class="p-datatable-sm" stripedRows responsiveLayout="scroll" editMode="cell"
        @cell-edit-complete="onCellEditComplete">
        <Column field="name" header="Name" class="p-text-lg"></Column>
        <Column field="netid" header="NetID" class="p-text-lg"></Column>
        <Column field="jupyterhubClass" header="Class" class="p-text-lg">
          <template #editor="{ data, field }">
            <Dropdown v-model="data[field]" :options="professorList" placeholder="Select Professor" />
          </template>
        </Column>

        <!-- Graduation Date (Read-only) -->
        <Column field="gradDate" header="Retirement Date" class="p-text-lg">
          <template #body="{ data }">
            {{ formatDate(data.gradDate) }}
          </template>
        </Column>

        <Column field="jupyterhubStatus" header="Status" class="p-text-lg">
          <template #editor="{ data, field }">
            <Dropdown v-model="data[field]" :options="softwareStatusList" placeholder="Select Status" />
          </template>
        </Column>

        <Column header="Actions" class="text-center">
          <template #body="slotProps">
            <div class="flex justify-center gap-2">
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm"
                @click="removeJupyterHubAccount(slotProps.data._id)" v-tooltip.bottom="'Delete Retired User Account'"
                :disabled="slotProps.data.jupyterhubStatus !== 'Retired'" />
            </div>
          </template>
        </Column>
      </DataTable>
      <Button label="Save Changes" icon="pi pi-save" class="p-mt-3" @click="saveStudentJupyterHubTableChanges" />
    </div>

    <Dialog v-model:visible="doorcodeDialog" :style="{ width: '800px' }" header="Doorcode" :modal="true">
      <div class="flex flex-col gap-6 p-4">

        <!-- Course Name -->
        <Card class="p-4">
          <template #title>Room</template>
          <template #content>
            <InputText id="room" v-model.trim="doorcode.room" required autofocus
              :invalid="doorcodeSubmitted && !doorcode.room" class="w-full p-2" />
            <small v-if="doorcodeSubmitted && !doorcode.room" class="text-red-500">Room is required.</small>
          </template>
        </Card>
        <br>
        <!-- Course Name -->
        <Card class="p-4">
          <template #title>Code</template>
          <template #content>
            <InputText id="code" v-model.trim="doorcode.code" required :invalid="doorcodeSubmitted && !doorcode.code"
              class="w-full p-2" />
            <small v-if="doorcodeSubmitted && !doorcode.code" class="text-red-500">Code is required.</small>
          </template>
        </Card>
        <br>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="doorcodeDialog = false" />
        <Button label="Save" icon="pi pi-check" class="p-button-success" @click="saveDoorcode" />
      </template>
    </Dialog>

    <Dialog v-model:visible="studentDialog" :style="{ width: '800px' }" header="Add New Student" :modal="true">
      <div class="flex flex-col gap-6 p-4">

        <!-- Student Name -->
        <Card class="p-4">
          <template #title>Student Name</template>
          <template #content>
            <InputText id="name" v-model.trim="student.name" required autofocus
              :invalid="studentSubmitted && !student.name" class="w-full p-2" />
            <small v-if="studentSubmitted && !student.name" class="text-red-500">Name is required.</small>
          </template>
        </Card>
        <br>

        <!-- Description -->
        <Card class="p-4">
          <template #title>Net ID</template>
          <template #content>
            <InputText id="netid" v-model="student.netid" required :invalid="studentSubmitted && !student.name"
              class="w-full p-2" />
            <small v-if="studentSubmitted && !student.netid" class="text-red-500">NetID is required.</small>
          </template>
        </Card>
        <br>

        <Card class="p-4">
          <template #title>Email</template>
          <template #content>
            <InputText id="email" v-model="student.email" required :invalid="studentSubmitted && !student.email"
              class="w-full p-2" />
            <small v-if="studentSubmitted && !student.email" class="text-red-500">Email is required.</small>
          </template>
        </Card>
        <br>

        <Card class="p-4">
          <template #title>Expected Graduation Date</template>
          <template #content>
            <InputText id="netid" v-model="student.gradDate" required :invalid="studentSubmitted && !student.gradDate"
              class="w-full p-2" />
            <small v-if="studentSubmitted && !student.gradDate" class="text-red-500">Anticipated Graduation Date is
              required.</small>
          </template>
        </Card>
        <br>

        <Card class="p-4">
          <template #title>Locker</template>
          <template #content>
            <Select id="locker" v-model="student.locker" :options="lockersList.map(l => l.name)" filter
              placeholder="Select Locker" class="w-full p-2" />
          </template>
        </Card>

        <Card class="p-4">
          <template #title>Door Access</template>
          <template #content>
            <MultiSelect id="doorAccess" v-model="student.doorcode" :options="doorcodesList.map(d => d.room)" filter
              placeholder="Select Room Access" class="w-full p-2" />
          </template>
        </Card>

        <!-- Save & Cancel Buttons -->
        <div class="flex justify-end gap-3">
          <Button label="Cancel" class="p-button-text" @click="studentDialog = false" />
          <Button label="Save Student" icon="pi pi-check" class="p-button-success" @click="saveStudent"
            :disabled="!student.name.trim()" />
        </div>
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
.p-multiselect {
  max-width: 100%;
  /* Ensures it doesn’t overflow */
}

.p-multiselect .p-multiselect-label {
  white-space: normal !important;
  /* Allows text to wrap */
  display: flex;
  flex-wrap: wrap;
  /* Enables wrapping */
  min-height: 2.5rem;
  /* Adjust height as needed */
  max-height: 300px;
  /* Set a max height */
  overflow-y: auto;
  /* Allows vertical scrolling if needed */
}
</style>