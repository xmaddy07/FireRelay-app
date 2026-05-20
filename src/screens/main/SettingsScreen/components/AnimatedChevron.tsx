import React from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  color: string;
  size?: number;
};

export const useAnimatedChevron = () => {
  const offset = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{translateX: offset.value}],
  }));

  const bind = {
    onPressIn: () => {
      offset.value = withSpring(6, {damping: 14, stiffness: 280});
    },
    onPressOut: () => {
      offset.value = withSpring(0, {damping: 14, stiffness: 280});
    },
  };

  return {style, bind};
};

const AnimatedChevron = ({color, size = 16, style}: Props & {style: ReturnType<typeof useAnimatedChevron>['style']}) => (
  <Animated.View style={style}>
    <Icon name="right" size={size} color={color} />
  </Animated.View>
);

export default AnimatedChevron;
