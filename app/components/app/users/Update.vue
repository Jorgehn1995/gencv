<script setup lang="ts">
import { useUserStore } from "~/stores/user";
import { useRouter } from "vue-router";
import { VForm } from "vuetify/components";
import { useFilesUpload } from "@/composables/base/useFilesUpload";
import { useFirebase } from "@/composables/base/useFirebase";
import { updateProfile } from "firebase/auth";
import type { AppFile } from "~/types/app";

const form = ref<InstanceType<typeof VForm> | null>(null);
const userStore = useUserStore();
const router = useRouter();
const { uploadBase64Image } = useFilesUpload();
const { auth } = useFirebase();

const nameRules = [
  (v: string) => !!v || "El nombre es obligatorio",
  (v: string) => (v && v.length >= 4) || "Mínimo 4 letras",
  (v: string) => (v && v.length <= 25) || "Máximo 25 letras",
];

const originalPhoto = userStore.fullUser.photo;
const isUploadingPhoto = ref(false);
const user = reactive({
  photo: originalPhoto,
  name: userStore.fullUser.name,
});

const restorePhoto = () => {
  user.photo = originalPhoto;
};

const validateForm = async (): Promise<boolean> => {
  const result = await form.value?.validate();
  return result?.valid || false;
};

const updatePhoto = async (newPhoto: string) => {
  try {
    isUploadingPhoto.value = true;
    const file: AppFile = await uploadBase64Image(newPhoto);
    user.photo = file.url;
  } catch (e) {
    console.error("Error al subir imagen:", e);
  } finally {
    isUploadingPhoto.value = false;
  }
};

const isSubmitting = ref(false);
const submitForm = async () => {
  if (!(await validateForm())) {
    console.log("Formulario inválido");
    return;
  }
  isSubmitting.value = true;
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuario no autenticado");
    await updateProfile(currentUser, {
      displayName: user.name,
      photoURL: user.photo,
    });
    userStore.name = user.name;
    userStore.photo = user.photo;
    router.push({name: "user-profile"});
  } catch (e) {
    console.error("Error al actualizar usuario:", e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
<template>
  <v-card>
    <v-card-title>Actualizar Perfil</v-card-title>
    <v-card-subtitle>Actualiza los datos de tu perfil</v-card-subtitle>
    <v-card-text>
      <v-form ref="form" @submit.prevent="submitForm" id="user-update">
        <v-sheet
          class="mb-8 d-flex justify-center flex-column align-center"
          width="100%"
        >
          <base-users-avatar
            :size="100"
            class="mb-4"
            :src="user.photo?.toString()"
            :name="user.name?.toString()"
          ></base-users-avatar>
          <div class="d-flex justify-center ga-4">
            <v-btn class="opacity-80" variant="text" @click="restorePhoto">
              Restablecer
            </v-btn>
            <base-file-image-selector
              @update:image="updatePhoto"
              #default="{ loading, select }"
            >
              <v-btn
                color="primary"
                variant="text"
                :loading="loading || isUploadingPhoto"
                :disabled="loading || isUploadingPhoto"
                @click="select"
              >
                Cambiar
              </v-btn>
            </base-file-image-selector>
          </div>
        </v-sheet>
        <v-text-field
          label="Nombre"
          v-model="user.name"
          :rules="nameRules"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn prepend-icon="mdi-chevron-left" @click="router.back()">
        Regresar
      </v-btn>
      <v-btn
        variant="flat"
        color="primary"
        type="submit"
        form="user-update"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        Actualizar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
