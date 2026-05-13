export const api = {
  login: async (email: string, password: string) => {
    return Promise.resolve({token: 'demo-token', user: {id: '1', name: 'User', email}});
  },
  signup: async (name: string, email: string, password: string) => {
    return Promise.resolve({token: 'demo-token', user: {id: '1', name, email}});
  },
  fetchNotifications: async () => {
    return Promise.resolve([]);
  },
};
