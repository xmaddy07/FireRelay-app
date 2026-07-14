import React from 'react';
import {ScrollView, View} from 'react-native';
import {useThemedStyles} from '../../../config/theme';
import {hp, wp} from '../../../utils/responsive';
import {createStyles} from './styles';

const SKELETON_CARD_COUNT = 3;

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
    <View style={[styles.countySkeletonBlock, {width, height}, style]} />
  );
};

const CountySkeletonCard = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.countySkeletonCard}>
      <View style={styles.countySkeletonHeader}>
        <SkeletonBlock
          width={wp(7.2)}
          height={wp(7.2)}
          style={styles.countySkeletonShield}
        />
        <View style={styles.countySkeletonTitleBlock}>
          <SkeletonBlock width="72%" height={hp(1.2)} />
          <SkeletonBlock width="48%" height={hp(0.85)} />
        </View>
        <SkeletonBlock
          width={wp(2.4)}
          height={wp(2.4)}
          style={styles.countySkeletonDot}
        />
      </View>

      <View style={styles.countySkeletonMetaRow}>
        <SkeletonBlock width={wp(12)} height={hp(0.9)} />
      </View>

      <View style={styles.countySkeletonFooter}>
        <SkeletonBlock width={wp(14)} height={hp(0.9)} />
        <SkeletonBlock width={wp(10)} height={hp(0.9)} />
      </View>
    </View>
  );
};

const CountyStripSkeleton = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScrollContent}
      style={styles.countiesHorizontalContainer}
    >
      {Array.from({length: SKELETON_CARD_COUNT}, (_, index) => (
        <CountySkeletonCard key={`county-skeleton-${index}`} />
      ))}
    </ScrollView>
  );
};

export default CountyStripSkeleton;
