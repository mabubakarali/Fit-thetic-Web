import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ShieldAlert, Clock, User, Activity } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';

export const AdminAuditLogsPage: React.FC = () => {
  const { data: auditData, isLoading } = useQuery({
    queryKey: ['adminAuditLogs'],
    queryFn: () => adminService.getAuditLogs({ limit: 50 }),
  });

  const logs: AuditLog[] = auditData?.data || [];

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          SYSTEM INTEGRITY & EVENT STREAM
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
          AUDIT <span className="text-[#CCFF00]">TRAIL</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Immutable historical audit log of all administrative actions, cancellations, lock toggles, and slot mutations.
        </p>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-xs">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs">No audit events recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-zinc-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {log.actorName || log.actorId?.name || 'System Admin'} ({log.actorRole})
                    </td>
                    <td className="py-4 px-4 uppercase font-bold text-zinc-400 text-[10px]">
                      {log.resource}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-mono text-[10px] max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
