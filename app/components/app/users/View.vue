<script lang="ts" setup>
import { useUserStore } from "~/stores/user";
import { useRouter } from "vue-router";
const userStore = useUserStore();
const router = useRouter();
</script>
<template>
  <v-card>
    <v-card-icon #default="{ size }">
      <v-avatar
        :size="size"
        :image="userStore.fullUser.photo?.toString()"
      ></v-avatar>
    </v-card-icon>
    <v-card-title>Perfil de Usuario</v-card-title>
    <v-card-subtitle>Datos personales y contacto</v-card-subtitle>
    <v-card-text>
      <v-list>
        <v-list-item class="px-0">
          <v-list-item-title class="text-body-1 font-weight-normal">
            Nombre
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ userStore.fullUser.name }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item class="px-0">
          <v-list-item-title class="text-body-1 font-weight-normal">
            Email
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ userStore.fullUser.email }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-btn prepend-icon="mdi-chevron-left" @click="router.back()">
        Regresar
      </v-btn>
      <v-btn color="primary" variant="tonal" :to="{name:'user-update'}">Actualizar</v-btn>
    </v-card-actions>
  </v-card>
</template>
