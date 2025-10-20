<script setup lang="ts">
import { useDialog } from "~/composables/base/useDialog";
import { useAuth } from "~/composables/base/useAuth";
import { useTheme } from "vuetify";
const theme = useTheme();
const userStore = useUserStore();
const emit = defineEmits(["authenticated"]);
const dialog = useDialog();
const { loading, signInWithGoogle, signOut, initAuthListener } = useAuth();

const handleSignIn = async () => {
  try {
    const user = await signInWithGoogle();

    emit("authenticated", user);
  } catch (error: any) {
    dialog.error({
      message: `Error al iniciar sesión: ${error.message}`,
    });
  }
};

const handleSignOut = async () => {
  try {
    await signOut();
    dialog.info({
      message: "Sesión cerrada correctamente",
    });
  } catch (error: any) {
    dialog.error({
      message: `Error al cerrar sesión: ${error.message}`,
    });
  }
};

const isLoading = ref(true);

watchEffect(() => {
  if (userStore.isAuthenticated) {
    emit("authenticated", userStore.fullUser);
  }
});

onMounted(async () => {
  isLoading.value = true;
  await initAuthListener();
  nextTick(() => {
    isLoading.value = false;
  });
});
</script>

<template>
  <v-card class="landing-card bordered" elevation="8">
    <v-card-text class="pa-8 text-center">
      <div class="pa-6 d-flex justify-center mb-6">
        <v-img
          width="300px"
          height="60px"
          :src="theme.current.value.dark ? '/logo-dark.png' : '/logo-light.png'"
        />
      </div>

      <h3 class="auth-title mb-3">Bienvenido a ProCV</h3>

      <p class="text-medium-emphasis mb-8" v-if="!userStore.isAuthenticated">
        Inicia sesión con tu cuenta de Google para comenzar a optimizar tu
        currículum
      </p>

      <div class="d-flex justify-center align-center" style="min-height: 60px">
        <base-loading v-if="isLoading"></base-loading>
        <v-btn
          v-else
          color="primary"
          variant="flat"
          size="large"
          :loading="loading"
          @click="handleSignIn"
          class="btn-premium"
          block
        >
          <v-icon start>mdi-google</v-icon>
          Continuar con Google
        </v-btn>
      </div>

      <div class="mt-6">
        <p class="text-caption text-disabled">
          Al continuar, aceptas nuestros términos de servicio y política de
          privacidad
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.auth-title {
  font-size: 1.75rem;
  font-weight: 600;
  font-family: "Outfit", sans-serif;
  color: rgb(var(--v-theme-on-surface));
}


</style>
