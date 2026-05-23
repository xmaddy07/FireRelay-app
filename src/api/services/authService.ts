import {apiRequestWithAuth} from '../client';
import {endpoints} from '../endpoints';
import type {LoginRequest, LoginResponse} from '../types/auth';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const {data, token} = await apiRequestWithAuth<LoginResponse>(
    endpoints.auth.login,
    {
      method: 'POST',
      body: credentials,
    },
  );

  return {
    ...data,
    accessToken: data.accessToken ?? token,
  };
}
