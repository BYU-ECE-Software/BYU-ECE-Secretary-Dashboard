<template>
  <div class="flex flex-col gap-1.5">
    <!-- Optional label above the card -->
    <label v-if="label" class="text-sm mt-2 font-medium text-byu-navy">
      {{ label }}
    </label>

    <!-- Person summary card -->
    <div
      class="border border-byu-navy/20 rounded-xl p-3 bg-white/80 shadow-sm text-sm"
    >
      <div class="flex items-start justify-between gap-3">
        <!-- LEFT: avatar + details -->
        <div class="flex items-start gap-3 min-w-0">
          <!-- Avatar w/ initials -->
          <div
            class="h-10 w-10 shrink-0 rounded-full bg-byu-royal/15 text-byu-royal grid place-items-center font-semibold"
            :aria-label="avatarLabel"
          >
            {{ initials }}
          </div>

          <div class="min-w-0 flex flex-col gap-1">
            <!-- Eyebrow (optional) -->
            <div
              v-if="eyebrow"
              class="text-[11px] uppercase tracking-wide text-gray-500 font-medium"
            >
              {{ eyebrow }}
            </div>

            <!-- Name (slot override allowed if parent wants custom) -->
            <div class="font-semibold text-byu-navy leading-5">
              <slot name="name">
                {{ safePerson.firstName }} {{ safePerson.lastName }}
              </slot>
            </div>

            <!-- Email -->
            <div
              v-if="safePerson.email"
              class="text-xs text-gray-600 truncate"
              :title="safePerson.email"
            >
              {{ safePerson.email }}
            </div>

            <!-- Small pill chips for NetID / BYU ID if we have them -->
            <div
              v-if="safePerson.netId || safePerson.byuId"
              class="flex flex-wrap items-center gap-2.5 pt-0.5"
            >
              <span
                v-if="safePerson.netId"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-byu-royal/10 text-byu-navy"
              >
                <span class="opacity-70">NetID:</span>
                {{ safePerson.netId }}
              </span>

              <span
                v-if="safePerson.byuId"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-byu-royal/10 text-byu-navy"
              >
                <span class="opacity-70">BYU ID:</span>
                {{ safePerson.byuId }}
              </span>
            </div>
          </div>
        </div>

        <!-- RIGHT: action buttons injected by parent (e.g. Clear) -->
        <div class="shrink-0 flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

/* ===== Props ===== */

const props = defineProps({
  // Expected shape: { firstName?, lastName?, email?, netId?, byuId? }
  person: { type: Object, default: null },
  // Small label above the name (e.g. “Currently assigned to”)
  eyebrow: { type: String, default: "" },
  // Label above the entire card (used in forms)
  label: { type: String, default: "" },
});

/* ===== Derived person fields (safe defaults) ===== */

// Normalize person so we always have empty strings instead of undefined
const safePerson = computed(() => ({
  firstName: props.person?.firstName ?? "",
  lastName: props.person?.lastName ?? "",
  email: props.person?.email ?? "",
  netId: props.person?.netId ?? "",
  byuId: props.person?.byuId ?? "",
}));

/* ===== Avatar helpers ===== */

// Build initials from first + last name
const initials = computed(() => {
  const f = safePerson.value.firstName?.[0] || "";
  const l = safePerson.value.lastName?.[0] || "";
  return (f + l).toUpperCase();
});

// Accessible label for the avatar circle
const avatarLabel = computed(() => {
  const { firstName, lastName } = safePerson.value;
  return `${firstName} ${lastName}`.trim() || "User avatar";
});
</script>
