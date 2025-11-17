<template>
  <section
    class="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-3xl mx-auto"
  >
    <!-- Header -->
    <div class="px-4 py-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-byu-navy">By Professor</h2>
    </div>

    <!-- Body -->
    <div class="p-3">
      <div class="border border-gray-200 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full table-fixed text-sm leading-tight">
            <!-- Column Widths. Will need to be adjusted if more columns are added-->
            <colgroup>
              <col class="w-[48%]" />
              <col class="w-[48%]" />
              <col class="w-8 sm:w-10" />
            </colgroup>
            <thead class="bg-byu-navy text-white">
              <tr>
                <th class="px-3 py-2 text-left">Professor</th>
                <th class="px-3 py-2 text-center">Key #</th>
                <th class="px-2 py-2 text-right"></th>
              </tr>
            </thead>

            <tbody>
              <!-- one professor section: header row + rows for each key -->
              <template v-for="g in groups" :key="g.user.id">
                <!-- Professor header row (light BYU blue) -->
                <tr class="bg-byu-royal/10">
                  <td class="px-3 py-2">
                    <div class="font-medium text-xs text-byu-navy truncate">
                      {{ g.user.lastName }}, {{ g.user.firstName }}
                    </div>
                  </td>
                  <!-- empty cells to line up with columns -->
                  <td class="px-3 py-2"></td>
                  <td class="px-2 py-2"></td>
                </tr>

                <!-- Key rows (alternate gray/white per professor group) -->
                <tr
                  v-for="(k, i) in g.keys"
                  :key="k.number"
                  :class="[
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                    'hover:bg-byu-navy/5 transition-colors',
                  ]"
                >
                  <!-- empty first cell under professor -->
                  <td class="px-3 py-2"></td>

                  <td
                    class="px-3 py-2 font-medium text-xs text-byu-navy whitespace-nowrap text-center"
                  >
                    #{{ k.number }}
                  </td>

                  <td class="px-2 py-2 w-8 align-middle">
                    <button
                      class="p-1.5 rounded-full focus:outline-none text-gray-700 cursor-pointer hover:bg-gray-100"
                      @click.stop="openDropdown(k.number, $event)"
                      :aria-expanded="
                        openMenuFor === k.number ? 'true' : 'false'
                      "
                      aria-haspopup="menu"
                      aria-label="More options"
                    >
                      <EllipsisVerticalIcon
                        class="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </td>
                </tr>
              </template>

              <!-- empty state -->
              <tr v-if="!groups.length">
                <td colspan="99" class="px-3 py-8 text-center text-gray-500">
                  No professors with assigned keys.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Floating kebab menu (By Professor table) -->
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
          class="fixed z-50 w-44 origin-top-right rounded-xl bg-white text-xs shadow-lg ring-1 ring-black/5 border border-gray-100 p-1"
          :style="{
            top: menuPosition.top + 'px',
            left: menuPosition.left + 'px',
          }"
          role="menu"
          tabindex="-1"
        >
          <!-- Unassign -->
          <button
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

          <!-- Edit -->
          <button
            class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-gray-800 flex items-center gap-2 cursor-pointer"
            role="menuitem"
            @click="
              emit('edit', { number: openMenuFor });
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

          <!-- Delete -->
          <button
            class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-50 active:bg-gray-100 text-red-600 flex items-center gap-2 cursor-pointer"
            role="menuitem"
            @click="
              emit('delete', { number: openMenuFor });
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
  PencilSquareIcon,
  UserMinusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  // keys from DB: [{ number, user: { id, firstName, lastName, email } | null }]
  keys: { type: Array, default: () => [] },
});

const emit = defineEmits(["unassign", "edit", "delete"]);

const groups = computed(() => {
  const byId = new Map();
  for (const k of props.keys) {
    if (!k?.user) continue;
    const u = k.user;
    if (!byId.has(u.id)) byId.set(u.id, { user: u, keys: [] });
    byId.get(u.id).keys.push({ number: k.number });
  }

  const arr = Array.from(byId.values());
  for (const g of arr) g.keys.sort((a, b) => a.number - b.number);
  arr.sort((a, b) => {
    const ln = a.user.lastName.localeCompare(b.user.lastName, undefined, {
      sensitivity: "base",
    });
    return (
      ln ||
      a.user.firstName.localeCompare(b.user.firstName, undefined, {
        sensitivity: "base",
      })
    );
  });
  return arr;
});

// kebab state (floating menu)
const openMenuFor = ref(null); // the key.number that is open, or null
const menuPosition = ref({ top: 0, left: 0 });

// Look up the full key object (with user) by number
const activeKey = computed(
  () => props.keys.find((k) => k.number === openMenuFor.value) || null
);

function openDropdown(keyNumber, evt) {
  // toggle off if clicking same one
  if (openMenuFor.value === keyNumber) {
    closeMenu();
    return;
  }

  const rect = evt.currentTarget.getBoundingClientRect();

  // Right-align the menu to the button, similar to your old `right-0` style.
  // w-44 = 11rem ≈ 176px assuming 16px root font-size.
  const menuWidth = 176;
  menuPosition.value = {
    top: rect.bottom + 4, // a few px below the button
    left: rect.right - menuWidth, // align right edge to button's right
  };

  openMenuFor.value = keyNumber;
}

function closeMenu() {
  openMenuFor.value = null;
}
</script>
