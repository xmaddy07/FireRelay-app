export type ApiAudioNote = {
  id: string;
  audioId?: string;
  text?: string;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;
  userId?: string;
  authorEmail?: string;
  authorName?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
  [key: string]: unknown;
};

export type AudioNoteRecord = {
  id: string;
  audioId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  authorLabel?: string;
};

export type CreateAudioNotePayload = {
  audioId: string;
  text: string;
};

export type UpdateAudioNotePayload = {
  text: string;
};
