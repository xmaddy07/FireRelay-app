import type {AppDialogContextValue} from '../../context/DialogContext';

let handlers: AppDialogContextValue | null = null;

export const registerDialogHandlers = (
  next: AppDialogContextValue | null,
): void => {
  handlers = next;
};

export const dialogService: AppDialogContextValue = {
  alert: (title, message, options) => {
    handlers?.alert(title, message, options);
  },
  confirm: (title, message, options) => {
    handlers?.confirm(title, message, options);
  },
  showError: (title, error) => {
    handlers?.showError(title, error);
  },
  showToast: (message, options) => {
    handlers?.showToast(message, options);
  },
};
