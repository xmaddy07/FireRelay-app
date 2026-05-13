import type {AuthState} from '../rootReducer';

export const initialAuthState: AuthState = {
  token: undefined,
  isAuthenticated: false,
};

export const authActions = {
  login: (token: string) => ({type: 'auth/login', payload: token}),
  logout: () => ({type: 'auth/logout'}),
};
