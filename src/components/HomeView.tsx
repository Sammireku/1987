import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Camera, 
  Sliders, 
  Sparkles, 
  TreePine, 
  Award, 
  ShieldCheck, 
  Clock, 
  Eye, 
  Check, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Compass,
  Layers
} from 'lucide-react';
import { FurnitureItem, MaterialOption } from '../types/furniture';
import { ProductImage } from '../utils/productImages';

interface HomeViewProps {
  catalog: FurnitureItem[];
  woodMaterials?: MaterialOption[];
  onSelectProduct: (product: FurnitureItem) => void;
  onNavigateToProducts: () => void;
  onNavigateToProductDetail?: (product: FurnitureItem) => void;
  onNavigateToStudio: () => void;
  onNavigateToCompany: () => void;
  onNavigateToContact: () => void;
  onOpenARForProduct: (product: FurnitureItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  catalog,
  woodMaterials = [],
  onSelectProduct,
  onNavigateToProducts,
  onNavigateToProductDetail,
  onNavigateToStudio,
  onNavigateToCompany,
  onNavigateToContact,
  onOpenARForProduct,
}) => {
  const [scrollY, setScrollY] = useState<number>(0);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [activeWoodTab, setActiveWoodTab] = useState<string>(woodMaterials[0]?.id || 'walnut');

  // Track scroll position for smooth parallax and reveals
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Featured Silhouettes from Catalogue 87
  const featuredSilhouettes = catalog?.slice(0, 4) || [];

  const defaultWoodFallback: MaterialOption = {
    id: 'sapele',
    name: 'Ghanaian Golden Sapele',
    category: 'wood',
    colorHex: '#4A3525',
    description: 'Deep lustrous amber-brown with subtle ribbon figure and natural cedar undertones. Harvested from certified mature Ashanti timber reserves.',
    origin: 'Ghana Forestry Commission Certified Concession',
    priceModifier: 180,
    roughness: 0.6,
    metalness: 0.05,
  };

  const selectedWood = (woodMaterials && woodMaterials.find(w => w.id === activeWoodTab)) || woodMaterials?.[0] || defaultWoodFallback;

  return (
    <div className="bg-[#FAF8F5] text-[#22201D] font-sans overflow-x-hidden">
      
      {/* 1. IMMERSIVE VIDEO HERO WITH PARALLAX SCROLL EFFECT */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden flex items-center justify-center">
        
        {/* Video Background Container with Dynamic Scroll Parallax & Opacity Scaling */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-100 ease-out"
          style={{
            transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0004})`,
            opacity: Math.max(0.2, 1 - scrollY * 0.0014),
          }}
        >
          {/* Loop Video: Luxury interior & modern architecture */}
          <video
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
            className="w-full h-full object-cover filter brightness-[0.72] contrast-[1.08]"
            poster="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80"
          >
            <source 
              src="https://assets.mixkit.co/videos/preview/mixkit-modern-living-room-with-minimalist-furniture-41485-large.mp4" 
              type="video/mp4" 
            />
            {/* Fallback image */}
            <img 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80" 
              alt="Luxury Interior Atelier" 
              className="w-full h-full object-cover" 
            />
          </video>

          {/* Cinematic Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917] via-black/40 to-black/60 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)] pointer-events-none"></div>
        </div>

        {/* Video Audio & Playback Controls Floating Widget */}
        <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-colors cursor-pointer"
            title={isVideoMuted ? 'Unmute Ambient Sound' : 'Mute Sound'}
          >
            {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#C5A880]" />}
          </button>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 pt-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-xs font-mono tracking-[0.3em] uppercase text-[#C5A880] shadow-xl"
          >
            <TreePine className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Catalogue 87 · PRO DWA</span>
            <span>·</span>
            <span>Ghanaian Woodcraft</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="font-['Cinzel'] text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] text-white drop-shadow-md"
          >
            Where Architecture <br className="hidden sm:inline" />
            <span className="italic font-light text-[#C5A880]">Meets</span> Pure Solid Wood
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-white/85 leading-relaxed font-light drop-shadow-sm"
          >
            Genuine open-pored solid wood brings comfort and warmth into your home. It breathes, absorbs humidity, and releases it when dry. Discover our 87 Collection of sculptural seating, nonstop extension tables, and floating cabinetry.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={onNavigateToProducts}
              className="px-8 py-3.5 rounded-xl bg-[#C5A880] hover:bg-[#D4AF37] text-[#1A1917] font-semibold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore All 38 Pieces</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToStudio}
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-semibold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sliders className="w-4 h-4 text-[#C5A880]" />
              <span>Launch 3D Studio</span>
            </button>

            <button
              onClick={onNavigateToCompany}
              className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-white/90 hover:text-white border border-white/20 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              <span>Our Story</span>
            </button>
          </motion.div>

        </div>

        {/* Scroll Indicator Prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/60 text-[10px] font-mono tracking-widest uppercase pointer-events-none">
          <span>Scroll to Discover</span>
          <div className="w-4 h-7 rounded-full border border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 rounded-full bg-[#C5A880] animate-bounce"></div>
          </div>
        </div>

      </section>

      {/* 2. PHILOSOPHY RIBBON (87 Years of Passion for Wood) */}
      <section className="border-b border-[#E8E3DA] bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
                Ghanaian Heritage
              </div>
              <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Master Woodcraft Since 1987</h3>
              <p className="text-xs text-[#615951] leading-relaxed">
                Rooted in Kumasi and Accra with a devotion to indigenous hardwoods, creating heirloom architectural pieces that last decades.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
                Ecological Balance
              </div>
              <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Certified Forestry</h3>
              <p className="text-xs text-[#615951] leading-relaxed">
                100% sustainable Ghanaian felling licensed under TIDD & FLEGT. Cared for strictly with organic botanical plant oils.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
                3-Layer Board Core
              </div>
              <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Zero Composite MDF</h3>
              <p className="text-xs text-[#615951] leading-relaxed">
                Cross-laminated solid hardwood layers prevent warping, delivering unmatched structural tolerance and beauty.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
                Spatial Technology
              </div>
              <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">True 1:1 Metric AR</h3>
              <p className="text-xs text-[#615951] leading-relaxed">
                Project virtual pieces directly into your room with real-time contact shadows, lighting match, and spatial screenshot captures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED MASTERPIECES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E3DA] pb-8">
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
              The 87 Collection Highlights
            </div>
            <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold text-[#1A1917]">
              Masterpieces in Solid Timber
            </h2>
            <p className="text-xs sm:text-sm text-[#615951] max-w-2xl leading-relaxed">
              Every design is parametrically scalable and hand-finished in your choice of certified Ghanaian hardwoods and Sunbrella™ performance textiles.
            </p>
          </div>

          <button
            onClick={onNavigateToProducts}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-[#8C4B23] font-bold uppercase hover:text-[#1A1917] transition-colors cursor-pointer"
          >
            <span>View Complete Catalogue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSilhouettes.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-[#E8E3DA] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#8C4B23]/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Media Preview */}
              <div 
                onClick={() => onNavigateToProductDetail && onNavigateToProductDetail(item)}
                className="relative aspect-[4/3] bg-[#F5F2EB] flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <ProductImage
                  product={item}
                  alt={item.name}
                  containerClassName="w-full h-full"
                  className="group-hover:scale-108 transition-transform duration-700 ease-out object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"></div>

                <span className="absolute top-3 left-3 bg-[#1A1917]/90 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wider z-10 shadow-xs">
                  Cat. p. {item.catalogPage || '1'}
                </span>

                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <span className="px-3.5 py-2 rounded-xl bg-white/95 text-[#1A1917] text-xs font-semibold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye className="w-3.5 h-3.5 text-[#8C4B23]" />
                    <span>Inspect Silhouette</span>
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C4B23] font-semibold truncate">
                    {item.subtitle}
                  </div>
                  <h3 
                    onClick={() => onNavigateToProductDetail(item)}
                    className="font-['Cinzel'] text-base font-bold text-[#1A1917] group-hover:text-[#8C4B23] transition-colors cursor-pointer"
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#615951] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E3DA] flex items-center justify-between">
                  <span className="font-['Cinzel'] text-sm font-bold text-[#1A1917]">
                    ${item.basePrice.toLocaleString('en-US')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectProduct(item)}
                      className="p-2 rounded-lg bg-[#1A1917] hover:bg-black text-white transition-colors cursor-pointer"
                      title="Customize in 3D Studio"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                    </button>
                    <button
                      onClick={() => onOpenARForProduct(item)}
                      className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#C5A880] text-[#1A1917] transition-colors cursor-pointer"
                      title="View in AR"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#8C4B23]" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 4. TACTILE MATERIAL LAB: CERTIFIED TIMBER EXPLORATION */}
      <section className="bg-[#EFECE6] border-y border-[#E2DDD5] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
              Authentic Materials · Catalogue Pages 54–57
            </div>
            <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold text-[#1A1917]">
              12 Authentic Wood Species & Sunbrella™ Acrylics
            </h2>
            <p className="text-xs sm:text-sm text-[#524B43] leading-relaxed">
              We never use veneer on particle board. Every curve, tabletop, and leg is milled from solid Ghanaian hardwood, conditioned with botanical oils that let the organic fibers breathe.
            </p>
          </div>

          {/* Species Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {woodMaterials.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveWoodTab(w.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeWoodTab === w.id
                    ? 'bg-[#1A1917] text-white shadow-md'
                    : 'bg-white border border-[#E2DDD5] text-[#524B43] hover:text-[#1A1917]'
                }`}
              >
                <span 
                  className="w-3 h-3 rounded-full border border-black/20"
                  style={{ backgroundColor: w.colorHex }}
                />
                <span>{w.name}</span>
              </button>
            ))}
          </div>

          {/* Active Wood Deep Dive Card */}
          <div className="bg-white rounded-3xl border border-[#E8E3DA] p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            <div className="space-y-3 md:col-span-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8C4B23] font-semibold">
                Origin: {selectedWood.origin || 'Ghana Forestry Commission Certified Concession'}
              </div>
              <h3 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-[#1A1917]">
                {selectedWood.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#615951] leading-relaxed">
                {selectedWood.description}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8E3DA] text-xs">
                <div>
                  <div className="text-[#766E65] text-[10px] font-mono uppercase">Wood Moisture</div>
                  <div className="font-bold text-[#1A1917] mt-0.5">7% – 9% Kiln-Dried</div>
                </div>
                <div>
                  <div className="text-[#766E65] text-[10px] font-mono uppercase">Finish Treatment</div>
                  <div className="font-bold text-[#1A1917] mt-0.5">Organic Herbal Glaze</div>
                </div>
                <div>
                  <div className="text-[#766E65] text-[10px] font-mono uppercase">Emission Class</div>
                  <div className="font-bold text-[#8C4B23] mt-0.5">Zero VOC Purifying</div>
                </div>
              </div>
            </div>

            {/* Visual Swatch Plinth */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] border border-[#E8E3DA] rounded-2xl text-center space-y-3">
              <div 
                className="w-28 h-28 rounded-2xl shadow-inner border-4 border-white"
                style={{ backgroundColor: selectedWood.colorHex }}
              />
              <div className="text-xs font-mono font-semibold text-[#1A1917]">
                {selectedWood.name}
              </div>
              <button
                onClick={onNavigateToStudio}
                className="text-[11px] font-mono text-[#8C4B23] hover:underline font-semibold cursor-pointer"
              >
                Configure in 3D Studio →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[#1A1917] text-white rounded-3xl p-8 sm:p-14 border border-[#C5A880]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="text-[#C5A880] text-xs font-mono uppercase tracking-[0.25em] font-semibold">
              Bespoke Commissioning Service
            </div>
            <h2 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold leading-tight">
              Have an Architectural Space in Mind?
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Our master joiners adapt any 1987 silhouette to your exact millimeter dimensions, customized wood species, and Sunbrella textiles. In-home white glove delivery included.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToContact}
              className="px-6 py-3.5 rounded-xl bg-[#C5A880] hover:bg-[#D4AF37] text-[#1A1917] text-xs font-semibold tracking-wider uppercase transition-all shadow-lg cursor-pointer"
            >
              Contact Atelier Concierge
            </button>
            <button
              onClick={onNavigateToProducts}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Browse Showroom
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
