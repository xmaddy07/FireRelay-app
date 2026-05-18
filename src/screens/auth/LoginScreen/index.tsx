import React, { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { styles } from './styles';
import { Button, Input } from '../../../components';
import { images } from '../../../constants';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch } from '../../../redux/hooks';
import { userActions } from '../../../redux/slices/userSlice';
import { authActions } from '../../../redux/slices/authSlice';

// LoginScreenProps is no longer needed as we use Redux for state management

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      console.log('Form values:', values);
      const email = values.email.toLowerCase();
      const role = (email === 'admin@firerelay.com' || email === 'steve@firerelay.com') ? 'admin' : 'user';
      
      // Simulate network request delay for a premium loader feel
      setTimeout(() => {
        // Save credentials in Redux
        dispatch(
          userActions.setUser({
            id: role === 'admin' ? 'admin-id' : 'user-id',
            name: role === 'admin' ? 'Steve' : 'User',
            email: email,
            role: role,
          })
        );
        dispatch(authActions.login('mock-jwt-token'));
        setSubmitting(false);
      }, 1500);
    },
  });
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(36)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardOpacity, cardTranslateY, logoScale]);

  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            <View style={styles.brand}>
              <Animated.Image
                source={images.logoname}
                style={[
                  styles.brandTitleImage,
                  { transform: [{ scale: logoScale }] },
                ]}
                resizeMode="contain"
              />
              <Text style={[styles.brandSubtitle, { fontStyle: 'italic' }]}>
                Real Referrals, Real Time.
              </Text>
              <Animated.Text
                style={[
                  styles.brandTitle,
                  { transform: [{ scale: logoScale }] },
                ]}
              >
                Fire Relay
              </Animated.Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email*"
                placeholder="Enter your email address"
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Password*"
                placeholder="Enter your password"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                secureTextEntry
              />

              <Button
                title="Sell"
                onPress={formik.handleSubmit as any}
                loading={formik.isSubmitting}
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LoginScreen;
