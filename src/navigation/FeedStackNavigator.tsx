import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CountiesScreen from '../screens/main/feeds';
import CountyDetailScreen from '../screens/main/counties/CountyDetailScreen';
import type {FeedStackParamList} from './types';

const Stack = createNativeStackNavigator<FeedStackParamList>();

const FeedStackNavigator = () => (
  <View style={styles.root}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen name="FeedList" component={CountiesScreen} />
      <Stack.Screen name="CountyDetail" component={CountyDetailScreen} />
    </Stack.Navigator>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default FeedStackNavigator;
