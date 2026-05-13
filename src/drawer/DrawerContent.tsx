import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

const DrawerContent = () => (
  <View style={{flex: 1, padding: 24}}>
    <Text style={{fontSize: 20, fontWeight: '700', marginBottom: 16}}>Menu</Text>
    <TouchableOpacity style={{marginBottom: 12}} onPress={() => null}>
      <Text>Dashboard</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{marginBottom: 12}} onPress={() => null}>
      <Text>Profile</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{marginBottom: 12}} onPress={() => null}>
      <Text>Settings</Text>
    </TouchableOpacity>
  </View>
);

export default DrawerContent;
