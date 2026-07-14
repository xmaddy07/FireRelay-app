import React, {useCallback, useState} from 'react';
import {Pressable, Text} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {Button} from '../../../components';
import {
  ApiError,
  changeEmail,
  confirmEmailChange,
  getProfile,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import {syncProfileOrLogoutOnRoleChange} from '../../../services/auth/roleChange';
import type {SettingsStackParamList} from '../../../navigation/types';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';
import SettingsScreenLayout from './SettingsScreenLayout';
import OtpCodeInput, {OTP_CODE_LENGTH} from './components/OtpCodeInput';
import SuccessPopup from './components/SuccessPopup';

const ProfileEmailOtp = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const route = useRoute<RouteProp<SettingsStackParamList, 'ProfileEmailOtp'>>();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {token} = useAuth();
  const {currentEmail, newEmail} = route.params;

  const [code, setCode] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVerify = useCallback(async () => {
    if (!token) {
      setSubmitError('You must be signed in to verify your email.');
      return;
    }

    if (code.length !== OTP_CODE_LENGTH) {
      setSubmitError(
        `Enter the ${OTP_CODE_LENGTH}-character code from your email.`,
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await confirmEmailChange(token, code);
      const profile = await getProfile(token);
      const mapped = syncProfileOrLogoutOnRoleChange(profile);
      if (!mapped) {
        return;
      }
      setShowSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to verify the confirmation code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [code, token]);

  const handleResend = useCallback(async () => {
    if (!token) {
      setSubmitError('You must be signed in to resend the code.');
      return;
    }

    setSubmitError(null);
    setIsResending(true);
    try {
      await changeEmail(token, {newEmail});
      setCode('');
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'Unable to resend the confirmation code.',
      );
    } finally {
      setIsResending(false);
    }
  }, [newEmail, token]);

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    navigation.navigate('Profile');
  };

  return (
    <SettingsScreenLayout
      title="Verify Email"
      showBack
      onBackPress={() => navigation.goBack()}
    >
      <Text style={styles.sectionTitle}>Enter confirmation code</Text>
      <Text style={styles.sectionSubtitle}>
        We sent a {OTP_CODE_LENGTH}-character code to {currentEmail}. Enter it
        below
        to confirm your new email ({newEmail}).
      </Text>

      <OtpCodeInput
        value={code}
        onChange={next => {
          setCode(next);
          if (submitError) {
            setSubmitError(null);
          }
        }}
        error={submitError ?? undefined}
        style={styles.inputGap}
      />

      <Button
        title="Verify Code"
        style={styles.saveButton}
        onPress={handleVerify}
        disabled={isSubmitting || isResending}
        loading={isSubmitting}
      />

      <Pressable
        onPress={handleResend}
        disabled={isSubmitting || isResending}
        style={styles.requestButton}
      >
        <Text style={[styles.subtext, {color: colors.primary}]}>
          {isResending ? 'Sending code…' : 'Resend code'}
        </Text>
      </Pressable>

      <SuccessPopup
        visible={showSuccess}
        title="Email updated"
        message="Your email address has been changed successfully."
        onDismiss={handleSuccessDismiss}
      />
    </SettingsScreenLayout>
  );
};

export default ProfileEmailOtp;
