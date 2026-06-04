import {endpoints} from '../endpoints';
import {
  mapAudioNoteToRecord,
  sortNotesNewestFirst,
} from '../mappers/audioNoteMapper';
import type {
  ApiAudioNote,
  AudioNoteRecord,
  CreateAudioNotePayload,
  UpdateAudioNotePayload,
} from '../types/audioNote';
import {authorizedRequest, buildQuery, unwrapEntity, unwrapList} from '../utils';

const mapNotesPayload = (payload: unknown): AudioNoteRecord[] => {
  const items = unwrapList<ApiAudioNote>(payload);
  return sortNotesNewestFirst(items.map(mapAudioNoteToRecord));
};

const groupNotesPayload = (
  payload: unknown,
  audioIds: string[],
): Record<string, AudioNoteRecord[]> => {
  const grouped: Record<string, AudioNoteRecord[]> = {};
  audioIds.forEach(id => {
    grouped[id] = [];
  });

  if (!payload || typeof payload !== 'object') {
    return grouped;
  }

  if (Array.isArray(payload)) {
    mapNotesPayload(payload).forEach(note => {
      if (!grouped[note.audioId]) {
        grouped[note.audioId] = [];
      }
      grouped[note.audioId].push(note);
    });
    Object.keys(grouped).forEach(id => {
      grouped[id] = sortNotesNewestFirst(grouped[id]);
    });
    return grouped;
  }

  const record = payload as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === 'object' ? record.data : record;

  if (Array.isArray(nested)) {
    return groupNotesPayload(nested, audioIds);
  }

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const nestedRecord = nested as Record<string, unknown>;
    audioIds.forEach(audioId => {
      const bucket = nestedRecord[audioId];
      if (Array.isArray(bucket)) {
        grouped[audioId] = sortNotesNewestFirst(
          bucket.map(entry => mapAudioNoteToRecord(entry as ApiAudioNote)),
        );
      }
    });
  }

  return grouped;
};

export async function createAudioNote(
  token: string,
  payload: CreateAudioNotePayload,
): Promise<AudioNoteRecord> {
  const created = await authorizedRequest<ApiAudioNote>(
    token,
    endpoints.audioNotes.root,
    {
      method: 'POST',
      body: payload,
    },
  );
  return mapAudioNoteToRecord(unwrapEntity<ApiAudioNote>(created));
}

export async function listAudioNotes(
  token: string,
  audioId: string,
): Promise<AudioNoteRecord[]> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.audio.notes(audioId),
  );
  return mapNotesPayload(payload);
}

export async function listAudioNotesByAudioIds(
  token: string,
  audioIds: string[],
): Promise<Record<string, AudioNoteRecord[]>> {
  const uniqueIds = [...new Set(audioIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const query = buildQuery({audioIds: uniqueIds.join(',')});
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.audioNotes.root}${query}`,
  );
  return groupNotesPayload(payload, uniqueIds);
}

export async function updateAudioNote(
  token: string,
  noteId: string,
  payload: UpdateAudioNotePayload,
): Promise<AudioNoteRecord> {
  const updated = await authorizedRequest<ApiAudioNote>(
    token,
    endpoints.audioNotes.byId(noteId),
    {
      method: 'PATCH',
      body: payload,
    },
  );
  return mapAudioNoteToRecord(unwrapEntity<ApiAudioNote>(updated));
}

export async function deleteAudioNote(
  token: string,
  noteId: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.audioNotes.byId(noteId), {
    method: 'DELETE',
  });
}
