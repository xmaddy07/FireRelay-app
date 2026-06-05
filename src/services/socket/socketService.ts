import {io, type Socket} from 'socket.io-client';
import {API_WS_URL} from '../../config/env';
import {socketEvents} from './socketEvents';

const AUDIO_NAMESPACE = '/audio';
const SOCKET_PATH = '/socket.io/';

type EventHandler = (...args: unknown[]) => void;

let socket: Socket | null = null;
let activeToken: string | null = null;
let lifecycleHandlersAttached = false;
const handlerRegistry = new Map<string, Set<EventHandler>>();

const logSocket = (label: string, payload?: Record<string, unknown>) => {
  if (__DEV__) {
    console.log(`[Socket] ${label}`, payload ?? {});
  }
};

const attachRegisteredHandlers = (instance: Socket) => {
  handlerRegistry.forEach((handlers, event) => {
    handlers.forEach(handler => {
      instance.on(event, handler);
    });
  });
};

const attachLifecycleLogging = (instance: Socket, url: string) => {
  if (lifecycleHandlersAttached) {
    return;
  }
  lifecycleHandlersAttached = true;

  instance.on(socketEvents.connect, () => {
    logSocket('connected', {url, socketId: instance.id});
  });

  instance.on(socketEvents.disconnect, reason => {
    logSocket('disconnected', {
      url,
      reason: typeof reason === 'string' ? reason : 'unknown',
    });
  });

  instance.on(socketEvents.connectError, error => {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Connection failed';
    logSocket('connect_error', {url, message});
  });

  instance.on(socketEvents.connected, payload => {
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof (payload as {message: unknown}).message === 'string'
        ? (payload as {message: string}).message
        : undefined;
    logSocket('server_ready', {url, message});
  });

  instance.on(socketEvents.error, payload => {
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof (payload as {message: unknown}).message === 'string'
        ? (payload as {message: string}).message
        : 'Socket error';
    logSocket('error', {url, message});
  });
};

const buildSocket = (token: string): Socket => {
  const url = `${API_WS_URL}${AUDIO_NAMESPACE}`;
  logSocket('connecting', {url});

  const instance = io(url, {
    path: SOCKET_PATH,
    autoConnect: true,
    transports: ['polling'],
    extraHeaders: {
      Cookie: `jwt=${token}`,
    },
    auth: {
      token,
    },
  });

  attachLifecycleLogging(instance, url);
  return instance;
};

export const socketService = {
  events: socketEvents,

  connect(token: string): Socket {
    if (socket && activeToken === token) {
      if (!socket.connected) {
        logSocket('reconnecting', {
          url: `${API_WS_URL}${AUDIO_NAMESPACE}`,
        });
        socket.connect();
      }
      return socket;
    }

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
      lifecycleHandlersAttached = false;
    }

    activeToken = token;
    socket = buildSocket(token);
    attachRegisteredHandlers(socket);
    return socket;
  },

  disconnect() {
    if (!socket) {
      activeToken = null;
      return;
    }

    logSocket('disconnecting', {url: `${API_WS_URL}${AUDIO_NAMESPACE}`});
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    activeToken = null;
    lifecycleHandlersAttached = false;
  },

  getSocket(): Socket | null {
    return socket;
  },

  isConnected(): boolean {
    return socket?.connected ?? false;
  },

  joinCounty(countyId: string) {
    if (__DEV__) {
      logSocket('emit joinCounty', {countyId});
    }
    socket?.emit(socketEvents.joinCounty, {countyId});
  },

  leaveCounty(countyId: string) {
    if (__DEV__) {
      logSocket('emit leaveCounty', {countyId});
    }
    socket?.emit(socketEvents.leaveCounty, {countyId});
  },

  on(event: string, handler: EventHandler): () => void {
    if (!handlerRegistry.has(event)) {
      handlerRegistry.set(event, new Set());
    }
    handlerRegistry.get(event)!.add(handler);
    socket?.on(event, handler);

    return () => {
      handlerRegistry.get(event)?.delete(handler);
      socket?.off(event, handler);
    };
  },
};
