import React, {forwardRef, useImperativeHandle} from 'react';
import {
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {wp} from '../../../../utils/responsive';

type Props = {
  onPress: () => void;
  label: string;
  iconColor: string;
  textStyle: StyleProp<TextStyle>;
  buttonStyle: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
};

export type AnimatedLogoutButtonRef = {
  resetAnimation: () => void;
};

const AnimatedLogoutButton = forwardRef<AnimatedLogoutButtonRef, Props>(
  ({onPress, label, iconColor, textStyle, buttonStyle, iconStyle}, ref) => {
    const iconX = useSharedValue(0);
    const iconScale = useSharedValue(1);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{translateX: iconX.value}, {scale: iconScale.value}],
    }));

    const animateReset = () => {
      cancelAnimation(iconX);
      cancelAnimation(iconScale);
      iconX.value = withSpring(0, {damping: 14, stiffness: 220});
      iconScale.value = withSpring(1, {damping: 14, stiffness: 220});
    };

    const animateOut = () => {
      cancelAnimation(iconX);
      cancelAnimation(iconScale);
      iconX.value = withSequence(
        withTiming(4, {duration: 70}),
        withSpring(8, {damping: 12, stiffness: 200}),
      );
      iconScale.value = withSequence(
        withTiming(0.9, {duration: 70}),
        withTiming(1.08, {duration: 100}),
      );
    };

    useImperativeHandle(ref, () => ({
      resetAnimation: animateReset,
    }));

    const handlePress = () => {
      animateOut();
      setTimeout(onPress, 220);
    };

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePress}
        activeOpacity={0.92}
      >
        <Text style={textStyle}>{label}</Text>
        <Animated.View style={[iconStyle, iconAnimatedStyle]}>
          <Feather name="log-out" size={wp(5)} color={iconColor} />
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

AnimatedLogoutButton.displayName = 'AnimatedLogoutButton';

export default AnimatedLogoutButton;
