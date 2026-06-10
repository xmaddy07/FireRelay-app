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
import {getUserCounties, type CountyOption} from '../../../api';
import {ALL_COUNTIES, EditUserTab, ROLE_OPTIONS, UserRecord, UserRole} from './types';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {createPremium} from './styles';
import {createEditModalStyles} from './editUserModal.styles';

type Props = {
  visible: boolean;
  user: UserRecord | null;
  token?: string;
  countyOptions?: CountyOption[];
  onClose: () => void;
  onSave: (user: UserRecord, countyIds: string[]) => void;
};

const resolveCountyIds = (
  entries: string[],
  counties: CountyOption[],
): string[] => {
  const ids = new Set<string>();
  for (const entry of entries) {
    const match =
      counties.find(county => county.id === entry) ??
      counties.find(county => county.name === entry) ??
      counties.find(county => county.code === entry);
    if (match) {
      ids.add(match.id);
    }
  }
  return [...ids];
};

const EditUserModal = ({
  visible,
  user,
  token,
  countyOptions = [],
  onClose,
  onSave,
}: Props) => {
  const {colors} = useTheme();
  const premium = useMemo(() => createPremium(colors), [colors]);
  const s = useThemedStyles(createEditModalStyles);
  const [activeTab, setActiveTab] = useState<EditUserTab>('details');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedCountyIds, setSelectedCountyIds] = useState<string[]>([]);
  const [countySearch, setCountySearch] = useState('');
  const [loadingCounties, setLoadingCounties] = useState(false);

  const availableCounties = useMemo(
    () =>
      countyOptions.length > 0
        ? countyOptions
        : ALL_COUNTIES.map(county => ({
            id: county.code,
            name: county.name,
            code: county.code,
            state: county.state,
            established: '',
          })),
    [countyOptions],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    setEmail(user.email);
    setRole(user.role);
    setActiveTab('details');
    setRoleOpen(false);
    setCountySearch('');
  }, [user]);

  useEffect(() => {
    if (!visible || !user) {
      return;
    }

    let cancelled = false;

    const applyCountyIds = (ids: string[]) => {
      if (!cancelled) {
        setSelectedCountyIds(ids);
      }
    };

    if (!token) {
      applyCountyIds(resolveCountyIds(user.counties, availableCounties));
      return;
    }

    setLoadingCounties(true);
    getUserCounties(token, user.id)
      .then(counties => {
        applyCountyIds(counties.map(county => county.id));
      })
      .catch(() => {
        applyCountyIds(resolveCountyIds(user.counties, availableCounties));
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCounties(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [availableCounties, token, user, visible]);

  const filteredCounties = useMemo(() => {
    const query = countySearch.trim().toLowerCase();
    const matches = !query
      ? availableCounties
      : availableCounties.filter(
          c =>
            c.name.toLowerCase().includes(query) ||
            c.code.toLowerCase().includes(query) ||
            c.state.toLowerCase().includes(query),
        );
    const selectedSet = new Set(selectedCountyIds);
    return [...matches].sort((a, b) => {
      const aSelected = selectedSet.has(a.id);
      const bSelected = selectedSet.has(b.id);
      if (aSelected === bSelected) {
        return 0;
      }
      return aSelected ? -1 : 1;
    });
  }, [availableCounties, countySearch, selectedCountyIds]);

  const roleLabel =
    ROLE_OPTIONS.find(option => option.value === role)?.label ?? 'Admin';

  const toggleCounty = (countyId: string) => {
    setSelectedCountyIds(prev =>
      prev.includes(countyId)
        ? prev.filter(id => id !== countyId)
        : [...prev, countyId],
    );
  };

  const handleSelectAll = () => {
    const ids = filteredCounties.map(c => c.id);
    const allSelected = ids.every(id => selectedCountyIds.includes(id));
    if (allSelected) {
      setSelectedCountyIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedCountyIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const handleUpdate = () => {
    if (!user || !email.trim()) {
      return;
    }
    onSave(
      {
        ...user,
        email: email.trim(),
        role,
        counties: selectedCountyIds
          .map(id => availableCounties.find(c => c.id === id)?.name)
          .filter((name): name is string => Boolean(name)),
      },
      selectedCountyIds,
    );
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
                    {loadingCounties ? (
                      <Text style={s.countyLoadingText}>
                        Loading county access...
                      </Text>
                    ) : (
                      <ScrollView
                        horizontal
                        nestedScrollEnabled
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.countyGridInner}
                      >
                        {filteredCounties.map(county => {
                          const checked = selectedCountyIds.includes(county.id);
                          return (
                            <TouchableOpacity
                              key={county.id}
                              style={[
                                s.countyItem,
                                checked && s.countyItemSelected,
                              ]}
                              onPress={() => toggleCounty(county.id)}
                              activeOpacity={0.8}
                            >
                              <View
                                style={[
                                  s.checkbox,
                                  checked && s.checkboxChecked,
                                ]}
                              >
                                {checked ? (
                                  <Icon
                                    name="check"
                                    size={12}
                                    color="#FFFFFF"
                                  />
                                ) : null}
                              </View>
                              <Text style={s.countyName} numberOfLines={1}>
                                {county.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
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
