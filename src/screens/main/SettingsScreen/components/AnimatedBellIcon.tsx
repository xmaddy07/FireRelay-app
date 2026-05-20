import React, {useEffect} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {wp} from '../../../../utils/responsive';

type Props = {
  color: string;
  ringTrigger: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const AnimatedBellIcon = ({ringTrigger, color, size = wp(5.2), style}: Props) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (ringTrigger === 0) {
      return;
    }
    rotation.value = withSequence(
      withTiming(-14, {duration: 70}),
      withTiming(14, {duration: 70}),
      withTiming(-10, {duration: 60}),
      withTiming(10, {duration: 60}),
      withTiming(0, {duration: 50}),
    );
    scale.value = withSequence(
      withTiming(1.12, {duration: 120}),
      withTiming(1, {duration: 120}),
    );
  }, [ringTrigger, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}, {scale: scale.value}],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Feather name="bell" size={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedBellIcon;
