import React, {useEffect, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {wp} from '../../../utils/responsive';

const DEFAULT_BAR_COUNT = 24;
const PULSE_CYCLE_MS = 1400;

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

type BarProps = {
  index: number;
  baseHeight: number;
  maxBarHeight: number;
  phase: Animated.SharedValue<number>;
  playing: Animated.SharedValue<boolean>;
  isPlayed: boolean;
  barColor: string;
  barColorDim: string;
};

const WaveformBar = React.memo(function WaveformBar({
  index,
  baseHeight,
  maxBarHeight,
  phase,
  playing,
  isPlayed,
  barColor,
  barColorDim,
}: BarProps) {
  const barHeight = Math.max(4, baseHeight * maxBarHeight);

  const animatedStyle = useAnimatedStyle(() => {
    const scaleY = playing.value
      ? 0.72 +
        0.28 *
          Math.sin(phase.value * Math.PI * 2 + index * 0.42 + baseHeight * 4)
      : 1;
    return {transform: [{scaleY}]};
  }, [index, baseHeight]);

  return (
    <View style={[styles.barSlot, {height: maxBarHeight}]}>
      <Animated.View
        style={[
          styles.bar,
          {
            height: barHeight,
            backgroundColor: isPlayed ? barColor : barColorDim,
            opacity: isPlayed ? 1 : 0.92,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
});

type Props = {
  seed: string;
  progress: number;
  isPlaying: boolean;
  barCount?: number;
  barColor?: string;
  barColorDim?: string;
  trackHeight?: number;
};

const AnimatedAudioWaveform = ({
  seed,
  progress,
  isPlaying,
  barCount = DEFAULT_BAR_COUNT,
  barColor = 'rgba(255, 132, 128, 0.95)',
  barColorDim = 'rgba(255, 132, 128, 0.65)',
  trackHeight,
}: Props) => {
  const phase = useSharedValue(0);
  const playing = useSharedValue(isPlaying);
  const maxBarHeight = trackHeight ?? wp(10);
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const playedBarCount = Math.floor(clampedProgress * barCount);

  const baseHeights = useMemo(
    () => buildBaseHeights(seed, barCount),
    [seed, barCount],
  );

  useEffect(() => {
    playing.value = isPlaying;
  }, [isPlaying, playing]);

  useEffect(() => {
    cancelAnimation(phase);

    if (isPlaying) {
      phase.value = withRepeat(
        withTiming(1, {duration: PULSE_CYCLE_MS, easing: Easing.linear}),
        -1,
        false,
      );
      return;
    }

    phase.value = 0;
  }, [isPlaying, phase]);

  return (
    <View style={styles.container} collapsable={false}>
      <View style={[styles.waveformRow, {height: maxBarHeight}]}>
        {baseHeights.map((baseHeight, index) => (
          <WaveformBar
            key={`wave-${index}`}
            index={index}
            baseHeight={baseHeight}
            maxBarHeight={maxBarHeight}
            phase={phase}
            playing={playing}
            isPlayed={index < playedBarCount}
            barColor={barColor}
            barColorDim={barColorDim}
          />
        ))}
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${clampedProgress * 100}%`,
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
  barSlot: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
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
