<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{ (e: "uploaded", file: File): void }>();
const { $toast } = useNuxtApp();
const props = defineProps({
  accept: {
    type: String,
    default:
      ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const uploadedFileName = ref<string | null>(null);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

const processFiles = (files: FileList) => {
  if (!files || files.length === 0) {
    loading.value = false;
    return;
  }

  try {
    if (props.multiple) {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          $toast.error(
            "El archivo " + file.name + " excede el tamaño máximo de 10 MB."
          );
          continue;
        }
        emit("uploaded", file);
      }
      uploadedFileName.value = null;
    } else {
      const file = files[0];
      if (!file) {
        loading.value = false;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        $toast.error(
          "El archivo " + file.name + " excede el tamaño máximo de 10 MB."
        );
        loading.value = false;
        return;
      }
      emit("uploaded", file);
      uploadedFileName.value = file.name;
    }
  } catch (e) {
    $toast.error("Error al seleccionar archivo");
  }
  loading.value = false;
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  processFiles(input.files!);
  input.value = "";
};

const unSelectFile = () => {
  if (loading.value) return;
  uploadedFileName.value = null;
  emit("uploaded", null as any);
};

const onDrop = (e: DragEvent) => {
  if (loading.value) return;
  loading.value = true;
  processFiles(e.dataTransfer!.files);
};
</script>
<template>
  <div class="uploader-dropzone-wrapper">
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      style="display: none"
      @change="onFileChange"
    />
    <div
      class="uploader-dropzone"
      :class="{ 'is-loading': loading }"
      @dragover.prevent
      @dragenter.prevent
      @drop.prevent="onDrop"
    >
      <slot name="default" :loading="loading" :select="triggerFileInput">
        <div class="d-flex flex-column justify-center align-center ga-4">
          <v-avatar class="cv-avatar" size="80">
            <v-icon size="40" class="opacity-80">
              {{
                uploadedFileName
                  ? "mdi-file-check-outline"
                  : "mdi-file-plus-outline"
              }}
            </v-icon>
          </v-avatar>
          <div class="d-flex flex-column justify-center align-center ga-2">
            <span v-if="uploadedFileName" class="text-body-1">
              {{ uploadedFileName }}
              <v-btn
                size="small"
                icon="mdi-close"
                @click="unSelectFile"
              ></v-btn>
            </span>
            <v-btn
              @click="triggerFileInput"
              color="primary"
              :variant="uploadedFileName ? 'text' : 'tonal'"
              :loading="loading"
            >
              {{
                uploadedFileName ? "Cambiar Archivo" : "Selecciona un Archivo"
              }}
            </v-btn>
            <span v-if="!uploadedFileName" class="text-body-1 mb-4">
              o arrastra y suelta uno.
            </span>
            <span class="text-body-2 opacity-50">
              {{
                uploadedFileName
                  ? "Archivo Seleccionado Correctamente"
                  : "Sube PDF o DOCX hasta 10MB"
              }}
            </span>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.uploader-dropzone-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.uploader-dropzone {
  width: 100%;
  min-height: 280px;
  border: 2px dashed rgba(var(--v-theme-contrast), 0.4);
  border-radius: 24px;
  background: rgba(var(--v-theme-contrast), 0.01);
  color: rgba(var(--v-theme-contrast), 1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  font-family: "Outfit", "Roboto", sans-serif;
  font-size: 1.1rem;

  margin: 0 auto;
  box-sizing: border-box;
}
.uploader-dropzone.is-loading {
  opacity: 0.6;
  pointer-events: none;
}
.cv-avatar {
  background-color: rgba(var(--v-theme-contrast), 0.03) !important;
  color: rgba(var(--v-theme-contrast), 0.6) !important;
}
.cv-avatar-success {
  background-color: rgba(var(--v-theme-teal), 0.03) !important;
  color: rgba(var(--v-theme-teal), 0.6) !important;
}
</style>
