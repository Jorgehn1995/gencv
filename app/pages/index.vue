<script setup lang="ts">
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
const theme = useTheme();
definePageMeta({ layout: "default", name: "login" });

const router = useRouter();

const features = [
  {
    icon: "mdi-robot-outline",
    title: "IA Avanzada",
    description:
      "Optimización inteligente de tu CV con tecnología de última generación",
  },
  {
    icon: "mdi-target",
    title: "Personalización",
    description: "Adapta tu CV a cada puesto de trabajo específico",
  },
  {
    icon: "mdi-chart-line",
    title: "Mejora Continua",
    description: "Análisis y sugerencias para maximizar tus oportunidades",
  },
  {
    icon: "mdi-lightning-bolt",
    title: "Resultados Rápidos",
    description: "Genera CVs optimizados en segundos",
  },
];

const scrollToAuth = () => {
  const authElement = document.getElementById("auth-section");
  if (authElement) {
    authElement.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<template>
  <ClientOnly>
    <div class="landing-page">
      <section class="hero-section section-bg-gradient">
        <div
          class="deco-circle-primary"
          style="top: -50%; right: -20%; width: 600px; height: 600px"
        ></div>
        <div
          class="deco-circle-accent"
          style="bottom: -30%; left: -10%; width: 500px; height: 500px"
        ></div>
        <v-container>
          <v-row align="center" justify="center">
            <v-col
              cols="12"
              md="6"
              class="text-center text-md-left d-flex justify-center flex-column"
              order="2"
              order-sm="1"
            >
              <div class="logo-container mb-8">
                <v-img
                  width="300px"
                  height="120px"
                  :src="
                    theme.current.value.dark
                      ? '/logo-dark.png'
                      : '/logo-light.png'
                  "
                />
              </div>
              <h1 class="text-h1 text-center">
                Optimiza tu CV con Inteligencia Artificial
              </h1>
              <p class="hero-subtitle opacity-50 mt-4 text-center">
                ProCV utiliza IA avanzada para adaptar tu currículum a cada
                puesto de trabajo, aumentando tus posibilidades de éxito
                profesional
              </p>
              <v-btn
                color="primary"
                size="x-large"
                variant="flat"
                class="mt-8 mx-auto"
                @click="scrollToAuth"
                max-width="450"
              >
                Comenzar Ahora
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="12" md="6" class="d-flex justify-center align-center" order="1" order-sm="2">
              <div class="device-container animate-float">
                <v-img
                  src="/device.png"
                  class="device-image shadow-primary rounded-lg"
                  aspect-ratio="2"
                />
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="features-section">
        <v-container>
          <v-row>
            <v-col cols="12" class="text-center mb-8">
              <h2 class="section-title">¿Por qué elegir ProCV?</h2>
              <p class="section-subtitle">
                Herramientas profesionales para destacar en tu búsqueda laboral
              </p>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              v-for="feature in features"
              :key="feature.title"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card
                class="feature-card landing-card landing-card--hover"
                elevation="2"
              >
                <v-card-text class="text-center pa-6">
                  <v-icon
                    :icon="feature.icon"
                    size="48"
                    color="primary"
                    class="mb-4"
                  ></v-icon>
                  <h3 class="feature-title mb-3">{{ feature.title }}</h3>
                  <p class="text-medium-emphasis">{{ feature.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section id="auth-section" class="auth-section section-bg-gradient-alt">
        <div
          class="deco-circle-primary"
          style="
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 80%;
            opacity: 0.3;
          "
        ></div>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="6" lg="5">
              <div class="text-center mb-8">
                <h2 class="section-title">Comienza tu transformación</h2>
                <p class="section-subtitle">
                  Inicia sesión para acceder a todas las funcionalidades
                </p>
              </div>
              <app-auth-google
                @authenticated="router.push('/app')"
                max-width="400"
                class="mx-auto"
              ></app-auth-google>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <app-footer />
    </div>
    <base-theme-toggle
      class="position-absolute"
      style="right: 20px; top: 20px"
    ></base-theme-toggle>
  </ClientOnly>
</template>

<style scoped lang="scss">
.landing-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;

  :deep(.v-sheet) {
    width: 150px !important;
    margin: 0 auto;
  }

  @media (min-width: 960px) {
    justify-content: flex-start;
  }
}

.device-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;

  .device-image {
    border-radius: 8px;
    width: 100%;
  }
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  font-family: "Outfit", sans-serif;
  line-height: 1.2;
  margin-bottom: 24px;
  color: rgb(var(--v-theme-on-background));
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: rgb(var(--v-theme-on-background));
  opacity: 0.8;
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.features-section {
  padding: 96px 0;
  background: rgb(var(--v-theme-background));
}

.section-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 600;
  font-family: "Outfit", sans-serif;
  margin-bottom: 16px;
  color: rgb(var(--v-theme-on-surface));
}

.section-subtitle {
  font-size: 1.125rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

.feature-card {
  height: 100%;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  font-family: "Outfit", sans-serif;
  color: rgb(var(--v-theme-on-surface));
}

.auth-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 96px 0;
  position: relative;
}
</style>
