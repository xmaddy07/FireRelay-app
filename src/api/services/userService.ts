import {apiRequestWithAuth} from '../client';

/** User API — extend as backend endpoints are added */
export const userService = {
  getProfile: (token: string) =>
    apiRequestWithAuth('/user/profile', {method: 'GET', token}),
};
