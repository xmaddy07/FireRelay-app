import React, {ReactNode} from 'react';
import {ScrollView, StyleProp, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Header} from '../../../components';
import {createStyles} from './styles';
import {useThemedStyles} from '../../../theme';
import {TAB_BAR_HEIGHT, hp} from '../../../utils/responsive';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  children: ReactNode;
  scrollContentStyle?: StyleProp<ViewStyle>;
  onNotificationPress?: () => void;
  showNotification?: boolean;
  layout?: 'centered' | 'stacked';
  /** When true, content uses full height (no tab bar inset). */
  fullScreen?: boolean;
};

const SettingsScreenLayout = ({
  title,
  subtitle,
  showBack,
  onBackPress,
  children,
  scrollContentStyle,
  onNotificationPress,
  showNotification,
  layout = 'centered',
  fullScreen = false,
}: Props) => {
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const bottomInset = fullScreen
    ? insets.bottom + hp(3)
    : TAB_BAR_HEIGHT + hp(2);

  return (
    <View style={styles.container}>
      <Header
        title={title}
        subtitle={subtitle}
        layout={layout}
        showBack={showBack}
        onBackPress={onBackPress}
        showNotification={showNotification}
        onNotificationPress={onNotificationPress}
      />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: bottomInset},
          scrollContentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
};

export default SettingsScreenLayout;
