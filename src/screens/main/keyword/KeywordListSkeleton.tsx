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
    <View style={[styles.keywordSkeletonBlock, {width, height}, style]} />
  );
};

const KeywordSkeletonCard = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.keywordSkeletonCard}>
      <View style={styles.keywordSkeletonLines}>
        <SkeletonBlock width="96%" height={hp(1)} />
        <SkeletonBlock width="82%" height={hp(1)} />
        <SkeletonBlock width="68%" height={hp(1)} />
        <SkeletonBlock width="52%" height={hp(1)} />
      </View>

      <View style={styles.keywordSkeletonFooter}>
        <View style={styles.keywordSkeletonFooterLeft}>
          <SkeletonBlock
            width={wp(4)}
            height={wp(4)}
            style={styles.keywordSkeletonCircle}
          />
          <SkeletonBlock
            width={wp(4)}
            height={wp(4)}
            style={styles.keywordSkeletonCircle}
          />
          <SkeletonBlock
            width={wp(4)}
            height={wp(4)}
            style={styles.keywordSkeletonCircle}
          />
          <SkeletonBlock width={wp(12)} height={hp(1.1)} />
        </View>
        <SkeletonBlock width="28%" height={hp(1.2)} />
      </View>
    </View>
  );
};

const KeywordListSkeleton = () => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.keywordSkeletonList}>
      {Array.from({length: SKELETON_CARD_COUNT}, (_, index) => (
        <KeywordSkeletonCard key={`keyword-skeleton-${index}`} />
      ))}
    </View>
  );
};

export default KeywordListSkeleton;
