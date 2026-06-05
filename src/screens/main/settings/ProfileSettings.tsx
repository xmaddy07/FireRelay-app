import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {ActivityIndicator, View, Text} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {SettingsStackParamList} from '../../../navigation/types';
import {Input, Button} from '../../../components';
import {ApiError, changeEmail, getProfile} from '../../../api';
import type {AuthUser} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {userActions} from '../../../redux/slices/userSlice';
import {createStyles} from './styles';
import {useThemedStyles} from '../../../config/theme';
import {hp} from '../../../utils/responsive';
import SettingsScreenLayout from './SettingsScreenLayout';

const validationSchema = Yup.object().shape({
  newEmail: Yup.string()
    .email('Please enter a valid email address')
    .required('New email address is required'),
});

const mapProfileToUserState = (profile: AuthUser) => ({
  id: typeof profile.id === 'string' ? profile.id : undefined,
  name:
    typeof profile.name === 'string'
      ? profile.name
      : typeof profile.email === 'string'
        ? profile.email.split('@')[0]
        : undefined,
  email: typeof profile.email === 'string' ? profile.email : undefined,
  role: profile.role === 'admin' ? ('admin' as const) : ('user' as const),
});

const ProfileSettings = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const styles = useThemedStyles(createStyles);
  const dispatch = useAppDispatch();
  const {token} = useAuth();
  const storedEmail = useAppSelector(state => state.user.email);
  const storedRole = useAppSelector(state => state.user.role);
  const [profileEmail, setProfileEmail] = useState(storedEmail ?? '—');
  const [profileRole, setProfileRole] = useState(
    storedRole === 'admin' ? 'Admin' : 'User',
  );
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    try {
      const profile = await getProfile(token);
      const mapped = mapProfileToUserState(profile);
      dispatch(userActions.setUser(mapped));
      if (mapped.email) {
        setProfileEmail(mapped.email);
      }
      if (mapped.role) {
        setProfileRole(mapped.role === 'admin' ? 'Admin' : 'User');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [dispatch, token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const formik = useFormik({
    initialValues: {
      newEmail: '',
    },
    validationSchema,
    onSubmit: async (values, {setSubmitting, resetForm}) => {
      if (!token) {
        setSubmitError('You must be signed in to change your email.');
        return;
      }

      setSubmitError(null);
      try {
        const trimmedEmail = values.newEmail.trim().toLowerCase();
        await changeEmail(token, {
          newEmail: trimmedEmail,
        });
        resetForm();
        navigation.navigate('ProfileEmailOtp', {
          currentEmail: profileEmail,
          newEmail: trimmedEmail,
        });
      } catch (error) {
        setSubmitError(
          error instanceof ApiError
            ? error.message
            : 'Unable to request email change.',
        );
      } finally {
        setSubmitting(false);
      }
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
        {loadingProfile ? (
          <ActivityIndicator />
        ) : (
          <>
            <View style={[styles.infoColumn, {marginBottom: hp(2)}]}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profileEmail}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{profileRole}</Text>
            </View>
          </>
        )}
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

      {submitError ? (
        <Text style={styles.errorText}>{submitError}</Text>
      ) : null}

      <Text style={styles.subtext}>
        A confirmation code will be sent to your current email
      </Text>

      <Button
        title="Request Email Change"
        style={styles.requestButton}
        onPress={formik.handleSubmit as () => void}
        disabled={formik.isSubmitting}
      />
    </SettingsScreenLayout>
  );
};

export default ProfileSettings;
