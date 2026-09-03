import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  /** Optimistic, in-session events written this visit — shown immediately
   * while the real server history loads, then merged with it. */
  localLogs?: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ localLogs = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serverLogs, setServerLogs] = useState<AuditLog[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = () => {
    setIsLoading(true);
    setError('');
    fetch('/api/audit-log')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || 'Failed to load audit log');
        setServerLogs(
          (data.logs || []).map((l: any) => ({
            id: l.id,
            createdAt: l.createdAt,
            userId: l.userId,
            userName: l.userName,
            userRole: l.userRole,
            action: l.action,
            entityType: l.entityType,
            entityId: l.entityId || undefined,
            entityName: l.entityName || undefined,
            changes: l.changes || undefined,
            details: l.details,
          }))
        );
      })
      .catch((e) => setError(e.message || 'Failed to load audit log'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Server history is the source of truth; any local events not yet visible
  // there (written moments ago, before this fetch) are shown on top.
  const knownIds = new Set((serverLogs || []).map((l) => l.id));
  const pendingLocal = localLogs.filter((l) => !knownIds.has(l.id));
  const logs = [...pendingLocal, ...(serverLogs || [])];

  const filteredLogs = logs.filter((l) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.entityName || '').toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatValue = (v: any) => (v === null || v === undefined || v === '' ? '—' : String(v));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Audit Trail</h1>
            <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {logs.length} events
            </span>
            <span className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              <ShieldCheck className="h-3 w-3" />
              Insert-only server record
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every add, edit, delete, approval, and system event for this account, attributed to the real user who did it. Written directly by the server — not editable from the client.
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail events..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</div>
      )}

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor / User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Action Performed</th>
                <th className="py-3 px-4 font-semibold">Target</th>
                <th className="py-3 px-4 font-semibold">What Changed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {isLoading && serverLogs === null && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center font-sans text-slate-500">
                    Loading audit trail…
                  </td>
                </tr>
              )}
              {!isLoading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center font-sans text-slate-500">
                    {logs.length === 0 ? 'No audit events yet.' : 'No events match your search.'}
                  </td>
                </tr>
              )}
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors align-top">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-sans font-bold text-slate-700">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-800 whitespace-nowrap">{log.action}</td>
                  <td className="py-3 px-4 font-sans text-slate-700">
                    <div>{log.entityName || log.entityType}</div>
                    {log.entityName && <div className="text-[9px] text-slate-400">{log.entityType}</div>}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 max-w-sm">
                    {log.changes && log.changes.length > 0 ? (
                      <ul className="space-y-0.5">
                        {log.changes.map((c, i) => (
                          <li key={i}>
                            <span className="font-semibold text-slate-700">{c.field}</span>:{' '}
                            <span className="text-rose-600 line-through">{formatValue(c.oldValue)}</span>{' '}
                            → <span className="text-emerald-700 font-semibold">{formatValue(c.newValue)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-500">{log.details}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
