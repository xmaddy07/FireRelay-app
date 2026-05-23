import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  ALL_COUNTIES,
  EditUserTab,
  ROLE_OPTIONS,
  UserRecord,
  UserRole,
} from './types';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {createPremium} from './styles';
import {createEditModalStyles} from './editUserModal.styles';

type Props = {
  visible: boolean;
  user: UserRecord | null;
  onClose: () => void;
  onSave: (user: UserRecord) => void;
};

const EditUserModal = ({visible, user, onClose, onSave}: Props) => {
  const {colors} = useTheme();
  const premium = useMemo(() => createPremium(colors), [colors]);
  const s = useThemedStyles(createEditModalStyles);
  const [activeTab, setActiveTab] = useState<EditUserTab>('details');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [countySearch, setCountySearch] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setRole(user.role);
      setSelectedCounties(user.counties);
      setActiveTab('details');
      setRoleOpen(false);
      setCountySearch('');
    }
  }, [user]);

  const filteredCounties = useMemo(() => {
    const query = countySearch.trim().toLowerCase();
    if (!query) {
      return ALL_COUNTIES;
    }
    return ALL_COUNTIES.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.state.toLowerCase().includes(query),
    );
  }, [countySearch]);

  const roleLabel =
    ROLE_OPTIONS.find(option => option.value === role)?.label ?? 'Admin';

  const toggleCounty = (name: string) => {
    setSelectedCounties(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name],
    );
  };

  const handleSelectAll = () => {
    const names = filteredCounties.map(c => c.name);
    const allSelected = names.every(name => selectedCounties.includes(name));
    if (allSelected) {
      setSelectedCounties(prev => prev.filter(name => !names.includes(name)));
    } else {
      setSelectedCounties(prev => [...new Set([...prev, ...names])]);
    }
  };

  const handleUpdate = () => {
    if (!user || !email.trim()) {
      return;
    }
    onSave({
      ...user,
      email: email.trim(),
      role,
      counties: selectedCounties,
    });
    onClose();
  };

  if (!user) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable style={s.card} onPress={e => e.stopPropagation()}>
            <View style={s.header}>
              <Text style={s.headerTitle}>Edit User</Text>
              <TouchableOpacity
                style={s.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Icon name="x" size={20} color={premium.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={s.tabsRow}>
              <TouchableOpacity
                style={[s.tab, activeTab === 'details' && s.tabActive]}
                onPress={() => setActiveTab('details')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.tabText,
                    activeTab === 'details' && s.tabTextActive,
                  ]}
                >
                  User Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tab, activeTab === 'counties' && s.tabActive]}
                onPress={() => setActiveTab('counties')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.tabText,
                    activeTab === 'counties' && s.tabTextActive,
                  ]}
                >
                  County Access
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={s.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {activeTab === 'details' ? (
                <>
                  <Text style={s.fieldLabel}>
                    Email <Text style={s.required}>*</Text>
                  </Text>
                  <TextInput
                    style={s.textInput}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="alerts@firerelay.com"
                    placeholderTextColor={premium.textMuted}
                  />

                  <Text style={s.fieldLabel}>
                    Role <Text style={s.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={s.roleSelect}
                    onPress={() => setRoleOpen(open => !open)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.roleSelectText}>{roleLabel}</Text>
                    <Icon
                      name={roleOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={premium.textMuted}
                    />
                  </TouchableOpacity>
                  {roleOpen ? (
                    <View style={s.roleOptions}>
                      {ROLE_OPTIONS.map(option => {
                        const isActive = option.value === role;
                        return (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              s.roleOption,
                              isActive && s.roleOptionActive,
                            ]}
                            onPress={() => {
                              setRole(option.value);
                              setRoleOpen(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                s.roleOptionText,
                                isActive && s.roleOptionTextActive,
                              ]}
                            >
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={s.sectionTitle}>Assign Counties</Text>
                  <Text style={s.sectionSubtitle}>
                    Select which counties this user can access
                  </Text>

                  <View style={s.countyToolbar}>
                    <TextInput
                      style={s.countySearch}
                      placeholder="Search counties by name, code, or state..."
                      placeholderTextColor={premium.textMuted}
                      value={countySearch}
                      onChangeText={setCountySearch}
                    />
                    <TouchableOpacity
                      style={s.selectAllButton}
                      onPress={handleSelectAll}
                      activeOpacity={0.8}
                    >
                      <Text style={s.selectAllText}>Select All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={s.countyGrid}>
                    <View style={s.countyGridInner}>
                      {filteredCounties.map(county => {
                        const checked = selectedCounties.includes(county.name);
                        return (
                          <TouchableOpacity
                            key={county.code}
                            style={[
                              s.countyItem,
                              checked && s.countyItemSelected,
                            ]}
                            onPress={() => toggleCounty(county.name)}
                            activeOpacity={0.8}
                          >
                            <View
                              style={[
                                s.checkbox,
                                checked && s.checkboxChecked,
                              ]}
                            >
                              {checked ? (
                                <Icon name="check" size={12} color="#FFFFFF" />
                              ) : null}
                            </View>
                            <Text style={s.countyName}>{county.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={s.footer}>
              <TouchableOpacity
                style={s.cancelButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.updateButton}
                onPress={handleUpdate}
                activeOpacity={0.85}
              >
                <Text style={s.updateButtonText}>Update User</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditUserModal;
