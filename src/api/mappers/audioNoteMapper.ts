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

const pickNestedUserRecord = (record: Record<string, unknown>) => {
  const nested = record.user ?? record.createdBy ?? record.author;
  if (nested && typeof nested === 'object') {
    return nested as Record<string, unknown>;
  }
  return undefined;
};

const pickAuthorName = (record: Record<string, unknown>) => {
  const userRecord = pickNestedUserRecord(record);
  if (userRecord) {
    const firstName = pickString(userRecord, ['firstName', 'first_name']);
    const lastName = pickString(userRecord, ['lastName', 'last_name']);
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    if (fullName) {
      return fullName;
    }

    const name = pickString(userRecord, [
      'name',
      'fullName',
      'full_name',
      'displayName',
      'display_name',
    ]);
    if (name) {
      return name;
    }
  }

  return (
    pickString(record, [
      'authorName',
      'userName',
      'user_name',
      'createdByName',
      'created_by_name',
    ]) ?? undefined
  );
};

const pickAuthorEmail = (record: Record<string, unknown>) => {
  const userRecord = pickNestedUserRecord(record);
  if (userRecord) {
    const email = pickString(userRecord, ['email']);
    if (email) {
      return email;
    }
  }

  return (
    pickString(record, ['authorEmail', 'userEmail', 'email']) ?? undefined
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
    authorLabel: pickAuthorName(record),
    authorEmail: pickAuthorEmail(record),
  };
};

export const sortNotesNewestFirst = (notes: AudioNoteRecord[]) =>
  [...notes].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
