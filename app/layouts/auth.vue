<script lang="ts" setup>
import { useAuth } from "~/composables/base/useAuth";
import { useRouter } from "vue-router";
import { useDialog } from "~/composables/base/useDialog";

const { checkAuthState } = useAuth();
const isReady = ref(false);
const router = useRouter();
const dialog = useDialog();

onMounted(async () => {
  let user = await checkAuthState();
  if (!user) {
    dialog.info({
      message: "Por favor, inicia sesión para continuar.",
    });
    router.push({ name: "login" });
  } else {
    isReady.value = true;
  }
});
</script>
<template>
  <div>
    <base-loading v-if="!isReady"></base-loading>
    <div v-else>
      <v-app-bar
        variant="flat"
        elevation="0"
        color="background"
        class="border-b-md"
      >
        <template #default>
<v-sheet color="transparent" width="1000" max-width="1000" class="mx-auto d-flex justify-space-between align-center">
          <base-logo></base-logo>
          <div class="d-flex">
            <base-theme-toggle class="mr-2"></base-theme-toggle>
            <app-auth-user-menu class="mr-2"></app-auth-user-menu>
          </div>
        </v-sheet>
        </template>
      </v-app-bar>
      <v-main>
        <v-container>
          <NuxtPage />
        </v-container>
      </v-main>
    </div>
  </div>
</template>
