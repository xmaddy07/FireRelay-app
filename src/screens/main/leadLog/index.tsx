import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  Image,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {images} from '../../../config/constants';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {useAppSelector} from '../../../redux/hooks';
import {useRole} from '../../../hooks/useRole';
import {
  ApiError,
  assignUserTalkgroupAccess,
  assignUserCounties,
  createUser,
  deleteUser,
  forcePasswordReset,
  getUserById,
  getUserCounties,
  getUserTalkgroupAccess,
  listCounties,
  listUserSessions,
  revokeUserSession,
  enrichUsersWithSessionSummaries,
  summarizeUserSessions,
  searchUsers,
  updateUser,
  type CountyOption,
  type FeedSeverityLevel,
  type UserSessionRecord,
  type UserTalkgroupAccessRecord,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import {hp, responsiveHitSlop, wp} from '../../../utils/responsive';
import {useOpenNotifications} from '../../../navigation/hooks';
import {createPremium, createStyles, TAB_BAR_HEIGHT} from './styles';
import {
  RoleFilter,
  ROLE_OPTIONS,
  UserPresenceStatus,
  UserRecord,
  UserRole,
} from './types';

const ROLE_FILTER_OPTIONS: RoleFilter[] = ['All Roles', 'Admin', 'User'];

const formatCreatedDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Created —';
  }
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `Created ${formatted}`;
};

const formatLastSeenLabel = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 1000 * 60) {
    return 'Just now';
  }
  if (diffMs < 1000 * 60 * 60) {
    return `${Math.max(1, Math.floor(diffMs / (1000 * 60)))} min ago`;
  }
  if (diffMs < 1000 * 60 * 60 * 24) {
    return `${Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))} hours ago`;
  }
  if (diffMs < 1000 * 60 * 60 * 48) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'});
};

const presenceLabel = (status: UserPresenceStatus) => {
  switch (status) {
    case 'online':
      return 'ONLINE';
    case 'away':
      return 'AWAY';
    default:
      return 'OFFLINE';
  }
};

const getPresenceStyles = (
  status: UserPresenceStatus,
  styles: ReturnType<typeof createStyles>,
) => {
  switch (status) {
    case 'online':
      return {
        badge: styles.presenceBadgeOnline,
        dot: styles.presenceDotOnline,
        text: styles.presenceTextOnline,
      };
    case 'away':
      return {
        badge: styles.presenceBadgeAway,
        dot: styles.presenceDotAway,
        text: styles.presenceTextAway,
      };
    default:
      return {
        badge: styles.presenceBadgeOffline,
        dot: styles.presenceDotOffline,
        text: styles.presenceTextOffline,
      };
  }
};

const getRoleBadgeStyle = (
  role: UserRole,
  styles: ReturnType<typeof createStyles>,
) => {
  switch (role) {
    case 'admin':
      return {
        container: styles.roleBadgeAdmin,
        text: styles.roleBadgeTextAdmin,
        label: 'ADMIN',
      };
    case 'user':
      return {
        container: styles.roleBadgeUser,
        text: styles.roleBadgeTextUser,
        label: 'USER',
      };
  }
};

type UserListItemProps = {
  item: UserRecord;
  entranceAnim: Animated.Value;
  isCurrentUser: boolean;
  canManage: boolean;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
  onOpenProfile: (user: UserRecord) => void;
};

