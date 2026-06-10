import React from 'react';
import {View} from 'react-native';
import {useThemedStyles} from '../../../config/theme';
import {hp, wp} from '../../../utils/responsive';
import {createStyles} from './styles';

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
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.userSkeletonBlock, {width, height}, style]} />
  );
};

const UserSkeletonCard = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.userSkeletonCard}>
      <View style={styles.userSkeletonHeader}>
        <SkeletonBlock width="68%" height={hp(1.35)} />
        <View style={styles.userSkeletonActions}>
          <SkeletonBlock
            width={wp(5)}
            height={wp(5)}
            style={styles.userSkeletonCircle}
          />
          <SkeletonBlock
            width={wp(5)}
            height={wp(5)}
            style={styles.userSkeletonCircle}
          />
        </View>
      </View>

      <SkeletonBlock width="22%" height={hp(1)} />

      <View style={styles.userSkeletonLines}>
        <SkeletonBlock width="96%" height={hp(0.95)} />
        <SkeletonBlock width="85%" height={hp(0.95)} />
      </View>

      <View style={styles.userSkeletonFooter}>
        <View style={styles.userSkeletonFooterLeft}>
          <SkeletonBlock
            width={wp(2.2)}
            height={wp(2.2)}
            style={styles.userSkeletonCircle}
          />
          <SkeletonBlock width={wp(14)} height={hp(1.1)} />
        </View>
        <View style={styles.userSkeletonFooterRight}>
          <SkeletonBlock width="72%" height={hp(0.85)} />
          <SkeletonBlock width="55%" height={hp(1)} />
        </View>
      </View>

      <SkeletonBlock width="48%" height={hp(0.85)} />
    </View>
  );
};

const UserListSkeleton = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.userSkeletonList}>
      {Array.from({length: SKELETON_CARD_COUNT}, (_, index) => (
        <UserSkeletonCard key={`user-skeleton-${index}`} />
      ))}
    </View>
  );
};

export default UserListSkeleton;
