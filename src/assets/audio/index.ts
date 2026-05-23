import {Image} from 'react-native';

const audioAssets = [
  require('./audio1.mp3'),
  require('./audio2.mp3'),
  require('./audio3.mp3'),
  require('./audio4.mp3'),
] as const;

const feedItemAudioIndex: Record<string, number> = {
  f1: 0,
  f2: 1,
  f3: 2,
  f4: 3,
  f5: 0,
};

export const getFeedAudioUri = (itemId: string): string | null => {
  const index = feedItemAudioIndex[itemId] ?? 0;
  const asset = audioAssets[index];
  const resolved = Image.resolveAssetSource(asset);
  return resolved?.uri ?? null;
};
