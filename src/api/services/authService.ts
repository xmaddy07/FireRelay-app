import {apiRequest, apiRequestWithAuth} from '../client';
import {endpoints} from '../endpoints';
import type {
  AuthUser,
  ChangeEmailRequest,
  ChangePasswordRequest,
  ConfirmEmailChangeRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
} from '../types/auth';
import {authorizedRequest} from '../utils';
import {getLoginDeviceInfo} from '../../utils/deviceInfo';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const device = credentials.device ?? getLoginDeviceInfo();

  const {data, token} = await apiRequestWithAuth<LoginResponse>(
    endpoints.auth.login,
    {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
        device,
      },
    },
  );

  return {
    ...data,
    accessToken: data.accessToken ?? token,
  };
}

export async function logout(token?: string): Promise<void> {
  if (token) {
    await authorizedRequest(token, endpoints.auth.logout, {method: 'POST'});
    return;
  }

  await apiRequest(endpoints.auth.logout, {method: 'POST'});
}

export async function getProfile(token: string): Promise<AuthUser> {
  return authorizedRequest<AuthUser>(token, endpoints.auth.profile);
}

export async function refreshToken(token: string): Promise<LoginResponse> {
  const {data, token: refreshedToken} = await apiRequestWithAuth<LoginResponse>(
    endpoints.auth.refresh,
    {
      method: 'POST',
      token,
    },
  );

  return {
    ...data,
    accessToken: data.accessToken ?? refreshedToken,
  };
}

export async function updateProfile(
  token: string,
  payload: UpdateProfileRequest,
): Promise<AuthUser> {
  return authorizedRequest<AuthUser>(token, endpoints.auth.updateProfile, {
    method: 'PATCH',
    body: payload,
  });
}

export async function changePassword(
  token: string,
  payload: ChangePasswordRequest,
): Promise<void> {
  await authorizedRequest(token, endpoints.auth.changePassword, {
    method: 'POST',
    body: payload,
  });
}

export async function changeEmail(
  token: string,
  payload: ChangeEmailRequest,
): Promise<void> {
  await authorizedRequest(token, endpoints.auth.changeEmail, {
    method: 'POST',
    body: payload,
  });
}

export async function confirmEmailChange(
  accessToken: string,
  verificationToken: string,
): Promise<void> {
  const payload: ConfirmEmailChangeRequest = {
    token: verificationToken,
  };

  await authorizedRequest(accessToken, endpoints.auth.confirmEmailChange, {
    method: 'POST',
    body: payload,
  });
}
