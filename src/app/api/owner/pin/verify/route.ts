import { NextRequest, NextResponse } from 'next/server';
import {
  createOwnerPinSession,
  getOwnerPinCookieName,
  getOwnerPinCookieOptions,
  getOwnerUser,
  isOwnerPinSet,
  requireOwner,
  updateOwnerPin,
  verifyOwnerPin,
} from '@/lib/ownerGuard';

export async function GET(request: NextRequest) {
  const guard = await requireOwner();

  if (guard) {
    return guard;
  }

  const isPinSet = await isOwnerPinSet();
  return NextResponse.json({ isPinSet });
}

export async function POST(request: NextRequest) {
  const guard = await requireOwner();

  if (guard) {
    return guard;
  }

  const owner = await getOwnerUser();

  if (!owner) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { pin?: string; setupPin?: string };
  const pin = body.pin || body.setupPin;

  if (!pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ message: 'Enter a valid 4-digit PIN.' }, { status: 400 });
  }

  const pinSet = await isOwnerPinSet();

  if (!pinSet) {
    // Initial PIN setup flow: set up PIN for the first time
    await updateOwnerPin(pin);
    const token = await createOwnerPinSession(owner.id);
    const response = NextResponse.json({ message: 'Owner PIN setup complete.', isPinSet: true });
    response.cookies.set(getOwnerPinCookieName(), token, getOwnerPinCookieOptions());
    return response;
  }

  const valid = await verifyOwnerPin(pin);

  if (!valid) {
    return NextResponse.json({ message: 'Incorrect owner PIN.' }, { status: 401 });
  }

  const token = await createOwnerPinSession(owner.id);
  const response = NextResponse.json({ message: 'Owner PIN verified.' });
  response.cookies.set(getOwnerPinCookieName(), token, getOwnerPinCookieOptions());
  return response;
}
