import {apiRequestWithAuth} from '../client';

/** Feed API — extend as backend endpoints are added */
export const feedService = {
  list: (token: string) =>
    apiRequestWithAuth('/feed', {method: 'GET', token}),
};
