# Copilot Coding Rules – GenCV Project

**Goal:** Generate clean, simple, and maintainable Nuxt 4 + Vuetify 3 + Firebase code.

---

### General Guidelines
- Never use emojis, decorative text, or informal comments.
- Do not auto-create `.md` or documentation files unless explicitly requested.
- Prefer minimal implementations and the fewest possible files.
- Follow Nuxt 4 conventions (file-based routing, composables auto-import, `.client.ts` for Firebase).
- Always write valid **TypeScript** and Composition API syntax (`<script setup lang="ts">`).
- Keep all logic easy to understand and modify — no over-engineering.
- Avoid unnecessary abstractions, patterns, or extra dependencies.
- All variables and code identifiers must be in English; all UI text in Spanish.

---

### Firebase & Nuxt Rules
- Use Firebase only on the **client side** (`.client.ts` plugin).
- Never hardcode Firebase credentials — load from `runtimeConfig`.
- Use lowercase plural collection names (e.g., `users`, `cvs`).
- Handle all Firebase operations with `try/catch` and loading states.

---

### Vuetify & Styling
- Follow global Vuetify defaults defined in `plugins/vuetify.ts`.
- Use SCSS for styling (`@/assets/scss/app.scss`).
- No inline styles; prefer class-based or SCSS variables.
- Use consistent spacing (multiples of 4px) and typography (Outfit + Roboto).

---

### Code Style
- No redundant comments, examples, or “TODOs”.
- Functions must be short, clear, and single-purpose.
- Prefer explicit return types in TypeScript.
- Wrap content in `<v-container>` and keep templates under 80 lines.
- Use `<ClientOnly>` for all Vuetify root-level rendering (SSR safe).

---

### Output Expectations
- Code must build and run successfully in Nuxt 4.
- Must be readable and follow project architecture.
- Avoid deep folder hierarchies or complex file splits.
- Never generate unnecessary demo code or placeholder text.

---

**In summary:**  
Generate minimal, professional, and production-ready code — no fluff, no emojis, no extra files.
