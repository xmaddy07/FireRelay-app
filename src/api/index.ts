export {API_BASE_URL} from '../config/env';
export {endpoints} from './endpoints';
export {ApiError, apiRequest, apiRequestWithAuth} from './client';
export * from './types/auth';
export * from './types/common';
export {getAudioFileUrl} from './mappers/audioMapper';

export {
  login,
  logout,
  getProfile,
  refreshToken,
  updateProfile,
  changePassword,
  changeEmail,
  confirmEmailChange,
} from './services/authService';

export {
  searchAudio,
  getAudioById,
  getAudioContext,
  searchAudioWithPagination,
  type AudioSearchResult,
} from './services/audioService';
export {
  addAudioFavorite,
  getFavoriteAudioIds,
  removeAudioFavorite,
} from './services/audioFavoriteService';
export {markAudioViewed} from './services/audioViewService';
export {
  createAudioNote,
  listAudioNotes,
  listAudioNotesByAudioIds,
  updateAudioNote,
  deleteAudioNote,
} from './services/audioNoteService';
export type {AudioNoteRecord} from './types/audioNote';

export {
  searchKeywords,
  listKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  type KeywordSearchResult,
} from './services/keywordService';

export {
  listSenders,
  searchSenders,
  getSenderById,
  createSender,
  updateSender,
  deleteSender,
  regenerateSenderToken,
} from './services/senderService';

export {listCounties, searchCounties} from './services/countyService';
export type {CountyOption} from './services/countyService';

export {
  searchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserCounties,
  assignUserCounties,
  listUserSessions,
  enrichUsersWithSessionSummaries,
  summarizeUserSessions,
  revokeUserSession,
  forcePasswordReset,
  getUserTalkgroupAccess,
  assignUserTalkgroupAccess,
} from './services/userService';
export type {FeedSeverityLevel} from './types/user';
export {normalizeFeedSeverityLevel, parseAllowedSeverities} from './mappers/userMapper';
export type {
  UserSessionRecord,
  UserTalkgroupAccessRecord,
} from './services/userService';
