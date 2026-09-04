import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Dumbbell, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { Button } from '../../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Story Hero */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-4">
            OUR PHILOSOPHY
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none mb-6">
            BUILT FOR PEOPLE WHO REFUSE TO STAY <span className="text-[#CCFF00]">AVERAGE.</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-xl leading-relaxed">
            FORGE was established with a singular objective: eradicate crowded commercial gyms where people waste time waiting for machines. We designed a performance facility built around time slots, master coaching, and world-class equipment.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
            <Dumbbell className="w-10 h-10 text-[#CCFF00] mb-4" />
            <h3 className="text-xl font-bold uppercase mb-2">ELEIKO COMPETITION SPEC</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every barbell, bumper plate, power rack, and platform meets IPF and IWF international standards for pure lifting precision.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
            <ShieldCheck className="w-10 h-10 text-[#CCFF00] mb-4" />
            <h3 className="text-xl font-bold uppercase mb-2">GUARANTEED SPOT CAPACITY</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Strict capacity limits on every slot mean zero crowding, immediate equipment access, and focused coaching on every repetition.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
            <Flame className="w-10 h-10 text-[#CCFF00] mb-4" />
            <h3 className="text-xl font-bold uppercase mb-2">SYSTEMIC CONTRAST THERAPY</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Sub-zero ice plunge tubs and Finnish cedar saunas engineered to reduce systemic inflammation, optimize CNS recovery, and prime you for tomorrow.
            </p>
          </div>
        </div>

        {/* Large Visual Feature */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 mb-20 shadow-2xl h-[500px]">
          <img
            src="/assets/hero_gym.jpg"
            alt="FORGE Interior Arena"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8 sm:p-12">
            <div className="max-w-2xl">
              <span className="text-xs font-black text-[#CCFF00] uppercase tracking-widest">
                THE MAIN ARENA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mt-1">
                12,000 SQ. FT. OF PURE ATHLETIC CAPACITY
              </h2>
              <p className="text-sm text-zinc-300 mt-2 mb-6">
                Zoned for Olympic lifting, sprint agility, powerlifting cages, and recovery sanctuaries.
              </p>
              <Link to="/schedule">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Book a Session
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
