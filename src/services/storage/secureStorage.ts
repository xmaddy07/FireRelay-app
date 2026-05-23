import {storageKeys} from '../../config/constants/storageKeys';
import {storageService} from './storageService';

export const secureStorage = {
  getToken: () => storageService.get(storageKeys.authToken),
  setToken: (token: string) =>
    storageService.set(storageKeys.authToken, token),
  clearToken: () => storageService.remove(storageKeys.authToken),
};
