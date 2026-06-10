import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {createAppDialogStyles} from './styles';

export type AppDialogVariant = 'default' | 'destructive' | 'info' | 'success';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  mode?: 'confirm' | 'alert';
  variant?: AppDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
};

const ICON_BY_VARIANT: Record<AppDialogVariant, string> = {
  default: 'alert-circle',
  destructive: 'trash-2',
  info: 'info',
  success: 'check-circle',
};

const AppDialog = ({
  visible,
  title,
  message,
  mode = 'confirm',
  variant = 'default',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createAppDialogStyles);

  const iconWrapStyle = {
    default: styles.iconWrapDefault,
    destructive: styles.iconWrapDestructive,
    info: styles.iconWrapInfo,
    success: styles.iconWrapSuccess,
  }[variant];

  const iconColor = {
    default: colors.primary,
    destructive: '#EF4444',
    info: '#60A5FA',
    success: colors.success,
  }[variant];

  const isDestructive = variant === 'destructive';
  const isAlert = mode === 'alert';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={[styles.iconWrap, iconWrapStyle]}>
              <Icon name={ICON_BY_VARIANT[variant]} size={22} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          <View style={[styles.footer, isAlert && styles.footerSingle]}>
            {!isAlert && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                isDestructive && styles.confirmButtonDestructive,
                loading && styles.confirmButtonDisabled,
                isAlert && {flex: 0, minWidth: '50%'},
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={isDestructive ? colors.white : colors.textOnPrimary}
                />
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    isDestructive && styles.confirmButtonTextDestructive,
                  ]}
                >
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AppDialog;
