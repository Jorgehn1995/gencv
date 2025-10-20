<script lang="ts" setup>
import { useUserStore } from "~/stores/user";
import { useDisplay } from "vuetify";
const userStore = useUserStore();
const display = useDisplay();
</script>
<template>
  <div>
    <base-menu title="Usuario" close-on-content-click>
      <template #activator="{ isOpen, props }">
        <v-btn
          v-bind="props"
          :append-icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          variant="tonal"
        >
          <template #prepend>
            <v-avatar
              size="20"
              :image="userStore.fullUser.photo?.toString()"
            ></v-avatar>
          </template>
          <span class="text-body-1" v-if="display.smAndUp.value">
            {{ userStore.fullUser.name }}
          </span>
        </v-btn>
      </template>
      <template #items>
        <v-list bg-color="transparent">
          <v-list-item
            link
            title="Perfil"
            :to="{ name: 'user-profile' }"
            prepend-icon="mdi-account-circle"
            rounded="lg"
          ></v-list-item>
          <v-list-item
            link
            :to="{ name: 'logout' }"
            title="Cerrar sesión"
            prepend-icon="mdi-logout"
            rounded="lg"
          ></v-list-item>
        </v-list>
      </template>
    </base-menu>
  </div>
</template>
