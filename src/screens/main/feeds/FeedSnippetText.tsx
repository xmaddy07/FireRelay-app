import React from 'react';
import {Text, TextStyle, StyleProp} from 'react-native';
import {useThemedStyles} from '../../../config/theme';
import {createStyles} from './styles';
import type {FeedItem} from './feedTypes';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Props = {
  snippet: string;
  highlightKeywords: string[];
  severity?: FeedItem['severity'];
  numberOfLines?: number;
  textStyle?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
};

const severityHighlightStyle = (
  severity: FeedItem['severity'],
  styles: ReturnType<typeof createStyles>,
) => {
  if (severity === 'critical') {
    return styles.feedSnippetHighlightCritical;
  }
  if (severity === 'warning') {
    return styles.feedSnippetHighlightWarning;
  }
  return styles.feedSnippetHighlightInfo;
};

const FeedSnippetText = ({
  snippet,
  highlightKeywords,
  severity = 'info',
  numberOfLines,
  textStyle,
  highlightStyle,
}: Props) => {
  const styles = useThemedStyles(createStyles);
  const snippetProps = {
    style: [styles.feedSnippetText, textStyle],
    numberOfLines,
    ellipsizeMode: 'tail' as const,
  };

  if (highlightKeywords.length === 0) {
    return <Text {...snippetProps}>{snippet}</Text>;
  }

  const pattern = new RegExp(
    `(${highlightKeywords.map(escapeRegExp).join('|')})`,
    'gi',
  );
  const parts = snippet.split(pattern).filter(part => part.length > 0);

  return (
    <Text {...snippetProps}>
      {parts.map((part, index) => {
        const isHighlight = highlightKeywords.some(
          keyword => keyword.toLowerCase() === part.toLowerCase(),
        );

        if (isHighlight) {
          return (
            <Text
              key={`${part}-${index}`}
              style={[
                styles.feedSnippetHighlight,
                severityHighlightStyle(severity, styles),
                highlightStyle,
              ]}
            >
              {part}
            </Text>
          );
        }

        return <Text key={`${part}-${index}`}>{part}</Text>;
      })}
    </Text>
  );
};

export default FeedSnippetText;
