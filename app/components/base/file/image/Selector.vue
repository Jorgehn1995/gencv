<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg"
      style="display: none"
      @change="onFileChange"
    />

    <slot
      name="default"
      v-if="!showEditor"
      :loading="loading"
      :select="triggerFileInput"
    >
      <v-btn
        color="primary"
        variant="text"
        :loading="loading"
        :disabled="loading"
        @click="triggerFileInput"
      >
        Cambiar
      </v-btn>
    </slot>

    <v-dialog v-model="showEditor" width="440" persistent>
      <v-card elevation="0" rounded="lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Ajustar Imagen</span>
        </v-card-title>

        <v-card-text>
          <div class="d-flex justify-center align-center">
            <v-sheet rounded="lg" style="overflow: hidden">
              <div class="cropper-wrap" @wheel.prevent="onWheelZoom">
                <Cropper
                  v-if="imageUrl"
                  :src="imageUrl"
                  ref="cropper"
                  :stencil-props="{
                    handlers: {},
                    movable: false,
                    resizable: false,
                    aspectRatio: 1,
                  }"
                  :stencil-size="{ width: 300, height: 300 }"
                  :canvas="{ maxWidth: 380, maxHeight: 340 }"
                  image-restriction="stencil"
                  class="cropper"
                  @change="onCropperChange"
                  @ready="onCropperReady"
                />
              </div>
            </v-sheet>
          </div>

          <v-chip-group
            v-model="tool"
            variant="text"
            color="primary"
            mandatory
            show-arrows
            centered
            center-active
            class="py-4"
          >
            <v-chip>
              <template #prepend>
                <v-icon start>mdi-magnify-plus-outline</v-icon>
              </template>
              Zoom
            </v-chip>

            <v-chip>
              <template #prepend>
                <v-icon start>mdi-format-rotate-90</v-icon>
              </template>
              Rotar
            </v-chip>

            <v-chip>
              <template #prepend>
                <v-icon start>mdi-flip-horizontal</v-icon>
              </template>
              Voltear
            </v-chip>
          </v-chip-group>

          <v-sheet color="transparent" height="50">
            <div v-if="tool === 0" class="d-flex justify-center align-center">
              <v-btn
                text="Disminuir"
                size="small"
                variant="text"
                prepend-icon="mdi-minus"
                @click="zoomUpdate(-zoom.step)"
              />

              <v-btn
                text="Aumentar"
                size="small"
                append-icon="mdi-plus"
                variant="text"
                @click="zoomUpdate(zoom.step)"
              />
            </div>

            <v-slider
              v-else-if="tool === 1"
              v-model="rotation.actual"
              color="primary"
              @update:model-value="rotationUpdate"
              :step="rotation.step"
              :max="rotation.max"
              :min="rotation.min"
              track-color="grey"
              thumb-color="primary"
              :hint="`${rotation.actual}°`"
              persistent-hint
            >
              <template #prepend>
                <v-btn
                  icon="mdi-rotate-left"
                  size="small"
                  @click="rotationUpdate(rotation.actual - rotation.step)"
                />
              </template>
              <template #append>
                <v-btn
                  icon="mdi-rotate-right"
                  size="small"
                  @click="rotationUpdate(rotation.actual + rotation.step)"
                />
              </template>
            </v-slider>

            <div v-else class="d-flex justify-center">
              <v-btn @click="flipUpdate('horizontal')" class="mr-2">
                <template #prepend>
                  <v-icon>mdi-flip-horizontal</v-icon>
                </template>
                Horizontal
              </v-btn>
              <v-btn @click="flipUpdate('vertical')" class="mr-2">
                <template #prepend>
                  <v-icon>mdi-flip-vertical</v-icon>
                </template>
                Vertical
              </v-btn>
            </div>
          </v-sheet>
        </v-card-text>

        <v-card-actions class="text-right mt-0 pt-0 mb-0">
          <v-btn class="mr-2" @click="closeEditor">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmCrop"
            :loading="isCropping"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from "vue";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const showEditor = ref(false);
const imageUrl = ref<string | null>(null);
const cropper = ref<any | null>(null);
const isCropping = ref(false);
const tool = ref(0);
const isReady = ref(false);
const isUpdatingZoom = ref(false); // Flag para controlar actualizaciones programáticas

const zoom = reactive({
  actual: 1,
  step: 0.1,
  min: 0.5,
  max: 2,
});
const zoomPercentage = computed(() => Math.round(zoom.actual * 100));

const rotation = reactive({
  actual: 0,
  step: 15,
  min: -180,
  max: 180,
});
const lastRotation = ref(0);

