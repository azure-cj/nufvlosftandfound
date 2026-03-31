import { redirect } from 'next/navigation';
import { OwnerDashboard } from '@/components/owner/OwnerDashboard';
import { getAuthenticatedUserFromCookies } from '@/lib/admin';
import { getUserDisplayName } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function OwnerPage() {
  const user = await getAuthenticatedUserFromCookies();

  if (!user) {
    redirect('/login');
  }

  return (
    <OwnerDashboard
      userEmail={user.email}
      userName={getUserDisplayName(user)}
    />
  );
}
