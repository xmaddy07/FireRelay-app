export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
    updateProfile: '/auth/update-profile',
    changePassword: '/auth/change-password',
    changeEmail: '/auth/change-email',
    confirmEmailChange: '/auth/confirm-email-change',
  },
  users: {
    list: '/users',
    search: '/users/search',
    byId: (id: string) => `/users/${id}`,
    counties: (id: string) => `/users/${id}/counties`,
    sessions: (id: string) => `/users/${id}/sessions`,
    sessionById: (userId: string, sessionId: string) =>
      `/users/${userId}/sessions/${sessionId}`,
    forcePasswordReset: (id: string) => `/users/${id}/force-password-reset`,
    talkgroupAccess: (id: string) => `/users/${id}/talkgroup-access`,
    county: (userId: string, countyId: string) =>
      `/users/${userId}/counties/${countyId}`,
    byRole: (role: string) => `/users/by-role/${role}`,
    byEmail: '/users/by-email',
    checkEmail: '/users/check-email',
    byCounty: (countyId: string) => `/users/by-county/${countyId}`,
  },
  audio: {
    root: '/audio',
    search: '/audio/search',
    searchPaginated: '/audio/search/paginated',
    byCounty: (county: string) => `/audio/county/${encodeURIComponent(county)}`,
    byCountyPaginated: (county: string) =>
      `/audio/county/${encodeURIComponent(county)}/paginated`,
    byCountyIdPaginated: (countyId: string) =>
      `/audio/county-id/${countyId}/paginated`,
    file: (filename: string) => `/audio/file/${encodeURIComponent(filename)}`,
    context: (id: string) => `/audio/${id}/context`,
    byId: (id: string) => `/audio/${id}`,
    notes: (audioId: string) => `/audio/${audioId}/notes`,
  },
  audioNotes: {
    root: '/audio-notes',
    byId: (id: string) => `/audio-notes/${id}`,
  },
  keywords: {
    root: '/keywords',
    search: '/keywords/search',
    list: '/keywords/list',
    find: (keyword: string) => `/keywords/find/${encodeURIComponent(keyword)}`,
    reload: '/keywords/reload',
    byId: (id: string) => `/keywords/${id}`,
  },
  senders: {
    root: '/senders',
    verify: '/senders/verify',
    search: '/senders/search',
    byId: (id: string) => `/senders/${id}`,
    regenerateToken: (id: string) => `/senders/${id}/regenerate-token`,
  },
  counties: {
    root: '/counties',
    search: '/counties/search',
    byId: (id: string) => `/counties/${id}`,
  },
  audioViews: {
    root: '/audio-views',
    me: '/audio-views/me',
    markViewed: (audioId: string) => `/audio-views/${audioId}`,
    byId: (id: string) => `/audio-views/${id}`,
  },
  audioFavorites: {
    root: '/audio-favorites',
    me: '/audio-favorites/me',
    favorite: (audioId: string) => `/audio-favorites/${audioId}`,
    byId: (id: string) => `/audio-favorites/${id}`,
  },
} as const;
