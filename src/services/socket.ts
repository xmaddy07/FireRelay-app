export const socketService = {
  connect: () => Promise.resolve(true),
  disconnect: () => Promise.resolve(true),
  sendMessage: (message: string) => Promise.resolve(message),
};
