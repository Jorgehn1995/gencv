// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";
import { themes } from "~/configs/theme";
import "vuetify/styles";
import "@/assets/scss/app.scss";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    defaults: {
      VCard: {
        elevation: 0,
        rounded: "lg",
      },

      VBtn: {
        variant: "flat",
        class: "px-4",
        rounded: "lg",
        size: "large",
        elevation: 0,
      },
      VTextField: {
        rounded: "md",
      },
      VTextarea: {
        rounded: "md",
      },
    },
    theme: {
      defaultTheme: "light",
      themes: {
        light: themes.light,
        dark: themes.dark,
      },
    },
  });
  app.vueApp.use(vuetify);
});
