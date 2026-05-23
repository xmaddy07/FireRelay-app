import React, {useEffect} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {wp} from '../../../../utils/responsive';

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  trackOnColor: string;
  trackOffColor: string;
  thumbColor?: string;
};

const TRACK_W = wp(13);
const TRACK_H = wp(7);
const THUMB_PAD = wp(0.5);
const THUMB = TRACK_H - THUMB_PAD * 2;
const THUMB_TRAVEL = TRACK_W - THUMB - THUMB_PAD * 2;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 320,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const AnimatedToggle = ({
  value,
  onValueChange,
  trackOnColor,
  trackOffColor,
  thumbColor = '#FFFFFF',
}: Props) => {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, SPRING_CONFIG);
  }, [value, progress]);

  const handlePress = () => {
    const next = !value;
    progress.value = withSpring(next ? 1 : 0, SPRING_CONFIG);
    onValueChange(next);
  };

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [trackOffColor, trackOnColor],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [THUMB_PAD, THUMB_TRAVEL + THUMB_PAD],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{checked: value}}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View
          style={[styles.thumb, {backgroundColor: thumbColor}, thumbStyle]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    top: THUMB_PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AnimatedToggle;
