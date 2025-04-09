<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">User Registration</h2>
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Name</label>
          <InputText 
            v-model="form.name" 
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter your full name"
            required 
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">Email</label>
          <InputText 
            v-model="form.email" 
            type="email" 
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter your email"
            required 
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">Net ID</label>
          <InputText 
            v-model="form.netid" 
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter your Net ID"
            required 
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">BYU ID</label>
          <InputText 
            v-model="form.byuid" 
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter your BYU ID"
            required 
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-1">Expected Graduation Date</label>
          <DatePicker 
            v-model="form.gradDate"
            showButtonBar
            dateFormat="mm/dd/yy" 
            class="w-full" 
            inputClass="p-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Select date"
            required 
          />
        </div>

        <Button 
          type="submit" 
          label="Register" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
          :loading="isSubmitting"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import axios from 'axios'; // Import Axios
import { DatePicker } from 'primevue';

// const toast = useToast();

const form = ref({
  name: '',
  email: '',
  netid: '',
  byuid: '',
  gradDate: null
});

const isSubmitting = ref(false);

const submitForm = async () => {
  isSubmitting.value = true;
  try {

    const formattedGradDate = form.value.gradDate instanceof Date ? form.value.gradDate.toISOString() : new Date(form.value.gradDate).toISOString;

    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URI}/students/register`, {
      name: form.value.name,
      email: form.value.email,
      netid: form.value.netid,
      byuid: form.value.byuid,
      gradDate: formattedGradDate,
      admin: false
    });

    console.log('User registered:', response.data);
    
    toast.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Registration successful!', 
      life: 3000 
    });

    // Reset form
    form.value = {
      name: '',
      email: '',
      netid: '',
      byuid: '',
      gradDate: null
    };
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    // toast.add({ 
    //   severity: 'error', 
    //   summary: 'Error', 
    //   detail: error.response?.data?.error || 'Registration failed. Please try again.', 
    //   life: 3000 
    // });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
  
  <style scoped>
  /* TailwindCSS handles most styling, but you can add custom styles here if needed */
  </style>