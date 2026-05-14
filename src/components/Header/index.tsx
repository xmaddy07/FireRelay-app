import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { images } from '../../constants';
import Icon from 'react-native-vector-icons/AntDesign';

type Props = {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
};

const Header = ({ title, onMenuPress, showBack, onBackPress }: Props) => (
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
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default Header;
