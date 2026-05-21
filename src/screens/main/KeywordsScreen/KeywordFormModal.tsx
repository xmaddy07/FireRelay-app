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
import {useTheme, useThemedStyles} from '../../../theme';
import {createPremium} from './styles';
import {createKeywordModalStyles} from './keywordModal.styles';
import type {KeywordDescriptionLevel, KeywordRecord} from './types';

type Props = {
  visible: boolean;
  mode: 'add' | 'edit';
  keyword: KeywordRecord | null;
  onClose: () => void;
  onSubmit: (keyword: KeywordRecord) => void;
};

const deriveDescriptionMeta = (description: string) => {
  const trimmed = description.trim();
  const isCritical = trimmed.toUpperCase() === 'CRITICAL';
  const descriptionLevel: KeywordDescriptionLevel = isCritical
    ? 'critical'
    : 'normal';
  return {description: trimmed, descriptionLevel, isCritical};
};

const KeywordFormModal = ({
  visible,
  mode,
  keyword,
  onClose,
  onSubmit,
}: Props) => {
  const {colors} = useTheme();
  const premium = useMemo(() => createPremium(colors), [colors]);
  const s = useThemedStyles(createKeywordModalStyles);

  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Keyword' : 'Add New Keyword';
  const submitLabel = isEdit ? 'Update' : 'Create';
  const canSubmit = name.trim().length > 0;

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (isEdit && keyword) {
      setName(keyword.name);
      setActive(keyword.active);
      setDescription(keyword.description);
      return;
    }
    setName('');
    setActive(true);
    setDescription('');
  }, [visible, isEdit, keyword]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const meta = deriveDescriptionMeta(description);

    if (isEdit && keyword) {
      onSubmit({
        ...keyword,
        name: trimmedName,
        active,
        ...meta,
      });
    } else {
      onSubmit({
        id: `keyword-${Date.now()}`,
        name: trimmedName,
        active,
        createdAt: new Date().toISOString().slice(0, 10),
        ...meta,
      });
    }
    onClose();
  };

  if (isEdit && !keyword) {
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
                Keyword <Text style={s.required}>*</Text>
              </Text>
              <TextInput
                style={s.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter keyword"
                placeholderTextColor={premium.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={s.activeRow}
                onPress={() => setActive(prev => !prev)}
                activeOpacity={0.8}
              >
                <View
                  style={[s.checkbox, active && s.checkboxChecked]}
                >
                  {active ? (
                    <Icon name="check" size={14} color={colors.textOnPrimary} />
                  ) : null}
                </View>
                <Text style={s.activeLabel}>Active</Text>
              </TouchableOpacity>

              <Text style={s.fieldLabel}>Description</Text>
              <TextInput
                style={[s.textInput, s.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Optional description"
                placeholderTextColor={premium.textMuted}
                multiline
                numberOfLines={4}
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

export default KeywordFormModal;
