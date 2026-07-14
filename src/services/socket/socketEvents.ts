export const socketEvents = {
  connect: 'connect',
  disconnect: 'disconnect',
  connectError: 'connect_error',
  connected: 'connected',
  error: 'error',
  joinCounty: 'joinCounty',
  leaveCounty: 'leaveCounty',
  joinedCounty: 'joinedCounty',
  leftCounty: 'leftCounty',
  newAudio: 'newAudio',
  newCountyAudio: 'newCountyAudio',
  audioUpdated: 'audioUpdated',
  countyAudioUpdated: 'countyAudioUpdated',
  audioDeleted: 'audioDeleted',
  countyAudioDeleted: 'countyAudioDeleted',
  sessionRevoked: 'sessionRevoked',
  sessionsRevoked: 'sessionsRevoked',
  userUpdated: 'userUpdated',
  roleChanged: 'roleChanged',
  userRoleChanged: 'userRoleChanged',
} as const;

export type SocketEventName = (typeof socketEvents)[keyof typeof socketEvents];
