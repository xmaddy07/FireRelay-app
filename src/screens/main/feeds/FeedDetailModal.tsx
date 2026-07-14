import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {useAppSelector} from '../../../redux/hooks';
import {wp, responsiveHitSlop} from '../../../utils/responsive';
import {createFeedDetailModalStyles} from './feedDetailModal.styles';
import type {FeedDetailData, FeedItem} from './feedTypes';
import AnimatedAudioWaveform from './AnimatedAudioWaveform';
import FeedSnippetText from './FeedSnippetText';
import PlaybackSpeedControl from './PlaybackSpeedControl';
import {useFeedAudioPlayer} from './useFeedAudioPlayer';

type Props = {
  visible: boolean;
  item: FeedItem | null;
  detail: FeedDetailData | null;
  onClose: () => void;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const severityBadgeLabel: Record<FeedItem['severity'], string> = {
  critical: 'CRITICAL',
  warning: 'WARNING',
  info: 'ALERT',
};

const typeBadgeLabel: Record<FeedItem['type'], string> = {
  fire: 'FIRE',
  medical: 'MEDICAL',
  police: 'POLICE',
  general: 'GENERAL',
};

const COMPACT_BREAKPOINT = 340;

const FeedDetailModal = ({
  visible,
  item,
  detail,
  onClose,
}: Props) => {
  const {width: screenWidth} = useWindowDimensions();
  const {colors} = useTheme();
  const styles = useThemedStyles(createFeedDetailModalStyles);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const {
    isPlaying,
    positionSec,
    durationSec,
    playbackSpeed,
    setPlaybackSpeed,
    togglePlay,
    seekBy,
    stopPlayback,
  } = useFeedAudioPlayer(
    visible,
    item?.id,
    item?.audioFilename,
    item?.audioUrl,
  );

  const cachedDurationSec = useAppSelector(state =>
    item?.id ? state.audioCache.byId[item.id]?.durationSec : undefined,
  );
  const displayDurationSec =
    durationSec > 0 ? durationSec : cachedDurationSec ?? 0;

  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  const compact = screenWidth < COMPACT_BREAKPOINT;
  const waveformBarCount = useMemo(
    () => Math.max(20, Math.min(24, Math.floor(screenWidth / 10))),
    [screenWidth],
  );
  const playButtonSize = compact ? wp(13) : wp(15);
  const skipButtonSize = compact ? wp(10) : wp(11);

  const progress = useMemo(() => {
    if (displayDurationSec > 0) {
      return Math.min(1, positionSec / displayDurationSec);
    }
    if (positionSec > 0) {
      return Math.min(0.92, positionSec / Math.max(positionSec * 1.4, 45));
    }
    return 0;
  }, [displayDurationSec, positionSec]);

  useEffect(() => {
    if (!visible) {
      setSpeedMenuOpen(false);
    }
  }, [visible, item?.id]);

  if (!item || !detail) {
    return null;
  }

  const badgeStyle =
    item.severity === 'critical'
      ? styles.criticalBadge
      : item.severity === 'warning'
        ? [styles.criticalBadge, styles.warningBadge]
        : [styles.criticalBadge, styles.infoBadge];

  const badgeTextStyle =
    item.severity === 'critical'
      ? styles.criticalBadgeText
      : item.severity === 'warning'
        ? [styles.criticalBadgeText, styles.warningBadgeText]
        : [styles.criticalBadgeText, styles.infoBadgeText];

  const countyLabel = /\bcounty\b/i.test(item.county)
    ? item.county
    : `${item.county} County`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Pressable
            style={styles.card}
            onPress={event => event.stopPropagation()}
          >
            <View style={styles.popupHeader}>
              <LinearGradient
                colors={[
                  colors.primaryTintStrong,
                  colors.modalSurface,
                  colors.modalSurface,
                ]}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={styles.popupHeaderGradient}
                pointerEvents="none"
              />
              <View style={styles.popupHeaderContent}>
                <View style={styles.popupHeaderMain}>
                  <View style={styles.headerIconWrap}>
                    <Icon name="radio" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.popupHeaderText}>
                    <Text style={styles.popupHeaderEyebrow}>
                      {typeBadgeLabel[item.type]} DISPATCH
                    </Text>
                    <Text style={styles.popupHeaderTitle} numberOfLines={2}>
                      {detail.title}
                    </Text>
                    <Text style={styles.popupHeaderSubtitle} numberOfLines={1}>
                      {countyLabel} · {item.date} · {item.time}
                    </Text>
                  </View>
                </View>

                <View style={[badgeStyle, styles.headerSeverityPill]}>
                  <Text
                    style={[badgeTextStyle, styles.headerSeverityText]}
                    numberOfLines={1}
                  >
                    {severityBadgeLabel[item.severity]}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  hitSlop={responsiveHitSlop(2)}
                  activeOpacity={0.7}
                >
                  <Icon name="x" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
            <View style={styles.playerCard}>
              <LinearGradient
                colors={[...colors.playerGradient]}
                start={{x: 0, y: 0}}
                end={{x: 0.5, y: 1}}
                style={[StyleSheet.absoluteFill, {borderRadius: wp(4) - 1}]}
                pointerEvents="none"
              />
              <View style={styles.playerCardContent}>
                <View style={styles.playerHeaderRow}>
                  <View style={[badgeStyle, styles.headerBadge]}>
                    <Text
                      style={badgeTextStyle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {severityBadgeLabel[item.severity]}
                    </Text>
                  </View>
                  <Text
                    style={styles.playerTimestamp}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                  >
                    {item.time}
                  </Text>
                </View>

                <Text style={styles.alertTitle} numberOfLines={2}>
                  {detail.title}
                </Text>

                <AnimatedAudioWaveform
                  seed={item.id}
                  progress={progress}
                  isPlaying={isPlaying}
                  barCount={waveformBarCount}
                  barColor={colors.primary}
                  barColorDim={colors.metaValue}
                  trackHeight={wp(9.5)}
                />

                <View style={styles.trackerRow}>
                  <Text style={styles.trackerTimeLeft}>
                    {formatTime(positionSec)}
                  </Text>
                  <View style={styles.trackerRight}>
                    <Text style={styles.trackerTimeRight}>
                      {formatTime(displayDurationSec)}
                    </Text>
                    <PlaybackSpeedControl
                      value={playbackSpeed}
                      open={speedMenuOpen}
                      onToggle={() => setSpeedMenuOpen(open => !open)}
                      onSelect={speed => {
                        setPlaybackSpeed(speed);
                        setSpeedMenuOpen(false);
                      }}
                      menuAlign="right"
                    />
                  </View>
                </View>

                <View style={styles.controlsRow}>
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => seekBy(-10)}
                    hitSlop={responsiveHitSlop(2)}
                  >
                    <View
                      style={[
                        styles.skipButtonRing,
                        {
                          width: skipButtonSize,
                          height: skipButtonSize,
                          borderRadius: skipButtonSize / 2,
                        },
                      ]}
                    >
                      <View style={styles.skipIconWrap}>
                        <Icon
                          name="rotate-ccw"
                          size={compact ? 20 : 22}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.skipLabel}>10</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.playButtonOuter,
                      {borderRadius: playButtonSize / 2 + 3},
                    ]}
                  >
                    <TouchableOpacity onPress={togglePlay} activeOpacity={0.9}>
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={[
                          styles.playButton,
                          {
                            width: playButtonSize,
                            height: playButtonSize,
                            borderRadius: playButtonSize / 2,
                          },
                        ]}
                      >
                        <Icon
                          name={isPlaying ? 'pause' : 'play'}
                          size={compact ? 24 : 28}
                          color={colors.textOnPrimary}
                          style={!isPlaying ? {marginLeft: 3} : undefined}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => seekBy(10)}
                    hitSlop={responsiveHitSlop(2)}
                  >
                    <View
                      style={[
                        styles.skipButtonRing,
                        {
                          width: skipButtonSize,
                          height: skipButtonSize,
                          borderRadius: skipButtonSize / 2,
                        },
                      ]}
                    >
                      <View style={styles.skipIconWrap}>
                        <Icon
                          name="rotate-cw"
                          size={compact ? 20 : 22}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.skipLabel}>10</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.metaRow}>
              {(
                [
                  ['COUNTY', item.county.toUpperCase()],
                  ['TALKGROUP', detail.talkgroupShort],
                  ['PRIORITY', detail.priority.toUpperCase()],
                  ['CONFIDENCE', `${detail.confidencePercent}%`],
                ] as const
              ).map(([label, value]) => (
                <View key={label} style={styles.metaCard}>
                  <View style={styles.metaCardAccent} />
                  <Text style={styles.metaLabel}>{label}</Text>
                  <Text
                    style={styles.metaValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.feedContentCard}>
              <Text style={styles.feedTalkgroupText} numberOfLines={2}>
                {item.talkgroup}
              </Text>
              <FeedSnippetText
                snippet={item.snippet}
                highlightKeywords={item.highlightKeywords}
                severity={item.severity}
              />
            </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FeedDetailModal;
