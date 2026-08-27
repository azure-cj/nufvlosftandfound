import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDisplayDate(value?: string | Date | null, pattern = 'MMM d, yyyy') {
  if (!value) {
    return 'N/A';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return format(date, pattern);
}

export function formatItemCode(value?: string | null) {
  if (!value) {
    return 'ITEM-XXXX-0000';
  }

  return value.startsWith('ITEM-') ? value : 'ITEM-XXXX-0000';
}

export function getUserDisplayName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || user?.username || 'Staff User';
}

export function getStoredClaimerName(item?: { claimerName?: string | null }) {
  const name = item?.claimerName?.trim();
  return name || 'Claim details missing';
}

export function maskName(fullName: string | null | undefined): string {
  if (!fullName) {
    return 'Unknown';
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return 'Unknown';
  }

  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    const word = words[0];
    if (word.length <= 2) {
      return word;
    }
    return `${word[0]}${'*'.repeat(word.length - 2)}${word[word.length - 1]}`;
  }

  const firstName = words[0];
  const lastNamePart = words.slice(1).join(' ');

  const maskedFirstName =
    firstName.length <= 2
      ? firstName
      : `${firstName[0]}${'*'.repeat(firstName.length - 2)}${firstName[firstName.length - 1]}`;

  const firstLetterLastName = lastNamePart[0];

  return `${maskedFirstName} ${firstLetterLastName}.`;
}

