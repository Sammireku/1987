import React from 'react';
import { motion } from 'motion/react';
import { 
  TreePine, 
  Award, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Hammer, 
  Leaf, 
  Compass, 
  Building2,
  Users
} from 'lucide-react';

interface CompanyProfileViewProps {
  onNavigateToProducts: () => void;
  onNavigateToStudio: () => void;
  onNavigateToContact: () => void;
}

export const CompanyProfileView: React.FC<CompanyProfileViewProps> = ({
  onNavigateToProducts,
  onNavigateToStudio,
  onNavigateToContact,
}) => {
  const milestones = [
    {
      year: '1939',
      title: 'The Sawmill Origins',
      description: 'Founded in the alpine foothills of Upper Austria as an artisanal timber mill, dedicated solely to harvesting mature regional hardwood trees.',
    },
    {
      year: '1958',
      title: '3-Layer Solid Core Invention',
      description: 'Pioneered cross-laminated 3-layer solid hardwood panel technology, eliminating warp while maintaining 100% natural wood breathability without MDF.',
    },
    {
      year: '1987',
      title: 'The Atelier Renaissance',
      description: 'Rebranded into the 1987 Atelier, introducing architectural furniture collections with patented nonstop extension dining mechanisms.',
    },
    {
      year: '2004',
      title: 'The Pure Botanical Pledge',
      description: 'Eliminated all synthetic varnishes and chemical sealants, moving entirely to organic cold-pressed herbal oils and pure beeswax.',
    },
    {
      year: '2026',
      title: 'Spatial Craft & True-Scale AR',
      description: 'Bridging physical Austrian master joinery with spatial computing, allowing clients worldwide to configure and project bespoke furniture in 1:1 true scale.',
    },
  ];

  return (
    <div className="bg-[#FAF8F5] text-[#22201D] font-sans pb-24">
      
      {/* Editorial Hero */}
      <section className="relative py-24 bg-[#1A1917] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-widest uppercase text-[#C5A880]">
            <TreePine className="w-3.5 h-3.5" />
            <span>PRO DWA · It&apos;s a Tree Story</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-6xl font-bold leading-tight">
            87 Years of Passion <br />
            <span className="italic font-light text-[#C5A880]">for Authentic</span> Woodcraft
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-white/80 leading-relaxed font-light">
            Genuine solid wood brings comfort and warmth into your home. It breathes, absorbs humidity, and releases it when dry. For nearly nine decades, our Austrian workshop has preserved the purity of the living tree.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onNavigateToProducts}
              className="px-8 py-3.5 rounded-xl bg-[#C5A880] hover:bg-[#D4AF37] text-[#1A1917] font-semibold text-xs tracking-wider uppercase transition-all shadow-xl cursor-pointer"
            >
              Explore Collection
            </button>
            <button
              onClick={onNavigateToContact}
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Visit Our Flagships
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Woodcraft */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
            The 1987 Standards
          </div>
          <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold text-[#1A1917]">
            The 4 Pillars of Austrian Craftsmanship
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-[#E8E3DA] space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C4B23] flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Sustainable Forestry</h3>
            <p className="text-xs text-[#615951] leading-relaxed">
              Every tree is harvested selectively in certified European forests at peak maturity. For each tree felled, two new saplings are planted in our regional reforestation trust.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E8E3DA] space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C4B23] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Open-Pored Breathing</h3>
            <p className="text-xs text-[#615951] leading-relaxed">
              We never suffocate wood beneath polyurethane plastic coatings. Our organic herbal oils leave the natural capillary pores open, enabling natural electrostatic air purification.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E8E3DA] space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C4B23] flex items-center justify-center">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">3-Layer Solid Core</h3>
            <p className="text-xs text-[#615951] leading-relaxed">
              Cross-laminated hardwood layers prevent swelling and warping under fluctuating seasonal humidity, achieving 0.2mm mechanical tolerances without composite MDF.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#E8E3DA] space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#8C4B23] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Heirloom Longevity</h3>
            <p className="text-xs text-[#615951] leading-relaxed">
              Backed by our 10-year master joinery warranty. Solid wood can be sanded, re-oiled, and cherished across multiple generations without losing structural integrity.
            </p>
          </div>

        </div>
      </section>

      {/* Timeline of Passion */}
      <section className="bg-[#EFECE6] border-y border-[#E2DDD5] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
              Our Journey Through Time
            </div>
            <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold text-[#1A1917]">
              From Alpine Mill to Global Design Icon
            </h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-[#C5A880]/40">
            {milestones.map((m, idx) => (
              <div 
                key={m.year}
                className={`relative flex flex-col sm:flex-row items-start ${
                  idx % 2 === 0 ? 'sm:flex-row-reverse' : ''
                } gap-6 sm:gap-12`}
              >
                {/* Center Badge */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1A1917] border-2 border-[#C5A880] text-white flex items-center justify-center z-10 shadow-md font-mono text-[10px] font-bold">
                  {idx + 1}
                </div>

                {/* Content Block */}
                <div className={`pl-12 sm:pl-0 sm:w-1/2 ${idx % 2 === 0 ? 'sm:text-left sm:pr-12' : 'sm:text-left sm:pl-12'}`}>
                  <div className="bg-white p-6 rounded-2xl border border-[#E8E3DA] shadow-xs space-y-2">
                    <span className="font-mono text-sm font-bold text-[#8C4B23]">{m.year}</span>
                    <h4 className="font-['Cinzel'] text-lg font-bold text-[#1A1917]">{m.title}</h4>
                    <p className="text-xs text-[#615951] leading-relaxed">{m.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Sustainable Certification Pledge Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[#1A1917] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A880]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="text-xs font-mono text-[#C5A880] uppercase tracking-widest font-semibold">
              The Pure Wood Guarantee
            </div>
            <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold">
              Pure Austrian Hardwoods. No Chemical Off-Gassing.
            </h3>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Every item leaving our workshop carries an engraved serial hallmark verifying certified timber origin, master joiner signature, and natural oil blend certification.
            </p>
          </div>

          <button
            onClick={onNavigateToStudio}
            className="px-6 py-3.5 rounded-xl bg-[#C5A880] hover:bg-[#D4AF37] text-[#1A1917] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shrink-0 cursor-pointer"
          >
            Launch 3D Studio
          </button>
        </div>
      </section>

    </div>
  );
};
