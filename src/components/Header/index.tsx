import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { styles } from './styles';
import { images } from '../../constants';

type Props = {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
  onNotificationPress?: () => void;
};

const Header = ({
  title,
  subtitle,
  onMenuPress,
  showBack,
  onBackPress,
  showFilter,
  onFilterPress,
  onNotificationPress,
}: Props) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.menuButton}
      onPress={showBack ? onBackPress : onMenuPress}
      activeOpacity={0.7}
    >
      {showBack ? (
        <Icon name="arrowleft" size={24} color="#fff" />
      ) : (
        <Image source={images.menu} style={styles.menuIcon} resizeMode="contain" />
      )}
    </TouchableOpacity>
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.rightButtonsContainer}>
      {showFilter && (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Image
            source={images.filter}
            style={styles.filterIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.notificationButton}
        activeOpacity={0.7}
        onPress={onNotificationPress}
      >
        <Image
          source={images.notification}
          style={styles.notificationIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  </View>
);

export default Header;
