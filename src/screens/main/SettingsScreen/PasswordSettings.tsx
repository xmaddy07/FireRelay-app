import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { View, Text, ScrollView } from 'react-native';
import { Header, Input, Button } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {glass} from '../../../constants';

type Props = {
  navigation: any;
};

const validationSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Old password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const PasswordSettings = ({ navigation }: Props) => {
  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Password change values:', values);
      // Handle password change logic here
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
              value={formik.values.oldPassword}
              onChangeText={formik.handleChange('oldPassword')}
              onBlur={formik.handleBlur('oldPassword')}
              error={formik.touched.oldPassword && formik.errors.oldPassword ? formik.errors.oldPassword : undefined}
              placeholder="Enter old password"
              secureTextEntry
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Input
              label="New Password"
              value={formik.values.newPassword}
              onChangeText={formik.handleChange('newPassword')}
              onBlur={formik.handleBlur('newPassword')}
              error={formik.touched.newPassword && formik.errors.newPassword ? formik.errors.newPassword : undefined}
              placeholder="Enter new password"
              secureTextEntry
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <Input
              label="Confirm New Password"
              value={formik.values.confirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
              placeholder="Enter confirm new password"
              secureTextEntry
              style={styles.inputGap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <Button title="Change Password" style={styles.saveButton} onPress={formik.handleSubmit as any} />
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default PasswordSettings;
