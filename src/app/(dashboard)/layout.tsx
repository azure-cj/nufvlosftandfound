import { headers } from 'next/headers';
import { DashboardLayout as SharedDashboardLayout } from '@/components/layout/DashboardLayout';
import { getAuthenticatedUserFromCookies } from '@/lib/admin';
import type { SessionUser } from '@/hooks/useAuth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resolveInitialUser = async (): Promise<SessionUser | null> => {
    const user = await getAuthenticatedUserFromCookies();

    if (user) {
      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    }

    const requestHeaders = await headers();
    const userId = requestHeaders.get('x-user-id');
    const email = requestHeaders.get('x-user-email');
    const username = requestHeaders.get('x-user-username');
    const role = requestHeaders.get('x-user-role');

    if (!userId || !email || !username || (role !== 'ADMIN' && role !== 'USER')) {
      return null;
    }

    return {
      id: userId,
      email,
      username,
      firstName: null,
      lastName: null,
      role,
      isActive: true,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    };
  };

  return <SharedDashboardLayout initialUser={await resolveInitialUser()}>{children}</SharedDashboardLayout>;
}
