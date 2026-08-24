import { requireAdmin } from '@/lib/adminGuard';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();
  return <>{children}</>;
}
