import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import AnimatedChevron, {useAnimatedChevron} from './AnimatedChevron';
import type {AppColors} from '../../../../theme/types';

type Styles = {
  settingRow: object;
  iconBox: object;
  iconBoxNeutral: object;
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
        <View style={[s.iconBox, s.iconBoxNeutral]}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[s.settingTitle, s.settingTitleFlex]}>{label}</Text>
        <AnimatedChevron color={colors.textSecondary} style={chevron.style} />
      </TouchableOpacity>
      {showDivider ? <View style={s.rowDivider} /> : null}
    </View>
  );
};

export default AccountNavRow;
