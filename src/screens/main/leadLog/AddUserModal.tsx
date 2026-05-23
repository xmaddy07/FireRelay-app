import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {ROLE_OPTIONS, UserRecord, UserRole} from './types';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {createPremium} from './styles';
import {createEditModalStyles} from './editUserModal.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (user: UserRecord) => void;
};

const AddUserModal = ({visible, onClose, onCreate}: Props) => {
  const {colors} = useTheme();
  const premium = useMemo(() => createPremium(colors), [colors]);
  const s = useThemedStyles(createEditModalStyles);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [roleOpen, setRoleOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setRole('user');
      setRoleOpen(false);
    }
  }, [visible]);

  const roleLabel =
    ROLE_OPTIONS.find(option => option.value === role)?.label ?? 'User';

  const handleCreate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      return;
    }
    onCreate({
      id: `user-${Date.now()}`,
      email: trimmed,
      role,
      createdAt: new Date().toISOString(),
      counties: [],
    });
    onClose();
  };

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
              <Text style={s.headerTitle}>Add New User</Text>
              <TouchableOpacity
                style={s.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Icon name="x" size={20} color={premium.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={s.bodyCompact}>
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
                placeholder="user@example.com"
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
            </View>

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
                onPress={handleCreate}
                activeOpacity={0.85}
              >
                <Text style={s.updateButtonText}>Create User</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddUserModal;
