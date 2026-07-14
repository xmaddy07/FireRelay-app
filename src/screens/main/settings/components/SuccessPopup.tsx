import React, {useEffect} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {fonts} from '../../../../config/theme/typography';
import {useTheme} from '../../../../config/theme';
import {hp, responsiveSize, wp} from '../../../../utils/responsive';

export type SuccessPopupAnimation = 'scale' | 'slide';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
  /** `scale` = spring pop + check; `slide` = rise from below + lock. */
  animation?: SuccessPopupAnimation;
  style?: StyleProp<ViewStyle>;
};

const SuccessPopup = ({
  visible,
  title,
  message,
  onDismiss,
  autoDismissMs = 2400,
  animation = 'scale',
  style,
}: Props) => {
  const {colors} = useTheme();
  const isSlide = animation === 'slide';

  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.82);
  const cardTranslateY = useSharedValue(hp(4));
  const cardOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.85);
  const ringOpacity = useSharedValue(0);

  const easeOut = Easing.out(Easing.cubic);

  const dismiss = () => {
    overlayOpacity.value = withTiming(0, {duration: 180});
    cardOpacity.value = withTiming(0, {duration: 180});
    if (isSlide) {
      cardTranslateY.value = withTiming(
        hp(2),
        {duration: 180, easing: easeOut},
        finished => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        },
      );
    } else {
      cardScale.value = withTiming(0.92, {duration: 180}, finished => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      });
    }
  };

  useEffect(() => {
    if (!visible) {
      overlayOpacity.value = 0;
      cardScale.value = 0.82;
      cardTranslateY.value = hp(4);
      cardOpacity.value = 0;
      iconScale.value = 0;
      checkOpacity.value = 0;
      ringScale.value = 0.85;
      ringOpacity.value = 0;
      return;
    }

    overlayOpacity.value = withTiming(1, {duration: 220, easing: easeOut});
    cardOpacity.value = withTiming(1, {duration: 220, easing: easeOut});

    if (isSlide) {
      cardTranslateY.value = withTiming(0, {
        duration: 320,
        easing: easeOut,
      });
      cardScale.value = 1;
      iconScale.value = withDelay(
        120,
        withTiming(1, {duration: 280, easing: easeOut}),
      );
      ringOpacity.value = withDelay(
        140,
        withTiming(0.35, {duration: 280, easing: easeOut}),
      );
      ringScale.value = withDelay(
        140,
        withTiming(1, {duration: 320, easing: easeOut}),
      );
      checkOpacity.value = withDelay(
        200,
        withTiming(1, {duration: 220, easing: easeOut}),
      );
    } else {
      cardScale.value = withSpring(1, {damping: 14, stiffness: 180});
      iconScale.value = withDelay(
        120,
        withSpring(1, {damping: 10, stiffness: 200}),
      );
      ringScale.value = withDelay(
        80,
        withSequence(
          withSpring(1.15, {damping: 8, stiffness: 160}),
          withSpring(1, {damping: 12, stiffness: 200}),
        ),
      );
      ringOpacity.value = withDelay(80, withTiming(0.35, {duration: 200}));
      checkOpacity.value = withDelay(220, withTiming(1, {duration: 180}));
    }

    const timer = setTimeout(() => {
      dismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [
    visible,
    autoDismissMs,
    isSlide,
    overlayOpacity,
    cardScale,
    cardTranslateY,
    cardOpacity,
    iconScale,
    checkOpacity,
    ringScale,
    ringOpacity,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: isSlide
      ? [{translateY: cardTranslateY.value}]
      : [{scale: cardScale.value}],
  }));

  const iconCircleStyle = useAnimatedStyle(() => ({
    transform: [{scale: iconScale.value}],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{scale: ringScale.value}],
    opacity: ringOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  const iconName = isSlide ? 'lock' : 'check';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={[styles.root, style]}>
        <Animated.View
          style={[
            styles.overlay,
            {backgroundColor: colors.overlay},
            overlayStyle,
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.modalSurface,
              borderColor: colors.borderSubtle,
              shadowColor: colors.shadow,
            },
            cardStyle,
          ]}
        >
          <View style={styles.iconWrap}>
            <Animated.View
              style={[
                styles.ring,
                {borderColor: colors.success},
                ringStyle,
              ]}
            />
            <Animated.View
              style={[
                styles.iconCircle,
                {backgroundColor: `${colors.success}22`},
                iconCircleStyle,
              ]}
            >
              <Animated.View style={checkStyle}>
                <Feather
                  name={iconName}
                  size={wp(9)}
                  color={colors.success}
                />
              </Animated.View>
            </Animated.View>
          </View>

          <Text style={[styles.title, {color: colors.text}]}>{title}</Text>
          <Text style={[styles.message, {color: colors.textSecondary}]}>
            {message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '100%',
    maxWidth: wp(78),
    borderRadius: wp(5),
    borderWidth: 1,
    paddingVertical: hp(3.5),
    paddingHorizontal: wp(6),
    alignItems: 'center',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrap: {
    width: wp(22),
    height: wp(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  ring: {
    position: 'absolute',
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    borderWidth: 2,
  },
  iconCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: responsiveSize(20),
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: hp(0.8),
  },
  message: {
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: responsiveSize(20),
  },
});

export default SuccessPopup;
