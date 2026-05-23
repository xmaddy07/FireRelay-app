import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {View, Text} from 'react-native';
import {Input, Button} from '../../../components';
import {createStyles} from './styles';
import {useThemedStyles} from '../../../config/theme';
import {hp} from '../../../utils/responsive';
import SettingsScreenLayout from './SettingsScreenLayout';

const validationSchema = Yup.object().shape({
  newEmail: Yup.string()
    .email('Please enter a valid email address')
    .required('New email address is required'),
});

const ProfileSettings = () => {
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);

  const formik = useFormik({
    initialValues: {
      newEmail: '',
    },
    validationSchema,
    onSubmit: values => {
      console.log('Email change values:', values);
    },
  });

  return (
    <SettingsScreenLayout
      title="Profile"
      showBack
      onBackPress={() => navigation.goBack()}
    >
      <Text style={styles.sectionTitle}>Profile Information</Text>

      <View style={styles.infoCard}>
        <View style={[styles.infoColumn, {marginBottom: hp(2)}]}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>steve@firerelay.com</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>Admin</Text>
        </View>
      </View>

      <Input
        label="New Email Address"
        value={formik.values.newEmail}
        onChangeText={formik.handleChange('newEmail')}
        onBlur={formik.handleBlur('newEmail')}
        error={
          formik.touched.newEmail && formik.errors.newEmail
            ? formik.errors.newEmail
            : undefined
        }
        placeholder="Enter new email address"
        keyboardType="email-address"
        style={styles.inputGap}
      />

      <Text style={styles.subtext}>
        A confirmation code will be sent to your current email
      </Text>

      <Button
        title="Request Email Change"
        style={styles.requestButton}
        onPress={formik.handleSubmit as () => void}
      />
    </SettingsScreenLayout>
  );
};

export default ProfileSettings;
