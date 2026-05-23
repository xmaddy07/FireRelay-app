import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  BlurEvent,
  Easing,
  FocusEvent,
  Text,
  TextInput,
  View,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';

type Props = TextInputProps & {
  label?: string;
  labelRight?: React.ReactNode;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  variant?: 'default' | 'stacked';
  animatedBorder?: boolean;
  error?: string;
};

const Input = ({
  label,
  labelRight,
  icon,
  style,
  labelStyle,
  wrapperStyle,
  inputStyle,
  variant = 'default',
  animatedBorder = false,
  error,
  onFocus,
  onBlur,
  ...props
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isFocused, setIsFocused] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animatedBorder || error) {
      pulseAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: isFocused ? 1100 : 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: isFocused ? 1100 : 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [animatedBorder, error, isFocused, pulseAnim]);

  const handleFocus = (event: FocusEvent) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: BlurEvent) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  if (variant === 'stacked') {
    const useAnimatedWrapper = animatedBorder && !error;

    const animatedWrapperStyle = useAnimatedWrapper
      ? {
          borderWidth: 1,
          borderColor: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: isFocused
              ? [colors.inputBorder, colors.primary]
              : [colors.inputBorder, colors.borderMuted],
          }),
        }
      : undefined;

    return (
      <View style={[styles.stackedContainer, style]}>
        {label || labelRight ? (
          <View style={styles.labelRow}>
            {label ? (
              <Text style={[styles.stackedLabel, labelStyle]}>{label}</Text>
            ) : (
              <View />
            )}
            {labelRight}
          </View>
        ) : null}
        {useAnimatedWrapper ? (
          <Animated.View
            style={[
              styles.stackedInputWrapper,
              wrapperStyle,
              animatedWrapperStyle,
            ]}
          >
            {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
            <TextInput
              style={[
                styles.stackedInput,
                icon ? styles.inputWithIcon : null,
                inputStyle,
              ]}
              placeholderTextColor={colors.textMuted}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
          </Animated.View>
        ) : (
          <View
            style={[
              styles.stackedInputWrapper,
              wrapperStyle,
              error ? styles.inputError : null,
            ]}
          >
            {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
            <TextInput
              style={[
                styles.stackedInput,
                icon ? styles.inputWithIcon : null,
                inputStyle,
              ]}
              placeholderTextColor={colors.textMuted}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
          </View>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, wrapperStyle, error ? styles.inputError : null]}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <TextInput
          style={[
            icon ? [styles.input, styles.inputWithIcon] : styles.input,
            inputStyle,
          ]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default Input;
