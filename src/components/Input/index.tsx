import React from 'react';
import {Text, TextInput, View, TextInputProps, StyleProp, ViewStyle} from 'react-native';
import {styles} from './styles';

type Props = TextInputProps & {
  label?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Input = ({label, icon, style, ...props}: Props) => (
  <View style={[styles.container, style]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={styles.inputWrapper}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <TextInput
        style={icon ? [styles.input, styles.inputWithIcon] : styles.input}
        placeholderTextColor="#8f9db5"
        {...props}
      />
    </View>
  </View>
);

export default Input;
