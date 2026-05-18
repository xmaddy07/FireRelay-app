import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { glass } from '../../constants/glass';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: readonly [string, string, ...string[]];
};

const GlassScreen = ({
  children,
  style,
  colors = glass.screenGradient,
}: Props) => (
  <LinearGradient
    colors={[...colors]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.screen, style]}
  >
    {children}
  </LinearGradient>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

export default GlassScreen;
