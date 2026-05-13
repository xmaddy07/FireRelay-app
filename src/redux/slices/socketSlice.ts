import type {SocketState} from '../rootReducer';

export const initialSocketState: SocketState = {
  connected: false,
  lastEvent: undefined,
};

export const socketActions = {
  connect: () => ({type: 'socket/connect'}),
  disconnect: () => ({type: 'socket/disconnect'}),
};
