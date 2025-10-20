<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    default: "mdi-cog-outline",
  },
  size: {
    type: Number,
    default: 60,
  },
});
const iconSize = Math.floor(props.size / 2) ;
</script>
<template>
  <div class="v-card-icon">
    <v-avatar :size="props.size">
      <slot name="default" :size="iconSize">
        <v-icon :size="iconSize">{{ props.icon }}</v-icon>
      </slot>
    </v-avatar>
  </div>
</template>
