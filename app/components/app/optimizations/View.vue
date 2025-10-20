<script lang="ts" setup>
import useFirestore from "~/composables/base/useFirestore";
import type { Optimization } from "~/types/cv";
import { useOptimizationsForm } from "~/composables/app/optimizations/useOptimizationsForm";

const props = defineProps<{
  optimizationId: string;
}>();
const router = useRouter();
const { getDocument } = useFirestore();
const {
  deleteOptimization,
  loading: deleteLoading,
  error: deleteError,
} = useOptimizationsForm();
const isLoading = ref(false);
const optimization = ref<Optimization | null>(null);

const getDocumentData = async () => {
  isLoading.value = true;
  console.log("inicio");

  try {
    const data = await getDocument<Optimization>(
      "optimizations",
      props.optimizationId
    );
    optimization.value = data;
  } catch (error) {
    console.error("Error fetching document:", error);
  } finally {
    isLoading.value = false;
  }
};

const viewCompatibilityDetails = ref(false);
const viewSalaryDetails = ref(false);
const viewCoverLetter = ref(false);
const viewDeleteConfirmation = ref(false);

const handleDelete = async () => {
  const result = await deleteOptimization(props.optimizationId);
  if (result) {
    viewDeleteConfirmation.value = false;
    router.push("/app/optimizations");
  }
};

onMounted(() => {
  getDocumentData();
});
</script>

