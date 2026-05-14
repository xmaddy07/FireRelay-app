import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Header, Input, Button } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { hp } from '../../../utils/responsive';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  navigation: any;
};

const ProfileSettings = ({ navigation }: Props) => {
  const [newEmail, setNewEmail] = useState('');

  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Header
          title="Profile"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <View style={styles.infoCard}>
              <View style={[styles.infoColumn, { marginBottom: hp(2) }]}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>steve@firerelay.com</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>Admin</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Input
              label="New Email Address"
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email address"
              keyboardType="email-address"
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <Text style={styles.subtext}>
              A confirmation code will be sent to your current email
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <Button
              title="Request Email Change"
              style={styles.requestButton}
              onPress={() => null}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileSettings;
