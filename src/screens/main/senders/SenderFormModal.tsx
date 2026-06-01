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
import {useTheme, useThemedStyles} from '../../../config/theme';
import {createPremium} from './styles';
import {createSenderModalStyles} from './senderModal.styles';
import type {SenderRecord, SenderStatus} from './types';

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  sender: SenderRecord | null;
  onClose: () => void;
  onSubmit: (sender: SenderRecord) => void;
};

const STATUS_OPTIONS: {label: string; value: SenderStatus}[] = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
  {label: 'Disabled', value: 'disabled'},
];

const SenderFormModal = ({
  visible,
  mode,
  sender,
  onClose,
  onSubmit,
}: Props) => {
  const {colors} = useTheme();
  const premium = useMemo(() => createPremium(colors), [colors]);
  const s = useThemedStyles(createSenderModalStyles);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SenderStatus>('active');

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Sender' : 'Add Sender';
  const submitLabel = isEdit ? 'Update' : 'Create';
  const canSubmit = name.trim().length > 0;

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (isEdit && sender) {
      setName(sender.name);
      setDescription(sender.description ?? '');
      setStatus(sender.status);
      return;
    }
    setName('');
    setDescription('');
    setStatus('active');
  }, [visible, isEdit, sender]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const payload: SenderRecord = {
      id: sender?.id ?? '',
      name: trimmedName,
      description: description.trim() || undefined,
      status,
      token: sender?.token ?? '',
      createdAt: sender?.createdAt ?? new Date().toISOString(),
      email: sender?.email,
      domain: sender?.domain,
    };

    onSubmit(payload);
    onClose();
  };

  if (isEdit && !sender) {
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
              <Text style={s.headerTitle}>{title}</Text>
            </View>

            <View style={s.body}>
              <Text style={s.fieldLabel}>
                Name <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter sender name"
                placeholderTextColor={premium.textMuted}
                autoCapitalize="words"
              />

              <Text style={s.fieldLabel}>Status</Text>
              <View style={s.statusRow}>
                {STATUS_OPTIONS.map(option => {
                  const isActive = status === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        s.statusOption,
                        isActive && s.statusOptionActive,
                      ]}
                      onPress={() => setStatus(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          s.statusOptionText,
                          isActive && s.statusOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.fieldLabel}>Description</Text>
              <TextInput
                style={[s.textInput, s.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor={premium.textMuted}
                multiline
                numberOfLines={3}
              />
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
                style={[
                  s.submitButton,
                  !canSubmit && s.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!canSubmit}
              >
                <Text style={s.submitButtonText}>{submitLabel}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SenderFormModal;
