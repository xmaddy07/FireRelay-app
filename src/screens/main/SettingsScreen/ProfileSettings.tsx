import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { View, Text, ScrollView } from 'react-native';
import { Header, Input, Button } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { hp } from '../../../utils/responsive';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {glass} from '../../../constants';

type Props = {
  navigation: any;
};

const validationSchema = Yup.object().shape({
  newEmail: Yup.string()
    .email('Please enter a valid email address')
    .required('New email address is required'),
});

const ProfileSettings = ({ navigation }: Props) => {
  const formik = useFormik({
    initialValues: {
      newEmail: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Email change values:', values);
      // Handle email change logic here
    },
  });

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
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
              value={formik.values.newEmail}
              onChangeText={formik.handleChange('newEmail')}
              onBlur={formik.handleBlur('newEmail')}
              error={formik.touched.newEmail && formik.errors.newEmail ? formik.errors.newEmail : undefined}
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
              onPress={formik.handleSubmit as any}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileSettings;
