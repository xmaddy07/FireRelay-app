import React, {useMemo} from 'react';
import {View, Text} from 'react-native';
import {useThemedStyles} from '../../../config/theme';
import {createStyles} from './styles';
import {buildFeedMetadata, type FeedItem} from './feedTypes';

type Props = {
  item: FeedItem;
  expanded: boolean;
};

type MetaRow = {
  label: string;
  value: string;
  tone?: FeedItem['severity'];
};

const FeedCardMetadataPanel = ({item, expanded}: Props) => {
  const styles = useThemedStyles(createStyles);
  const metadata = useMemo(() => buildFeedMetadata(item), [item]);

  if (!expanded) {
    return null;
  }

  const severityBadgeStyle =
    metadata.maxSeverityTone === 'critical'
      ? styles.metadataSeverityCritical
      : metadata.maxSeverityTone === 'warning'
        ? styles.metadataSeverityWarning
        : styles.metadataSeverityInfo;

  const rows: MetaRow[] = [
    {label: 'Confidence', value: `${metadata.confidencePercent}%`},
    {label: 'Channel ID', value: metadata.channelId},
    {label: 'Talkgroup', value: metadata.talkgroup},
    {label: 'County', value: metadata.county},
    {label: 'Max severity', value: metadata.maxSeverityLabel, tone: metadata.maxSeverityTone},
    {label: 'Created', value: metadata.createdAtLabel},
  ];

  return (
    <View style={styles.feedMetadataPanel}>
      <Text style={styles.feedMetadataPanelTitle}>Audio metadata</Text>

      <View style={styles.feedMetadataTable}>
        {rows.map(row => (
          <View key={row.label} style={styles.feedMetadataRow}>
            <Text style={styles.feedMetadataLabel}>{row.label}</Text>
            {row.label === 'Max severity' ? (
              <View style={[styles.metadataSeverityBadge, severityBadgeStyle]}>
                <Text style={styles.metadataSeverityBadgeText}>{row.value}</Text>
              </View>
            ) : (
              <Text style={styles.feedMetadataValue} numberOfLines={2}>
                {row.value}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.feedMetadataDivider} />

      <Text style={styles.feedMetadataKeywordsTitle}>Matched keywords</Text>
      {metadata.matchedKeywords.length === 0 ? (
        <Text style={styles.feedMetadataKeywordsEmpty}>No matched keywords</Text>
      ) : (
        <View style={styles.feedMetadataKeywordList}>
          {metadata.matchedKeywords.map(match => {
            const pillStyle =
              match.severity === 'High'
                ? styles.metadataKeywordPillCritical
                : match.severity === 'Medium'
                  ? styles.metadataKeywordPillWarning
                  : styles.metadataKeywordPillInfo;

            return (
              <View
                key={`${match.keyword}-${match.severity}`}
                style={[styles.metadataKeywordPill, pillStyle]}
              >
                <Text style={styles.metadataKeywordPillText}>
                  {match.keyword} · {match.severity}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default FeedCardMetadataPanel;
