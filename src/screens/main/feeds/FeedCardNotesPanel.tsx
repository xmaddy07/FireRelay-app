import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  createAudioNote,
  deleteAudioNote,
  listAudioNotes,
  updateAudioNote,
  type AudioNoteRecord,
} from '../../../api';
import {useAppDialog} from '../../../context';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {useAppSelector} from '../../../redux/hooks';
import {responsiveHitSlop} from '../../../utils/responsive';
import {createStyles} from './styles';

type Props = {
  audioId: string;
  expanded: boolean;
  token?: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onNotesCountChange?: (count: number) => void;
};

const formatNoteAddedDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const resolveNoteAuthorName = (
  note: AudioNoteRecord,
  currentUserId?: string,
  currentUserName?: string,
) => {
  if (note.authorLabel?.trim()) {
    return note.authorLabel.trim();
  }
  if (currentUserId && note.authorId === currentUserId && currentUserName?.trim()) {
    return currentUserName.trim();
  }
  if (note.authorEmail?.includes('@')) {
    return note.authorEmail.split('@')[0];
  }
  return undefined;
};

const FeedCardNotesPanel = ({
  audioId,
  expanded,
  token,
  currentUserId,
  isAdmin = false,
  onNotesCountChange,
}: Props) => {
  const {confirm, showError} = useAppDialog();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const currentUserName = useAppSelector(state => state.user.name);
  const [notes, setNotes] = useState<AudioNoteRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const canModifyNote = useCallback(
    (note: AudioNoteRecord) =>
      isAdmin ||
      Boolean(
        currentUserId && note.authorId && note.authorId === currentUserId,
      ),
    [currentUserId, isAdmin],
  );

  const refreshNotes = useCallback(async () => {
    if (!token || !expanded) {
      return;
    }

    setLoading(true);
    try {
      const loaded = await listAudioNotes(token, audioId);
      setNotes(loaded);
      setHasLoaded(true);
    } catch (error) {
      showError('Could not load notes', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [audioId, expanded, showError, token]);

  useEffect(() => {
    if (!expanded) {
      setDraft('');
      setEditingNoteId(null);
      setEditDraft('');
      return;
    }
    void refreshNotes();
  }, [expanded, refreshNotes]);

  useEffect(() => {
    if (hasLoaded) {
      onNotesCountChange?.(notes.length);
    }
  }, [hasLoaded, notes.length, onNotesCountChange]);

  const handleSaveNote = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !token || saving) {
      return;
    }

    setSaving(true);
    try {
      const saved = await createAudioNote(token, {audioId, text: trimmed});
      setNotes(prev => [saved, ...prev.filter(note => note.id !== saved.id)]);
      setDraft('');
    } catch (error) {
      showError('Could not save note', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (note: AudioNoteRecord) => {
    setEditingNoteId(note.id);
    setEditDraft(note.text);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditDraft('');
  };

  const handleUpdateNote = async (noteId: string) => {
    const trimmed = editDraft.trim();
    if (!trimmed || !token || updatingNoteId) {
      return;
    }

    setUpdatingNoteId(noteId);
    try {
      const updated = await updateAudioNote(token, noteId, {text: trimmed});
      setNotes(prev =>
        prev.map(note => (note.id === noteId ? updated : note)),
      );
      handleCancelEdit();
    } catch (error) {
      showError('Could not update note', error);
    } finally {
      setUpdatingNoteId(null);
    }
  };

  const handleDeleteNote = (note: AudioNoteRecord) => {
    if (!token) {
      return;
    }

    confirm('Delete note', 'Remove this note for everyone?', {
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteAudioNote(token, note.id);
        setNotes(prev => prev.filter(item => item.id !== note.id));
        if (editingNoteId === note.id) {
          handleCancelEdit();
        }
      },
    });
  };

  if (!expanded) {
    return null;
  }

  const canSave = draft.trim().length > 0 && !saving && Boolean(token);

  return (
    <View style={styles.feedNotesPanel}>
      <View style={styles.feedNotesPanelHeader}>
        <Text style={styles.feedNotesPanelTitle}>Notes</Text>
        <Text style={styles.feedNotesPanelHint}>Shared with your team</Text>
      </View>

      <TextInput
        style={styles.feedNotesInput}
        placeholder="Add a note..."
        placeholderTextColor={colors.textMuted}
        value={draft}
        onChangeText={setDraft}
        multiline
        textAlignVertical="top"
        editable={Boolean(token) && !saving}
      />

      <TouchableOpacity
        style={[
          styles.feedNotesSaveButton,
          !canSave && styles.feedNotesSaveButtonDisabled,
        ]}
        onPress={() => void handleSaveNote()}
        disabled={!canSave}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color={colors.textOnPrimary} size="small" />
        ) : (
          <>
            <Icon name="plus" size={14} color={colors.textOnPrimary} />
            <Text style={styles.feedNotesSaveButtonText}>Save note</Text>
          </>
        )}
      </TouchableOpacity>

      {loading && !hasLoaded ? (
        <ActivityIndicator
          color={colors.primary}
          style={styles.feedNotesLoading}
          size="small"
        />
      ) : notes.length === 0 ? (
        <Text style={styles.feedNotesEmptyText}>No notes yet.</Text>
      ) : (
        <View style={styles.feedNotesList}>
          {notes.map(note => {
            const isEditing = editingNoteId === note.id;
            const canModify = canModifyNote(note);
            const authorName = resolveNoteAuthorName(
              note,
              currentUserId,
              currentUserName,
            );
            const addedLabel = formatNoteAddedDate(note.createdAt);

            return (
              <View key={note.id} style={styles.feedNoteCard}>
                <View style={styles.feedNoteCardHeader}>
                  <Text style={styles.feedNoteLabel}>Note</Text>
                  {canModify ? (
                    <View style={styles.feedNoteActions}>
                      <TouchableOpacity
                        onPress={() =>
                          isEditing ? handleCancelEdit() : handleStartEdit(note)
                        }
                        hitSlop={responsiveHitSlop(2)}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name={isEditing ? 'x' : 'edit-2'}
                          size={14}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteNote(note)}
                        hitSlop={responsiveHitSlop(2)}
                        activeOpacity={0.7}
                      >
                        <Icon
                          name="trash-2"
                          size={14}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.feedNotesEditInput}
                      value={editDraft}
                      onChangeText={setEditDraft}
                      multiline
                      textAlignVertical="top"
                      editable={updatingNoteId !== note.id}
                    />
                    <TouchableOpacity
                      style={[
                        styles.feedNotesEditSaveButton,
                        (!editDraft.trim() || updatingNoteId === note.id) &&
                          styles.feedNotesSaveButtonDisabled,
                      ]}
                      onPress={() => void handleUpdateNote(note.id)}
                      disabled={!editDraft.trim() || updatingNoteId === note.id}
                      activeOpacity={0.85}
                    >
                      {updatingNoteId === note.id ? (
                        <ActivityIndicator
                          color={colors.textOnPrimary}
                          size="small"
                        />
                      ) : (
                        <Text style={styles.feedNotesSaveButtonText}>
                          Update
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.feedNoteBody}>{note.text}</Text>
                )}

                {authorName || addedLabel ? (
                  <Text style={styles.feedNoteMeta} numberOfLines={2}>
                    {authorName ? `By ${authorName}` : ''}
                    {authorName && addedLabel ? ' • ' : ''}
                    {addedLabel ? `Added: ${addedLabel}` : ''}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default FeedCardNotesPanel;
