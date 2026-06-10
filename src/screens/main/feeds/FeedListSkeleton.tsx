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
    <View style={[styles.feedSkeletonBlock, {width, height}, style]} />
  );
};

const FeedSkeletonCard = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.feedSkeletonCard}>
      <View style={styles.feedSkeletonHeader}>
        <SkeletonBlock
          width={wp(4.2)}
          height={wp(4.2)}
          style={styles.feedSkeletonCircle}
        />
        <SkeletonBlock width="16%" height={hp(1.1)} />
        <SkeletonBlock
          width="34%"
          height={hp(1.1)}
          style={styles.feedSkeletonHeaderCounty}
        />
        <View style={styles.feedSkeletonHeaderActions}>
          <SkeletonBlock
            width={wp(5)}
            height={wp(5)}
            style={styles.feedSkeletonCircle}
          />
          <SkeletonBlock
            width={wp(5)}
            height={wp(5)}
            style={styles.feedSkeletonCircle}
          />
        </View>
        <View style={styles.feedSkeletonHeaderTime}>
          <SkeletonBlock width={wp(9)} height={hp(0.9)} />
          <SkeletonBlock
            width={wp(7)}
            height={hp(0.8)}
            style={styles.feedSkeletonTimeSecond}
          />
        </View>
      </View>

      <View style={styles.feedSkeletonLines}>
        <SkeletonBlock width="96%" height={hp(1)} />
        <SkeletonBlock width="82%" height={hp(1)} />
        <SkeletonBlock width="68%" height={hp(1)} />
        <SkeletonBlock width="52%" height={hp(1)} />
      </View>

      <View style={styles.feedSkeletonFooter}>
        <View style={styles.feedSkeletonFooterLeft}>
          <SkeletonBlock
            width={wp(4)}
            height={wp(4)}
            style={styles.feedSkeletonCircle}
          />
          <SkeletonBlock
            width={wp(4)}
            height={wp(4)}
            style={styles.feedSkeletonCircle}
          />
          <SkeletonBlock
            width={wp(4)}
            height={wp(4)}
            style={styles.feedSkeletonCircle}
          />
          <SkeletonBlock width={wp(12)} height={hp(1.1)} />
        </View>
        <SkeletonBlock width="28%" height={hp(1.2)} />
      </View>
    </View>
  );
};

const FeedListSkeleton = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.feedSkeletonList}>
      {Array.from({length: SKELETON_CARD_COUNT}, (_, index) => (
        <FeedSkeletonCard key={`feed-skeleton-${index}`} />
      ))}
    </View>
  );
};

export default FeedListSkeleton;
