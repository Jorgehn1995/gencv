<template>
  <v-btn
    @click="toggleTheme"
    variant="text"
    icon
    height="44"
    :color="theme.global.current.value.dark ? 'blue-lighten-2' : 'orange-darken-4'"
  >
    <v-icon :icon="!theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"></v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";

const theme = useTheme();

const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? "light" : "dark";
  theme.change(newTheme);
  localStorage.setItem("theme-preference", newTheme);
};
</script>
