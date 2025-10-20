import { ref } from 'vue';

export interface DialogOptions {
  title?: string;
  message: string;
  color?: string;
  icon?: string;
  btnCancel?: boolean | string;
  btnOk?: boolean | string;
  persistent?: boolean;
  maxWidth?: string | number;
  callback?: (result: boolean) => void;
}

interface DialogState extends DialogOptions {
  show: boolean;
}

const state = ref<DialogState>({
  show: false,
  title: '',
  message: '',
  color: 'primary',
  icon: '',
  btnCancel: false,
  btnOk: true,
  persistent: false,
  maxWidth: 500,
  callback: undefined,
});

const show = (options: DialogOptions) => {
  state.value = {
    show: true,
    title: options.title || 'Diálogo',
    message: options.message,
    color: options.color || 'primary',
    icon: options.icon || 'mdi-information',
    btnCancel: options.btnCancel ?? false,
    btnOk: options.btnOk ?? true,
    persistent: options.persistent ?? false,
    maxWidth: options.maxWidth || 500,
    callback: options.callback,
  };
};

const hide = () => {
  state.value.show = false;
};

const handleOk = () => {
  state.value.callback?.(true);
  hide();
};

const handleCancel = () => {
  state.value.callback?.(false);
  hide();
};

const success = (options: Omit<DialogOptions, 'color' | 'icon'>) => {
  show({
    ...options,
    title: options.title || 'Éxito',
    color: 'teal',
    icon: 'mdi-check-circle',
  });
};

const error = (options: Omit<DialogOptions, 'color' | 'icon'>) => {
  show({
    ...options,
    title: options.title || 'Error',
    color: 'error',
    icon: 'mdi-alert-circle',
  });
};

const info = (options: Omit<DialogOptions, 'color' | 'icon'>) => {
  show({
    ...options,
    title: options.title || 'Información',
    color: 'blue',
    icon: 'mdi-information',
  });
};

const warning = (options: Omit<DialogOptions, 'color' | 'icon'>) => {
  show({
    ...options,
    title: options.title || 'Advertencia',
    color: 'orange',
    icon: 'mdi-alert',
  });
};

const confirm = (options: DialogOptions) => {
  return new Promise<boolean>((resolve) => {
    show({
      ...options,
      btnCancel: options.btnCancel ?? 'Cancelar',
      btnOk: options.btnOk ?? 'Aceptar',
      callback: (result) => {
        options.callback?.(result);
        resolve(result);
      },
    });
  });
};

export const useDialog = () => ({
  state,
  show,
  hide,
  handleOk,
  handleCancel,
  success,
  error,
  info,
  warning,
  confirm,
});
