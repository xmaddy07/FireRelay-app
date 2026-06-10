import React from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../../config/theme';
import {hp, wp} from '../../../utils/responsive';
import {createNotificationSkeletonStyles} from './notificationSkeletonStyles';

const SKELETON_CARD_COUNT = 6;

const SkeletonBlock = ({
  width,
  height,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  style?: object;
}) => {
  const styles = useThemedStyles(createNotificationSkeletonStyles);

  return (
    <View
      style={[styles.notificationSkeletonBlock, {width, height}, style]}
    />
  );
};

const NotificationSkeletonCard = () => {
  const styles = useThemedStyles(createNotificationSkeletonStyles);

  return (
    <View style={styles.notificationSkeletonCard}>
      <View style={styles.notificationSkeletonRow}>
        <SkeletonBlock
          width={wp(11)}
          height={wp(11)}
          style={styles.notificationSkeletonIcon}
        />

        <View style={styles.notificationSkeletonContent}>
          <View style={styles.notificationSkeletonTitleRow}>
            <SkeletonBlock width="68%" height={hp(1.2)} />
            <SkeletonBlock width={wp(12)} height={hp(0.9)} />
          </View>

          <View style={styles.notificationSkeletonLines}>
            <SkeletonBlock width="96%" height={hp(0.95)} />
            <SkeletonBlock width="88%" height={hp(0.95)} />
            <SkeletonBlock width="72%" height={hp(0.95)} />
          </View>
        </View>
      </View>
    </View>
  );
};

const NotificationListSkeleton = () => {
  const styles = useThemedStyles(createNotificationSkeletonStyles);

  return (
    <View style={styles.notificationSkeletonList}>
      {Array.from({length: SKELETON_CARD_COUNT}, (_, index) => (
        <NotificationSkeletonCard key={`notification-skeleton-${index}`} />
      ))}
    </View>
  );
};

export default NotificationListSkeleton;
