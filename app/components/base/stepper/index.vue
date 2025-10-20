<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  step: number;
  steps: string[];
}>();

const emit = defineEmits(["step"]);
const currentIndex = computed(() => Math.min(Math.max(props.step - 1, 0), props.steps.length - 1));

const isActive = (i: number) => i === currentIndex.value;
const isComplete = (i: number) => i <= currentIndex.value;
</script>

<template>
  <div>
    <section class="steper">
      <ul>
        <li
          v-for="(s, i) in steps"
          :key="i"
          class="step"
          :class="{ active: isActive(i), complete: isComplete(i) }"
          @click="emit('step', i)"
        >
          <div class="circle-wrapper">
            <div class="circle">
              <transition name="step-content" mode="out-in">
                <span v-if="i > currentIndex || isActive(i)" key="number">
                  {{ i + 1 }}
                </span>
                <span v-else key="check">
                  <v-icon>mdi-check</v-icon>
                </span>
              </transition>

              <div v-if="i < steps.length - 1">
                <div v-if="i < currentIndex" class="step-line complete" style="top: 24px; height: calc(100% - 24px)" />
                <div v-else class="step-line" style="top: 24px; height: calc(100% - 24px)" />
              </div>
            </div>
          </div>

          <div class="title">
            {{ s }}
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scroped>
ul {
  list-style: none;
}
.steper {
  background-color: transparent;
}
.step {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 48px;
  position: relative;
}
.step.active:hover,
.step.complete:hover {
  cursor: pointer;
  opacity: 0.7;
}

.circle-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 100%;
  min-height: 48px;
}
.step-line {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  background: rgb(var(--v-theme-contrast));
  opacity: 0.05;
  border-radius: 2px;
  transition: opacity 0.2s;
  z-index: 0;
}
.step-line.complete,
.step-line.active {
  opacity: 1;
}
.circle {
  background-color: rgb(var(--v-theme-contrast), 0.05);
  color: rgb(var(--v-theme-contrast), 0.3);
  font-weight: 600;
  border-radius: 12px;
  padding: 6px;
  font-size: 0.7rem;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.title {
  color: rgb(var(--v-theme-contrast), 0.3);
}
.complete .circle {
  background-color: rgb(var(--v-theme-contrast), 1);
  color: rgb(var(--v-theme-background), 1);
}
.complete .title {
  color: rgb(var(--v-theme-contrast), 1);
}
.active .circle {
  box-shadow: 0 0 0 4px rgba(var(--v-theme-contrast), 0.15), 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.step-content-enter-active,
.step-content-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.step-content-enter-from,
.step-content-leave-to {
  opacity: 0;
}

.step-content-enter-to,
.step-content-leave-from {
  opacity: 1;
}
</style>
