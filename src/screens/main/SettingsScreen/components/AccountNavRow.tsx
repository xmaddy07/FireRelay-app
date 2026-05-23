import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import AnimatedChevron, {useAnimatedChevron} from './AnimatedChevron';
import type {AppColors} from '../../../../theme/types';
import {wp} from '../../../../utils/responsive';

type Styles = {
  settingRow: object;
  iconBox: object;
  iconBoxAccent: object;
  settingTitle: object;
  settingTitleFlex: object;
  rowDivider: object;
};

type Props = {
  label: string;
  icon: string;
  onPress: () => void;
  showDivider?: boolean;
  styles: Styles;
  colors: AppColors;
};

const AccountNavRow = ({
  label,
  icon,
  onPress,
  showDivider,
  styles: s,
  colors,
}: Props) => {
  const chevron = useAnimatedChevron();

  return (
    <View>
      <TouchableOpacity
        style={s.settingRow}
        onPress={onPress}
        activeOpacity={0.75}
        {...chevron.bind}
      >
        <View style={[s.iconBox, s.iconBoxAccent]}>
          <Feather name={icon} size={wp(5.2)} color={colors.primary} />
        </View>
        <Text style={[s.settingTitle, s.settingTitleFlex]}>{label}</Text>
        <AnimatedChevron color={colors.textSecondary} style={chevron.style} />
      </TouchableOpacity>
      {showDivider ? <View style={s.rowDivider} /> : null}
    </View>
  );
};

export default AccountNavRow;
