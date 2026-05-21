import React, {useMemo} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GlassView} from '../components/LiquidGlass';
import {fonts} from '../constants';
import type {AppColors, GlassTheme} from '../theme/types';
import {useTheme} from '../theme';
import {hp, responsiveSize, wp} from '../utils/responsive';
import type {TabBarConfig} from './tabConfig';

type Props = BottomTabBarProps & {
  tabConfig: Record<string, TabBarConfig>;
};

const TAB_RADIUS = wp(4);
const TAB_ICON_SIZE = wp(5.5);
const TAB_LABEL_SIZE = responsiveSize(10);
const TAB_LABEL_LINE_HEIGHT = responsiveSize(12);
const TAB_PADDING_TOP = hp(0.9);
const TAB_PADDING_BOTTOM = hp(1.05);

const TAB_PILL_HEIGHT =
  TAB_PADDING_TOP +
  TAB_PADDING_BOTTOM +
  TAB_ICON_SIZE +
  hp(0.35) +
  TAB_LABEL_LINE_HEIGHT;

const createTabBarStyles = (
  colors: AppColors,
  glass: GlassTheme,
  isDark: boolean,
) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: wp(4),
      paddingTop: hp(1),
    },
    glassShell: {
      borderRadius: wp(6),
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.14)'
        : 'rgba(0, 0, 0, 0.1)',
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 12,
      elevation: 8,
    },
    glassFallback: {
      ...glass.fallback.loginCard,
      backgroundColor: isDark
        ? 'rgba(28, 28, 30, 0.88)'
        : 'rgba(255, 255, 255, 0.94)',
      borderRadius: wp(6),
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.14)'
        : 'rgba(0, 0, 0, 0.1)',
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp(0.8),
      paddingHorizontal: wp(1.5),
      gap: wp(1),
    },
    tabPressable: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
    },
    tabSlot: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabItem: {
      width: '100%',
      height: TAB_PILL_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: TAB_PADDING_TOP,
      paddingBottom: TAB_PADDING_BOTTOM,
      paddingHorizontal: wp(1),
    },
    tabIcon: {
      width: TAB_ICON_SIZE,
      height: TAB_ICON_SIZE,
      tintColor: isDark ? colors.textSecondary : colors.textMuted,
      marginBottom: hp(0.4),
    },
    tabIconActive: {
      tintColor: colors.white,
    },
    tabLabel: {
      fontSize: TAB_LABEL_SIZE,
      lineHeight: TAB_LABEL_LINE_HEIGHT,
      fontFamily: fonts.medium,
      color: isDark ? colors.textSecondary : colors.textMuted,
      textAlign: 'center',
      includeFontPadding: false,
      textAlignVertical: 'center' as const,
    },
    tabLabelActive: {
      color: colors.white,
      fontFamily: fonts.semibold,
    },
    activePill: {
      width: '100%',
      height: TAB_PILL_HEIGHT,
      borderRadius: TAB_RADIUS,
      overflow: 'hidden',
      elevation: 6,
    },
  });

const AndroidTabBar = ({state, descriptors, navigation, tabConfig}: Props) => {
  const insets = useSafeAreaInsets();
  const {colors, glass, isDark} = useTheme();
  const styles = useMemo(
    () => createTabBarStyles(colors, glass, isDark),
    [colors, glass, isDark],
  );

  return (
    <View style={[styles.wrapper, {paddingBottom: Math.max(insets.bottom, hp(1))}]}>
      <GlassView
        effect="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={
          isDark ? 'rgba(28, 28, 30, 0.5)' : 'rgba(255, 255, 255, 0.65)'
        }
        showHighlight={!isDark}
        style={styles.glassShell}
        fallbackStyle={styles.glassFallback}
      >
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const config = tabConfig[route.name];
            const label = config?.label ?? options.title ?? route.name;
            const icon = config?.icon;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const tabBody = (
              <>
                {icon ? (
                  <Image
                    source={icon}
                    style={[styles.tabIcon, isFocused && styles.tabIconActive]}
                    resizeMode="contain"
                  />
                ) : null}
                <Text
                  style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {label}
                </Text>
              </>
            );

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? {selected: true} : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabPressable}
              >
                <View style={styles.tabSlot}>
                  {isFocused ? (
                    <LinearGradient
                      colors={[...colors.buttonGradient]}
                      locations={[0, 1]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.activePill}
                    >
                      <View style={styles.tabContent}>{tabBody}</View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.tabItem}>
                      <View style={styles.tabContent}>{tabBody}</View>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </GlassView>
    </View>
  );
};

export default AndroidTabBar;
