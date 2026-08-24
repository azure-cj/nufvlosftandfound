import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit';
import { getAuthenticatedUserFromRequest } from '@/lib/auth';
import { generateRandomFileName, uploadConfig, validateImageMagicBytes } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Please provide an image file.' }, { status: 400 });
    }

    if (file.size > uploadConfig.maxFileSize) {
      return NextResponse.json(
        {
          message: `File exceeds the maximum size of ${Math.round(uploadConfig.maxFileSize / 1024 / 1024)}MB.`,
        },
        { status: 400 },
      );
    }

    // Inspect file header magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const magicResult = validateImageMagicBytes(buffer);

    if (!magicResult.valid || !magicResult.extension || !magicResult.mimeType) {
      return NextResponse.json(
        {
          message: `Invalid image format or corrupted file signature. Allowed: ${uploadConfig.allowedMimeTypes.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Generate random server-side filename; do not rely on client-supplied name or extension
    const safeFileName = generateRandomFileName(magicResult.extension);

    const blob = await put(`items/${safeFileName}`, file, {
      access: 'public',
      contentType: magicResult.mimeType,
    });

    await createAuditLog({
      userId: currentUser.id,
      action: 'ITEM_IMAGE_UPLOADED',
      entityType: 'ITEM',
      details: { storedFileName: safeFileName, url: blob.url },
      request,
    });

    return NextResponse.json({
      message: 'Image uploaded successfully.',
      url: blob.url,
    });
  } catch (error) {
    console.error('Upload item image error:', error);

    return NextResponse.json({ message: 'Unable to upload image.' }, { status: 500 });
  }
}