<template>
  <v-sheet color="transparent">
    <div v-if="isLoading">
      <base-loading></base-loading>
    </div>
    <div v-else-if="optimization">
      <v-btn
        @click="$router.push('/app/optimizations')"
        prepend-icon="mdi-arrow-left"
        class="mb-4"
        variant="text"
      >
        Regresar
      </v-btn>
      <v-sheet color="transparent" class="text-center">
        <h1 class="text-h1 mb-2">
          Aplicación para
          {{ optimization.job.title }}
        </h1>
        <p class="text-subtitle-1 mb-6">
          Aquí están los resultados de la optimización de tu CV basada en la
          vacante seleccionada.
        </p>
      </v-sheet>
      <v-row>
        <v-col cols="12" sm="12" md="6">
          <div class="d-flex ga-6 flex-column">
            <v-sheet class="widget pa-8 bordered" rounded="lg" height="380">
              <h4 class="text-h4 mb-4">Aplicación</h4>
              <v-list class="d-flex ga-4 flex-column">
                <v-list-item
                  :title="optimization.job.companyName"
                  subtitle="Empresa"
                >
                  <template #prepend>
                    <base-avatar icon="mdi-domain"></base-avatar>
                  </template>
                </v-list-item>
                <v-list-item
                  :title="optimization.harvardCV.personalInfo.position"
                  subtitle="Posición"
                >
                  <template #prepend>
                    <base-avatar icon="mdi-briefcase-outline"></base-avatar>
                  </template>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item
                  :title="
                    optimization.harvardCV.personalInfo.firstName +
                    ' ' +
                    optimization.harvardCV.personalInfo.lastName
                  "
                  subtitle="Nombre Completo"
                >
                  <template #prepend>
                    <base-avatar icon="mdi-account-outline"></base-avatar>
                  </template>
                </v-list-item>
                <v-list-item
                  :title="optimization.harvardCV.personalInfo.email"
                  subtitle="Correo Electrónico"
                >
                  <template #prepend>
                    <base-avatar icon="mdi-email-outline"></base-avatar>
                  </template>
                </v-list-item>
              </v-list>
            </v-sheet>
          </div>
        </v-col>
        <v-col cols="12" sm="12" md="6">
          <v-sheet
            class="d-flex justify-center align-center flex-column pa-10 bordered"
            rounded="lg"
            height="380"
          >
            <h4 class="text-h4">Compatibilidad</h4>
            <app-chart-speed
              :value="optimization.compatibility.percentage"
              :min="0"
              :max="100"
              label="Compatibilidad"
              class="mb-6"
            ></app-chart-speed>
            <v-btn @click="viewCompatibilityDetails = true">
              Ver Análisis Detallado
            </v-btn>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="4">
          <v-sheet
            class="widget px-4 py-2 bordered cursor-pointer"
            rounded="lg"
            @click="viewSalaryDetails = true"
          >
            <v-list v-bind="props">
              <v-list-item
                :title="optimization.salaryExpectation.range"
                subtitle="Rango Salarial"
                append-icon="mdi-eye"
              >
                <template #prepend>
                  <base-avatar icon="mdi-cash"></base-avatar>
                </template>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="4">
          <v-sheet
            class="widget px-4 py-2 bordered cursor-pointer"
            rounded="lg"
            @click="viewCoverLetter = true"
          >
            <v-list>
              <v-list-item
                append-icon="mdi-eye"
                title="Carta de Presentación"
                subtitle="Click para ver"
              >
                <template #prepend>
                  <base-avatar icon="mdi-file-document-outline"></base-avatar>
                </template>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="4">
          <base-menu close-on-content-click>
            <template #activator="{ isOpen, props }">
              <v-sheet
                v-bind="props"
                class="widget px-4 py-2 bordered"
                rounded="lg"
                target="_blank"
              >
                <v-list>
                  <v-list-item
                    :append-icon="isOpen ? 'mdi-menu-up' : 'mdi-menu-down'"
                    title="CV Optimizado"
                    subtitle="Click para descargar"
                  >
                    <template #prepend>
                      <base-avatar icon="mdi-folder-outline"></base-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </v-sheet>
            </template>
            <template #items>
              <v-list>
                <v-list-item
                  :href="optimization.fileURL"
                  target="_blank"
                  title="Cv en PDF"
                  prepend-icon="mdi-file-pdf-box"
                  append-icon="mdi-download"
                ></v-list-item>
                <v-list-item
                  :href="optimization.fileURLDocx"
                  target="_blank"
                  title="Cv en Word"
                  prepend-icon="mdi-file-word-box"
                  append-icon="mdi-download"
                ></v-list-item>
              </v-list>
            </template>
          </base-menu>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-icon icon="mdi-school-outline"></v-card-icon>
            <v-card-title> Recomendaciones de Estudio </v-card-title>
            <v-card-subtitle>
              Recomendaciones de estudio personalizadas.
            </v-card-subtitle>
            <v-card-text>
              <v-sheet
                v-for="(
                  recommendation, index
                ) in optimization.studyRecommendations"
                :key="index"
                class="py-2 mb-4 border-s-xl border-primary pl-4"
              >
                <h4 class="text-h4 mb-2">{{ recommendation.title }}</h4>
                <p class="text-body-1 opacity-80">
                  {{ recommendation.description }}
                </p>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-icon icon="mdi-briefcase-outline"></v-card-icon>
            <v-card-title> Mejoras de CV </v-card-title>
            <v-card-subtitle>
              Recomendaciones de mejora para el CV.
            </v-card-subtitle>
            <v-card-text>
              <v-sheet
                v-for="(recommendation, index) in optimization.cvImprovements"
                :key="index"
                class="py-2 mb-4 border-s-xl border-accent pl-4"
              >
                <h4 class="text-h4 mb-2">{{ recommendation.title }}</h4>
                <p class="text-body-1 opacity-80">
                  {{ recommendation.description }}
                </p>
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <div class="pa-8 d-flex justify-center align-center">
        <v-btn
          color="error"
          prepend-icon="mdi-delete-outline"
          class="px-10"
          variant="tonal"
          size="x-large"
          @click="viewDeleteConfirmation = true"
        >
          Eliminar Optimización
        </v-btn>
      </div>
    </div>
    <div v-else>
      <v-sheet
        class="pa-10 rounded-lg d-flex justify-center align-center flex-column mx-auto"
        max-width="800"
      >
        <v-icon size="100" class="opacity-40"
          >mdi-clipboard-remove-outline</v-icon
        >
        <p class="text-body-1 opacity-60">
          No se encontro el Cv optmizado solicitado.
        </p>
        <v-btn
          class="mt-4"
          @click="$router.push({ name: 'optimization-list' })"
          prepend-icon="mdi-chevron-left"
          variant="tonal"
        >
          Regresar
        </v-btn>
      </v-sheet>
    </div>

    <v-dialog v-model="viewCompatibilityDetails" width="600">
      <v-card>
        <v-card-title> Detalles de Compatibilidad </v-card-title>
        <v-card-subtitle>
          Aquí se mostrarán los detalles adicionales sobre la compatibilidad
          entre el CV optimizado y la vacante seleccionada.
        </v-card-subtitle>
        <v-card-text>
          <p>
            {{ optimization?.compatibility.description }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="viewCompatibilityDetails = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="viewSalaryDetails" width="600">
      <v-card>
        <v-card-title> Detalles de Salario </v-card-title>
        <v-card-subtitle>
          Aquí se mostrarán los detalles adicionales sobre el salario esperado
          para la vacante seleccionada.
        </v-card-subtitle>
        <v-card-text>
          <p>
            {{ optimization?.salaryExpectation.description }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="viewSalaryDetails = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="viewCoverLetter" width="600">
      <v-card>
        <v-card-title> Detalles de Carta de Presentación </v-card-title>
        <v-card-subtitle>
          Aquí se mostrarán los detalles adicionales sobre la carta de
          presentación para la vacante seleccionada.
        </v-card-subtitle>
        <v-card-text>
          <p>
            {{ optimization?.coverLetter }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="viewCoverLetter = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="viewDeleteConfirmation" width="600">
      <v-card>
        <v-card-title> Confirmar Eliminación </v-card-title>

        <v-card-text>
          <p class="text-body-1">
            Esta acción eliminará permanentemente la optimización y sus archivos
            asociados. ¿Estás seguro de que deseas eliminar la optimización para
            <strong>{{ optimization?.job.title }}</strong> en
            <strong>{{ optimization?.job.companyName }}</strong
            >?
          </p>
          <p v-if="deleteError" class="text-error mt-4">
            {{ deleteError }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="viewDeleteConfirmation = false"
            :disabled="deleteLoading"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="handleDelete"
            :loading="deleteLoading"
            prepend-icon="mdi-delete-outline"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>
<style scoped></style>
