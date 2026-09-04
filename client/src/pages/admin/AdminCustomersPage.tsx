import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Users, Search, Award, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types';
import { Badge } from '../../components/common/Badge';

export const AdminCustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data: customerData, isLoading } = useQuery({
    queryKey: ['adminCustomers', search],
    queryFn: () => customerService.getAll({ search, limit: 100 }),
  });

  const customers: Customer[] = customerData?.data || [];

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            ATHLETE DIRECTORY & CRM
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            CUSTOMER <span className="text-[#CCFF00]">MANAGEMENT</span>
          </h1>
        </div>

        <div className="text-xs font-bold text-zinc-400">
          Total Registered Athletes: <strong className="text-white">{customers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#111111] border border-[#222222]">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none focus:border-[#CCFF00]"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-xs">Loading customer directory...</div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs">No registered athletes found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-zinc-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Athlete Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Membership Tier</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Last Booking Date</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-bold text-white">
                      {c.userId?.name || 'Athlete'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-zinc-300">{c.userId?.email}</div>
                      <div className="text-[10px] text-zinc-500">{c.userId?.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#1C1C1C] border border-white/10 font-bold text-white text-[10px] uppercase">
                        {c.activeMembershipId?.tier || 'PERFORMANCE'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {c.totalBookings || 0}
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      {c.lastBookingAt ? format(new Date(c.lastBookingAt), 'MMM d, yyyy') : 'No bookings yet'}
                    </td>
                    <td className="py-4 px-4 text-zinc-500">
                      {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : '—'}
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
