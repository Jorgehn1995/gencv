<script setup lang="ts">
import { useRoute } from "vue-router";
definePageMeta({ layout: "auth", name: "optimization-view" });
const route = useRoute();

const optimizationId = computed(() => {
  return route.params.optimizationId?.toString();
});
</script>
<template>
  <div>
    <base-loading v-if="!optimizationId"></base-loading>
    <app-optimizations-view
      v-else
      max-width="1000"
      class="mx-auto"
      :optimization-id="optimizationId"
    ></app-optimizations-view>
  </div>
</template>
