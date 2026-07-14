import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {hp} from '../../../utils/responsive';
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

type DisplayState = {
  title: string;
  message: string;
  mode: 'confirm' | 'alert';
  variant: AppDialogVariant;
  confirmLabel: string;
  cancelLabel: string;
};

const ICON_BY_VARIANT: Record<AppDialogVariant, string> = {
  default: 'alert-circle',
  destructive: 'trash-2',
  info: 'info',
  success: 'check-circle',
};

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const ENTER_MS = 320;
const EXIT_MS = 200;

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

  const [presented, setPresented] = useState(false);
  const [display, setDisplay] = useState<DisplayState>({
    title,
    message,
    mode,
    variant,
    confirmLabel,
    cancelLabel,
  });
  const closingRef = useRef(false);

  const overlayOpacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(hp(3.5));
  const iconOpacity = useSharedValue(0);
  const iconTranslateY = useSharedValue(hp(1));
  const ringOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.88);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(hp(1));
  const footerOpacity = useSharedValue(0);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{translateY: cardTranslateY.value}],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{translateY: iconTranslateY.value}],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{scale: ringScale.value}],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{translateY: contentTranslateY.value}],
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const resetToHidden = useCallback(() => {
    overlayOpacity.value = 0;
    cardOpacity.value = 0;
    cardTranslateY.value = hp(3.5);
    iconOpacity.value = 0;
    iconTranslateY.value = hp(1);
    ringOpacity.value = 0;
    ringScale.value = 0.88;
    contentOpacity.value = 0;
    contentTranslateY.value = hp(1);
    footerOpacity.value = 0;
  }, [
    overlayOpacity,
    cardOpacity,
    cardTranslateY,
    iconOpacity,
    iconTranslateY,
    ringOpacity,
    ringScale,
    contentOpacity,
    contentTranslateY,
    footerOpacity,
  ]);

  const finishUnmount = useCallback(() => {
    closingRef.current = false;
    resetToHidden();
    setPresented(false);
  }, [resetToHidden]);

  const playEnter = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    overlayOpacity.value = withTiming(1, {duration: ENTER_MS, easing: EASE});
    cardOpacity.value = withTiming(1, {duration: ENTER_MS, easing: EASE});
    cardTranslateY.value = withTiming(0, {duration: ENTER_MS, easing: EASE});

    iconOpacity.value = withDelay(
      80,
      withTiming(1, {duration: 260, easing: EASE}),
    );
    iconTranslateY.value = withDelay(
      80,
      withTiming(0, {duration: 260, easing: EASE}),
    );
    ringOpacity.value = withDelay(
      100,
      withTiming(0.4, {duration: 280, easing: EASE}),
    );
    ringScale.value = withDelay(
      100,
      withTiming(1, {duration: 300, easing: EASE}),
    );

    contentOpacity.value = withDelay(
      140,
      withTiming(1, {duration: 260, easing: EASE}),
    );
    contentTranslateY.value = withDelay(
      140,
      withTiming(0, {duration: 260, easing: EASE}),
    );
    footerOpacity.value = withDelay(
      180,
      withTiming(1, {duration: 240, easing: EASE}),
    );
  }, [
    overlayOpacity,
    cardOpacity,
    cardTranslateY,
    iconOpacity,
    iconTranslateY,
    ringOpacity,
    ringScale,
    contentOpacity,
    contentTranslateY,
    footerOpacity,
  ]);

  const playExit = useCallback(() => {
    if (closingRef.current) {
      return;
    }
    closingRef.current = true;

    overlayOpacity.value = withTiming(0, {duration: EXIT_MS, easing: EASE});
    cardOpacity.value = withTiming(0, {duration: EXIT_MS, easing: EASE});
    cardTranslateY.value = withTiming(hp(1.5), {
      duration: EXIT_MS,
      easing: EASE,
    });
    iconOpacity.value = withTiming(0, {duration: EXIT_MS, easing: EASE});
    contentOpacity.value = withTiming(0, {duration: EXIT_MS, easing: EASE});
    footerOpacity.value = withTiming(0, {duration: EXIT_MS, easing: EASE});
    ringOpacity.value = withTiming(
      0,
      {duration: EXIT_MS, easing: EASE},
      finished => {
        if (finished) {
          runOnJS(finishUnmount)();
        }
      },
    );
  }, [
    overlayOpacity,
    cardOpacity,
    cardTranslateY,
    iconOpacity,
    contentOpacity,
    footerOpacity,
    ringOpacity,
    finishUnmount,
  ]);

  useEffect(() => {
    if (visible) {
      setDisplay({
        title,
        message,
        mode,
        variant,
        confirmLabel,
        cancelLabel,
      });
      closingRef.current = false;
      resetToHidden();
      setPresented(true);
      return;
    }

    if (presented) {
      playExit();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDisplay({
      title,
      message,
      mode,
      variant,
      confirmLabel,
      cancelLabel,
    });
  }, [title, message, mode, variant, confirmLabel, cancelLabel, visible]);

  if (!presented) {
    return null;
  }

  const iconWrapStyle = {
    default: styles.iconWrapDefault,
    destructive: styles.iconWrapDestructive,
    info: styles.iconWrapInfo,
    success: styles.iconWrapSuccess,
  }[display.variant];

  const ringColor = {
    default: colors.primary,
    destructive: '#EF4444',
    info: '#60A5FA',
    success: colors.success,
  }[display.variant];

  const iconColor = ringColor;
  const isDestructive = display.variant === 'destructive';
  const isAlert = display.mode === 'alert';

  const handleCancel = () => {
    if (loading || closingRef.current) {
      return;
    }
    onCancel?.();
  };

  const handleConfirm = () => {
    if (loading || closingRef.current) {
      return;
    }
    onConfirm?.();
  };

  return (
    <Modal
      visible={presented}
      transparent
      animationType="none"
      statusBarTranslucent
      onShow={playEnter}
      onRequestClose={handleCancel}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.overlayFill, overlayStyle]}
        >
          <Pressable
            style={styles.overlayPress}
            onPress={handleCancel}
            disabled={loading}
          />
        </Animated.View>

        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.header}>
            <View style={styles.iconStage}>
              <Animated.View
                style={[styles.ring, {borderColor: ringColor}, ringStyle]}
              />
              <Animated.View
                style={[styles.iconWrap, iconWrapStyle, iconStyle]}
              >
                <Icon
                  name={ICON_BY_VARIANT[display.variant]}
                  size={22}
                  color={iconColor}
                />
              </Animated.View>
            </View>
            <Animated.View style={contentStyle}>
              <Text style={styles.title}>{display.title}</Text>
              <Text style={styles.message}>{display.message}</Text>
            </Animated.View>
          </View>

          <Animated.View
            style={[styles.footer, isAlert && styles.footerSingle, footerStyle]}
          >
            {!isAlert && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>
                  {display.cancelLabel}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                isDestructive && styles.confirmButtonDestructive,
                loading && styles.confirmButtonDisabled,
                isAlert && {flex: 0, minWidth: '50%'},
              ]}
              onPress={handleConfirm}
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
                  {display.confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AppDialog;
