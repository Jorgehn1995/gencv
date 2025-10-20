<template>
  <ClientOnly>
    <v-avatar class="app-avatar" :size="avatarSize" start>
      <template v-if="icon">
        <v-icon :icon="icon" :size="iconSize" />
      </template>
      <template v-else>
        <slot />
      </template>
    </v-avatar>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ icon?: string; size?: string }>();

const avatarSize = computed(() => {
  const s = Number(props.size) || 40;
  return s;
});

const iconSize = computed(() => {
  return Math.round((avatarSize.value * 3) / 6);
});
</script>
