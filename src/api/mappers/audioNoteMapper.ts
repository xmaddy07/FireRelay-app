import type {ApiAudioNote, AudioNoteRecord} from '../types/audioNote';
import {pickString} from '../utils';

const pickAuthorId = (record: Record<string, unknown>) => {
  const user = record.user;
  if (user && typeof user === 'object') {
    const userRecord = user as Record<string, unknown>;
    const nestedId = pickString(userRecord, ['id']);
    if (nestedId) {
      return nestedId;
    }
  }
  return (
    pickString(record, ['authorId', 'userId', 'createdById', 'createdBy']) ??
    undefined
  );
};

const pickAuthorLabel = (record: Record<string, unknown>) => {
  const user = record.user;
  if (user && typeof user === 'object') {
    const userRecord = user as Record<string, unknown>;
    const name = pickString(userRecord, ['name', 'email']);
    if (name) {
      return name;
    }
  }
  return (
    pickString(record, ['authorName', 'authorEmail', 'userEmail', 'email']) ??
    undefined
  );
};

export const mapAudioNoteToRecord = (note: ApiAudioNote): AudioNoteRecord => {
  const record = note as Record<string, unknown>;
  const createdAt =
    pickString(record, ['createdAt', 'created_at']) ?? new Date().toISOString();
  const updatedAt =
    pickString(record, ['updatedAt', 'updated_at']) ?? createdAt;

  return {
    id: note.id,
    audioId:
      pickString(record, ['audioId', 'audio_id']) ?? note.audioId ?? '',
    text: pickString(record, ['text', 'note', 'content']) ?? '',
    createdAt,
    updatedAt,
    authorId: pickAuthorId(record),
    authorLabel: pickAuthorLabel(record),
  };
};

export const sortNotesNewestFirst = (notes: AudioNoteRecord[]) =>
  [...notes].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
