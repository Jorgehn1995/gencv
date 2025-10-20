<script lang="ts" setup>
import { useTheme } from "vuetify";
const theme = useTheme();
</script>
<template>
  <div>
    <nuxt-link :to="{ name: 'home' }">
      <v-sheet width="100" class="ml-2" color="transparent">
        <v-img
          :src="theme.current.value.dark ? '/logo-dark.png' : '/logo-light.png'"
        />
      </v-sheet>
    </nuxt-link>
  </div>
</template>
