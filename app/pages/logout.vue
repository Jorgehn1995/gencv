<script lang="ts" setup>
import { useAuth } from "~/composables/base/useAuth";
import { useRouter } from "vue-router";
definePageMeta({ layout: "default", name: "logout" });
const { signOut } = useAuth();
const router = useRouter();
const { $toast } = useNuxtApp()

onMounted(async () => {
  await signOut();
  $toast.success("Sesión cerrada");
  router.push({ name: "login" });
});
</script>
<template>
  <base-loading></base-loading>
</template>
