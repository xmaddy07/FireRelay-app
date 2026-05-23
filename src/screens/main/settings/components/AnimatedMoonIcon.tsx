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
  pulseTrigger: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const AnimatedMoonIcon = ({pulseTrigger, color, size = wp(5.2), style}: Props) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulseTrigger === 0) {
      return;
    }
    rotation.value = withSequence(
      withTiming(-18, {duration: 120}),
      withTiming(0, {duration: 200}),
    );
    scale.value = withSequence(
      withTiming(1.15, {duration: 140}),
      withTiming(1, {duration: 160}),
    );
  }, [pulseTrigger, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}, {scale: scale.value}],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Feather name="moon" size={size} color={color} />
    </Animated.View>
  );
};

export default AnimatedMoonIcon;
