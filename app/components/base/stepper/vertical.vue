<script setup lang="ts">
const props = defineProps<{
  step: number;
  steps: string[];
}>();
</script>
<template>
  <div>
    <v-sheet width="100%" class="nice-sticky border-t" color="background">
      <v-progress-linear
        color="actions"
        :model-value="((step + 1) / 5) * 100"
        height="2"
      ></v-progress-linear>
      <v-sheet
        max-width="500"
        color="transparent"
        class="mx-auto d-flex justify-space-between px-6 pb-2"
      >
        <v-sheet
          class="py-4 d-flex flex-column align-start justify-center"
          rounded="sm"
          color="transparent"
          max-width="250"
          style="flex-basis: 0; flex-grow: 1"
        >
          <span class="font-weight-black">Crear Sección</span>
          <div class="opacity-80">
            <span class="font-weight-bold mr-1"
              >Paso {{ step + 1 }} de {{ steps.length }} -
            </span>
            <span>{{ steps[step] }} </span>
          </div>
        </v-sheet>
      </v-sheet>
    </v-sheet>
  </div>
</template>