const UserListItem = ({
  item,
  entranceAnim,
  isCurrentUser,
  canManage,
  onEdit,
  onDelete,
  onOpenProfile,
}: UserListItemProps) => {
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const roleBadge = getRoleBadgeStyle(item.role, styles);
  const presenceStyles = getPresenceStyles(item.presenceStatus, styles);
  const canDelete = !isCurrentUser;
  const lastSeenText = item.lastSeenAt
    ? formatLastSeenLabel(item.lastSeenAt)
    : '—';
  const sessionText =
    item.activeSessionCount === 0
      ? 'None'
      : `${item.activeSessionCount} active`;

  const entranceStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
      {scale: scaleAnim},
    ],
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={entranceStyle}>
      <Pressable
        onPress={() => onOpenProfile(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.userCard}
      >
        <View style={styles.userCardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleBlock}>
              <View style={styles.emailRow}>
                <Text
                  style={styles.emailText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {item.email}
                </Text>
                {isCurrentUser ? (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>YOU</Text>
                  </View>
                ) : null}
              </View>
              <View style={[styles.roleBadge, roleBadge.container]}>
                <Text style={[styles.roleBadgeText, roleBadge.text]}>
                  {roleBadge.label}
                </Text>
              </View>
            </View>

            {canManage ? (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(item)}
                  activeOpacity={0.75}
                  hitSlop={responsiveHitSlop(1.6)}
                >
                  <Icon name="edit-2" size={14} color="#60A5FA" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.actionButtonDanger,
                    !canDelete && styles.actionButtonDisabled,
                  ]}
                  onPress={() => onDelete(item)}
                  activeOpacity={canDelete ? 0.75 : 1}
                  disabled={!canDelete}
                  hitSlop={responsiveHitSlop(1.6)}
                >
                  <Icon
                    name="trash-2"
                    size={14}
                    color={canDelete ? '#F87171' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View style={styles.cardMetaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Status</Text>
              <View
                style={[
                  styles.presenceBadge,
                  presenceStyles.badge,
                ]}
              >
                <View style={[styles.presenceDot, presenceStyles.dot]} />
                <Text style={[styles.presenceBadgeText, presenceStyles.text]}>
                  {presenceLabel(item.presenceStatus)}
                </Text>
                <Text style={styles.presenceLastSeen} numberOfLines={1}>
                  · {lastSeenText}
                </Text>
              </View>
            </View>
            <View style={[styles.metaColumn, styles.metaColumnEnd]}>
              <Text style={styles.metaLabel}>Sessions</Text>
              <Text style={styles.metaValue} numberOfLines={1}>
                {sessionText}
              </Text>
            </View>
          </View>

          <Text style={styles.createdText} numberOfLines={1}>
            {formatCreatedDate(item.createdAt)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

type ProfileTab = 'Overview' | 'Permissions' | 'Sessions' | 'Security' | 'Activity';

const PROFILE_TABS: ProfileTab[] = [
  'Overview',
  'Permissions',
  'Sessions',
  'Security',
  'Activity',
];

const FEED_SEVERITY_LEVELS: FeedSeverityLevel[] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
];

type SeverityAccessMode = 'all' | 'restricted';

const severityDisplayLabel = (level: FeedSeverityLevel) =>
  level.charAt(0) + level.slice(1).toLowerCase();

const severityLevelStyles = (
  level: FeedSeverityLevel,
  styles: ReturnType<typeof createStyles>,
) => {
  switch (level) {
    case 'CRITICAL':
    case 'HIGH':
      return {
        badge: [styles.severityLevelBadge, styles.severityBadgeHigh],
        text: styles.severityLevelTextHigh,
      };
    case 'MEDIUM':
      return {
        badge: [styles.severityLevelBadge, styles.severityBadgeMedium],
        text: styles.severityLevelTextMedium,
      };
    default:
      return {
        badge: [styles.severityLevelBadge, styles.severityBadgeLow],
        text: styles.severityLevelTextLow,
      };
  }
};

const applySeverityAccessState = (
  allowed: FeedSeverityLevel[] | null,
  setMode: (mode: SeverityAccessMode) => void,
  setLevels: (levels: FeedSeverityLevel[]) => void,
) => {
  if (allowed === null || allowed.length === 0) {
    setMode('all');
    setLevels([]);
    return;
  }
  setMode('restricted');
  setLevels(allowed);
};

const profileTabLabel = (tab: ProfileTab, compact: boolean) => {
  if (!compact) {
    return tab;
  }
  const shortLabels: Record<ProfileTab, string> = {
    Overview: 'Overview',
    Permissions: 'Perms',
    Sessions: 'Sessions',
    Security: 'Secure',
    Activity: 'Activity',
  };
  return shortLabels[tab];
};

const formatSessionDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const userInitial = (email: string) => email.trim().charAt(0).toUpperCase() || 'U';

const formatDeviceLabel = (session: UserSessionRecord) => {
  const primary = session.deviceInfo.trim();
  if (primary) {
    return primary;
  }
  const ua = session.userAgent.toLowerCase();
  if (ua.includes('iphone')) {
    return 'iPhone app session';
  }
  if (ua.includes('android')) {
    return 'Android app session';
  }
  if (ua.includes('mac')) {
    return 'MacOS desktop session';
  }
  if (ua.includes('windows')) {
    return 'Windows desktop session';
  }
  return 'Web dashboard session';
};

const sortSessionsByLastSeen = (sessionList: UserSessionRecord[]) =>
  [...sessionList].sort((a, b) => {
    const left = new Date(a.lastSeenAt).getTime();
    const right = new Date(b.lastSeenAt).getTime();
    return right - left;
  });

const UserProfileModal = ({
  visible,
  user,
  token,
  currentEmail,
  onClose,
  onUserUpdated,
}: {
  visible: boolean;
  user: UserRecord | null;
  token: string | undefined;
  currentEmail: string;
  onClose: () => void;
  onUserUpdated?: (user: UserRecord) => void;
}) => {
  const styles = useThemedStyles(createStyles);
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const {width: windowWidth} = useWindowDimensions();
  const compactProfileTabs = windowWidth < 390;
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview');
  const [tabLoading, setTabLoading] = useState<ProfileTab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileUser, setProfileUser] = useState<UserRecord | null>(null);
  const [sessions, setSessions] = useState<UserSessionRecord[]>([]);
  const [talkgroupAccess, setTalkgroupAccess] = useState<UserTalkgroupAccessRecord[]>([]);
  const [severityMode, setSeverityMode] = useState<SeverityAccessMode>('all');
  const [allowedSeverities, setAllowedSeverities] = useState<FeedSeverityLevel[]>([]);
  const [savingSeverityAccess, setSavingSeverityAccess] = useState(false);
  const [expandedCountyEntryId, setExpandedCountyEntryId] = useState<string | null>(
    null,
  );
  const [userCounties, setUserCounties] = useState<CountyOption[]>([]);
  const [pickerCounties, setPickerCounties] = useState<CountyOption[]>([]);
  const [selectedCountyIds, setSelectedCountyIds] = useState<string[]>([]);
  const [managingCounties, setManagingCounties] = useState(false);
  const [countySearch, setCountySearch] = useState('');
  const [editingRole, setEditingRole] = useState(false);
  const [draftRole, setDraftRole] = useState<UserRole>('user');
  const [savingRole, setSavingRole] = useState(false);
  const [savingCounties, setSavingCounties] = useState(false);
  const loadedTabsRef = useRef<Set<ProfileTab>>(new Set());
  const tabLoadGenerationRef = useRef(0);
  const [sessionActionId, setSessionActionId] = useState<string | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);
  const [securityLoading, setSecurityLoading] = useState<'reset' | 'revokeAll' | null>(
    null,
  );
  const modalEntranceAnim = useRef(new Animated.Value(0)).current;
  const tabContentAnim = useRef(new Animated.Value(1)).current;
  const tabFocusAnim = useRef(new Animated.Value(0)).current;
  const onUserUpdatedRef = useRef(onUserUpdated);

  useEffect(() => {
    onUserUpdatedRef.current = onUserUpdated;
  }, [onUserUpdated]);

  const animateTabFocus = useCallback(
    (tab: ProfileTab) => {
      const nextIndex = PROFILE_TABS.indexOf(tab);
      Animated.spring(tabFocusAnim, {
        toValue: nextIndex,
        friction: 8,
        tension: 95,
        useNativeDriver: true,
      }).start();
    },
    [tabFocusAnim],
  );

  useEffect(() => {
    if (visible) {
      setActiveTab('Overview');
      tabContentAnim.setValue(1);
      tabFocusAnim.setValue(0);
      modalEntranceAnim.setValue(0);
      Animated.spring(modalEntranceAnim, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }).start();
    }
  }, [modalEntranceAnim, tabContentAnim, tabFocusAnim, visible]);

  const loadTabData = useCallback(
    async (tab: ProfileTab, force = false) => {
      if (!visible || !userId || !token) {
        return;
      }
      if (!force && loadedTabsRef.current.has(tab)) {
        return;
      }

      const generation = ++tabLoadGenerationRef.current;
      setTabLoading(tab);
      setError(null);

      try {
        if (tab === 'Overview') {
          const [fetchedUser, counties, allCounties] = await Promise.all([
            getUserById(token, userId),
            getUserCounties(token, userId),
            listCounties(token),
          ]);
          if (generation !== tabLoadGenerationRef.current) {
            return;
          }
          setProfileUser(fetchedUser);
          setUserCounties(counties);
          setPickerCounties(allCounties);
          setSelectedCountyIds(counties.map(county => county.id));
          setDraftRole(fetchedUser.role);
          applySeverityAccessState(
            fetchedUser.allowedSeverities,
            setSeverityMode,
            setAllowedSeverities,
          );
          onUserUpdatedRef.current?.(fetchedUser);
        } else if (tab === 'Permissions') {
          const [access, fetchedUser] = await Promise.all([
            getUserTalkgroupAccess(token, userId),
            getUserById(token, userId),
          ]);
          if (generation !== tabLoadGenerationRef.current) {
            return;
          }
          setTalkgroupAccess(access);
          setProfileUser(fetchedUser);
          applySeverityAccessState(
            fetchedUser.allowedSeverities,
            setSeverityMode,
            setAllowedSeverities,
          );
        } else if (
          tab === 'Sessions' ||
          tab === 'Activity' ||
          tab === 'Security'
        ) {
          const sessionList = await listUserSessions(token, userId);
          if (generation !== tabLoadGenerationRef.current) {
            return;
          }
          setSessions(sortSessionsByLastSeen(sessionList));
        }

        loadedTabsRef.current.add(tab);
      } catch (loadErr) {
        if (generation !== tabLoadGenerationRef.current) {
          return;
        }
        setError(
          loadErr instanceof ApiError ? loadErr.message : 'Unable to load profile data.',
        );
      } finally {
        if (generation === tabLoadGenerationRef.current) {
          setTabLoading(null);
        }
      }
    },
    [token, userId, visible],
  );

  const loadTabDataRef = useRef(loadTabData);
  loadTabDataRef.current = loadTabData;

  useEffect(() => {
    if (!visible || !userId || !token) {
      return;
    }
    setActiveTab('Overview');
    setProfileUser(null);
    setSessions([]);
    setTalkgroupAccess([]);
    setSeverityMode('all');
    setAllowedSeverities([]);
    setExpandedCountyEntryId(null);
    setUserCounties([]);
    setPickerCounties([]);
    setSelectedCountyIds([]);
    setManagingCounties(false);
    setCountySearch('');
    setEditingRole(false);
    tabLoadGenerationRef.current += 1;
    loadedTabsRef.current = new Set();
    setTabLoading(null);
    setError(null);
  }, [visible, userId, token]);

  useEffect(() => {
    if (!visible || !userId || !token) {
      return;
    }
    void loadTabDataRef.current(activeTab);
  }, [activeTab, visible, userId, token]);

  useEffect(() => {
    animateTabFocus(activeTab);
  }, [activeTab, animateTabFocus]);

  const countyMap = useMemo(
    () => new Map(pickerCounties.map(county => [county.id, county.name])),
    [pickerCounties],
  );

  const talkgroupCountyOptions = useMemo(() => {
    const merged = new Map<string, CountyOption>();
    userCounties.forEach(county => merged.set(county.id, county));
    pickerCounties.forEach(county => {
      if (!merged.has(county.id)) {
        merged.set(county.id, county);
      }
    });
    return [...merged.values()];
  }, [pickerCounties, userCounties]);

  const filteredPickerCounties = useMemo(() => {
    const query = countySearch.trim().toLowerCase();
    if (!query) {
      return pickerCounties;
    }
    return pickerCounties.filter(
      county =>
        county.name.toLowerCase().includes(query) ||
        county.code.toLowerCase().includes(query) ||
        county.state.toLowerCase().includes(query),
    );
  }, [countySearch, pickerCounties]);

  if (!user || !userId) {
    return null;
  }

  const displayUser = profileUser ?? user;
  const roleLabel = displayUser.role === 'admin' ? 'Administrator' : 'User';
  const severityEditingDisabled = displayUser.role === 'admin';
  const headerTopSpacing = insets.top + hp(1.2);
  const activeSessions = sessions.filter(session => !session.revokedAt);
  const {presenceStatus: profilePresenceStatus} = summarizeUserSessions(sessions);
  const countyNames = userCounties.map(county => county.name).filter(Boolean);
  const hasCountyAccess = countyNames.length > 0;
  const isTabLoading = tabLoading === activeTab;

  const toggleCounty = (countyId: string) => {
    setSelectedCountyIds(prev =>
      prev.includes(countyId)
        ? prev.filter(id => id !== countyId)
        : [...prev, countyId],
    );
  };

  const handleSaveRole = async () => {
    if (!token || !userId) {
      return;
    }
    setSavingRole(true);
    try {
      const updated = await updateUser(token, userId, {role: draftRole});
      setProfileUser(updated);
      setEditingRole(false);
      onUserUpdatedRef.current?.(updated);
    } catch (saveErr) {
      Alert.alert(
        'Unable to update role',
        saveErr instanceof ApiError ? saveErr.message : 'Please try again.',
      );
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveCounties = async () => {
    if (!token || !userId) {
      return;
    }
    setSavingCounties(true);
    try {
      await assignUserCounties(token, userId, selectedCountyIds);
      const counties = await getUserCounties(token, userId);
      setUserCounties(counties);
      setSelectedCountyIds(counties.map(county => county.id));
      const refreshed = await getUserById(token, userId);
      setProfileUser(refreshed);
      setManagingCounties(false);
      onUserUpdatedRef.current?.(refreshed);
    } catch (saveErr) {
      Alert.alert(
        'Unable to save county access',
        saveErr instanceof ApiError ? saveErr.message : 'Please try again.',
      );
    } finally {
      setSavingCounties(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!token || !userId) {
      return;
    }
    setSessionActionId(sessionId);
    try {
      await revokeUserSession(token, userId, sessionId);
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? {...session, revokedAt: new Date().toISOString()}
            : session,
        ),
      );
    } catch (revokeErr) {
      Alert.alert(
        'Unable to revoke session',
        revokeErr instanceof ApiError ? revokeErr.message : 'Please try again.',
      );
    } finally {
      setSessionActionId(null);
    }
  };

  const handleForcePasswordReset = async () => {
    if (!token || !userId) {
      return;
    }
    setSecurityLoading('reset');
    try {
      const updated = await forcePasswordReset(token, userId);
      const sessionList = sortSessionsByLastSeen(
        await listUserSessions(token, userId),
      );
      setSessions(sessionList);
      setProfileUser(updated);
      loadedTabsRef.current.add('Sessions');
      loadedTabsRef.current.add('Activity');
      loadedTabsRef.current.add('Security');
      onUserUpdatedRef.current?.({
        ...updated,
        ...summarizeUserSessions(sessionList),
      });
      Alert.alert(
        'Password reset sent',
        'A new password was issued and all active sessions were revoked.',
      );
    } catch (resetErr) {
      Alert.alert(
        'Unable to reset password',
        resetErr instanceof ApiError ? resetErr.message : 'Please try again.',
      );
    } finally {
      setSecurityLoading(null);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!token || !userId) {
      return;
    }
    const ids = activeSessions.map(session => session.id);
    if (ids.length === 0) {
      return;
    }
    setSecurityLoading('revokeAll');
    try {
      await Promise.all(ids.map(id => revokeUserSession(token, userId, id)));
      const sessionList = sortSessionsByLastSeen(
        await listUserSessions(token, userId),
      );
      setSessions(sessionList);
      loadedTabsRef.current.add('Sessions');
      onUserUpdatedRef.current?.({
        ...displayUser,
        ...summarizeUserSessions(sessionList),
      });
      Alert.alert('Sessions revoked', 'All active sessions were revoked.');
    } catch (revokeErr) {
      Alert.alert(
        'Unable to revoke all sessions',
        revokeErr instanceof ApiError ? revokeErr.message : 'Please try again.',
      );
    } finally {
      setSecurityLoading(null);
    }
  };

  const handleAddTalkgroup = () => {
    const fallbackCountyId = userCounties[0]?.id ?? pickerCounties[0]?.id ?? '';
    setTalkgroupAccess(prev => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        userId: userId ?? '',
        countyId: fallbackCountyId,
        talkgroupID: '',
        talkgroup: '',
      },
    ]);
  };

  const handleTalkgroupFieldChange = (
    id: string,
    field: 'countyId' | 'talkgroupID' | 'talkgroup',
    value: string,
  ) => {
    setTalkgroupAccess(prev =>
      prev.map(access =>
        access.id === id ? {...access, [field]: value} : access,
      ),
    );
  };

  const toggleAllowedSeverity = (level: FeedSeverityLevel) => {
    setAllowedSeverities(prev =>
      prev.includes(level) ? prev.filter(item => item !== level) : [...prev, level],
    );
  };

  const handleSaveSeverityAccess = async () => {
    const targetUser = profileUser ?? user;
    if (!token || !userId || targetUser.role === 'admin') {
      return;
    }
    if (severityMode === 'restricted' && allowedSeverities.length === 0) {
      Alert.alert(
        'Select severities',
        'Choose at least one of HIGH, MEDIUM, or LOW, or switch to all severities.',
      );
      return;
    }
    setSavingSeverityAccess(true);
    try {
      const updated = await updateUser(token, userId, {
        allowedSeverities:
          severityMode === 'all' ? null : allowedSeverities,
      });
      setProfileUser(updated);
      applySeverityAccessState(
        updated.allowedSeverities,
        setSeverityMode,
        setAllowedSeverities,
      );
      onUserUpdatedRef.current?.(updated);
      Alert.alert('Access saved', 'Feed severity access has been updated.');
    } catch (saveErr) {
      Alert.alert(
        'Unable to save severity access',
        saveErr instanceof ApiError ? saveErr.message : 'Please try again.',
      );
    } finally {
      setSavingSeverityAccess(false);
    }
  };

  const handleRemoveTalkgroup = (id: string) => {
    setTalkgroupAccess(prev => prev.filter(access => access.id !== id));
  };

  const handleSaveTalkgroupAccess = async () => {
    if (!token || !userId) {
      return;
    }
    const payloadAccess = talkgroupAccess
      .filter(access => access.countyId && access.talkgroupID.trim())
      .map(access => ({
        countyId: access.countyId,
        talkgroupID: access.talkgroupID.trim(),
        talkgroup: access.talkgroup.trim() || undefined,
      }));
    setSavingAccess(true);
    try {
      const saved = await assignUserTalkgroupAccess(token, userId, {
        access: payloadAccess,
      });
      setTalkgroupAccess(saved);
      loadedTabsRef.current.delete('Permissions');
      Alert.alert('Access saved', 'Talkgroup access list has been updated.');
    } catch (saveErr) {
      Alert.alert(
        'Unable to save talkgroup access',
        saveErr instanceof ApiError ? saveErr.message : 'Please try again.',
      );
    } finally {
      setSavingAccess(false);
    }
  };

  const sheetAnimatedStyle = {
    opacity: modalEntranceAnim,
    transform: [
      {
        translateY: modalEntranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
    ],
  };

  const headerAnimatedStyle = {
    opacity: modalEntranceAnim,
    transform: [
      {
        translateY: modalEntranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
    ],
  };

  const tabContentAnimatedStyle = {
    opacity: tabContentAnim,
    transform: [
      {
        translateY: tabContentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  const handleTabPress = (tab: ProfileTab) => {
    if (tab === activeTab) {
      return;
    }
    Animated.sequence([
      Animated.timing(tabContentAnim, {
        toValue: 0,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(tabContentAnim, {
        toValue: 1,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (activeTab === 'Overview') {
      return (
        <>
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileSectionTitle}>Account details</Text>
            <View style={styles.profileRowBlock}>
              <Text style={styles.profileLabel}>Email address</Text>
              <Text style={styles.profileValue}>{displayUser.email}</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileRowBlock}>
              <View style={styles.profileLabelRow}>
                <Text style={styles.profileLabel}>Role</Text>
                {!editingRole ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setDraftRole(displayUser.role);
                      setEditingRole(true);
                    }}
                  >
                    <Text style={styles.profileLinkText}>Edit</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {editingRole ? (
                <View style={styles.profileRoleOptions}>
                  {ROLE_OPTIONS.map(option => {
                    const isActive = option.value === draftRole;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.profileRoleOption,
                          isActive && styles.profileRoleOptionActive,
                        ]}
                        onPress={() => setDraftRole(option.value)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.profileRoleOptionText,
                            isActive && styles.profileRoleOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.profileValue}>{roleLabel}</Text>
              )}
              {editingRole ? (
                <View style={styles.profileInlineActions}>
                  <TouchableOpacity
                    style={[styles.profileOutlineButton, styles.profileActionFlex]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setDraftRole(displayUser.role);
                      setEditingRole(false);
                    }}
                  >
                    <Text
                      style={styles.profileOutlineButtonText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profilePrimaryButton, styles.profileActionFlex]}
                    activeOpacity={0.9}
                    onPress={handleSaveRole}
                    disabled={savingRole}
                  >
                    <Text
                      style={styles.profilePrimaryButtonText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {savingRole ? 'Saving...' : 'Save role'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileRowBlock}>
              <Text style={styles.profileLabel}>User ID</Text>
              <View style={styles.userIdPill}>
                <Text style={styles.profileIdText}>{displayUser.id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileSectionCard}>
            <View style={styles.profileLabelRow}>
              <Text style={styles.profileSectionSubtitle}>County access</Text>
              {!managingCounties ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setManagingCounties(true)}
                >
                  <Text style={styles.profileLinkText}>Manage</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {managingCounties ? (
              <>
                <TextInput
                  style={styles.profileCountySearch}
                  value={countySearch}
                  onChangeText={setCountySearch}
                  placeholder="Search counties..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                />
                <View style={styles.profileCountyGrid}>
                  {filteredPickerCounties.map(county => {
                    const checked = selectedCountyIds.includes(county.id);
                    return (
                      <TouchableOpacity
                        key={county.id}
                        style={[
                          styles.profileCountyItem,
                          checked && styles.profileCountyItemSelected,
                        ]}
                        onPress={() => toggleCounty(county.id)}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.profileCountyCheck,
                            checked && styles.profileCountyCheckSelected,
                          ]}
                        >
                          {checked ? (
                            <Icon name="check" size={11} color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text style={styles.profileCountyName} numberOfLines={1}>
                          {county.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.profileInlineActions}>
                  <TouchableOpacity
                    style={[styles.profileOutlineButton, styles.profileActionFlex]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedCountyIds(userCounties.map(county => county.id));
                      setManagingCounties(false);
                      setCountySearch('');
                    }}
                  >
                    <Text
                      style={styles.profileOutlineButtonText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profilePrimaryButton, styles.profileActionFlex]}
                    activeOpacity={0.9}
                    onPress={handleSaveCounties}
                    disabled={savingCounties}
                  >
                    <Text
                      style={styles.profilePrimaryButtonText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {savingCounties ? 'Saving...' : 'Save counties'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.profileSubtleText}>
                {hasCountyAccess
                  ? countyNames.join(', ')
                  : 'No counties assigned to this profile yet.'}
              </Text>
            )}
          </View>
        </>
      );
    }

    if (activeTab === 'Permissions') {
      return (
        <View style={styles.permissionsStack}>
          <View style={styles.profileSectionCard}>
            <View style={styles.profileSectionHeaderRow}>
              <View style={styles.profileSectionHeaderTextWrap}>
                <Text style={styles.profileHeading}>Feed severity access</Text>
                <Text style={styles.profileSubtleText}>
                  Controls which flagged audio (by max severity) appears in feeds for
                  this user. Filtering is enforced on the server. Audio with no max
                  severity is hidden when access is restricted.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.profileOutlineButton, styles.profileOutlineButtonCompact]}
                activeOpacity={0.85}
                onPress={() => loadTabData('Permissions', true)}
              >
                <View style={styles.profileReloadRow}>
                  <Icon name="rotate-cw" size={14} color={colors.text} />
                  <Text style={styles.profileOutlineButtonText}>Reload</Text>
                </View>
              </TouchableOpacity>
            </View>

            {severityEditingDisabled ? (
              <View style={styles.infoAlertCard}>
                <Text style={styles.infoAlertText}>
                  Administrators always see all severities. allowedSeverities is
                  ignored for admin accounts.
                </Text>
              </View>
            ) : (
              <>
            <TouchableOpacity
              style={[
                styles.severityModeCard,
                severityMode === 'all' && styles.severityModeCardActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setSeverityMode('all')}
              disabled={severityEditingDisabled}
            >
              <Text style={styles.severityModeTitle}>All severities</Text>
              <Text style={styles.severityModeHint}>
                User sees HIGH, MEDIUM, and LOW flagged audio (null or empty list =
                unrestricted).
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.severityModeCard,
                severityMode === 'restricted' && styles.severityModeCardActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setSeverityMode('restricted')}
              disabled={severityEditingDisabled}
            >
              <Text style={styles.severityModeTitle}>Restrict to selected levels</Text>
              <Text style={styles.severityModeHint}>
                Only audio whose max severity is in the list is shown (e.g. HIGH,
                MEDIUM). LOW will not appear if it is not selected.
              </Text>
            </TouchableOpacity>

            {severityMode === 'restricted' ? (
              <View style={styles.severityPickerCard}>
                <Text style={styles.severityPickerTitle}>ALLOWED MAX SEVERITIES</Text>
                {FEED_SEVERITY_LEVELS.map(level => {
                  const checked = allowedSeverities.includes(level);
                  const levelStyle = severityLevelStyles(level, styles);
                  return (
                    <TouchableOpacity
                      key={level}
                      style={styles.severityOptionRow}
                      activeOpacity={0.85}
                      onPress={() => toggleAllowedSeverity(level)}
                      disabled={severityEditingDisabled}
                    >
                      <View
                        style={[
                          styles.profileCountyCheck,
                          checked && styles.profileCountyCheckSelected,
                        ]}
                      >
                        {checked ? (
                          <Icon name="check" size={11} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <View style={levelStyle.badge}>
                        <Text style={[levelStyle.text, styles.severityLevelBadgeText]}>
                          {severityDisplayLabel(level)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.profilePrimaryButton, styles.profilePrimaryButtonFull]}
              activeOpacity={0.9}
              onPress={handleSaveSeverityAccess}
              disabled={savingSeverityAccess || severityEditingDisabled}
            >
              <Text
                style={styles.profilePrimaryButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {savingSeverityAccess ? 'Saving...' : 'Save severity access'}
              </Text>
            </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.profileSectionCard}>
            <View style={styles.profileSectionHeaderRow}>
              <View style={styles.profileSectionHeaderTextWrap}>
                <Text style={styles.profileHeading}>Talkgroup allowlist</Text>
                <Text style={styles.profileSubtleText}>
                  Restrict which talkgroups this user can access per county. Saving
                  replaces the full list.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.profileOutlineButton, styles.profileOutlineButtonCompact]}
                activeOpacity={0.85}
                onPress={() => loadTabData('Permissions', true)}
              >
                <View style={styles.profileReloadRow}>
                  <Icon name="rotate-cw" size={14} color={colors.text} />
                  <Text style={styles.profileOutlineButtonText}>Reload</Text>
                </View>
              </TouchableOpacity>
            </View>

            {talkgroupAccess.length === 0 ? (
              <View style={styles.profilePlaceholderCard}>
                <Text style={styles.profilePlaceholderText}>
                  No talkgroup restrictions — user can access all talkgroups in assigned
                  counties.
                </Text>
              </View>
            ) : (
              <View style={styles.profileTalkgroupList}>
                {talkgroupAccess.map((access, index) => {
                  const countyName =
                    countyMap.get(access.countyId) ??
                    talkgroupCountyOptions.find(c => c.id === access.countyId)?.name ??
                    'Select county';
                  const countyPickerOpen = expandedCountyEntryId === access.id;
                  return (
                    <View key={access.id} style={styles.profileTalkgroupItem}>
                      <View style={styles.profileTalkgroupHeader}>
                        <Text style={styles.profileTalkgroupEntryLabel}>
                          ENTRY {index + 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTalkgroup(access.id)}
                          hitSlop={responsiveHitSlop(1.2)}
                        >
                          <Icon name="trash-2" size={15} color="#F87171" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.profileFieldLabel}>County</Text>
                      <TouchableOpacity
                        style={styles.profileCountySelect}
                        activeOpacity={0.85}
                        onPress={() =>
                          setExpandedCountyEntryId(prev =>
                            prev === access.id ? null : access.id,
                          )
                        }
                      >
                        <Text style={styles.profileCountySelectText} numberOfLines={1}>
                          {countyName}
                        </Text>
                        <Icon
                          name={countyPickerOpen ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                      {countyPickerOpen ? (
                        <View style={styles.profileCountyOptions}>
                          {talkgroupCountyOptions.map(county => {
                            const selected = access.countyId === county.id;
                            return (
                              <TouchableOpacity
                                key={county.id}
                                style={[
                                  styles.profileCountyOptionChip,
                                  selected && styles.profileCountyOptionChipActive,
                                ]}
                                onPress={() => {
                                  handleTalkgroupFieldChange(
                                    access.id,
                                    'countyId',
                                    county.id,
                                  );
                                  setExpandedCountyEntryId(null);
                                }}
                                activeOpacity={0.85}
                              >
                                <Text
                                  style={[
                                    styles.profileCountyOptionChipText,
                                    selected &&
                                      styles.profileCountyOptionChipTextActive,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {county.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : null}

                      <Text style={styles.profileFieldLabel}>Talkgroup ID</Text>
                      <TextInput
                        value={access.talkgroupID}
                        onChangeText={value =>
                          handleTalkgroupFieldChange(access.id, 'talkgroupID', value)
                        }
                        placeholder="1147"
                        placeholderTextColor={colors.textMuted}
                        style={styles.profileTalkgroupInput}
                        autoCapitalize="none"
                      />

                      <Text style={styles.profileFieldLabel}>Talkgroup name</Text>
                      <TextInput
                        value={access.talkgroup}
                        onChangeText={value =>
                          handleTalkgroupFieldChange(access.id, 'talkgroup', value)
                        }
                        placeholder="AFD Locution"
                        placeholderTextColor={colors.textMuted}
                        style={styles.profileTalkgroupInput}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.profileGhostCard}
              activeOpacity={0.85}
              onPress={handleAddTalkgroup}
            >
              <Text style={styles.profileGhostCardText}>+ Add talkgroup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.profilePrimaryButton, styles.profilePrimaryButtonFull]}
              activeOpacity={0.9}
              onPress={handleSaveTalkgroupAccess}
              disabled={savingAccess}
            >
              <Text
                style={styles.profilePrimaryButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {savingAccess ? 'Saving...' : 'Save talkgroup access'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (activeTab === 'Sessions') {
      if (activeSessions.length === 0) {
        return (
          <View style={styles.profilePlaceholderCard}>
            <Text style={styles.profilePlaceholderText}>No active sessions.</Text>
          </View>
        );
      }

      return (
        <>
          <View style={styles.profileSectionHeaderInline}>
            <Text style={styles.profileSectionHeading}>Active Sessions</Text>
            <View style={styles.activeCountPill}>
              <Text
                style={styles.activeCountText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {activeSessions.length} active{' '}
                {activeSessions.length === 1 ? 'session' : 'sessions'}
              </Text>
            </View>
          </View>
          {activeSessions.map((session, idx) => (
            <View key={session.id} style={styles.profileSectionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTitleWrap}>
                  <Text style={styles.sessionTitle}>{formatDeviceLabel(session)}</Text>
                  {displayUser.email === currentEmail && idx === 0 ? (
                    <Text style={styles.currentSessionDot}>Current Session</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.revokeButton}
                  activeOpacity={0.85}
                  onPress={() => handleRevokeSession(session.id)}
                  disabled={sessionActionId === session.id}
                >
                  <Text style={styles.revokeButtonText}>
                    {sessionActionId === session.id ? 'Revoking...' : 'Revoke'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sessionGrid}>
                <View style={styles.sessionGridCell}>
                  <Text style={styles.profileLabel}>IP address</Text>
                  <Text style={styles.profileValue} numberOfLines={1}>
                    {session.ipAddress || '-'}
                  </Text>
                </View>
                <View style={styles.sessionGridCell}>
                  <Text style={styles.profileLabel}>Last seen</Text>
                  <Text style={styles.profileValue} numberOfLines={1}>
                    {formatLastSeenLabel(session.lastSeenAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.sessionSignedRow}>
                <Text style={styles.profileLabel}>Signed in</Text>
                <Text style={styles.profileValue}>
                  {formatSessionDate(session.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </>
      );
    }

    if (activeTab === 'Security') {
      return (
        <>
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileHeading}>Force password reset</Text>
            <Text style={styles.profileSubtleText}>
              Generates a new password, emails it to the user, and revokes all active
              sessions.
            </Text>
            <TouchableOpacity
              style={styles.profileOutlineDangerButton}
              activeOpacity={0.85}
              onPress={handleForcePasswordReset}
              disabled={securityLoading === 'reset'}
            >
              <Text
                style={styles.profileOutlineDangerButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {securityLoading === 'reset' ? 'Sending...' : 'Email new password'}
              </Text>
            </TouchableOpacity>
            <View style={styles.infoAlertCard}>
              <Text style={styles.infoAlertText}>
                The user must use the emailed password on next sign-in.
              </Text>
            </View>
          </View>
          <View style={styles.profileSectionCard}>
            <Text style={styles.profileHeading}>Revoke all sessions</Text>
            <Text style={styles.profileSubtleText}>
              Sign the user out of every active session without changing their password.
            </Text>
            <TouchableOpacity
              style={styles.profileOutlineDangerButton}
              activeOpacity={0.85}
              onPress={handleRevokeAllSessions}
              disabled={securityLoading === 'revokeAll' || activeSessions.length === 0}
            >
              <Text
                style={styles.profileOutlineDangerButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {securityLoading === 'revokeAll' ? 'Revoking...' : 'Revoke all sessions'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (sessions.length === 0) {
      return (
        <View style={styles.profilePlaceholderCard}>
          <Text style={styles.profilePlaceholderText}>No session activity yet.</Text>
        </View>
      );
    }

    return (
      <View style={styles.profileTimelineWrap}>
        {sessions.map((session, idx) => (
          <View key={session.id} style={styles.timelineItem}>
            <View style={styles.timelineColumn}>
              <View style={styles.timelineDot} />
              {idx !== sessions.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.timelineCard}>
              <Text style={styles.sessionTitle}>{formatDeviceLabel(session)}</Text>
              <View style={styles.sessionSignedRow}>
                <Text style={styles.profileLabel}>Last seen</Text>
                <Text style={styles.profileValue}>{formatLastSeenLabel(session.lastSeenAt)}</Text>
              </View>
              <View style={styles.sessionSignedRow}>
                <Text style={styles.profileLabel}>Signed in</Text>
                <Text style={styles.profileValue}>
                  {formatSessionDate(session.createdAt)}
                </Text>
              </View>
              <View style={styles.sessionSignedRow}>
                <Text style={styles.profileLabel}>IP address</Text>
                <Text style={styles.profileValue}>{session.ipAddress || '-'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.profileOverlay}>
        <Animated.View style={[styles.profileSheet, sheetAnimatedStyle]}>
          <Animated.View
            style={[styles.profileHeader, headerAnimatedStyle, {paddingTop: headerTopSpacing}]}
          >
            <View style={styles.profileHeaderMain}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {userInitial(displayUser.email)}
                </Text>
              </View>
              <View style={styles.profileHeaderTextWrap}>
                <Text style={styles.profileNameText} numberOfLines={1}>
                  {displayUser.email.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.profileEmailText} numberOfLines={1}>
                  {displayUser.email}
                </Text>
                <Text style={styles.profileIdSubtext} numberOfLines={1}>
                  {displayUser.id}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.profileBadgesRow, headerAnimatedStyle]}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                {presenceLabel(profilePresenceStatus)}
              </Text>
            </View>
            <View style={styles.administratorBadge}>
              <Text style={styles.administratorBadgeText}>{roleLabel}</Text>
            </View>
          </Animated.View>

          <Animated.View style={headerAnimatedStyle}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.profileTabsScrollView}
              contentContainerStyle={styles.profileTabsContent}
              bounces={false}
            >
              {PROFILE_TABS.map((tab, index) => {
                const isActive = tab === activeTab;
                const tabAnimatedStyle = {
                  opacity: tabFocusAnim.interpolate({
                    inputRange: [index - 1, index, index + 1],
                    outputRange: [0.68, 1, 0.68],
                    extrapolate: 'clamp',
                  }),
                };
                return (
                  <Animated.View key={tab} style={tabAnimatedStyle}>
                    <TouchableOpacity
                      onPress={() => handleTabPress(tab)}
                      style={[
                        styles.profileTabItem,
                        isActive && styles.profileTabActive,
                      ]}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.profileTabText,
                          isActive && styles.profileTabTextActive,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {profileTabLabel(tab, compactProfileTabs)}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>

          <ScrollView
            style={styles.profileContent}
            contentContainerStyle={styles.profileContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileTabContentWrap}>
              <Animated.View style={[styles.profileTabContent, tabContentAnimatedStyle]}>
                {renderTabContent()}
              </Animated.View>
              {isTabLoading ? (
                <View style={styles.profileLoadingOverlay}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : null}
            </View>
            {error ? <Text style={styles.profileErrorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.closeProfileButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeProfileButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const LeadLogScreen = () => {
  const {isAdmin} = useRole();
  const {token} = useAuth();
  const openNotifications = useOpenNotifications();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const premium = useMemo(() => createPremium(colors), [colors]);
  const insets = useSafeAreaInsets();
  const currentEmail = useAppSelector(state => state.user.email) ?? '';
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [countyOptions, setCountyOptions] = useState<CountyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const listBottomInset = insets.bottom + TAB_BAR_HEIGHT + hp(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All Roles');
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserRecord | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const searchAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(0)).current;
  const itemAnimsRef = useRef<Record<string, Animated.Value>>({});

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter(user => {
      const matchesSearch =
        !query || user.email.toLowerCase().includes(query);
      const matchesRole =
        roleFilter === 'All Roles' ||
        user.role === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [searchQuery, roleFilter, users]);

  const getItemAnim = (id: string) => {
    if (!itemAnimsRef.current[id]) {
      itemAnimsRef.current[id] = new Animated.Value(0);
    }
    return itemAnimsRef.current[id];
  };

  const animateUserList = (items: UserRecord[]) => {
    const anims = items.map(item => {
      const anim = getItemAnim(item.id);
      anim.setValue(0);
      return anim;
    });
    if (anims.length === 0) {
      return;
    }
    Animated.stagger(
      70,
      anims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(searchAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(180),
        Animated.spring(fabAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [searchAnim, fabAnim, fabPulse]);

  useEffect(() => {
    animateUserList(filteredUsers);
  }, [filteredUsers]);

  const loadUsers = useCallback(async () => {
    if (!token || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const [userResults, counties] = await Promise.all([
        searchUsers(token, {
          limit: 200,
          search: searchQuery.trim() || undefined,
          role:
            roleFilter === 'All Roles'
              ? undefined
              : roleFilter.toLowerCase(),
        }),
        listCounties(token),
      ]);
      setUsers(userResults);
      setCountyOptions(counties);
      void enrichUsersWithSessionSummaries(token, userResults).then(enriched => {
        setUsers(enriched);
      });
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : 'Unable to load users.',
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin, roleFilter, searchQuery, token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingUser(null);
  };

  const openProfile = (user: UserRecord) => {
    setSelectedProfileUser(user);
    setProfileVisible(true);
  };

  const closeProfile = () => {
    setProfileVisible(false);
  };

  const handleProfileUserUpdated = useCallback((updated: UserRecord) => {
    setSelectedProfileUser(updated);
    setUsers(prev =>
      prev.map(item =>
        item.id === updated.id
          ? {
              ...item,
              email: updated.email,
              role: updated.role,
              counties: updated.counties,
              createdAt: updated.createdAt,
              allowedSeverities: updated.allowedSeverities,
            }
          : item,
      ),
    );
  }, []);

  const handleSaveUser = async (
    updated: UserRecord,
    countyIds: string[],
  ) => {
    if (!token) {
      return;
    }

    try {
      const saved = await updateUser(token, updated.id, {
        email: updated.email,
        role: updated.role,
      });
      await assignUserCounties(token, updated.id, countyIds);
      setUsers(prev =>
        prev.map(u => {
          if (u.id !== updated.id) {
            return u;
          }
          return {
            ...saved,
            counties: countyIds
              .map(id => countyOptions.find(c => c.id === id)?.name)
              .filter((name): name is string => Boolean(name)),
            lastSeenAt: u.lastSeenAt,
            activeSessionCount: u.activeSessionCount,
            presenceStatus: u.presenceStatus,
            allowedSeverities: u.allowedSeverities,
          };
        }),
      );
      closeEditModal();
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof ApiError ? error.message : 'Unable to update user.',
      );
    }
  };

  const handleCreateUser = async (user: UserRecord) => {
    if (!token) {
      return;
    }

    try {
      const created = await createUser(token, {
        email: user.email,
        role: user.role,
      });
      setUsers(prev => [created, ...prev]);
      setAddModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Create failed',
        error instanceof ApiError ? error.message : 'Unable to create user.',
      );
    }
  };

  const handleDeleteUser = (user: UserRecord) => {
    if (user.email === currentEmail) {
      return;
    }
    Alert.alert('Delete User', `Remove ${user.email} from FireRelay?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await deleteUser(token, user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
          } catch (error) {
            Alert.alert(
              'Delete failed',
              error instanceof ApiError
                ? error.message
                : 'Unable to delete user.',
            );
          }
        },
      },
    ]);
  };

  const searchBarStyle = {
    opacity: searchAnim,
    transform: [
      {
        translateY: searchAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-14, 0],
        }),
      },
      {
        scale: searchAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  const fabStyle = {
    opacity: fabAnim,
    transform: [
      {
        scale: fabAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 1],
        }),
      },
    ],
  };

  const fabRingStyle = {
    opacity: fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.85],
    }),
    transform: [
      {
        scale: fabPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  const renderUserCard = ({item}: {item: UserRecord}) => (
    <UserListItem
      item={item}
      entranceAnim={getItemAnim(item.id)}
      isCurrentUser={item.email === currentEmail}
      canManage={isAdmin}
      onEdit={openEditModal}
      onDelete={handleDeleteUser}
      onOpenProfile={openProfile}
    />
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.searchRow, searchBarStyle]}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={18}
            color={premium.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by email..."
            placeholderTextColor={premium.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        {isAdmin ? (
          <Animated.View style={[styles.addButtonWrap, fabStyle]}>
            <Animated.View
              style={[styles.addButtonRing, fabRingStyle]}
              pointerEvents="none"
            />
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.9}
              onPress={() => setAddModalVisible(true)}
            >
              <Icon name="plus" size={22} color={colors.textOnPrimary} />
            </TouchableOpacity>
          </Animated.View>
        ) : null}

        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={openNotifications}
          hitSlop={responsiveHitSlop(2)}
        >
          <Image
            source={images.notification}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      {isAdmin ? (
        <View style={styles.roleChipsRow}>
          {ROLE_FILTER_OPTIONS.map(option => {
            const isActive = option === roleFilter;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.roleChip, isActive && styles.roleChipActive]}
                onPress={() => setRoleFilter(option)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    isActive && styles.roleChipTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      <FlatList
        style={styles.list}
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={renderUserCard}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: listBottomInset},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={<View style={styles.listFooter} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.emptyStateText}>
                {loadError ?? 'No users match your filters.'}
              </Text>
            )}
          </View>
        }
      />

      <UserProfileModal
        visible={profileVisible}
        user={selectedProfileUser}
        token={token}
        currentEmail={currentEmail}
        onClose={closeProfile}
        onUserUpdated={handleProfileUserUpdated}
      />

      {isAdmin ? (
        <>
          <AddUserModal
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onCreate={handleCreateUser}
          />

          <EditUserModal
            visible={editModalVisible}
            user={editingUser}
            countyOptions={countyOptions}
            onClose={closeEditModal}
            onSave={handleSaveUser}
          />
        </>
      ) : null}
    </View>
  );
};

export default LeadLogScreen;
