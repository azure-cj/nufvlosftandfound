import crypto from 'node:crypto';

export const uploadConfig = {
  maxFileSize: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE ?? 5 * 1024 * 1024),
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

/**
 * Validates magic numbers (file header signatures) of the provided buffer.
 * Supports JPEG, PNG, and WebP.
 */
export function validateImageMagicBytes(buffer: Uint8Array): { valid: boolean; extension: string | null; mimeType: string | null } {
  if (buffer.length < 12) {
    return { valid: false, extension: null, mimeType: null };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, extension: 'jpg', mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, extension: 'png', mimeType: 'image/png' };
  }

  // WebP: RIFF ... WEBP (Bytes 0-3: 'RIFF', Bytes 8-11: 'WEBP')
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return { valid: true, extension: 'webp', mimeType: 'image/webp' };
  }

  return { valid: false, extension: null, mimeType: null };
}

/**
 * Generates a completely random server-side filename with the validated extension.
 * Never trusts or reuses client-supplied filenames or extensions.
 */
export function generateRandomFileName(extension: string) {
  const safeExt = ['jpg', 'png', 'webp'].includes(extension.toLowerCase()) ? extension.toLowerCase() : 'jpg';
  const randomHex = crypto.randomBytes(16).toString('hex');
  return `item-${Date.now()}-${randomHex}.${safeExt}`;
}
