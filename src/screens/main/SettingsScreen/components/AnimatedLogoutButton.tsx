import React from 'react';
import {
  Text,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
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

const AnimatedLogoutButton = ({
  onPress,
  label,
  iconColor,
  textStyle,
  buttonStyle,
  iconStyle,
}: Props) => {
  const iconX = useSharedValue(0);
  const iconScale = useSharedValue(1);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: iconX.value}, {scale: iconScale.value}],
  }));

  const animateOut = () => {
    iconX.value = withSequence(
      withTiming(4, {duration: 70}),
      withSpring(12, {damping: 12, stiffness: 200}),
    );
    iconScale.value = withSequence(
      withTiming(0.9, {duration: 70}),
      withTiming(1.08, {duration: 100}),
    );
  };

  const animateReset = () => {
    iconX.value = withSpring(0, {damping: 14, stiffness: 220});
    iconScale.value = withSpring(1, {damping: 14, stiffness: 220});
  };

  const handlePress = () => {
    animateOut();
    setTimeout(onPress, 220);
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      onPressOut={animateReset}
      activeOpacity={0.92}
    >
      <Animated.View style={[iconStyle, iconAnimatedStyle]}>
        <Feather name="log-out" size={wp(5)} color={iconColor} />
      </Animated.View>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export default AnimatedLogoutButton;
