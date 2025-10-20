interface RequestOptions {
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
}

export default function useApi() {
  const { $serverApi } = useNuxtApp();

  /**
   * GET - Obtener datos del servidor
   * @param url - La ruta del endpoint (ej: '/users/me')
   * @param options - Opciones de la petición (query params, headers)
   */
  const get = async <T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<T> => {
    try {
      const response = await $serverApi<T>(url, {
        method: "GET",
        params: options?.query,
        headers: options?.headers,
      });
      return response as T;
    } catch (error: any) {
      console.error(`Error en GET ${url}:`, error);
      throw error;
    }
  };

  /**
   * POST - Crear o enviar datos al servidor
   * @param url - La ruta del endpoint
   * @param options - Opciones de la petición (body, query params, headers)
   */
  const post = async <T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<T> => {
    try {
      const response = await $serverApi<T>(url, {
        method: "POST",
        body: options?.body,
        params: options?.query,
        headers: options?.headers,
      });
      return response as T;
    } catch (error: any) {
      console.error(`Error en POST ${url}:`, error);
      throw error;
    }
  };

  /**
   * PUT - Actualizar datos completos en el servidor
   * @param url - La ruta del endpoint
   * @param options - Opciones de la petición (body, query params, headers)
   */
  const put = async <T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<T> => {
    try {
      const response = await $serverApi<T>(url, {
        method: "PUT",
        body: options?.body,
        params: options?.query,
        headers: options?.headers,
      });
      return response as T;
    } catch (error: any) {
      console.error(`Error en PUT ${url}:`, error);
      throw error;
    }
  };

  /**
   * PATCH - Actualizar datos parciales en el servidor
   * @param url - La ruta del endpoint
   * @param options - Opciones de la petición (body, query params, headers)
   */
  const patch = async <T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<T> => {
    try {
      const response = await $serverApi<T>(url, {
        method: "PATCH",
        body: options?.body,
        params: options?.query,
        headers: options?.headers,
      });
      return response as T;
    } catch (error: any) {
      console.error(`Error en PATCH ${url}:`, error);
      throw error;
    }
  };

  /**
   * DELETE - Eliminar datos del servidor
   * @param url - La ruta del endpoint
   * @param options - Opciones de la petición (body, query params, headers)
   */
  const del = async <T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<T> => {
    try {
      const response = await $serverApi<T>(url, {
        method: "DELETE",
        body: options?.body,
        params: options?.query,
        headers: options?.headers,
      });
      return response as T;
    } catch (error: any) {
      console.error(`Error en DELETE ${url}:`, error);
      throw error;
    }
  };

  /**
   * SENDFILE - Subir un archivo blob al servidor y obtener la URL
   * @param url - La ruta del endpoint de subida
   * @param file - El archivo blob a subir
   * @param options - Opciones adicionales (query params, headers, nombre del campo)
   * @returns La URL del archivo subido
   */
  const sendFile = async (
    url: string,
    file: Blob | File,
    options?: RequestOptions & { fieldName?: string }
  ): Promise<any> => {
    try {
      const formData = new FormData();
      const fieldName = options?.fieldName || "file";

      if (file instanceof File) {
        formData.append(fieldName, file, file.name);
      } else {
        const timestamp = Date.now();
        const fileName = `upload-${timestamp}.bin`;
        formData.append(fieldName, file, fileName);
      }

      const response = await $serverApi<{ url: string }>(url, {
        method: "POST",
        body: formData,
        params: options?.query,
        headers: options?.headers,
      });

      return response;
    } catch (error: any) {
      console.error(`Error en UPLOAD ${url}:`, error);
      throw error;
    }
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    sendFile,
  };
}
