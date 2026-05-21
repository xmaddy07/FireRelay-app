import React, {useEffect, useMemo, useRef, useState} from 'react';
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
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {images} from '../../../constants';
import {useTheme, useThemedStyles} from '../../../theme';
import {useAppSelector} from '../../../redux/hooks';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import {hp, responsiveHitSlop, wp} from '../../../utils/responsive';
import {useOpenNotifications} from '../../../navigation/hooks';
import {createPremium, createStyles, TAB_BAR_HEIGHT} from './styles';
import {RoleFilter, UserRecord, UserRole} from './types';

const INITIAL_USERS: UserRecord[] = [
  {
    id: '1',
    email: 'matt.shelton@firerelay.com',
    role: 'admin',
    createdAt: '2024-03-12T10:30:00Z',
    counties: ['Travis', 'Wilco'],
  },
  {
    id: '2',
    email: 'test@gmail.com',
    role: 'user',
    createdAt: '2024-06-01T14:20:00Z',
    counties: ['Travis'],
  },
  {
    id: '3',
    email: 'test@firerelay.com',
    role: 'admin',
    createdAt: '2024-08-19T09:15:00Z',
    counties: ['McLennan', 'Harris'],
  },
  {
    id: '4',
    email: 'evan.mayeux@gmail.com',
    role: 'admin',
    createdAt: '2023-11-14T16:45:00Z',
    counties: ['Travis', 'Wilco', 'McLennan'],
  },
];

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
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
};

const UserListItem = ({
  item,
  entranceAnim,
  isCurrentUser,
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

const UsersScreen = () => {
  const openNotifications = useOpenNotifications();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const premium = useMemo(() => createPremium(colors), [colors]);
  const insets = useSafeAreaInsets();
  const currentEmail =
    useAppSelector(state => state.user.email) || 'matt.shelton@firerelay.com';
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);

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

  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingUser(null);
  };

  const handleSaveUser = (updated: UserRecord) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  const handleCreateUser = (user: UserRecord) => {
    setUsers(prev => [user, ...prev]);
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
        onPress: () => {
          setUsers(prev => prev.filter(u => u.id !== user.id));
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
            <Text style={styles.emptyStateText}>
              No users match your filters.
            </Text>
          </View>
        }
      />

      <AddUserModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onCreate={handleCreateUser}
      />

      <EditUserModal
        visible={editModalVisible}
        user={editingUser}
        onClose={closeEditModal}
        onSave={handleSaveUser}
      />
    </View>
  );
};

export default UsersScreen;
