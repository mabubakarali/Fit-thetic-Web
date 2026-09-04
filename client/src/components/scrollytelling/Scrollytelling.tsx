import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

interface StoryStep {
  number: string;
  phase: string;
  tagline: string;
  description: string;
  stats: string;
  image: string;
  focus: string[];
}

const STORY_STEPS: StoryStep[] = [
  {
    number: '01',
    phase: 'ARRIVE',
    tagline: 'Walk in ready.',
    description:
      'No queues. No waiting for equipment. Your training slot is pre-allocated with your personal lifting platform ready.',
    stats: 'Zero Wait Time',
    image: '/assets/scrolly_arrive.jpg',
    focus: ['Dedicated Platform', 'Towel & Recovery Concierge', 'Seamless Digital Check-In'],
  },
  {
    number: '02',
    phase: 'TRAIN',
    tagline: 'Train with purpose.',
    description:
      'Olympic barbells, custom competition plates, and master strength coaches cueing your movement patterns.',
    stats: '100% Calibrated Gear',
    image: '/assets/scrolly_train.jpg',
    focus: ['Eleiko Competition Plates', 'Biomechanical Form Checks', 'Progressive Periodization'],
  },
  {
    number: '03',
    phase: 'PERFORM',
    tagline: 'Push your limits.',
    description:
      'High-velocity sprint turf, battle ropes, and metabolic conditioning zones engineered for peak athletic output.',
    stats: 'Athletic High-Intensity Zone',
    image: '/assets/scrolly_perform.jpg',
    focus: ['Sprint Turf & Sled Tracks', 'Metabolic Threshold Work', 'Explosive Power Drills'],
  },
  {
    number: '04',
    phase: 'RECOVER',
    tagline: 'Leave stronger.',
    description:
      'Sub-zero ice bath therapy, cedar wood Finnish saunas, and percussion therapy to accelerate systemic recovery.',
    stats: 'Full Contrast Therapy',
    image: '/assets/scrolly_recover.jpg',
    focus: ['3°C Cold Plunge', 'Infrared & Cedar Saunas', 'Theragun Percussion Lounge'],
  },
];

export const Scrollytelling: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate scroll progress within this container
      const totalScrollableHeight = rect.height - windowHeight;
      if (totalScrollableHeight <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.min(Math.max(currentScroll / totalScrollableHeight, 0), 0.999);
      const stepIndex = Math.floor(progress * STORY_STEPS.length);

      setActiveStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="relative bg-[#080808] text-white">
      {/* Background section header */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
          THE FORGE METHOD
        </div>
        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
          YOUR SESSION. <span className="text-[#CCFF00]">YOUR TIME.</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mt-3">
          Every minute inside FORGE is engineered for pure performance. Experience the seamless training cycle from entry to recovery.
        </p>
      </div>

      {/* Scrollytelling Sticky Viewport Container */}
      <div className="relative min-h-[400vh]">
        <div className="sticky top-20 h-[85vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10 lg:gap-14 overflow-hidden">
          
          {/* Visual Showcase (Sticky Image Canvas) */}
          <div className="w-full lg:w-3/5 h-[45vh] lg:h-full relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#111111]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={STORY_STEPS[activeStep].image}
                  alt={STORY_STEPS[activeStep].phase}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Metric Pill */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                  <div className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                    {STORY_STEPS[activeStep].stats}
                  </div>
                  <div className="text-4xl font-black text-white/20 tracking-tighter">
                    {STORY_STEPS[activeStep].number}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Story Content & Controls */}
          <div className="w-full lg:w-2/5 flex flex-col justify-between h-[35vh] lg:h-full py-2 lg:py-12">
            
            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {STORY_STEPS.map((step, idx) => (
                <button
                  key={step.number}
                  onClick={() => {
                    if (containerRef.current) {
                      const top = containerRef.current.offsetTop;
                      const stepHeight = containerRef.current.offsetHeight / 4;
                      window.scrollTo({ top: top + stepHeight * idx + 50, behavior: 'smooth' });
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeStep ? 'bg-[#CCFF00] shadow-[0_0_10px_#CCFF00]' : 'bg-white/10 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Dynamic Step Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-4"
              >
                <div className="text-sm font-black tracking-widest text-[#CCFF00] uppercase">
                  PHASE {STORY_STEPS[activeStep].number} — {STORY_STEPS[activeStep].phase}
                </div>
                <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                  "{STORY_STEPS[activeStep].tagline}"
                </h3>
                <p className="text-zinc-400 text-base leading-relaxed">
                  {STORY_STEPS[activeStep].description}
                </p>

                {/* Focus bullet points */}
                <div className="pt-3 space-y-2">
                  {STORY_STEPS[activeStep].focus.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#CCFF00] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTA action */}
            <div className="pt-6">
              <Link to="/schedule">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Book Your Training Slot
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
