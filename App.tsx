import React from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar, StyleSheet} from 'react-native';
import {Provider} from 'react-redux';
import {AppNavigator} from './src/navigation/AppNavigator';
import {store} from './src/redux/store';
import {ThemeProvider, useTheme} from './src/theme';

const AppShell = () => {
  const {colors, isDark} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top']}>
        <AppNavigator />
      </SafeAreaView>
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppShell />
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
