import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {styles} from './styles';
import {Button, Input} from '../../../components';
import {images} from '../../../constants';
import LinearGradient from 'react-native-linear-gradient';

type LoginScreenProps = {
  onSignIn: () => void;
};

const LoginScreen = ({onSignIn}: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
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
                transform: [{translateY: cardTranslateY}],
              },
            ]}
          >
            <View style={styles.brand}>
              <Animated.Image
                source={images.logoname}
                style={[
                  styles.brandTitleImage,
                  {transform: [{scale: logoScale}]},
                ]}
                resizeMode="contain"
              />
              <Text style={styles.brandSubtitle}>
                Sign in to access your Fire Relay.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email*"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                label="Password*"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title="Sign In"
                onPress={onSignIn}
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
