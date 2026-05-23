import React, {useEffect, useRef} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {images} from '../../../constants';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../theme';
import {Button, Input} from '../../../components';
import {GlassView} from '../../../components/LiquidGlass';
import {useAppDispatch} from '../../../redux/hooks';
import {userActions} from '../../../redux/slices/userSlice';
import {authActions} from '../../../redux/slices/authSlice';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const AnimatedLoginIcon = ({active}: {active?: boolean}) => {
  const {colors, glass} = useTheme();
  const styles = useThemedStyles(createStyles);

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
};

const LoginScreen = () => {
  const {colors, glass, isDark} = useTheme();
  const styles = useThemedStyles(createStyles);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values, {setSubmitting}) => {
      const email = values.email.trim().toLowerCase();
      const role =
        email === 'admin@firerelay.com' || email === 'steve@firerelay.com'
          ? 'admin'
          : 'user';

      setTimeout(() => {
        dispatch(
          userActions.setUser({
            id: role === 'admin' ? 'admin-id' : 'user-id',
            name: role === 'admin' ? 'Steve' : 'User',
            email,
            role,
          }),
        );
        dispatch(authActions.login('mock-jwt-token'));
        setSubmitting(false);
      }, 1500);
    },
  });

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(36)).current;

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
    ]).start();
  }, [cardOpacity, cardTranslateY]);

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
             <Image source={images.logoname} style={styles.logo} resizeMode='contain' />
            </View>
            <View style={styles.brandRow}>
              <Text style={styles.brandFire}>FIRE </Text>
              <Text style={styles.brandRelay}>RELAY</Text>
            </View>
            <Text style={styles.brandTagline}>REAL REFERRAIS, REAL TIME</Text>
          </View>

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{translateY: cardTranslateY}],
            }}
          >
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
                label='PASSWORD'
                placeholder="••••••••••"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                error={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : undefined
                }
                secureTextEntry
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
              />

              {(formik.touched.email && formik.errors.email) ||
              (formik.touched.password && formik.errors.password) ? (
                <Text style={styles.errorText}>
                  {formik.errors.email || formik.errors.password}
                </Text>
              ) : null}

              <Button
                title="SIGN IN"
                onPress={formik.handleSubmit as () => void}
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
          </Animated.View>
        </ScrollView>

      
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
