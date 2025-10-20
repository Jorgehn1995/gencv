<template>
  <v-dialog
    v-model="state.show"
    :max-width="state.maxWidth"
    :persistent="state.persistent"
  >
    <v-card>
      <v-card-title class="d-flex align-center gap-2">
        <v-icon v-if="state.icon" :color="state.color" size="28">
          {{ state.icon }}
        </v-icon>
        <span>{{ state.title }}</span>
      </v-card-title>

      <v-card-text class="py-4">
        <div v-html="state.message"></div>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />

        <v-btn v-if="state.btnCancel" variant="text" @click="handleCancel">
          {{
            typeof state.btnCancel === "string" ? state.btnCancel : "Cancelar"
          }}
        </v-btn>

        <v-btn
          v-if="state.btnOk"
          :color="state.color"
          variant="flat"
          @click="handleOk"
        >
          {{ typeof state.btnOk === "string" ? state.btnOk : "Aceptar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialog } from "~/composables/base/useDialog";
const { state, handleOk, handleCancel } = useDialog();
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
