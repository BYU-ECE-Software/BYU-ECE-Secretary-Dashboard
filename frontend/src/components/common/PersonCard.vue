<template>
  <div class="flex flex-col gap-1.5">
    <!-- Optional label above the card -->
    <label v-if="label" class="text-sm mt-2 font-medium text-byu-navy">
      {{ label }}
    </label>

    <!-- Card -->
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

            <!-- Name -->
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

            <!-- Chips: NetID / BYU ID (only if present) -->
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

        <!-- RIGHT: actions slot -->
        <div class="shrink-0 flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  // Expected shape: { firstName?, lastName?, email?, netId?, byuId? }
  person: { type: Object, default: null },
  // e.g., “Currently assigned to”, “New • will be created on Save”
  eyebrow: { type: String, default: "" },
  label: { type: String, default: "" },
});

const safePerson = computed(() => ({
  firstName: props.person?.firstName ?? "",
  lastName: props.person?.lastName ?? "",
  email: props.person?.email ?? "",
  netId: props.person?.netId ?? "",
  byuId: props.person?.byuId ?? "",
}));

const initials = computed(() => {
  const f = safePerson.value.firstName?.[0] || "";
  const l = safePerson.value.lastName?.[0] || "";
  return (f + l).toUpperCase();
});

const avatarLabel = computed(() => {
  const { firstName, lastName } = safePerson.value;
  return `${firstName} ${lastName}`.trim() || "User avatar";
});
</script>
