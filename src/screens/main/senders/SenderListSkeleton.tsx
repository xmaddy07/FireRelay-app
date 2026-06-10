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
    <View style={[styles.senderSkeletonBlock, {width, height}, style]} />
  );
};

const SenderSkeletonCard = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.senderSkeletonCard}>
      <View style={styles.senderSkeletonHeader}>
        <SkeletonBlock width="55%" height={hp(1.35)} />
        <SkeletonBlock width={wp(18)} height={hp(1.2)} />
      </View>

      <View style={styles.senderSkeletonMetaRow}>
        <View style={styles.senderSkeletonMetaColumn}>
          <SkeletonBlock width="38%" height={hp(0.7)} />
          <SkeletonBlock width="82%" height={hp(1)} />
        </View>
        <View style={styles.senderSkeletonMetaColumnEnd}>
          <SkeletonBlock width="48%" height={hp(0.7)} />
          <SkeletonBlock width="62%" height={hp(1)} />
        </View>
      </View>

      <View style={styles.senderSkeletonDescription}>
        <SkeletonBlock width="34%" height={hp(0.7)} />
        <SkeletonBlock width="92%" height={hp(1)} />
      </View>

      <View style={styles.senderSkeletonActions}>
        <SkeletonBlock width={wp(24)} height={hp(2.4)} />
        <SkeletonBlock width={wp(17)} height={hp(2.4)} />
        <SkeletonBlock width={wp(19)} height={hp(2.4)} />
      </View>
    </View>
  );
};

const SenderListSkeleton = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.senderSkeletonList}>
      {Array.from({length: SKELETON_CARD_COUNT}, (_, index) => (
        <SenderSkeletonCard key={`sender-skeleton-${index}`} />
      ))}
    </View>
  );
};

export default SenderListSkeleton;
