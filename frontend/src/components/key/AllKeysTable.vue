<template>
  <section
    class="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-3xl mx-auto"
  >
    <!-- Header -->
    <div class="px-4 py-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-byu-navy">All Keys</h2>

      <!-- Status pills -->
      <div class="flex items-center gap-2">
        <span class="sr-only">Filter status</span>
        <div
          class="inline-flex rounded-lg border border-byu-navy/30 overflow-hidden"
        >
          <button
            class="px-3 py-1.5 text-sm transition cursor-pointer"
            :class="
              props.status === 'all'
                ? 'bg-byu-royal text-white'
                : 'bg-white text-byu-navy hover:bg-byu-navy/5'
            "
            @click="updateStatus('all')"
          >
            All
          </button>
          <button
            class="px-3 py-1.5 text-sm border-l border-byu-navy/20 transition cursor-pointer"
            :class="
              props.status === 'assigned'
                ? 'bg-byu-royal text-white'
                : 'bg-white text-byu-navy hover:bg-byu-navy/5'
            "
            @click="updateStatus('assigned')"
          >
            Assigned
          </button>
          <button
            class="px-3 py-1.5 text-sm border-l border-byu-navy/20 transition cursor-pointer"
            :class="
              props.status === 'unassigned'
                ? 'bg-byu-royal text-white'
                : 'bg-white text-byu-navy hover:bg-byu-navy/5'
            "
            @click="updateStatus('unassigned')"
          >
            Unassigned
          </button>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="p-3">
      <div class="border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full table-auto">
            <thead class="bg-byu-navy text-white">
              <tr>
                <!-- ultra-narrow blank header; no visible text -->
                <th class="px-1 py-2 w-8"></th>
                <th class="px-3 py-2 text-center text-sm">Key #</th>
                <th class="px-3 py-2 text-center text-sm">Assigned To</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="k in filteredKeys"
                :key="k.number"
                class="odd:bg-white even:bg-gray-50 hover:bg-byu-navy/5 transition-colors"
              >
                <!-- Kebab column: left-aligned, very small -->
                <td class="px-2 py-2 w-8 align-middle">
                  <button
                    class="p-1.5 rounded-full focus:outline-none text-gray-700 cursor-pointer hover:bg-gray-100"
                    @click.stop="openDropdown(k, $event)"
                    :aria-expanded="openMenuFor === k.number ? 'true' : 'false'"
                    aria-haspopup="menu"
                    aria-label="More options"
                  >
                    <EllipsisVerticalIcon class="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>

                <!-- Key # (centered) -->
                <td
                  class="px-3 py-2 font-medium text-xs text-center text-byu-navy whitespace-nowrap"
                >
                  #{{ k.number }}
                </td>

                <!-- Assigned To (centered) -->
                <td class="px-3 py-2 text-center">
                  <template v-if="k.user">
                    <span class="text-byu-navy text-xs"
                      >{{ k.user.lastName }}, {{ k.user.firstName }}</span
                    >
                  </template>
                </td>
              </tr>

              <tr v-if="!filteredKeys.length">
                <td class="px-3 py-8 text-center text-gray-500" colspan="99">
                  No keys found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Floating kebab menu -->
    <Teleport to="body">
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="openMenuFor !== null && activeKey"
          class="fixed z-50 w-44 origin-top-left rounded-xl bg-white text-xs shadow-lg ring-1 ring-black/5 border border-gray-100 p-1"
          :style="{
            top: menuPosition.top + 'px',
            left: menuPosition.left + 'px',
          }"
          role="menu"
          tabindex="-1"
        >
          <!-- Assign when unassigned -->
          <button
            v-if="!activeKey.user"
            class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-gray-800 flex items-center gap-2 cursor-pointer"
            role="menuitem"
            @click="
              emit('assign', activeKey);
              closeMenu();
            "
          >
            <UserPlusIcon class="h-4 w-4 text-gray-800" aria-hidden="true" />
            <span>Assign to Professor</span>
          </button>

          <!-- Unassign when assigned -->
          <button
            v-if="activeKey.user"
            class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-gray-800 flex items-center gap-2 cursor-pointer"
            role="menuitem"
            @click="
              emit('unassign', activeKey);
              closeMenu();
            "
          >
            <UserMinusIcon class="h-4 w-4 text-gray-800" aria-hidden="true" />
            <span>Unassign</span>
          </button>

          <button
            class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-gray-800 flex items-center gap-2 cursor-pointer"
            role="menuitem"
            @click="
              emit('edit', activeKey);
              closeMenu();
            "
          >
            <PencilSquareIcon
              class="h-4 w-4 text-gray-800"
              aria-hidden="true"
            />
            <span>Edit Key Information</span>
          </button>

          <div class="my-1 h-px bg-gray-100"></div>

          <button
            class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-red-600 flex items-center gap-2 cursor-pointer"
            role="menuitem"
            @click="
              emit('delete', activeKey);
              closeMenu();
            "
          >
            <TrashIcon class="h-4 w-4 text-red-600" aria-hidden="true" />
            <span>Delete Key</span>
          </button>
        </div>
      </transition>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/24/solid";
import {
  UserPlusIcon,
  PencilSquareIcon,
  UserMinusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  // Array like: [{ number, user: { id, firstName, lastName } | null }]
  keys: { type: Array, default: () => [] },

  // v-model:status → 'all' | 'assigned' | 'unassigned'
  status: {
    type: String,
    default: "all",
    validator: (v) => ["all", "assigned", "unassigned"].includes(v),
  },
});

const emit = defineEmits([
  "update:status",
  "assign",
  "unassign",
  "edit",
  "delete",
]);

function updateStatus(val) {
  emit("update:status", val);
}

const filteredKeys = computed(() => {
  if (props.status === "assigned") return props.keys.filter((k) => !!k.user);
  if (props.status === "unassigned") return props.keys.filter((k) => !k.user);
  return props.keys;
});

// kebab state (for floating menu)
const openMenuFor = ref(null); // the key.number that is open, or null
const menuPosition = ref({ top: 0, left: 0 });
const activeKey = computed(
  () => filteredKeys.value.find((k) => k.number === openMenuFor.value) || null
);

function openDropdown(key, evt) {
  // close if clicking the same one again
  if (openMenuFor.value === key.number) {
    closeMenu();
    return;
  }

  const rect = evt.currentTarget.getBoundingClientRect();
  menuPosition.value = {
    top: rect.bottom + 4, // a few px below the button
    left: rect.left,
  };

  openMenuFor.value = key.number;
}

function closeMenu() {
  openMenuFor.value = null;
}
</script>
