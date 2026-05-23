const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[FireRelay]', ...args);
    }
  },
  error: (...args: unknown[]) => console.error('[FireRelay]', ...args),
};
