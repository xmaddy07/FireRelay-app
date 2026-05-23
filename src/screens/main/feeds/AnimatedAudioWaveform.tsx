import React, {useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {wp} from '../../../utils/responsive';

const DEFAULT_BAR_COUNT = 48;

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildBaseHeights = (seed: string, barCount: number) => {
  const base = hashSeed(seed);
  return Array.from({length: barCount}, (_, index) => {
    const wave = Math.sin((index + base) * 0.55) * 0.35 + 0.55;
    const jitter = ((base + index * 17) % 13) / 26;
    return Math.min(1, Math.max(0.22, wave + jitter));
  });
};

type Props = {
  seed: string;
  progress: number;
  isPlaying: boolean;
  barCount?: number;
  barColor?: string;
  barColorDim?: string;
  trackHeight?: number;
};

const WaveformBar = ({
  index,
  baseHeight,
  phase,
  isPlaying,
  isPlayed,
  barColor,
  barColorDim,
  maxHeight,
}: {
  index: number;
  baseHeight: number;
  phase: {value: number};
  isPlaying: boolean;
  isPlayed: boolean;
  barColor: string;
  barColorDim: string;
  maxHeight: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const pulse = isPlaying
      ? 0.72 +
        0.28 *
          Math.sin(phase.value * Math.PI * 2 + index * 0.42 + baseHeight * 4)
      : 1;
    const height = Math.max(4, baseHeight * maxHeight * pulse);

    return {
      height,
      backgroundColor: isPlayed ? barColor : barColorDim,
      opacity: isPlayed ? 1 : 0.55,
    };
  }, [isPlaying, isPlayed, baseHeight, maxHeight, barColor, barColorDim]);

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

const AnimatedAudioWaveform = ({
  seed,
  progress,
  isPlaying,
  barCount = DEFAULT_BAR_COUNT,
  barColor = 'rgba(255, 132, 128, 0.95)',
  barColorDim = 'rgba(255, 132, 128, 0.42)',
  trackHeight,
}: Props) => {
  const phase = useSharedValue(0);
  const maxBarHeight = trackHeight ?? wp(10);
  const playedBarCount = Math.floor(
    Math.min(1, Math.max(0, progress)) * barCount,
  );

  const baseHeights = useMemo(
    () => buildBaseHeights(seed, barCount),
    [seed, barCount],
  );

  useEffect(() => {
    if (isPlaying) {
      phase.value = 0;
      phase.value = withRepeat(
        withTiming(1, {duration: 1400, easing: Easing.linear}),
        -1,
        false,
      );
    } else {
      cancelAnimation(phase);
      phase.value = withTiming(0, {duration: 200});
    }
  }, [isPlaying, phase]);

  return (
    <View style={styles.container}>
      <View style={[styles.waveformRow, {height: maxBarHeight}]}>
        {baseHeights.map((baseHeight, index) => (
          <WaveformBar
            key={`wave-${index}`}
            index={index}
            baseHeight={baseHeight}
            phase={phase}
            isPlaying={isPlaying}
            isPlayed={index < playedBarCount}
            barColor={barColor}
            barColorDim={barColorDim}
            maxHeight={maxBarHeight}
          />
        ))}
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 2,
    marginBottom: wp(1.2),
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 2,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AnimatedAudioWaveform;
