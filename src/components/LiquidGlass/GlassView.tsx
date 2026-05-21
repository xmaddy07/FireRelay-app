import React from 'react';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
  type LiquidGlassViewProps,
} from '@callstack/liquid-glass';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = LiquidGlassViewProps & {
  fallbackStyle?: StyleProp<ViewStyle>;
  showHighlight?: boolean;
};

const GlassView = ({
  children,
  style,
  fallbackStyle,
  effect = 'regular',
  colorScheme = 'dark',
  showHighlight = true,
  ...rest
}: Props) => {
  const isLightScheme = colorScheme === 'light';
  const resolvedStyle = StyleSheet.flatten([
    style,
    !isLiquidGlassSupported && fallbackStyle,
  ]);
  const borderRadius = resolvedStyle?.borderRadius ?? 0;

  const highlight = showHighlight ? (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.16)',
        'rgba(255, 255, 255, 0.04)',
        'transparent',
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  ) : null;

  if (!isLiquidGlassSupported) {
    return (
      <View style={[resolvedStyle, styles.fallbackContainer]}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isLightScheme ? 'light' : 'dark'}
          blurAmount={Platform.select({ios: 28, android: 18, default: 20})}
          reducedTransparencyFallbackColor={
            isLightScheme
              ? 'rgba(255, 255, 255, 0.92)'
              : 'rgba(16, 20, 26, 0.92)'
          }
          overlayColor="transparent"
        />
        <View
          style={[
            styles.fallbackTint,
            isLightScheme && styles.fallbackTintLight,
          ]}
        />
        {highlight}
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <LiquidGlassView
      style={[resolvedStyle, {overflow: 'hidden', borderRadius}]}
      effect={effect}
      colorScheme={colorScheme}
      {...rest}
    >
      {highlight}
      <View style={styles.content}>{children}</View>
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    overflow: 'hidden',
  },
  fallbackTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  fallbackTintLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  content: {
    zIndex: 1,
  },
});

export default GlassView;
