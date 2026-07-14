import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 375;

export const wp = (percentage: number) => (width * percentage) / 100;
export const hp = (percentage: number) => (height * percentage) / 100;
export const responsiveSize = (value: number) =>
  (width / guidelineBaseWidth) * value;

/** Shared tab bar clearance (was 88px on 812pt height). */
export const TAB_BAR_HEIGHT = hp(10.8);

/** Uniform touch target expansion using width-percentage scaling. */
export const responsiveHitSlop = (size = 2) => ({
  top: wp(size),
  bottom: wp(size),
  left: wp(size),
  right: wp(size),
});

/** County strip card width — scales with screen, clamped for small/large devices. */
export const COUNTY_FEED_CARD_WIDTH = Math.min(
  wp(48),
  Math.max(wp(40), width * 0.42),
);
