import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {styles} from './styles';
import {images} from '../../constants';

type Props = {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
};

const Header = ({title, subtitle, onMenuPress}: Props) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.menuButton}
      onPress={onMenuPress}
      activeOpacity={0.7}
    >
      <Image source={images.menu} style={styles.menuIcon} resizeMode="contain" />
    </TouchableOpacity>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default Header;
