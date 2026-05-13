export const storageService = {
  getToken: async () => Promise.resolve<string | null>(null),
  saveToken: async (token: string) => Promise.resolve(),
  removeToken: async () => Promise.resolve(),
};
