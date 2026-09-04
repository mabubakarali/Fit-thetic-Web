import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Lock, Unlock, Trash2, Edit2, AlertTriangle, Layers, Calendar, Clock, Check } from 'lucide-react';
import { slotService } from '../../services/slotService';
import { trainerService } from '../../services/trainerService';
import { Slot, Trainer } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { getErrorMessage } from '../../services/api';

export const AdminSlotsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<Slot | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query slots
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => slotService.getSlots({ date: selectedDate, includeCancelled: true }),
  });

  // Query trainers
  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainerService.getAll(),
  });

  // Form states for Create/Edit
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '06:00',
    endTime: '07:00',
    trainerId: '',
    capacity: 12,
  });

  // Create slot mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => slotService.createSlot(data),
    onSuccess: () => {
      setIsCreateModalOpen(false);
      setFormError(null);
      setFormSuccess('Slot created successfully');
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  // Update slot mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => slotService.updateSlot(id, data),
    onSuccess: () => {
      setEditingSlot(null);
      setFormError(null);
      setFormSuccess('Slot updated successfully');
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  // Delete slot mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => slotService.deleteSlot(id),
    onSuccess: (res) => {
      setDeletingSlot(null);
      setFormSuccess(res.message);
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  // Lock toggle mutation
  const lockMutation = useMutation({
    mutationFn: ({ slotId, isLocked }: { slotId: string; isLocked: boolean }) =>
      slotService.lockSlot(slotId, isLocked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['slots'] }),
  });

  const handleOpenCreate = () => {
    setFormData({
      date: selectedDate,
      startTime: '06:00',
      endTime: '07:00',
      trainerId: trainers[0]?._id || '',
      capacity: 12,
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      trainerId: typeof slot.trainerId === 'object' ? slot.trainerId._id : slot.trainerId,
      capacity: slot.capacity,
    });
    setFormError(null);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            SLOT INVENTORY
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            SLOT <span className="text-[#CCFF00]">MANAGEMENT</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Create New Slot
          </Button>
        </div>
      </div>

      {/* Date Filter Strip */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#111111] border border-[#222222]">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Filter Date:</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3.5 py-1.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white text-xs font-semibold focus:outline-none focus:border-[#CCFF00]"
        />
      </div>

      {/* Notifications */}
      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>{formSuccess}</span>
          <button onClick={() => setFormSuccess(null)}>✕</button>
        </div>
      )}

      {/* Slots Table */}
      <div className="rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Scheduled Slots for {format(new Date(selectedDate), 'EEEE, MMM d, yyyy')} ({slots.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 text-xs">Loading slots...</div>
        ) : slots.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No slots created for this date.{' '}
            <button onClick={handleOpenCreate} className="text-[#CCFF00] underline font-bold">
              Create the first slot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-zinc-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Assigned Coach</th>
                  <th className="py-3 px-4">Bookings / Capacity</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {slots.map((slot) => {
                  const trainer = typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
                  return (
                    <tr key={slot._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                        {slot.startTime} — {slot.endTime}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={trainer?.profileImage || '/assets/trainer_ahmed.jpg'}
                            alt={trainer?.name}
                            className="w-6 h-6 rounded-full object-cover border border-white/20"
                          />
                          <span className="font-semibold text-white">{trainer?.name || 'Coach'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        <span className="font-bold text-white">{slot.currentBookings}</span> / {slot.capacity}
                      </td>
                      <td className="py-4 px-4">
                        <Badge status={slot.status} spotsLeft={slot.spotsAvailable} />
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => lockMutation.mutate({ slotId: slot._id, isLocked: !slot.isLocked })}
                          className="p-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-zinc-300 transition-colors"
                          title={slot.isLocked ? 'Unlock Slot' : 'Lock Slot'}
                        >
                          {slot.isLocked ? <Unlock className="w-3.5 h-3.5 text-[#CCFF00]" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-zinc-300 transition-colors"
                          title="Edit Slot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingSlot(slot)}
                          className="p-1.5 rounded-lg bg-[#1C1C1C] hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete or Cancel Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE SLOT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md bg-[#121212] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-xl font-bold uppercase text-white">Create New Slot</h3>
            
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Assigned Coach</label>
                <select
                  required
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="" disabled>Select Coach</option>
                  {trainers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 12 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={createMutation.isPending}>
                  Create Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLOT MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingSlot(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md bg-[#121212] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-xl font-bold uppercase text-white">Edit Slot</h3>
            
            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editingSlot._id,
                  data: formData,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Coach</label>
                <select
                  required
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  {trainers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Capacity (Current Bookings: {editingSlot.currentBookings})
                </label>
                <input
                  type="number"
                  min={editingSlot.currentBookings}
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 12 })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingSlot(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingSlot(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md bg-[#141414] border border-red-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold">
              <AlertTriangle className="w-6 h-6" />
              <span>Confirm Slot Deletion / Cancellation</span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {deletingSlot.currentBookings > 0 ? (
                <>
                  This slot has <strong>{deletingSlot.currentBookings} confirmed bookings</strong>. It will be safely marked as <strong>CANCELLED</strong> in the database to preserve historical integrity.
                </>
              ) : (
                <>This slot has 0 bookings and will be permanently deleted.</>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingSlot(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingSlot._id)}
              >
                Proceed
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
