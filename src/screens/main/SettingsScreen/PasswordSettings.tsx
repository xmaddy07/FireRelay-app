import React from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Text} from 'react-native';
import {Input, Button} from '../../../components';
import {createStyles} from './styles';
import {useThemedStyles} from '../../../theme';
import SettingsScreenLayout from './SettingsScreenLayout';

type Props = {
  onBack: () => void;
};

const validationSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Old password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const PasswordSettings = ({onBack}: Props) => {
  const styles = useThemedStyles(createStyles);

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: values => {
      console.log('Password change values:', values);
    },
  });

  return (
    <SettingsScreenLayout
      title="Password"
      showBack
      onBackPress={onBack}
      fullScreen
    >
      <Text style={styles.sectionTitle}>Change Password</Text>

      <Input
        label="Old Password"
        value={formik.values.oldPassword}
        onChangeText={formik.handleChange('oldPassword')}
        onBlur={formik.handleBlur('oldPassword')}
        error={
          formik.touched.oldPassword && formik.errors.oldPassword
            ? formik.errors.oldPassword
            : undefined
        }
        placeholder="Enter old password"
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

      <Button
        title="Change Password"
        style={styles.saveButton}
        onPress={formik.handleSubmit as () => void}
      />
    </SettingsScreenLayout>
  );
};

export default PasswordSettings;
