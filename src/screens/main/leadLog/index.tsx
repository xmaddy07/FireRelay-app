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
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {images} from '../../../config/constants';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {useAppSelector} from '../../../redux/hooks';
import {useRole} from '../../../hooks/useRole';
import {
  ApiError,
  assignUserCounties,
  createUser,
  deleteUser,
  listCounties,
  searchUsers,
  updateUser,
  type CountyOption,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import {hp, responsiveHitSlop, wp} from '../../../utils/responsive';
import {useOpenNotifications} from '../../../navigation/hooks';
import {createPremium, createStyles, TAB_BAR_HEIGHT} from './styles';
import {RoleFilter, UserRecord, UserRole} from './types';

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
};

const UserListItem = ({
  item,
  entranceAnim,
  isCurrentUser,
  canManage,
  onEdit,
  onDelete,
}: UserListItemProps) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const premium = useMemo(() => createPremium(colors), [colors]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const roleBadge = getRoleBadgeStyle(item.role, styles);
  const canDelete = !isCurrentUser;

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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.userCard}
      >
        <View style={styles.userCardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.emailRow}>
              <View style={styles.emailTextWrap}>
                <Text
                  style={styles.emailText}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {item.email}
                </Text>
              </View>
              {isCurrentUser ? (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>YOU</Text>
                </View>
              ) : null}
            </View>

            {canManage ? (
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(item)}
                  activeOpacity={0.75}
                  hitSlop={responsiveHitSlop(1.6)}
                >
                  <Icon name="edit-2" size={15} color="#60A5FA" />
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
                    size={15}
                    color={canDelete ? '#F87171' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View style={[styles.roleBadge, roleBadge.container]}>
            <Text style={[styles.roleBadgeText, roleBadge.text]}>
              {roleBadge.label}
            </Text>
          </View>

          <View style={styles.userCardBottom}>
            <View style={styles.createdRow}>
              <Icon name="calendar" size={13} color={premium.textMuted} />
              <Text style={styles.createdText} numberOfLines={1}>
                {formatCreatedDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
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
      const withCounties: UserRecord = {
        ...saved,
        counties: countyIds
          .map(id => countyOptions.find(c => c.id === id)?.name)
          .filter((name): name is string => Boolean(name)),
      };
      setUsers(prev =>
        prev.map(u => (u.id === updated.id ? withCounties : u)),
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
