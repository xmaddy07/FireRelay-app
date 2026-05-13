import type {UserState} from '../rootReducer';

export const initialUserState: UserState = {
  id: undefined,
  name: undefined,
  email: undefined,
};

export const userActions = {
  setUser: (user: UserState) => ({type: 'user/set', payload: user}),
};
