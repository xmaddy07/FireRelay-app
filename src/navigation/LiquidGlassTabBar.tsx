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

export type TabBarConfig = {
  label: string;
  icon: ImageSourcePropType;
};

type Props = BottomTabBarProps & {
  tabConfig: Record<string, TabBarConfig>;
};

const createTabBarStyles = (colors: AppColors, glass: GlassTheme) =>
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
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
    },
    glassFallback: {
      ...glass.fallback.loginCard,
      borderRadius: wp(6),
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
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(1),
      paddingHorizontal: wp(1),
      borderRadius: wp(4),
    },
    tabItemActive: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(1),
      paddingHorizontal: wp(1),
      borderRadius: wp(4),
    },
    tabIcon: {
      width: wp(5.5),
      height: wp(5.5),
      tintColor: colors.textSecondary,
      marginBottom: hp(0.4),
    },
    tabIconActive: {
      tintColor: colors.textOnPrimary,
    },
    tabLabel: {
      fontSize: responsiveSize(10),
      fontFamily: fonts.medium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tabLabelActive: {
      color: colors.text,
      fontFamily: fonts.semibold,
    },
  });

const LiquidGlassTabBar = ({state, descriptors, navigation, tabConfig}: Props) => {
  const insets = useSafeAreaInsets();
  const {colors, glass, isDark} = useTheme();
  const styles = useMemo(() => createTabBarStyles(colors, glass), [colors, glass]);

  return (
    <View style={[styles.wrapper, {paddingBottom: Math.max(insets.bottom, hp(1))}]}>
      <GlassView
        effect="regular"
        colorScheme={isDark ? 'dark' : 'light'}
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
                {isFocused ? (
                  <LinearGradient
                    colors={[...colors.buttonGradient]}
                    locations={[0, 1]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.tabItemActive}
                  >
                    {icon ? (
                      <Image
                        source={icon}
                        style={[styles.tabIcon, styles.tabIconActive]}
                        resizeMode="contain"
                      />
                    ) : null}
                    <Text style={[styles.tabLabel, styles.tabLabelActive]} numberOfLines={1}>
                      {label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabItem}>
                    {icon ? (
                      <Image source={icon} style={styles.tabIcon} resizeMode="contain" />
                    ) : null}
                    <Text style={styles.tabLabel} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </GlassView>
    </View>
  );
};

export default LiquidGlassTabBar;
