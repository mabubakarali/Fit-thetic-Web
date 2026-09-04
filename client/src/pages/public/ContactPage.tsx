import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { Button } from '../../components/common/Button';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Membership Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
            CONCIERGE & SUPPORT
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            GET IN <span className="text-[#CCFF00]">TOUCH</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Have questions about slot bookings, concierge memberships, or private coaching? Speak directly with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222] space-y-6">
              <h3 className="text-xl font-bold uppercase text-white">DIRECT CONTACT</h3>
              
              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#1A1A1A] text-[#CCFF00] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Facility Address</div>
                    <div className="text-zinc-400 mt-0.5">{BRAND.contact.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#1A1A1A] text-[#CCFF00] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Concierge Phone</div>
                    <div className="text-zinc-400 mt-0.5">{BRAND.contact.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#1A1A1A] text-[#CCFF00] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Email Concierge</div>
                    <div className="text-zinc-400 mt-0.5">{BRAND.contact.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-[#1A1A1A] text-[#CCFF00] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Hours of Operation</div>
                    <div className="text-zinc-400 mt-0.5">{BRAND.openingHours}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222]">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center mx-auto text-[#CCFF00]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase">MESSAGE RECEIVED</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  Our concierge team has received your message and will respond within 2 business hours.
                </p>
                <Button variant="secondary" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold uppercase text-white mb-2">SEND AN INQUIRY</h3>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                    placeholder="e.g. Zayn Ali"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                      placeholder="zayn@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                      placeholder="+92 300 0000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                    placeholder="How can our concierge assist you?"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full justify-center" rightIcon={<Send className="w-4 h-4" />}>
                  SUBMIT INQUIRY
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
