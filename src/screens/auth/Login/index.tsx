import React, {useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {images} from '../../../config/constants';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {Button, Input} from '../../../components';
import {GlassView} from '../../../components/feed/LiquidGlass';
import {useAppDispatch} from '../../../redux/hooks';
import * as UserSlice from '../../../redux/slices/userSlice';
import {authActions} from '../../../redux/slices/authSlice';
import {ApiError, login} from '../../../api';
import type {AuthUser} from '../../../api';
import {getLoginDeviceInfo} from '../../../utils/deviceInfo';
import {getSessionIdFromToken} from '../../../utils/jwt';
import {
  loadRememberedLogin,
  saveRememberedLogin,
} from '../../../services/storage/rememberedLoginStorage';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

function mapApiUserToState(user: AuthUser): UserSlice.UserState {
  const role: UserSlice.UserState['role'] =
    user.role === 'admin' ? 'admin' : 'user';
  const email = typeof user.email === 'string' ? user.email : undefined;

  return {
    id: typeof user.id === 'string' ? user.id : undefined,
    name:
      typeof user.name === 'string'
        ? user.name
        : email?.split('@')[0] ?? 'User',
    email,
    role,
  };
}

type AnimatedLoginIconProps = {
  active?: boolean;
};

function AnimatedLoginIcon({active}: AnimatedLoginIconProps) {
  const {colors} = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const slide = Animated.sequence([
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 5,
          duration: active ? 320 : 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: active ? 320 : 520,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: active ? 320 : 520,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: active ? 320 : 520,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const loop = Animated.loop(slide);
    loop.start();
    return () => loop.stop();
  }, [active, opacity, translateX]);

  return (
    <Animated.View style={{transform: [{translateX}], opacity}}>
      <MaterialIcons name="login" size={20} color={colors.textOnPrimary} />
    </Animated.View>
  );
}

function LoginScreen() {
  const {colors, glass, isDark} = useTheme();
  const styles = useThemedStyles(createStyles);
  const dispatch = useAppDispatch();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, {setSubmitting}) => {
      setLoginError(null);

      try {
        const response = await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
          device: getLoginDeviceInfo(),
        });

        if (!response.user) {
          setLoginError('Login failed. Please try again.');
          return;
        }

        dispatch(UserSlice.userActions.setUser(mapApiUserToState(response.user)));

        const sessionId =
          response.sessionId ??
          response.session_id ??
          (response.accessToken
            ? getSessionIdFromToken(response.accessToken)
            : undefined);

        if (response.accessToken) {
          dispatch(
            authActions.login({
              token: response.accessToken,
              sessionId,
            }),
          );
        } else {
          dispatch(authActions.loginWithSession({sessionId}));
        }

        await saveRememberedLogin(
          rememberMe
            ? {
                email: values.email.trim().toLowerCase(),
                rememberMe: true,
              }
            : null,
        );
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          setLoginError(error.message);
        } else {
          setLoginError('Unable to sign in. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const saved = await loadRememberedLogin();
      if (!mounted || !saved) {
        return;
      }

      formik.setFieldValue('email', saved.email);
      setRememberMe(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Image
                source={images.logoname}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandRow}>
              <Text style={styles.brandFire}>FIRE </Text>
              <Text style={styles.brandRelay}>RELAY</Text>
            </View>
            <Text style={styles.brandTagline}>REAL REFERRAIS, REAL TIME</Text>
          </View>

          <View>
            <GlassView
              effect="clear"
              colorScheme={isDark ? 'dark' : 'light'}
              tintColor={glass.loginCardTint}
              style={styles.loginCard}
              fallbackStyle={glass.fallback.loginCard}
            >
              <Text style={styles.cardTitle}>Authorized Access</Text>
              <Text style={styles.cardSubtitle}>
                Enter credentials to establish terminal link.
              </Text>

              <Input
                variant="stacked"
                animatedBorder
                label="EMAIL ADDRESS"
                placeholder="your email address"
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
                    : undefined
                }
                autoCapitalize="none"
                keyboardType="email-address"
                labelStyle={styles.inputLabel}
                wrapperStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                icon={
                  <AntDesign
                    name="mail"
                    size={18}
                    color={colors.textSecondary}
                  />
                }
              />

              <Input
                variant="stacked"
                animatedBorder
                label="PASSWORD"
                placeholder="••••••••••"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                error={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : undefined
                }
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                labelStyle={styles.inputLabel}
                wrapperStyle={styles.inputWrapper}
                inputStyle={styles.inputField}
                icon={
                  <AntDesign
                    name="lock"
                    size={18}
                    color={colors.textSecondary}
                  />
                }
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword(prev => !prev)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <AntDesign
                      name={showPassword ? 'eyeo' : 'eye'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                }
              />

              <Pressable
                style={({pressed}) => [
                  styles.rememberRow,
                  pressed && styles.rememberRowPressed,
                ]}
                onPress={() => setRememberMe(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{checked: rememberMe}}
                accessibilityLabel="Remember me"
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                >
                  {rememberMe ? (
                    <AntDesign
                      name="check"
                      size={12}
                      color={colors.textOnPrimary}
                    />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.rememberText,
                    rememberMe && styles.rememberTextChecked,
                  ]}
                >
                  Remember me
                </Text>
              </Pressable>

              {loginError ? (
                <Text style={styles.errorText}>{loginError}</Text>
              ) : null}

              <Button
                title="SIGN IN"
                onPress={formik.handleSubmit}
                loading={formik.isSubmitting}
                backgroundColor={colors.primary}
                loadingColor={colors.textOnPrimary}
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
                rightIcon={
                  <AnimatedLoginIcon active={formik.isSubmitting} />
                }
              />
            </GlassView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default LoginScreen;
