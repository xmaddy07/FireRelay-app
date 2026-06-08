import {storageKeys} from '../../config/constants/storageKeys';
import {storageService} from './storageService';

export type RememberedLogin = {
  email: string;
  rememberMe: boolean;
};

const isRememberedLogin = (value: unknown): value is RememberedLogin => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.email === 'string' &&
    typeof record.rememberMe === 'boolean' &&
    record.rememberMe
  );
};

export async function loadRememberedLogin(): Promise<RememberedLogin | null> {
  try {
    const raw = await storageService.get(storageKeys.rememberedLogin);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isRememberedLogin(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveRememberedLogin(
  data: RememberedLogin | null,
): Promise<void> {
  if (!data?.rememberMe) {
    await storageService.remove(storageKeys.rememberedLogin);
    return;
  }
  await storageService.set(storageKeys.rememberedLogin, JSON.stringify(data));
}
