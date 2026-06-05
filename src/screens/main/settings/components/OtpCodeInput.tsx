import React, {useRef} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {fonts} from '../../../../config/theme/typography';
import {useTheme, useThemedStyles} from '../../../../config/theme';
import type {AppColors} from '../../../../config/theme/types';
import {hp, responsiveSize, wp} from '../../../../utils/responsive';

const CODE_LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
};

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    root: {
      gap: hp(1),
    },
    boxes: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(2),
    },
    box: {
      flex: 1,
      aspectRatio: 0.85,
      maxWidth: wp(13),
      borderRadius: wp(2.5),
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    boxFocused: {
      borderColor: colors.primary,
    },
    boxFilled: {
      borderColor: colors.primaryBorder,
      backgroundColor: colors.primaryTint,
    },
    boxError: {
      borderColor: '#F87171',
    },
    digit: {
      fontSize: responsiveSize(22),
      fontFamily: fonts.semibold,
      color: colors.text,
    },
    hiddenInput: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0,
    },
    errorText: {
      color: '#F87171',
      fontSize: responsiveSize(13),
      fontFamily: fonts.regular,
    },
  });

const OtpCodeInput = ({value, onChange, error, style}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(CODE_LENGTH, ' ').slice(0, CODE_LENGTH).split('');

  const handleChange = (text: string) => {
    onChange(
      text
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, CODE_LENGTH),
    );
  };

  return (
    <View style={[styles.root, style]}>
      <Pressable style={styles.boxes} onPress={() => inputRef.current?.focus()}>
        {digits.map((digit, index) => {
          const filled = digit.trim().length > 0;
          const focused = value.length === index;

          return (
            <View
              key={index}
              style={[
                styles.box,
                filled ? styles.boxFilled : null,
                focused ? styles.boxFocused : null,
                error ? styles.boxError : null,
              ]}
            >
              <Text style={styles.digit}>{filled ? digit : ''}</Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="default"
        autoCapitalize="characters"
        autoCorrect={false}
        spellCheck={false}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
        autoFocus
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export const OTP_CODE_LENGTH = CODE_LENGTH;
export default OtpCodeInput;
