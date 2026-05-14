import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Header, Input, Button } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  navigation: any;
};

const PasswordSettings = ({ navigation }: Props) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Header
          title="Password"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.sectionTitle}>Change Password</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Input
              label="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter old password"
              secureTextEntry
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Enter confirm new password"
              secureTextEntry
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <Button title="Change Password" style={styles.saveButton} onPress={() => null} />
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default PasswordSettings;
