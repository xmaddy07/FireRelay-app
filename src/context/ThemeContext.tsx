import React, {createContext, useContext, useMemo} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {themeActions} from '../redux/slices/themeSlice';
import {createGlass} from '../config/theme/createGlass';
import {getColorsForMode} from '../config/theme/colors';
import type {AppColors, GlassTheme, ThemeMode} from '../config/theme/types';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
  glass: GlassTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(state => state.theme.mode);
  const isDark = mode === 'dark';

  const colors = useMemo(() => getColorsForMode(mode), [mode]);
  const glass = useMemo(() => createGlass(colors, mode), [colors, mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark,
      colors,
      glass,
      setMode: nextMode => dispatch(themeActions.setMode(nextMode)),
      toggleTheme: () => dispatch(themeActions.toggleMode()),
    }),
    [mode, isDark, colors, glass, dispatch],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
