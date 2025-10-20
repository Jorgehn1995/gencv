<script setup lang="ts">
definePageMeta({ layout: "auth", name: "optimization-list" });
</script>

<template>
  <div>
    <app-optimizations-list
      max-width="1000"
      class="mx-auto"
      :optimizationId="$route.params.optimizationId?.toString() || ''"
    ></app-optimizations-list>
  </div>
</template>
