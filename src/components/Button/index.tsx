import React from 'react';
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../theme';

type Props = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  loadingColor?: string;
  rightIcon?: React.ReactNode;
};

const Button = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  backgroundColor,
  loadingColor,
  rightIcon,
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const resolvedLoadingColor = loadingColor ?? colors.white;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, style, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {backgroundColor ? (
        <View style={[styles.gradient, {backgroundColor}]} />
      ) : (
        <LinearGradient
          colors={[...colors.buttonGradient]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradient}
        />
      )}
      {loading ? (
        <ActivityIndicator color={resolvedLoadingColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          <Text style={[styles.text, textStyle]}>{title}</Text>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
