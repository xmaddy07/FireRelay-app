import React from 'react';
import {
  LiquidGlassView,
  isLiquidGlassSupported,
  type LiquidGlassViewProps,
} from '@callstack/liquid-glass';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = LiquidGlassViewProps & {
  fallbackStyle?: StyleProp<ViewStyle>;
};

const GlassView = ({
  children,
  style,
  fallbackStyle,
  effect = 'regular',
  colorScheme = 'dark',
  ...rest
}: Props) => {
  const resolvedStyle = StyleSheet.flatten([
    style,
    !isLiquidGlassSupported && fallbackStyle,
  ]);

  if (!isLiquidGlassSupported) {
    return <View style={resolvedStyle}>{children}</View>;
  }

  return (
    <LiquidGlassView
      style={resolvedStyle}
      effect={effect}
      colorScheme={colorScheme}
      {...rest}
    >
      {children}
    </LiquidGlassView>
  );
};

export default GlassView;
