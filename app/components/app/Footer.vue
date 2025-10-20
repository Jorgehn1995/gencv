<script setup lang="ts">
import { useTheme } from "vuetify";
const theme = useTheme();

const currentYear = new Date().getFullYear();

const footerLinks = {
  product: [
    { title: "Características", href: "#features" },
    { title: "Precios", href: "#pricing" },
    { title: "Casos de uso", href: "#use-cases" }
  ],
  company: [
    { title: "Acerca de", href: "#about" },
    { title: "Blog", href: "#blog" },
    { title: "Contacto", href: "#contact" }
  ],
  legal: [
    { title: "Privacidad", href: "#privacy" },
    { title: "Términos", href: "#terms" },
    { title: "Cookies", href: "#cookies" }
  ]
};

const socialLinks = [
  { icon: "mdi-twitter", href: "#", label: "Twitter" },
  { icon: "mdi-linkedin", href: "#", label: "LinkedIn" },
  { icon: "mdi-github", href: "#", label: "GitHub" },
  { icon: "mdi-instagram", href: "#", label: "Instagram" }
];
</script>

<template>
  <footer class="app-footer">
    <v-container>
      <v-row class="footer-content">
        <v-col cols="12" md="4" class="footer-brand">
          <div class="brand-logo mb-4">
            <v-img
              width="200px"
              height="50px"
              :src="theme.current.value.dark ? '/logo-dark.png' : '/logo-light.png'"
            />
          </div>
          <p class="brand-description text-medium-emphasis">
            Optimiza tu currículum con inteligencia artificial y aumenta tus oportunidades profesionales.
          </p>
          <div class="social-links mt-6">
            <v-btn
              v-for="social in socialLinks"
              :key="social.label"
              :icon="social.icon"
              :href="social.href"
              :aria-label="social.label"
              variant="text"
              color="primary"
              size="small"
              class="social-btn"
            />
          </div>
        </v-col>

        <v-col cols="12" md="2" class="footer-section">
          <h4 class="footer-title">Producto</h4>
          <ul class="footer-links">
            <li v-for="link in footerLinks.product" :key="link.title">
              <a :href="link.href" class="text-medium-emphasis">{{ link.title }}</a>
            </li>
          </ul>
        </v-col>

        <v-col cols="12" md="2" class="footer-section">
          <h4 class="footer-title">Compañía</h4>
          <ul class="footer-links">
            <li v-for="link in footerLinks.company" :key="link.title">
              <a :href="link.href" class="text-medium-emphasis">{{ link.title }}</a>
            </li>
          </ul>
        </v-col>

        <v-col cols="12" md="2" class="footer-section">
          <h4 class="footer-title">Legal</h4>
          <ul class="footer-links">
            <li v-for="link in footerLinks.legal" :key="link.title">
              <a :href="link.href" class="text-medium-emphasis">{{ link.title }}</a>
            </li>
          </ul>
        </v-col>

        <v-col cols="12" md="2" class="footer-section">
          <h4 class="footer-title">Contacto</h4>
          <ul class="footer-links">
            <li>
              <a href="mailto:info@procv.com" class="text-medium-emphasis">
                <v-icon size="small" class="mr-2">mdi-email</v-icon>
                info@procv.com
              </a>
            </li>
            <li>
              <a href="tel:+34900000000" class="text-medium-emphasis">
                <v-icon size="small" class="mr-2">mdi-phone</v-icon>
                +34 900 000 000
              </a>
            </li>
          </ul>
        </v-col>
      </v-row>

      <v-divider class="my-8" style="border-color: rgba(13, 183, 183, 0.1);"></v-divider>

      <v-row class="footer-bottom">
        <v-col cols="12" md="6" class="text-center text-md-left">
          <p class="copyright text-disabled">
            © {{ currentYear }} ProCV. Todos los derechos reservados.
          </p>
        </v-col>
        
      </v-row>
    </v-container>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(13, 183, 183, 0.1);
  padding: 64px 0 32px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgb(var(--v-theme-primary)) 50%, transparent 100%);
  }
}

.footer-content {
  margin-bottom: 24px;
}

.footer-brand .brand-description {
  max-width: 300px;
}

.social-links {
  display: flex;
  gap: 8px;

  .social-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      background: rgba(13, 183, 183, 0.1);
    }
  }
}

.footer-section {
  .footer-title {
    font-family: "Outfit", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 12px;

      a {
        text-decoration: none;
        font-size: 0.9375rem;
        display: inline-flex;
        align-items: center;
        transition: all 0.2s ease;

        &:hover {
          opacity: 1;
          color: rgb(var(--v-theme-primary));
          transform: translateX(4px);
        }
      }
    }
  }
}

.footer-bottom {
  .copyright,
  .powered-by {
    font-size: 0.875rem;
    margin: 0;
  }

  .brand-highlight {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
    opacity: 1;
  }
}

@media (max-width: 960px) {
  .footer-section {
    margin-bottom: 32px;
  }

  .footer-bottom .text-md-left,
  .footer-bottom .text-md-right {
    text-align: center !important;
  }
}
</style>
