import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {hp} from '../../../utils/responsive';
import {createAppToastStyles} from './styles';

type Props = {
  visible: boolean;
  message: string;
  icon?: string;
  duration?: number;
  onHide?: () => void;
};

const AppToast = ({
  visible,
  message,
  icon = 'check-circle',
  duration = 2200,
  onHide,
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createAppToastStyles);
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 12,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          onHide?.();
        }
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onHide, opacity, translateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          bottom: insets.bottom + hp(2.5),
          opacity,
          transform: [{translateY}],
        },
      ]}
    >
      <View style={styles.toast}>
        <Icon name={icon} size={18} color={colors.success} />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

export default AppToast;
