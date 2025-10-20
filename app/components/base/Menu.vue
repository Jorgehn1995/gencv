<script lang="ts" setup>
import { useDisplay } from "vuetify/lib/composables/display.mjs";

const props = defineProps<{
  title?: string;
  closeOnContentClick?: boolean;
}>();
const display = useDisplay();
const isOpen = ref(false);

const open = () => {
  isOpen.value = !!isOpen.value;
};
</script>
<template>
  <div>
    <div v-if="display.smAndUp.value">
      <v-menu v-model="isOpen" :close-on-content-click="props.closeOnContentClick" >
        <template v-slot:activator="{ props }">
          <slot name="activator" :props="props" :open="open" :isOpen="isOpen">
            <v-btn v-bind="props" @click="open"> Menu 1 </v-btn>
          </slot>
        </template>

        <v-sheet min-width="250" rounded="md" class="px-2 shadow">
          <slot name="title" v-if="title">
            <h5 class="text-body-1 px-4 pt-6 pb-2">{{ title ?? "" }}</h5>
          </slot>
          <slot name="items">
            <v-list nav>
              <v-list-item title="Item" prepend-icon="mdi-view-dashboard" subtitle="Item subtitle text"></v-list-item>
            </v-list>
          </slot>
        </v-sheet>
      </v-menu>
    </div>
    <div v-else>
      <v-bottom-sheet v-model="isOpen">
        <template v-slot:activator="{ props }">
          <slot name="activator" :props="props" :isOpen="isOpen" :open="open">
            <v-btn v-bind="props" @click="open"> Menu 2 </v-btn>
          </slot>
        </template>

        <v-sheet class="rounded-b-0 rounded-t-lg shadow pa-4">
          <slot name="title" v-if="title">
            <h5 class="text-body-1 pb-4 pt-2 ps-2">{{ title ?? "" }}</h5>
          </slot>
          <v-card color="background">
            <slot name="items">
              <v-list nav>
                <v-list-item title="Item" prepend-icon="mdi-view-dashboard" subtitle="Item subtitle text"></v-list-item>
              </v-list>
            </slot>
          </v-card>
        </v-sheet>
      </v-bottom-sheet>
    </div>
  </div>
</template>
<style>
.shadow {
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px !important;
}
</style>
