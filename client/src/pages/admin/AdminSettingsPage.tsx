import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { GymSettings } from '../../types';
import { Button } from '../../components/common/Button';
import { getErrorMessage } from '../../services/api';

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['gymSettings'],
    queryFn: () => settingsService.getSettings(),
  });

  const [formData, setFormData] = useState<Partial<GymSettings>>({});

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<GymSettings>) => settingsService.updateSettings(data),
    onSuccess: () => {
      setSuccess('Gym settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['gymSettings'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          FACILITY CONFIGURATION
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
          GYM <span className="text-[#CCFF00]">SETTINGS</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure operating policies, cancellation windows, timezone, and public gym information.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-zinc-500 text-xs">Loading settings...</div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#111111] border border-[#222222] space-y-6 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Gym Brand Name</label>
              <input
                type="text"
                required
                value={formData.gymName || 'FORGE'}
                onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Brand Tagline</label>
              <input
                type="text"
                required
                value={formData.tagline || 'BUILT TO PERFORM.'}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Default Slot Capacity</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={formData.defaultCapacity || 12}
                onChange={(e) => setFormData({ ...formData, defaultCapacity: parseInt(e.target.value, 10) || 12 })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Cancellation Window (Hours)</label>
              <input
                type="number"
                min={0}
                max={48}
                required
                value={formData.cancellationWindowHours || 2}
                onChange={(e) => setFormData({ ...formData, cancellationWindowHours: parseInt(e.target.value, 10) || 2 })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Server Timezone</label>
              <input
                type="text"
                required
                value={formData.timezone || 'Asia/Karachi'}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-white/5">
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Concierge Email</label>
              <input
                type="email"
                required
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1.5">Concierge Phone</label>
              <input
                type="text"
                required
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 font-bold uppercase mb-1.5">Facility Street Address</label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={updateMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      )}

    </div>
  );
};
