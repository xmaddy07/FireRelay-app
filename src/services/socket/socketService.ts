import {socketEvents} from './socketEvents';

/** Socket client placeholder — connect when backend URL is available */
export const socketService = {
  events: socketEvents,
  connect: (_url: string) => {},
  disconnect: () => {},
};
