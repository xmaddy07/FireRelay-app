/** Placeholder for socket hook — wire to services/socket/socketService */
export const useSocket = () => ({
  connected: false,
  emit: (_event: string, _payload?: unknown) => {},
  on: (_event: string, _handler: (...args: unknown[]) => void) => () => {},
});
