<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
    time?: number;
  }>(),
  {
    label: "search",
    time: 1500,
  }
);

const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const timer = ref<number | NodeJS.Timeout | null>(null);
const search = ref("");

const makeChange = (newTime = 0) => {
  isLoading.value = true;
  if (timer.value !== null) clearTimeout(timer.value);
  timer.value = setTimeout(
    () => {
      const newQuery = { ...route.query };
      if (search.value === "") {
        delete newQuery[props.label];
      } else if (typeof search.value === "string") {
        newQuery[props.label] = search.value;
      }

      router.replace({ query: newQuery });
      isLoading.value = false;
    },
    newTime > 0 ? newTime : props.time
  );
};

const query = computed(() => {
  return route.query[props.label]?.toString() || "";
});
watch(query, async (newQuestion, oldQuestion) => {
  if (query.value !== search.value) search.value = query.value;
});
onMounted(() => {
  search.value = query.value;
});
</script>

<template>
  <v-text-field
    prepend-inner-icon="mdi-magnify"
    placeholder="Buscar..."
    hide-details
    density="comfortable"
    name="cv-search"
    v-model="search"
    @input="makeChange"
    @change="makeChange(100)"
  >
    <template #append-inner v-if="isLoading">
      <div class="load-space d-flex justify-center align-center">
        <v-progress-circular
          size="21"
          width="2"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
    </template>
  </v-text-field>
</template>
<style>
.load-space {
  max-width: 24px;
  width: 24px;
}
</style>
