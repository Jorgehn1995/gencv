import { useFirebase } from "~/composables/base/useFirebase";
export default defineNuxtPlugin(() => {
  const { auth } = useFirebase();
  const serverApi = $fetch.create({
    baseURL: "/api",
    async onRequest({ options }) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          if (!options.headers) {
            options.headers = new Headers();
          }
          if (options.headers instanceof Headers) {
            options.headers.set("Authorization", `Bearer ${token}`);
          } else {
            (options.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        console.warn("Sesión expirada o token inválido");
      }
      if (response.status === 403) {
        console.warn("Acceso denegado");
      }
    },
  });
  return {
    provide: {
      serverApi,
    },
  };
});
