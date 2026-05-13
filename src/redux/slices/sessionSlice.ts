import type {SessionState} from '../rootReducer';

export const initialSessionState: SessionState = {
  activeSessionId: undefined,
  status: 'idle',
};

export const sessionActions = {
  startSession: (id: string) => ({type: 'session/start', payload: id}),
  endSession: () => ({type: 'session/end'}),
};
