import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Compass, 
  Calendar,
  MessageSquare
} from 'lucide-react';

export const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: 'residential',
    preferredWood: 'walnut',
    message: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectType: 'residential',
        preferredWood: 'walnut',
        message: '',
      });
    }, 4000);
  };

  const flagships = [
    {
      city: 'Vienna Flagship & Wood Lab',
      country: 'Austria',
      address: 'Kärntner Straße 18, 1010 Wien',
      hours: 'Mon – Sat: 10:00 – 19:00',
      phone: '+43 1 512 8700',
      email: 'vienna@1987-furniture.at',
    },
    {
      city: 'Salzburg Alpine Atelier',
      country: 'Austria',
      address: 'Alpenstraße 42, 5020 Salzburg',
      hours: 'Mon – Fri: 09:00 – 18:00',
      phone: '+43 662 840 1987',
      email: 'salzburg@1987-furniture.at',
    },
    {
      city: 'Zurich Design Salon',
      country: 'Switzerland',
      address: 'Bahnhofstrasse 26, 8001 Zürich',
      hours: 'Mon – Sat: 10:00 – 18:30',
      phone: '+41 44 211 1987',
      email: 'zurich@1987-furniture.ch',
    },
    {
      city: 'New York Trade Suite',
      country: 'United States',
      address: 'Greene Street, SoHo, NY 10012',
      hours: 'By Private Appointment',
      phone: '+1 (212) 555-1987',
      email: 'ny@1987-furniture.com',
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#22201D] font-sans min-h-screen pb-24">
      
      {/* Editorial Header */}
      <section className="bg-[#1A1917] text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-[#C5A880] tracking-widest uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Atelier Concierge</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-5xl font-bold">
            Bespoke Inquiries & Concierge
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-white/80 leading-relaxed font-light">
            Whether you require a custom-dimensioned nonstop dining table, a commercial trade commission, or a private showroom appointment with our master joiners.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Bespoke Commission Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E3DA] p-6 sm:p-10 shadow-sm space-y-6">
            
            <div className="space-y-2 border-b border-[#E8E3DA] pb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8C4B23] font-semibold">
                Direct Inquiry
              </span>
              <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-[#1A1917]">
                Commission a Piece
              </h2>
              <p className="text-xs text-[#615951]">
                Fill out the specifications below and an atelier project director will respond within 24 business hours.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl bg-[#FAF8F5] border border-[#C5A880] text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Inquiry Received</h3>
                <p className="text-xs text-[#615951] max-w-md mx-auto">
                  Thank you, {formData.name || 'valued client'}. Your commission details have been routed to our Austrian head atelier. We will reach out shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1917]">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3DA] text-xs focus:outline-none focus:border-[#8C4B23] bg-[#FAF8F5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1917]">Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. eleanor@vance-interiors.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3DA] text-xs focus:outline-none focus:border-[#8C4B23] bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1917]">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+43 / +1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3DA] text-xs focus:outline-none focus:border-[#8C4B23] bg-[#FAF8F5]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1A1917]">Project Scope</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3DA] text-xs focus:outline-none focus:border-[#8C4B23] bg-[#FAF8F5]"
                    >
                      <option value="residential">Private Residential Interior</option>
                      <option value="hospitality">Hospitality / Boutique Hotel</option>
                      <option value="trade">Architect & Interior Designer Trade</option>
                      <option value="bespoke">Bespoke Custom Dimension Table</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1A1917]">Commission Details & Architectural Notes</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your desired piece, space dimensions, or timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E3DA] text-xs focus:outline-none focus:border-[#8C4B23] bg-[#FAF8F5] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1A1917] hover:bg-black text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Transmit Commission Request</span>
                </button>

              </form>
            )}

          </div>

          {/* RIGHT: Flagship Atelier Showrooms & Direct Concierge */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#1A1917] text-white rounded-3xl p-6 sm:p-8 border border-[#C5A880]/30 shadow-xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C5A880] font-semibold">
                Direct Assistance
              </span>
              <h3 className="font-['Cinzel'] text-xl font-bold">
                Private Consultation Suite
              </h3>
              <p className="text-xs text-white/75 leading-relaxed">
                Schedule a 1-on-1 virtual design session with our CAD engineers or visit an atelier flagship in person to experience the grain and weight of solid Austrian timbers.
              </p>

              <div className="pt-2 border-t border-white/10 space-y-3 text-xs">
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="w-4 h-4 text-[#C5A880]" />
                  <span>+43 1 512 8700 (Mon–Fri 09:00 – 18:00 CET)</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="w-4 h-4 text-[#C5A880]" />
                  <span>concierge@1987-furniture.at</span>
                </div>
              </div>
            </div>

            {/* Flagships List */}
            <div className="space-y-4">
              <h3 className="font-['Cinzel'] text-lg font-bold text-[#1A1917]">
                Flagship Showrooms & Studios
              </h3>

              <div className="space-y-3">
                {flagships.map((f) => (
                  <div 
                    key={f.city}
                    className="bg-white rounded-2xl border border-[#E8E3DA] p-4 space-y-1.5 shadow-2xs hover:border-[#8C4B23]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1917]">
                      <span>{f.city}</span>
                      <span className="font-mono text-[10px] text-[#8C4B23] uppercase">{f.country}</span>
                    </div>
                    <div className="text-xs text-[#615951] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C4B23] shrink-0" />
                      <span>{f.address}</span>
                    </div>
                    <div className="text-[11px] text-[#766E65] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{f.hours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
