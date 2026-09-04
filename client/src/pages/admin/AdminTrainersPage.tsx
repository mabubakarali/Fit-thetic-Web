import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, Plus, Edit2, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { trainerService } from '../../services/trainerService';
import { Trainer } from '../../types';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../services/api';

export const AdminTrainersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['adminTrainers'],
    queryFn: () => trainerService.getAll(true),
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Strength Coach',
    bio: '',
    specialization: 'Strength, Hypertrophy, Biomechanics',
    profileImage: '/assets/trainer_ahmed.jpg',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    startHour: '06:00',
    endHour: '14:00',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trainerService.create(data),
    onSuccess: () => {
      setIsModalOpen(false);
      setFormSuccess('Trainer created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminTrainers'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => trainerService.update(id, data),
    onSuccess: () => {
      setEditingTrainer(null);
      setIsModalOpen(false);
      setFormSuccess('Trainer updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminTrainers'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  const handleOpenCreate = () => {
    setEditingTrainer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'Strength & Conditioning Coach',
      bio: '',
      specialization: 'Strength, Hypertrophy',
      profileImage: '/assets/trainer_ahmed.jpg',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      startHour: '06:00',
      endHour: '14:00',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      position: trainer.position,
      bio: trainer.bio,
      specialization: trainer.specialization.join(', '),
      profileImage: trainer.profileImage,
      workingDays: trainer.workingDays || ['Mon'],
      startHour: trainer.workingHours?.start || '06:00',
      endHour: trainer.workingHours?.end || '14:00',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      bio: formData.bio,
      specialization: formData.specialization.split(',').map((s) => s.trim()),
      profileImage: formData.profileImage,
      workingDays: formData.workingDays,
      workingHours: { start: formData.startHour, end: formData.endHour },
    };

    if (editingTrainer) {
      updateMutation.mutate({ id: editingTrainer._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            STAFF & COACHING ROSTER
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            COACH <span className="text-[#CCFF00]">MANAGEMENT</span>
          </h1>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Trainer
        </Button>
      </div>

      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>{formSuccess}</span>
          <button onClick={() => setFormSuccess(null)}>✕</button>
        </div>
      )}

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div key={trainer._id} className="p-6 rounded-3xl bg-[#111111] border border-[#222222] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={trainer.profileImage}
                  alt={trainer.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/20"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{trainer.name}</h3>
                  <div className="text-xs text-[#CCFF00] font-semibold">{trainer.position}</div>
                  <div className="text-[11px] text-zinc-400">{trainer.email}</div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">{trainer.bio}</p>

              <div className="space-y-1.5 pt-3 border-t border-white/5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>
                    {trainer.workingHours?.start} — {trainer.workingHours?.end} ({trainer.workingDays?.join(', ')})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(trainer)} leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                Edit Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT TRAINER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-lg bg-[#121212] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold uppercase text-white">
              {editingTrainer ? 'Edit Trainer Profile' : 'Add New Trainer'}
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Position / Title</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Bio</label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Specializations (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">Start Hour</label>
                  <input
                    type="time"
                    required
                    value={formData.startHour}
                    onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold uppercase mb-1">End Hour</label>
                  <input
                    type="time"
                    required
                    value={formData.endHour}
                    onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  Save Trainer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
