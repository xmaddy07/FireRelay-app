import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {formatApiErrorMessage} from '../api';
import AppDialog from '../components/common/AppDialog';
import type {AppDialogVariant} from '../components/common/AppDialog';
import AppToast from '../components/common/AppToast';
import {registerDialogHandlers} from '../services/dialogs/dialogService';
import {InteractionManager} from 'react-native';

type DialogMode = 'confirm' | 'alert';

type DialogState = {
  title: string;
  message: string;
  mode: DialogMode;
  variant: AppDialogVariant;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

type AlertOptions = {
  confirmLabel?: string;
  variant?: Extract<AppDialogVariant, 'info' | 'success'>;
  onDismiss?: () => void;
};

type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AppDialogVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

type ToastOptions = {
  icon?: string;
  duration?: number;
};

export type AppDialogContextValue = {
  alert: (title: string, message: string, options?: AlertOptions) => void;
  confirm: (title: string, message: string, options: ConfirmOptions) => void;
  showError: (title: string, error: unknown) => void;
  showToast: (message: string, options?: ToastOptions) => void;
};

const DialogContext = createContext<AppDialogContextValue | null>(null);

export const DialogProvider = ({children}: {children: React.ReactNode}) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastIcon, setToastIcon] = useState('check-circle');
  const [toastDuration, setToastDuration] = useState(2200);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setDialogLoading(false);
  }, []);

  const alert = useCallback(
    (title: string, message: string, options?: AlertOptions) => {
      setDialog({
        title,
        message,
        mode: 'alert',
        variant: options?.variant ?? 'info',
        confirmLabel: options?.confirmLabel ?? 'OK',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          options?.onDismiss?.();
          closeDialog();
        },
        onCancel: () => {
          options?.onDismiss?.();
          closeDialog();
        },
      });
    },
    [closeDialog],
  );

  const confirm = useCallback(
    (title: string, message: string, options: ConfirmOptions) => {
      setDialog({
        title,
        message,
        mode: 'confirm',
        variant: options.variant ?? 'default',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        onConfirm: options.onConfirm,
        onCancel: () => {
          options.onCancel?.();
          closeDialog();
        },
      });
    },
    [closeDialog],
  );

  const showError = useCallback(
    (title: string, error: unknown) => {
      const message = formatApiErrorMessage(error);
      // Defer so we never present AppDialog while another Modal is mid-transition
      // (nested RN Modals freeze the UI on iOS/Android).
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          alert(title, message);
        }, 320);
      });
    },
    [alert],
  );

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    setToastMessage(message);
    setToastIcon(options?.icon ?? 'check-circle');
    setToastDuration(options?.duration ?? 2200);
    setToastVisible(true);
  }, []);

  const handleDialogConfirm = useCallback(async () => {
    if (!dialog?.onConfirm) {
      closeDialog();
      return;
    }

    const result = dialog.onConfirm();
    if (result instanceof Promise) {
      setDialogLoading(true);
      try {
        await result;
        closeDialog();
      } catch (error) {
        closeDialog();
        showError('Something went wrong', error);
      } finally {
        setDialogLoading(false);
      }
      return;
    }

    closeDialog();
  }, [closeDialog, dialog, showError]);

  const handleDialogCancel = useCallback(() => {
    dialog?.onCancel?.();
  }, [dialog]);

  const value = useMemo(
    () => ({alert, confirm, showError, showToast}),
    [alert, confirm, showError, showToast],
  );

  useEffect(() => {
    registerDialogHandlers(value);
    return () => registerDialogHandlers(null);
  }, [value]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        mode={dialog?.mode ?? 'alert'}
        variant={dialog?.variant ?? 'info'}
        confirmLabel={dialog?.confirmLabel ?? 'OK'}
        cancelLabel={dialog?.cancelLabel ?? 'Cancel'}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        loading={dialogLoading}
      />
      <AppToast
        visible={toastVisible}
        message={toastMessage}
        icon={toastIcon}
        duration={toastDuration}
        onHide={() => setToastVisible(false)}
      />
    </DialogContext.Provider>
  );
};

export const useAppDialog = (): AppDialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useAppDialog must be used within DialogProvider');
  }
  return context;
};
