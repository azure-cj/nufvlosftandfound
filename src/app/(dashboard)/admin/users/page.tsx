import { requireAdmin } from '@/lib/adminGuard';
import { UserTable } from '@/components/admin/UserTable';
import { SmartPagination } from '@/components/ui/SmartPagination';
import { getUsersPageData } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number((Array.isArray(params.page) ? params.page[0] : params.page) ?? '1');
  const search = Array.isArray(params.search) ? params.search[0] : params.search;
  const { users, pagination } = await getUsersPageData({ page, search });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Manage Users</h2>
          <p className="text-sm text-slate-500">Create, update roles, and deactivate staff accounts.</p>
        </div>
        <form action="/admin/users">
          <input
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
            defaultValue={search}
            name="search"
            placeholder="Search users..."
            type="search"
          />
        </form>
      </div>

      <UserTable initialUsers={users} />

      <SmartPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
