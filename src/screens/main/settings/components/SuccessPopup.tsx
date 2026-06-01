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

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
  style?: StyleProp<ViewStyle>;
};

const SuccessPopup = ({
  visible,
  title,
  message,
  onDismiss,
  autoDismissMs = 2400,
  style,
}: Props) => {
  const {colors} = useTheme();
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.82);
  const cardOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.6);

  const dismiss = () => {
    overlayOpacity.value = withTiming(0, {duration: 180});
    cardScale.value = withTiming(0.92, {duration: 180});
    cardOpacity.value = withTiming(0, {duration: 180}, finished => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  useEffect(() => {
    if (!visible) {
      overlayOpacity.value = 0;
      cardScale.value = 0.82;
      cardOpacity.value = 0;
      iconScale.value = 0;
      checkOpacity.value = 0;
      ringScale.value = 0.6;
      return;
    }

    overlayOpacity.value = withTiming(1, {duration: 220});
    cardOpacity.value = withTiming(1, {duration: 200});
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
    checkOpacity.value = withDelay(220, withTiming(1, {duration: 180}));

    const timer = setTimeout(() => {
      dismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [
    visible,
    autoDismissMs,
    overlayOpacity,
    cardScale,
    cardOpacity,
    iconScale,
    checkOpacity,
    ringScale,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{scale: cardScale.value}],
  }));

  const iconCircleStyle = useAnimatedStyle(() => ({
    transform: [{scale: iconScale.value}],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{scale: ringScale.value}],
    opacity: ringScale.value * 0.35,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

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
                <Feather name="check" size={wp(9)} color={colors.success} />
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
