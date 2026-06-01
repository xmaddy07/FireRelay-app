import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Text} from 'react-native';
import {Input, Button} from '../../../components';
import {ApiError, changePassword} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import {createStyles} from './styles';
import {useThemedStyles} from '../../../config/theme';
import SettingsScreenLayout from './SettingsScreenLayout';
import SuccessPopup from './components/SuccessPopup';

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const PasswordSettings = () => {
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);
  const {token} = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, {setSubmitting, resetForm}) => {
      if (!token) {
        setSubmitError('You must be signed in to change your password.');
        return;
      }

      setSubmitError(null);
      try {
        await changePassword(token, {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        resetForm();
        setShowSuccess(true);
      } catch (error) {
        setSubmitError(
          error instanceof ApiError
            ? error.message
            : 'Unable to change password.',
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <SettingsScreenLayout
      title="Password"
      showBack
      onBackPress={() => navigation.goBack()}
    >
      <Text style={styles.sectionTitle}>Change Password</Text>

      <Input
        label="Current Password"
        value={formik.values.currentPassword}
        onChangeText={formik.handleChange('currentPassword')}
        onBlur={formik.handleBlur('currentPassword')}
        error={
          formik.touched.currentPassword && formik.errors.currentPassword
            ? formik.errors.currentPassword
            : undefined
        }
        placeholder="Enter current password"
        secureTextEntry
        style={styles.inputGap}
      />

      <Input
        label="New Password"
        value={formik.values.newPassword}
        onChangeText={formik.handleChange('newPassword')}
        onBlur={formik.handleBlur('newPassword')}
        error={
          formik.touched.newPassword && formik.errors.newPassword
            ? formik.errors.newPassword
            : undefined
        }
        placeholder="Enter new password"
        secureTextEntry
        style={styles.inputGap}
      />

      <Input
        label="Confirm New Password"
        value={formik.values.confirmPassword}
        onChangeText={formik.handleChange('confirmPassword')}
        onBlur={formik.handleBlur('confirmPassword')}
        error={
          formik.touched.confirmPassword && formik.errors.confirmPassword
            ? formik.errors.confirmPassword
            : undefined
        }
        placeholder="Enter confirm new password"
        secureTextEntry
        style={styles.inputGap}
      />

      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <Button
        title="Change Password"
        style={styles.saveButton}
        onPress={formik.handleSubmit as () => void}
        disabled={formik.isSubmitting}
      />

      <SuccessPopup
        visible={showSuccess}
        title="Password updated"
        message="Your password has been changed successfully."
        onDismiss={() => setShowSuccess(false)}
      />
    </SettingsScreenLayout>
  );
};

export default PasswordSettings;
