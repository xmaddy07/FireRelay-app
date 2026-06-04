import React, {useCallback, useEffect, useRef} from 'react';
import {StatusBar, View} from 'react-native';
import LottieView from 'lottie-react-native';
import {useTheme} from '../../../config/theme';
import {createStyles} from './styles';

const SPLASH_DURATION_MS = 2600;

type SplashAnimatedScreenProps = {
  onFinish: () => void;
};

function SplashAnimatedScreen({onFinish}: SplashAnimatedScreenProps) {
  const {colors} = useTheme();
  const styles = createStyles(colors);
  const hasFinishedRef = useRef(false);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) {
      return;
    }
    hasFinishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const timer = setTimeout(finish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [finish]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />
      <LottieView
        source={require('../../../assets/animations/FireRelay Logo.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        resizeMode="contain"
        onAnimationFinish={finish}
      />
    </View>
  );
}

export default SplashAnimatedScreen;