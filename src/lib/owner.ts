export const OWNER_EMAIL = 'aureojoseph518@gmail.com';
export const OWNER_PIN_SETTING_KEY = 'owner_console_pin_hash';
export const OWNER_PIN_COOKIE_NAME = 'owner-pin-token';
export const OWNER_DEFAULT_PIN = '5128';
export const OWNER_PIN_MAX_AGE = 60 * 60 * 4;

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? '';
}

export function isOwnerEmail(email?: string | null) {
  return normalizeEmail(email) === normalizeEmail(OWNER_EMAIL);
}