const onCropperReady = async () => {
  await nextTick();
  isReady.value = true;
  lastRotation.value = 0;
  zoom.actual = 1;
};

// Solo actualizamos zoom.actual si NO estamos haciendo un cambio programático
const onCropperChange = (payload: any) => {
  if (
    !payload?.coordinates?.transform ||
    !isReady.value ||
    isUpdatingZoom.value
  )
    return;

  const scale = Number(payload.coordinates.transform.scale) || 1;
  zoom.actual = parseFloat(
    Math.max(zoom.min, Math.min(zoom.max, scale)).toFixed(2)
  );
};

const triggerFileInput = () => {
  if (loading.value) return;
  loading.value = true;
  fileInput.value?.click();

  setTimeout(() => {
    window.addEventListener("focus", onWindowFocus, { once: true });
  }, 300);
};

const onWindowFocus = () => {
  setTimeout(() => {
    if (
      fileInput.value &&
      (!fileInput.value.files || fileInput.value.files.length === 0)
    ) {
      loading.value = false;
    }
  }, 300);
};

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !["image/png", "image/jpeg"].includes(file.type)) {
    loading.value = false;
    return;
  }
  imageUrl.value = await fileToDataUrl(file);
  loading.value = false;
  showEditor.value = true;
  input.value = "";
};

const closeEditor = () => {
  showEditor.value = false;
  imageUrl.value = null;
  resetTools();
};

const emit = defineEmits<{ (e: "update:image", dataUrl: string): void }>();

const confirmCrop = async () => {
  if (!cropper.value) return;
  isCropping.value = true;
  const { canvas } = cropper.value.getResult();
  if (canvas) {
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    emit("update:image", dataUrl);
  }
  isCropping.value = false;
  closeEditor();
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const zoomUpdate = async (delta: number) => {
  if (!cropper.value || !isReady.value) return;

  isUpdatingZoom.value = true;

  const targetZoom = Math.max(
    zoom.min,
    Math.min(zoom.max, zoom.actual + delta)
  );
  const factor = targetZoom / zoom.actual;

  if (isFinite(factor) && factor > 0) {
    cropper.value.zoom(factor);

    // Leer el zoom real después de aplicarlo
    await nextTick();
    const result = cropper.value.getResult();
    if (result?.coordinates?.transform?.scale) {
      const realScale = Number(result.coordinates.transform.scale);
      zoom.actual = parseFloat(
        Math.max(zoom.min, Math.min(zoom.max, realScale)).toFixed(2)
      );
    } else {
      zoom.actual = parseFloat(targetZoom.toFixed(2));
    }
  }

  await nextTick();
  isUpdatingZoom.value = false;
};

const onWheelZoom = (e: WheelEvent) => {
  if (!isReady.value || e.ctrlKey) return;

  const delta = e.deltaY > 0 ? -zoom.step : zoom.step;
  zoomUpdate(delta);
};

const resetZoom = async () => {
  if (!cropper.value || !isReady.value) return;

  isUpdatingZoom.value = true;

  const factor = 1 / zoom.actual;

  if (isFinite(factor) && factor > 0) {
    cropper.value.zoom(factor);

    // Leer el zoom real después de aplicarlo
    await nextTick();
    const result = cropper.value.getResult();
    if (result?.coordinates?.transform?.scale) {
      const realScale = Number(result.coordinates.transform.scale);
      zoom.actual = parseFloat(
        Math.max(zoom.min, Math.min(zoom.max, realScale)).toFixed(2)
      );
    } else {
      zoom.actual = 1;
    }
  }

  await nextTick();
  isUpdatingZoom.value = false;
};

const rotationUpdate = async (value: number) => {
  if (!cropper.value) return;
  const clamped = Math.max(rotation.min, Math.min(rotation.max, value));
  const delta = clamped - lastRotation.value;
  if (delta !== 0) {
    cropper.value.rotate(delta);
    lastRotation.value = clamped;
  }
  rotation.actual = Math.round(clamped);
  await nextTick();
};

const flipUpdate = async (type: "vertical" | "horizontal") => {
  if (!cropper.value) return;
  if (type === "horizontal") cropper.value.flip(true, false);
  else cropper.value.flip(false, true);
  await nextTick();
};

const resetTools = async () => {
  if (cropper.value) cropper.value.reset();
  tool.value = 0;
  zoom.actual = 1;
  rotation.actual = 0;
  lastRotation.value = 0;
  isReady.value = false;
  isUpdatingZoom.value = false;
  await nextTick();
};
</script>

<style scoped>
.cropper {
  width: 340px;
  height: 340px;
}
.cropper-wrap {
  width: 340px;
  height: 340px;
}
</style>
