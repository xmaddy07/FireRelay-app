import {useMemo} from 'react';
import type {StyleSheet} from 'react-native';
import {useTheme} from './ThemeContext';
import type {AppColors} from './types';

export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: AppColors) => T,
): T => {
  const {colors} = useTheme();
  return useMemo(() => createStyles(colors), [colors, createStyles]);
};
