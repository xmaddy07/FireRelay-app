import React from 'react';
import {Text, TextStyle, StyleProp} from 'react-native';
import {useThemedStyles} from '../../../config/theme';
import {createStyles} from './styles';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Props = {
  snippet: string;
  highlightKeywords: string[];
  numberOfLines?: number;
  textStyle?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
};

const FeedSnippetText = ({
  snippet,
  highlightKeywords,
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
              style={[styles.feedSnippetHighlight, highlightStyle]}
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
