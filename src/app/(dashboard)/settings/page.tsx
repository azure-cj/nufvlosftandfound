import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromCookies, hasAdminConsoleAccess } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function SettingsAliasPage() {
  const user = await getAuthenticatedUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  if (!hasAdminConsoleAccess(user)) {
    redirect('/dashboard');
  }

  redirect('/admin/settings');
}
