import { redirect } from 'next/navigation';
import { getAuthenticatedUserFromCookies } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export default async function SettingsAliasPage() {
  const user = await getAuthenticatedUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  redirect('/admin/settings');
}
