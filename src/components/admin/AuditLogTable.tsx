import { formatDisplayDate, getUserDisplayName } from '@/lib/utils';
import { Table } from '@/components/ui/Table';

export type AuditLogRow = {
  id: string;
  action: string;
  createdAt: string | Date;
  user?: {
    username: string;
    firstName?: string | null;
    lastName?: string | null;
  };
};

export function AuditLogTable({
  logs,
}: {
  logs: AuditLogRow[];
}) {
  return (
    <Table>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-[#334155]">
        <thead className="bg-brand-navy text-white dark:bg-[#0a1628]">
          <tr className="bg-brand-navy text-left text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-[#0a1628]">
            <th className="px-5 py-4">Timestamp</th>
            <th className="px-5 py-4">User</th>
            <th className="px-5 py-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm text-slate-700 dark:divide-[#334155] dark:text-slate-200">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="bg-white transition-colors hover:bg-slate-50 dark:bg-[#1e293b] dark:hover:bg-[#0f172a]"
            >
              <td className="px-5 py-4">{formatDisplayDate(log.createdAt, 'MMM d, yyyy h:mm a')}</td>
              <td className="px-5 py-4">{getUserDisplayName(log.user)}</td>
              <td className="px-5 py-4 font-semibold text-slate-900 dark:text-[#f1f5f9]">{log.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Table>
  );
}
