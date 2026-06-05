import {useCallback, useEffect, useState} from 'react';
import {socketService} from '../services/socket/socketService';

type UseSocketOptions = {
  token?: string | null;
  autoConnect?: boolean;
};

export const useSocket = ({token, autoConnect = false}: UseSocketOptions = {}) => {
  const [connected, setConnected] = useState(socketService.isConnected());

  useEffect(() => {
    if (!autoConnect || !token) {
      return;
    }

    socketService.connect(token);

    const unsubConnect = socketService.on(socketService.events.connect, () => {
      setConnected(true);
    });
    const unsubDisconnect = socketService.on(
      socketService.events.disconnect,
      () => {
        setConnected(false);
      },
    );

    setConnected(socketService.isConnected());

    return () => {
      unsubConnect();
      unsubDisconnect();
    };
  }, [autoConnect, token]);

  const emit = useCallback((event: string, payload?: unknown) => {
    socketService.getSocket()?.emit(event, payload);
  }, []);

  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) =>
      socketService.on(event, handler),
    [],
  );

  return {
    connected,
    emit,
    on,
    joinCounty: socketService.joinCounty,
    leaveCounty: socketService.leaveCounty,
    connect: (nextToken: string) => socketService.connect(nextToken),
    disconnect: () => socketService.disconnect(),
  };
};
