import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { responsiveHitSlop } from '../../../utils/responsive';
import { createStyles } from './styles';
import { images } from '../../../config/constants';
import { useTheme, useThemedStyles } from '../../../config/theme';

type Props = {
  title: string;
  subtitle?: string;
  layout?: 'centered' | 'stacked';
  onMenuPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  showFilter?: boolean;
  filterActive?: boolean;
  showNotification?: boolean;
  onFilterPress?: () => void;
  onNotificationPress?: () => void;
};

const Header = ({
  title,
  subtitle,
  layout = 'centered',
  onMenuPress,
  showBack,
  onBackPress,
  showFilter,
  filterActive,
  showNotification,
  onFilterPress,
  onNotificationPress,
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const isStacked = layout === 'stacked';

  const notificationControl = showNotification ? (
    <TouchableOpacity
      style={[styles.notificationButton, styles.notificationButtonBordered]}
      activeOpacity={0.7}
      onPress={onNotificationPress}
      hitSlop={responsiveHitSlop(2)}
    >
      <Image
        source={images.notification}
        style={[styles.notificationIcon, styles.notificationIconAccent]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  ) : null;

  const filterControl = showFilter ? (
    <TouchableOpacity
      style={[styles.filterButton, filterActive && styles.filterButtonActive]}
      onPress={onFilterPress}
      activeOpacity={0.7}
      hitSlop={responsiveHitSlop(2)}
    >
      <Image
        source={images.filter}
        style={[styles.filterIcon, filterActive && styles.filterIconActive]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  ) : null;

  const backOrMenuControl = (showBack || onMenuPress) ? (
    <TouchableOpacity
      style={isStacked ? styles.stackedBackButton : styles.menuButton}
      onPress={showBack ? onBackPress : onMenuPress}
      activeOpacity={0.7}
    >
      {showBack ? (
        <Icon name="arrowleft" size={24} color={colors.iconTint} />
      ) : (
        <Image source={images.menu} style={styles.menuIcon} resizeMode="contain" />
      )}
    </TouchableOpacity>
  ) : null;

  if (isStacked) {
    return (
      <View style={styles.stackedContainer}>
        {backOrMenuControl}
        <View style={styles.stackedBody}>
          <View style={styles.stackedTitleBlock}>
            <Text style={styles.stackedTitle}>{title}</Text>
            {subtitle ? <Text style={styles.stackedSubtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.stackedActions}>
            {filterControl}
            {notificationControl}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {backOrMenuControl}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightButtonsContainer}>
        {filterControl}
        {notificationControl}
      </View>
    </View>
  );
};

export default Header;
