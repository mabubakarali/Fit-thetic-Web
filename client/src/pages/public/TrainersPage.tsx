import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { trainerService } from '../../services/trainerService';
import { Button } from '../../components/common/Button';

export const TrainersPage: React.FC = () => {
  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainerService.getAll(),
  });

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
            MASTER COACHING ROSTER
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            MEET THE <span className="text-[#CCFF00]">COACHES</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Every session at FORGE is led by a dedicated coach ensuring uncompromising biomechanics, progression, and safety.
          </p>
        </div>

        {/* Trainers Roster */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-[#121212] animate-pulse border border-[#222222]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div
                key={trainer._id}
                className="group rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden hover:border-[#CCFF00]/50 transition-all flex flex-col justify-between"
              >
                <div className="h-96 relative overflow-hidden bg-[#181818]">
                  <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-black text-white">{trainer.name}</h3>
                    <div className="text-xs font-bold text-[#CCFF00] uppercase tracking-wider">
                      {trainer.position}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">{trainer.bio}</p>

                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Specializations
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {trainer.specialization.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#1C1C1C] text-xs font-semibold text-zinc-300 border border-white/5"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
                      <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>
                        On Duty: {trainer.workingHours?.start} — {trainer.workingHours?.end} ({trainer.workingDays?.join(', ')})
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link to="/schedule">
                      <Button variant="primary" size="md" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Book with {trainer.name.split(' ')[0]}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
