<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ src?: string; size?: number; name?: string }>();

const src = computed(() => props.src);
const size = computed(() => props.size ?? 40);
</script>
<template>
  <v-avatar :size="size">
    <span v-if="!src">
      {{ name ? name.charAt(0).toUpperCase() : "U" }}
    </span>
    <v-img v-else :src="src" alt="Avatar de usuario" />
  </v-avatar>
</template>
