<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import useOptimizations from "~/composables/app/optimizations/useOptimizations";

const props = defineProps<{
  optimizationId: string;
}>();

const {$toast} = useNuxtApp();
const router = useRouter();
const route = useRoute();
const { getOptimizations, fetchOptimizations, isOptimizationsLoading } =
  useOptimizations();

const optimizations = getOptimizations();
const isLoading = isOptimizationsLoading();
const search = computed(() => {
  return route.query["search"]?.toString() || "";
});

const filteredOptimizations = computed(() => {
  const searchTerm = search.value.toLowerCase().trim();

  let filtered = optimizations.value || [];

  if (searchTerm) {
    filtered = filtered.filter((opt) => {
      const title = opt.job.title?.toLowerCase() || "";
      const company = opt.job.companyName?.toLowerCase() || "";
      return title.includes(searchTerm) || company.includes(searchTerm);
    });
  }

  return filtered.sort((a, b) => {
    const dateA = a.createdAt?.toMillis() || 0;
    const dateB = b.createdAt?.toMillis() || 0;
    return dateB - dateA;
  });
});

onMounted(async () => {
  await fetchOptimizations();
  if (optimizations.value.length == 0) {
    $toast.info("¡Crea tu primer Cv optimizado!");
    router.push({ name: "optimizations-create" });
  }
});
</script>
<template>
  <v-sheet color="transparent">
    <h1 class="text-h1 text-center">Cv's Optimizados</h1>
    <v-sheet
      max-width="500"
      class="mx-auto mt-6 d-flex align-center ga-4"
      color="transparent"
    >
      <base-search></base-search>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="router.push({ name: 'optimizations-create' })"
      >
        Nueva
      </v-btn>
    </v-sheet>
    <v-sheet color="transparent" class="mt-8">
      <v-row v-if="isLoading && filteredOptimizations.length == 0">
        <v-col cols="12" sm="6" md="4" v-for="(n, i) in 6">
          <v-card style="padding: 8px !important">
            <v-skeleton-loader
              type="list-item-avatar-two-line"
            ></v-skeleton-loader>
          </v-card>
        </v-col>
      </v-row>
      <v-sheet
        v-else-if="!isLoading && search && filteredOptimizations.length == 0"
        class="pa-10 rounded-lg d-flex flex-column align-center"
      >
        <v-icon size="100" class="opacity-40">mdi-clipboard-outline</v-icon>
        <span class="text-body-1 opacity-80">
          No se encontraron Cv's optimizados que coincidan con "{{ search }}"
        </span>
      </v-sheet>
      <v-row dense v-else-if="!isLoading && filteredOptimizations.length > 0">
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="(optimization, index) in filteredOptimizations"
          :key="index"
        >
          <v-card
            class="rounded-lg pa-2 cursor-pointer"
            style="padding: 8px !important"
            @click="
              router.push({
                name: 'optimization-view',
                params: { optimizationId: optimization.id },
              })
            "
          >
            <v-list bg-color="transparent">
              <v-list-item>
                <v-list-item-title class="text-h6">
                  {{ optimization.job.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ optimization.job.companyName }}
                </v-list-item-subtitle>
                <template #append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      <v-sheet
        v-else
        class="pa-10 rounded-lg d-flex flex-column align-center"
        color="transparent"
      >
        <v-icon size="100" class="opacity-40">mdi-clipboard-outline</v-icon>
        <span class="text-body-1 opacity-80">
          No tienes Cv's optimizados aún. ¡Crea uno nuevo!
        </span>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>
