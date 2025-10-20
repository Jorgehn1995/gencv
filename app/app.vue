<template>
  <ClientOnly>
    <v-app>
      <Toaster position="top-right"  rich-colors/>
      <BaseDialog />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </v-app>
  </ClientOnly>
</template>
<script lang="ts" setup>
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";

import { useTheme } from "vuetify";

const theme = useTheme();

if (process.client) {
  const savedTheme = localStorage.getItem("theme-preference");
  if (savedTheme) {
    theme.change(savedTheme);
  } else {
    theme.change("dark");
  }
}
</script>
