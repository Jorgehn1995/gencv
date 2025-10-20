<script setup lang="ts">
definePageMeta({ layout: "auth", name: "home" });
const router = useRouter();
onMounted(() => {
  router.replace({ name: "optimization-list" });
});
</script>

<template>
  <div>
    <base-loading></base-loading>
  </div>
</template>
