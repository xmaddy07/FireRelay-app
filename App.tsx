import React from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ActivityIndicator, StatusBar, StyleSheet, View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {AppNavigator} from './src/navigation/AppNavigator';
import {persistor, store} from './src/redux/store';
import {ThemeProvider, useTheme} from './src/context';

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

const PersistLoading = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" />
  </View>
);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <ThemeProvider>
          <SafeAreaProvider>
            <AppShell />
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
