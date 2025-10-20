<script lang="ts" setup>
import { VForm } from "vuetify/components";
import { useOptimizationsForm } from "~/composables/app/optimizations/useOptimizationsForm";
import { useRouter } from "vue-router";

const router = useRouter();
const cvForm = useOptimizationsForm();
const eform = ref<VForm | null>(null);
const isGenerating = ref(false);

const information = reactive({
  cvFile: null as File | null,
  jobTitle: "",
  companyName: "",
  jobDescription: "",
});

const rules = {
  jobTitle: [
    (v: string) => (!!v && v.trim().length > 0) || "El título es obligatorio.",
    (v: string) => v.length <= 50 || "Máximo 50 caracteres.",
  ],
  companyName: [
    (v: string) =>
      (!!v && v.trim().length > 0) || "El nombre de la empresa es obligatorio.",
    (v: string) => v.length <= 50 || "Máximo 50 caracteres.",
  ],
  salaryExpectation: [
    (v: string) =>
      !v ||
      (/^\d+$/.test(v) && parseInt(v) > 0) ||
      "Debe ser un número entero mayor a 0.",
  ],
  jobDescription: [
    (v: string) =>
      (!!v && v.trim().length > 0) || "La descripción es obligatoria.",
    (v: string) => v.length <= 10000 || "Máximo 10000 caracteres.",
  ],
};

const jobInforValid = computed(() => {
  return (
    rules.jobTitle.every((rule) => rule(information.jobTitle) === true) &&
    rules.companyName.every((rule) => rule(information.companyName) === true) &&
    rules.jobDescription.every(
      (rule) => rule(information.jobDescription) === true
    )
  );
});

const submitForm = async () => {
  let form = await eform.value?.validate();
  if (!form) return;

  if (form?.valid) {
    isGenerating.value = true;
    let optimizedId = await cvForm.createOptimization(information);
    router.push({
      name: "optimization-view",
      params: { optimizationId: optimizedId.toString() },
    });
    isGenerating.value = false;
  } else {
    //8console.log("Formulario inválido");
  }
};
const words = [
  "Extrayendo datos",
  "Analizando con IA",
  "Mejorando tu perfil",
  "Detectando fortalezas",
  "Potenciando tu CV",
  "Aplicando inteligencia artificial",
  "Buscando oportunidades",
  "Personalizando recomendaciones",
  "Preparando tu CV para el éxito",
  "Transformando tu experiencia",
  "Creando ventajas competitivas",
];
const currentWord = ref(words[0]);
let wordInterval: number | undefined;
let wordIndex = 0;

onMounted(() => {
  wordInterval = window.setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    currentWord.value = words[wordIndex];
  }, 2000);
});

onUnmounted(() => {
  if (wordInterval) clearInterval(wordInterval);
});
</script>
<template>
  <v-sheet color="transparent">
    <v-btn
      @click="$router.push('/app/optimizations')"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      variant="text"
    >
      Regresar
    </v-btn>
    <section class="text-center px-8 pb-8" width="100%">
      <h1 class="text-h1">Optimizar CV</h1>
      <p class="text-subtitle-1 mb-6 my-3">
        Sube tu archivo en formato PDF o Word para comenzar a generar tu CV.
      </p>
    </section>
    <section>
      <div class="d-flex ga-6 align-start">
        <v-avatar
          :color="information.cvFile ? 'primary' : 'contrast'"
          :variant="information.cvFile ? 'flat' : 'tonal'"
          size="56"
        >
          <v-icon v-if="information.cvFile">mdi-check</v-icon>
          <span v-else class="text-h2">1</span>
        </v-avatar>
        <div class="d-flex flex-column">
          <h2 class="text-h2">Agrega Tu CV</h2>
          <p>
            Selecciona un archivo existente o sube uno nuevo desde tu
            dispositivo
          </p>
        </div>
      </div>
      <div class="d-flex flex-column ga-4">
        <v-sheet class="d-flex justify-center" color="transparent" v-if="false">
          <v-chip-group :center-active="true" :model-value="0">
            <v-chip>Subir Archivo</v-chip>
            <v-chip>Seleccionar Existente</v-chip>
          </v-chip-group>
        </v-sheet>
        <base-file-uploader
          class="my-8"
          @uploaded="information.cvFile = $event"
        ></base-file-uploader>
      </div>
    </section>
    <section>
      <div class="d-flex ga-6 align-center">
        <v-avatar
          :color="jobInforValid ? 'primary' : 'contrast'"
          :variant="jobInforValid ? 'flat' : 'tonal'"
          size="56"
        >
          <v-icon v-if="jobInforValid">mdi-check</v-icon>
          <span v-else class="text-h2">2</span>
        </v-avatar>
        <div class="d-flex flex-column">
          <h2 class="text-h2">Información de Vacante</h2>
          <p>Indica la informacion de la vacante a la cual aplicaras</p>
        </div>
      </div>
      <div>
        <v-sheet class="pa-8 my-8 job-info">
          <v-form ref="eform" id="optimize-cv" @submit.prevent="submitForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="Titulo del Puesto"
                  v-model="information.jobTitle"
                  :rules="rules.jobTitle"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="Nombre de la Empresa"
                  v-model="information.companyName"
                  :rules="rules.companyName"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  label="Descripción de la Vacante"
                  v-model="information.jobDescription"
                  :rules="rules.jobDescription"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-sheet>
      </div>
    </section>
    <section>
      <div class="d-flex justify-center mb-8">
        <v-btn
          color="primary"
          class="px-10 ai"
          size="x-large"
          form="optimize-cv"
          type="submit"
          append-icon="mdi-creation"
          :disabled="!jobInforValid || !information.cvFile"
          :loading="isGenerating"
        >
          Optimizar Mi CV
        </v-btn>
      </div>
    </section>
    <v-dialog v-model="isGenerating" width="400" persistent>
      <v-sheet color="primary" class="pa-4 ai" rounded="lg">
        <v-list bg-color="transparent">
          <v-list-item prepend-icon="mdi-creation">
            <v-list-item-title>
              <span class="text-capitalize">{{ currentWord }}...</span>
            </v-list-item-title>
            <v-list-item-subtitle class="mb-2">
              Espera un momento...
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <v-progress-linear rounded="lg" indeterminate></v-progress-linear>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-dialog>
  </v-sheet>
</template>

<style scoped>
.job-info {
  background: rgba(var(--v-theme-contrast), 0.01);
  border: 1px solid rgba(var(--v-theme-contrast), 0.1);
  border-radius: 24px;
}
</style>
