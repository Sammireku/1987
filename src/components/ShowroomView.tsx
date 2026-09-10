import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Sliders, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Clock, 
  Ruler, 
  Heart, 
  Search, 
  X, 
  Filter, 
  LayoutGrid, 
  Grid3X3, 
  Columns, 
  Eye, 
  Check, 
  ChevronDown, 
  Award, 
  Layers, 
  Info,
  Compass,
  TreePine,
  Sparkle
} from 'lucide-react';
import { FurnitureItem, FurnitureCategory, MaterialOption } from '../types/furniture';
import { ProductImage, getProductGallery } from '../utils/productImages';

interface ShowroomViewProps {
  catalog: FurnitureItem[];
  onSelectProduct: (product: FurnitureItem) => void;
  onOpenARForProduct: (product: FurnitureItem) => void;
  woodMaterials: MaterialOption[];
  fabricMaterials: MaterialOption[];
  onSaveToWishlist?: (product: FurnitureItem) => void;
  isWishlistedProduct?: (productId: string) => boolean;
  onNavigateToProductDetail?: (product: FurnitureItem) => void;
}

type ViewMode = 'editorial' | 'grid' | 'compact';
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'lead-time' | 'alphabetical';

export const ShowroomView: React.FC<ShowroomViewProps> = ({
  catalog,
  onSelectProduct,
  onOpenARForProduct,
  woodMaterials,
  fabricMaterials,
  onSaveToWishlist,
  isWishlistedProduct,
  onNavigateToProductDetail,
}) => {
  // Category & Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWoodFilter, setSelectedWoodFilter] = useState<string>('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<FurnitureItem | null>(null);

  // In-card active swatch selection state: productId -> { woodId?: string, fabricId?: string }
  const [cardSwatches, setCardSwatches] = useState<Record<string, { woodId?: string; fabricId?: string }>>({});

  const categories = [
    { id: 'all', label: 'All Masterpieces' },
    { id: 'sofa', label: 'Sofas & Daybeds' },
    { id: 'chair', label: 'Lounge & Armchairs' },
    { id: 'table', label: 'Dining & Desks' },
    { id: 'credenza', label: 'Sideboards & Storage' },
    { id: 'coffee_table', label: 'Coffee Tables & Benches' },
    { id: 'outdoor', label: 'Outdoor Living' },
    { id: 'lighting', label: 'Architectural Lighting' },
  ];

  const roomFilters = [
    { id: 'all', label: 'All Spaces' },
    { id: 'living', label: 'Living Room' },
    { id: 'dining', label: 'Dining Room' },
    { id: 'outdoor', label: 'Terrace & Garden' },
    { id: 'lighting', label: 'Illumination' },
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-2500', label: 'Under $2,500' },
    { id: '2500-4500', label: '$2,500 – $4,500' },
    { id: 'over-4500', label: '$4,500+' },
  ];

  // Map category to product counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: catalog.length };
    categories.forEach(cat => {
      if (cat.id !== 'all') {
        counts[cat.id] = catalog.filter(item => {
          if (cat.id === 'table') return item.category === 'table' || item.category === 'desk';
          if (cat.id === 'coffee_table') return item.category === 'coffee_table' || item.category === 'bench';
          return item.category === cat.id;
        }).length;
      }
    });
    return counts;
  }, [catalog]);

  // Filter and Sort Logic
  const filteredAndSortedItems = useMemo(() => {
    let result = catalog.filter(item => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'table') {
          if (item.category !== 'table' && item.category !== 'desk') return false;
        } else if (selectedCategory === 'coffee_table') {
          if (item.category !== 'coffee_table' && item.category !== 'bench') return false;
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }

      // Room filter
      if (selectedRoomFilter !== 'all') {
        if (item.roomType && item.roomType !== selectedRoomFilter) return false;
      }

      // Wood filter
      if (selectedWoodFilter !== 'all') {
        if (!item.compatibleWoodIds.includes(selectedWoodFilter) && item.defaultWoodId !== selectedWoodFilter) {
          return false;
        }
      }

      // Price filter
      if (selectedPriceRange === 'under-2500' && item.basePrice >= 2500) return false;
      if (selectedPriceRange === '2500-4500' && (item.basePrice < 2500 || item.basePrice > 4500)) return false;
      if (selectedPriceRange === 'over-4500' && item.basePrice <= 4500) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCraft = item.craftsmanshipNotes.toLowerCase().includes(query);
        const matchesFeatures = item.features.some(f => f.toLowerCase().includes(query));
        if (!matchesName && !matchesSubtitle && !matchesDesc && !matchesCraft && !matchesFeatures) {
          return false;
        }
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'lead-time') return a.leadTimeWeeks - b.leadTimeWeeks;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0; // featured/curated preserves catalog sequence
    });

    return result;
  }, [catalog, selectedCategory, selectedRoomFilter, selectedWoodFilter, selectedPriceRange, searchQuery, sortBy]);

  const handleCardSwatchSelect = (productId: string, type: 'wood' | 'fabric', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardSwatches(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [type === 'wood' ? 'woodId' : 'fabricId']: id
      }
    }));
  };

  const getActiveWood = (item: FurnitureItem) => {
    const selectedId = cardSwatches[item.id]?.woodId || item.defaultWoodId;
    return woodMaterials.find(w => w.id === selectedId) || woodMaterials[0];
  };

  const getActiveFabric = (item: FurnitureItem) => {
    const selectedId = cardSwatches[item.id]?.fabricId || item.defaultFabricId;
    return fabricMaterials.find(f => f.id === selectedId) || fabricMaterials[0];
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#22201D] font-sans pb-24">
      
      {/* 1. TOP EDITORIAL BREADCRUMB & BANNER */}
      <div className="border-b border-[#E8E3DA] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[11px] font-mono tracking-widest text-[#766E65] uppercase">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#8C4B23]">1987 Atelier</span>
            <span>/</span>
            <span className="text-[#22201D]">The 87 Collection</span>
            <span>/</span>
            <span className="hidden sm:inline">PRO DWA · it&apos;s a tree story</span>
          </div>
          <div className="flex items-center gap-4 text-[#8C4B23] font-semibold">
            <span className="hidden md:inline">100% Solid Certified Forestry</span>
            <span className="hidden md:inline">·</span>
            <span>Bespoke 3D & Physical AR</span>
          </div>
        </div>
      </div>

      {/* 2. EDITORIAL HERO SECTION (DI Dribbble Architecture) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 space-y-6">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFE9] border border-[#E2DDD5] text-[10px] font-mono tracking-[0.25em] text-[#8C4B23] uppercase font-semibold">
            <TreePine className="w-3.5 h-3.5 text-[#8C4B23]" />
            <span>Catalogue 87 Pro Dwa</span>
            <span>·</span>
            <span>87 Years of Passion for Wood</span>
          </div>

          <h1 className="font-['Cinzel'] text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1917] tracking-tight leading-[1.1]">
            Where Architecture <span className="italic font-light text-[#8C4B23]">Meets</span> Pure Solid Wood
          </h1>

          <p className="text-sm sm:text-base text-[#615951] leading-relaxed max-w-3xl">
            Genuine open-pored solid wood brings comfort and warmth into your home. It breathes, absorbs humidity, and releases it when the air is dry. Explore our full 87 Collection of sculptural seating, nonstop extension tables, floating storage systems, and architectural luminaires.
          </p>
        </div>

        {/* Top Metric Highlights Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white border border-[#E8E3DA] rounded-xl px-4 py-3">
            <div className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">{catalog.length} Silhouettes</div>
            <div className="text-[10px] font-mono text-[#766E65] uppercase tracking-wider mt-0.5">Handcrafted to Order</div>
          </div>
          <div className="bg-white border border-[#E8E3DA] rounded-xl px-4 py-3">
            <div className="font-['Cinzel'] text-xl font-bold text-[#8C4B23]">12 Solid Woods</div>
            <div className="text-[10px] font-mono text-[#766E65] uppercase tracking-wider mt-0.5">Ghanaian Certified Timber</div>
          </div>
          <div className="bg-white border border-[#E8E3DA] rounded-xl px-4 py-3">
            <div className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">Sunbrella™ Acrylics</div>
            <div className="text-[10px] font-mono text-[#766E65] uppercase tracking-wider mt-0.5">Indoor & Weatherproof</div>
          </div>
          <div className="bg-white border border-[#E8E3DA] rounded-xl px-4 py-3">
            <div className="font-['Cinzel'] text-xl font-bold text-[#8C4B23]">Metric 1:1 Scale AR</div>
            <div className="text-[10px] font-mono text-[#766E65] uppercase tracking-wider mt-0.5">Floor Surface Calibration</div>
          </div>
        </div>
      </div>

      {/* 3. STICKY FILTER & CONTROL BAR (DI Luxury E-commerce Toolbar) */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-y border-[#E8E3DA] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          
          {/* Category Pills with Item Badges */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-medium">
            {categories.map(cat => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  id={`filter-cat-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1A1917] text-white shadow-sm font-semibold'
                      : 'bg-white border border-[#E2DDD5] text-[#524B43] hover:text-[#1A1917] hover:border-[#8C4B23]/40'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#EFECE6] text-[#766E65]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Controls Bar: Search, Dropdowns, Grid Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8E3DA]/60 text-xs">
            
            {/* Left Controls: Search + Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              
              {/* Search Field */}
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#766E65]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search silhouettes, joinery, woods..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white border border-[#E2DDD5] text-xs text-[#22201D] placeholder-[#9E958A] focus:outline-none focus:border-[#8C4B23] focus:ring-1 focus:ring-[#8C4B23]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9E958A] hover:text-[#1A1917]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Wood Species Filter */}
              <select
                value={selectedWoodFilter}
                onChange={(e) => setSelectedWoodFilter(e.target.value)}
                className="bg-white border border-[#E2DDD5] rounded-xl px-3 py-1.5 text-xs text-[#22201D] focus:outline-none focus:border-[#8C4B23] cursor-pointer"
              >
                <option value="all">All Wood Species</option>
                {woodMaterials.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              {/* Room Space Filter */}
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="bg-white border border-[#E2DDD5] rounded-xl px-3 py-1.5 text-xs text-[#22201D] focus:outline-none focus:border-[#8C4B23] cursor-pointer"
              >
                {roomFilters.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>

              {/* Price Range Filter */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="bg-white border border-[#E2DDD5] rounded-xl px-3 py-1.5 text-xs text-[#22201D] focus:outline-none focus:border-[#8C4B23] cursor-pointer"
              >
                {priceRanges.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>

              {/* Reset filters button if any active */}
              {(searchQuery || selectedWoodFilter !== 'all' || selectedRoomFilter !== 'all' || selectedPriceRange !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedWoodFilter('all');
                    setSelectedRoomFilter('all');
                    setSelectedPriceRange('all');
                  }}
                  className="text-[11px] font-mono text-[#8C4B23] hover:underline cursor-pointer px-1 py-1"
                >
                  Clear Filters
                </button>
              )}

            </div>

            {/* Right Controls: Sort + Layout Switcher */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#766E65] font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-[#E2DDD5] rounded-xl px-2.5 py-1.5 text-xs text-[#22201D] focus:outline-none focus:border-[#8C4B23] cursor-pointer"
                >
                  <option value="featured">Curated (Catalogue)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="lead-time">Lead Time: Quickest</option>
                  <option value="alphabetical">Name: A to Z</option>
                </select>
              </div>

              {/* Grid Density View Switcher */}
              <div className="hidden sm:flex items-center bg-white border border-[#E2DDD5] rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('editorial')}
                  title="Editorial 2-Column View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'editorial' ? 'bg-[#1A1917] text-white' : 'text-[#766E65] hover:text-[#1A1917]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Showcase 3-Column View (DI Standard)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#1A1917] text-white' : 'text-[#766E65] hover:text-[#1A1917]'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  title="Compact 4-Column View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'compact' ? 'bg-[#1A1917] text-white' : 'text-[#766E65] hover:text-[#1A1917]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 4. PRODUCT LISTING & EDITORIAL CARDS CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Results Counter */}
        <div className="flex items-center justify-between pb-6 text-xs text-[#766E65] font-mono">
          <div>
            Showing <span className="font-bold text-[#1A1917]">{filteredAndSortedItems.length}</span> handcrafted pieces
            {selectedCategory !== 'all' && <span> in <span className="text-[#8C4B23]">{categories.find(c => c.id === selectedCategory)?.label}</span></span>}
          </div>
          <div className="hidden sm:inline">All items customizable in solid timber & Sunbrella™</div>
        </div>

        {/* Empty Search Results State */}
        {filteredAndSortedItems.length === 0 && (
          <div className="bg-white border border-[#E8E3DA] rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E8E3DA] mx-auto flex items-center justify-center text-[#8C4B23]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">No Matching Masterpieces Found</h3>
            <p className="text-xs text-[#766E65] leading-relaxed">
              We couldn&apos;t find pieces matching your current filters. Try relaxing your wood species, price, or search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedWoodFilter('all');
                setSelectedRoomFilter('all');
                setSelectedPriceRange('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#1A1917] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Dynamic Grid Layout */}
        <div className={`grid gap-6 ${
          viewMode === 'editorial' 
            ? 'grid-cols-1 md:grid-cols-2' 
            : viewMode === 'compact'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredAndSortedItems.map((item, index) => {
            const activeWood = getActiveWood(item);
            const activeFabric = getActiveFabric(item);
            const isWishlisted = isWishlistedProduct ? isWishlistedProduct(item.id) : false;

            return (
              <React.Fragment key={item.id}>
                
                {/* EDITORIAL STORY INTERSTITIAL 1 (Appears after item 5 in Showcase Grid) */}
                {index === 5 && selectedCategory === 'all' && !searchQuery && (
                  <div className={`col-span-full bg-[#22201D] text-white rounded-3xl p-8 md:p-12 border border-[#C5A880]/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 my-4`}>
                    <div className="max-w-2xl space-y-4">
                      <div className="inline-flex items-center gap-2 text-[#C5A880] text-xs font-mono uppercase tracking-[0.25em]">
                        <Award className="w-4 h-4" />
                        <span>Catalogue Page 3 & 4 · Austrian Forestry</span>
                      </div>
                      <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold leading-tight">
                        87 Years of Passion for Wood — It&apos;s a Tree Story
                      </h2>
                      <p className="text-xs md:text-sm text-white/75 leading-relaxed">
                        Pure solid wood brings comfort and warmth into your home. It breathes, absorbs humidity, and releases it when the air is dry. Wood possesses natural antibacterial and antistatic properties. Our trees come from sustainably managed Austrian forestry, cared for with natural organic botanical plant oils.
                      </p>
                      <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-[#C5A880]">
                        <span>· 100% Solid Timber</span>
                        <span>· Non-Toxic Herbal Glazes</span>
                        <span>· Zero Composite MDF</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <div className="font-['Cinzel'] text-4xl font-bold text-[#C5A880]">1987</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-white/60 mt-1">Austrian Artisan Craft</div>
                    </div>
                  </div>
                )}

                {/* EDITORIAL STORY INTERSTITIAL 2 (Appears after item 14) */}
                {index === 14 && selectedCategory === 'all' && !searchQuery && (
                  <div className={`col-span-full bg-[#EAE5DC] text-[#22201D] rounded-3xl p-8 md:p-12 border border-[#D5CEC2] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 my-4`}>
                    <div className="max-w-2xl space-y-4">
                      <div className="inline-flex items-center gap-2 text-[#8C4B23] text-xs font-mono uppercase tracking-[0.25em]">
                        <Compass className="w-4 h-4" />
                        <span>Catalogue Page 54–57 · Authentic Materials</span>
                      </div>
                      <h2 className="font-['Cinzel'] text-2xl md:text-3xl font-bold leading-tight">
                        Sunbrella™ Weather Resistance & 3-Layer Board Technology
                      </h2>
                      <p className="text-xs md:text-sm text-[#524B43] leading-relaxed">
                        Every piece in our outdoor and indoor collection utilizes Sunbrella 100% solution-dyed acrylic fabrics paired with 3-layer cross-laminated solid wood boards. Extremely stable, water-repellent, and UV-stabilized for enduring beauty on sun-drenched terraces and in formal living spaces.
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-4 py-2 rounded-xl bg-white border border-[#D5CEC2] text-xs font-mono font-semibold text-[#8C4B23]">
                        Sunbrella™ Certified
                      </span>
                    </div>
                  </div>
                )}

                {/* THE LUXURY PRODUCT CARD (DI Dribbble Style) */}
                <div 
                  className="group bg-white rounded-2xl border border-[#E8E3DA] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#8C4B23]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Media / Visual Container */}
                  <div 
                    onClick={() => {
                      if (onNavigateToProductDetail) {
                        onNavigateToProductDetail(item);
                      } else {
                        setQuickViewProduct(item);
                      }
                    }}
                    className="relative aspect-[4/3] bg-[#F5F2EB] flex items-center justify-center overflow-hidden select-none cursor-pointer"
                  >
                    {/* Handcrafted High-Resolution Product Photography */}
                    <ProductImage
                      product={item}
                      alt={item.name}
                      containerClassName="w-full h-full"
                      className="group-hover:scale-108 transition-transform duration-700 ease-out object-cover"
                    />

                    {/* Gradient Overlay for Top/Bottom Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none transition-opacity duration-300 group-hover:from-black/60"></div>

                    {/* Top Badges: Category / Catalogue Page */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                      {item.badge && (
                        <span className="bg-[#1A1917] text-white text-[10px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wider shadow-xs">
                          {item.badge}
                        </span>
                      )}
                      {item.catalogPage && (
                        <span className="bg-white/90 backdrop-blur-md text-[#8C4B23] border border-[#E2DDD5] text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider shadow-xs">
                          Cat. p. {item.catalogPage}
                        </span>
                      )}
                    </div>

                    {/* Top Right: Wishlist Heart Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveToWishlist && onSaveToWishlist(item);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs cursor-pointer z-20 ${
                        isWishlisted
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/90 text-[#766E65] hover:text-rose-600 hover:bg-white'
                      }`}
                      title={isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>

                    {/* Bottom Floating Pill: Dimensions */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-[#1A1917] text-[10px] px-2.5 py-1 rounded-full font-mono font-medium border border-[#E2DDD5] flex items-center gap-1.5 shadow-xs z-20">
                      <Ruler className="w-3 h-3 text-[#8C4B23]" />
                      <span>{item.dimensions?.widthCm ?? 0} × {item.dimensions?.depthCm ?? 0} × {item.dimensions?.heightCm ?? 0} cm</span>
                    </div>

                    {/* Quick View Button Hover Overlay (DI Signature) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4 z-10 pointer-events-none group-hover:pointer-events-auto">
                      <button
                        onClick={() => setQuickViewProduct(item)}
                        className="px-4 py-2 rounded-xl bg-white/95 text-[#1A1917] text-xs font-semibold shadow-lg hover:bg-white flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8C4B23]" />
                        <span>Quick View Specifications</span>
                      </button>
                    </div>

                  </div>

                  {/* Card Content & Details Area */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-2">
                      
                      {/* Subtitle & Room Tag */}
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#8C4B23]">
                        <span className="font-semibold line-clamp-1">{item.subtitle}</span>
                        <span className="text-[#9E958A] shrink-0 font-normal">· {item.leadTimeWeeks} Wks</span>
                      </div>

                      {/* Product Title */}
                      <h3 
                        onClick={() => {
                          if (onNavigateToProductDetail) {
                            onNavigateToProductDetail(item);
                          } else {
                            setQuickViewProduct(item);
                          }
                        }}
                        className="font-['Cinzel'] text-lg sm:text-xl font-bold text-[#1A1917] group-hover:text-[#8C4B23] transition-colors leading-snug cursor-pointer"
                      >
                        {item.name}
                      </h3>

                      {/* Description Snippet from Catalogue */}
                      <p className="text-xs text-[#615951] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                    </div>

                    {/* Interactive In-Card Swatch Selector (DI Luxury Pattern) */}
                    <div className="pt-3 border-t border-[#E8E3DA] space-y-2.5">
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-[#766E65] uppercase tracking-wider">
                          Finish: <span className="text-[#1A1917] font-semibold">{activeWood.name.split(' ')[0]}</span>
                          {item.compatibleFabricIds.length > 0 && (
                            <span> / <span className="text-[#1A1917] font-semibold">{activeFabric.name.split(' ')[0]}</span></span>
                          )}
                        </span>
                        <span className="font-['Cinzel'] text-base font-bold text-[#1A1917]">
                          ${item.basePrice.toLocaleString('en-US')}
                        </span>
                      </div>

                      {/* Swatch dots */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[9px] font-mono text-[#9E958A] uppercase shrink-0 mr-1">Woods:</span>
                        {item.compatibleWoodIds.slice(0, 5).map(wId => {
                          const wMat = woodMaterials.find(w => w.id === wId);
                          if (!wMat) return null;
                          const isSelected = activeWood.id === wId;

                          return (
                            <button
                              key={wId}
                              type="button"
                              onClick={(e) => handleCardSwatchSelect(item.id, 'wood', wId, e)}
                              title={`${wMat.name} (${wMat.origin || 'Certified'})`}
                              className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                                isSelected ? 'scale-125 ring-2 ring-[#8C4B23] ring-offset-1 border-white' : 'border-black/15 hover:scale-110'
                              }`}
                              style={{ backgroundColor: wMat.colorHex }}
                            />
                          );
                        })}

                        {item.compatibleFabricIds.length > 0 && (
                          <>
                            <span className="text-[9px] font-mono text-[#9E958A] uppercase shrink-0 mx-1">Fabrics:</span>
                            {item.compatibleFabricIds.slice(0, 4).map(fId => {
                              const fMat = fabricMaterials.find(f => f.id === fId);
                              if (!fMat) return null;
                              const isSelected = activeFabric.id === fId;

                              return (
                                <button
                                  key={fId}
                                  type="button"
                                  onClick={(e) => handleCardSwatchSelect(item.id, 'fabric', fId, e)}
                                  title={`${fMat.name}`}
                                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer border ${
                                    isSelected ? 'scale-125 ring-2 ring-[#8C4B23] ring-offset-1 border-white' : 'border-black/15 hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: fMat.colorHex }}
                                />
                              );
                            })}
                          </>
                        )}
                      </div>

                    </div>

                    {/* Action Buttons (Customize in 3D + View in AR) */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => onSelectProduct(item)}
                        className="py-2.5 px-3 rounded-xl bg-[#1A1917] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Customize 3D</span>
                      </button>

                      <button
                        onClick={() => onOpenARForProduct(item)}
                        className="py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#C5A880] text-[#1A1917] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#8C4B23]" />
                        <span>View in AR</span>
                      </button>
                    </div>

                  </div>

                </div>

              </React.Fragment>
            );
          })}
        </div>

      </div>

      {/* 5. QUICK VIEW SLIDE-OVER / MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div 
            className="bg-white rounded-3xl border border-[#E8E3DA] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E8E3DA] pb-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C4B23] font-semibold">
                  {quickViewProduct.subtitle} · Catalogue Page {quickViewProduct.catalogPage || 'Standard'}
                </div>
                <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-[#1A1917]">
                  {quickViewProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setQuickViewProduct(null)}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#766E65] hover:text-[#1A1917] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Visual representation & Dimensions */}
              <div className="space-y-4">
                <div className="aspect-[4/3] bg-[#F5F2EB] rounded-2xl overflow-hidden border border-[#E8E3DA] relative shadow-inner">
                  <ProductImage
                    product={quickViewProduct}
                    alt={quickViewProduct.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#1A1917]/85 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
                    {quickViewProduct.geometryType.replace('_', ' ')}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-2 flex items-center justify-between border border-[#E2DDD5] text-[10px] font-mono">
                    <span className="text-[#8C4B23] font-bold">1987 Master Photography</span>
                    <span className="text-[#766E65]">Parametric 3D Ready</span>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E8E3DA] rounded-2xl p-4 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C4B23] font-semibold flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Calibrated Metric Dimensions</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-xs">
                    <div className="bg-white p-2 rounded-xl border border-[#E8E3DA]">
                      <div className="text-[#766E65] text-[10px]">Width</div>
                      <div className="font-bold text-[#1A1917] mt-0.5">{quickViewProduct.dimensions?.widthCm ?? 0} cm</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#E8E3DA]">
                      <div className="text-[#766E65] text-[10px]">Depth</div>
                      <div className="font-bold text-[#1A1917] mt-0.5">{quickViewProduct.dimensions?.depthCm ?? 0} cm</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-[#E8E3DA]">
                      <div className="text-[#766E65] text-[10px]">Height</div>
                      <div className="font-bold text-[#1A1917] mt-0.5">{quickViewProduct.dimensions?.heightCm ?? 0} cm</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-[#766E65] text-center pt-1">
                    Parametric range: {quickViewProduct.dimensions.minWidthCm}–{quickViewProduct.dimensions.maxWidthCm}cm width
                  </div>
                </div>
              </div>

              {/* Right Column: Descriptions & Joinery Specifications */}
              <div className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8C4B23] font-semibold">
                    Architectural Narrative
                  </div>
                  <p className="text-[#524B43] leading-relaxed">
                    {quickViewProduct.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8C4B23] font-semibold">
                    Craftsmanship & Joinery Notes
                  </div>
                  <p className="text-[#524B43] leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E3DA]">
                    {quickViewProduct.craftsmanshipNotes}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[#8C4B23] font-semibold">
                    Key Features
                  </div>
                  <ul className="space-y-1 text-[#524B43]">
                    {quickViewProduct.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#8C4B23] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#E8E3DA] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-[#766E65]">Starting Base Price</div>
                    <div className="font-['Cinzel'] text-2xl font-bold text-[#1A1917]">
                      ${quickViewProduct.basePrice.toLocaleString('en-US')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-[#766E65]">Crafting Window</div>
                    <div className="text-xs font-semibold text-[#8C4B23]">
                      {quickViewProduct.leadTimeWeeks} Weeks Lead Time
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E8E3DA]">
              {onNavigateToProductDetail && (
                <button
                  onClick={() => {
                    onNavigateToProductDetail(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#8C4B23] hover:bg-[#A05528] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-[#FAF8F5]" />
                  <span>Product Page</span>
                </button>
              )}

              <button
                onClick={() => {
                  onSelectProduct(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="py-3 px-4 rounded-xl bg-[#1A1917] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#C5A880]" />
                <span>3D Studio</span>
              </button>

              <button
                onClick={() => {
                  onOpenARForProduct(quickViewProduct);
                  setQuickViewProduct(null);
                }}
                className="py-3 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#C5A880] text-[#1A1917] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#8C4B23]" />
                <span>AR In-Space</span>
              </button>

              <button
                onClick={() => {
                  onSaveToWishlist && onSaveToWishlist(quickViewProduct);
                }}
                className="py-3 px-4 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E8E3DA] text-[#1A1917] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isWishlistedProduct && isWishlistedProduct(quickViewProduct.id) ? 'fill-rose-500 text-rose-500' : 'text-[#766E65]'}`} />
                <span>{isWishlistedProduct && isWishlistedProduct(quickViewProduct.id) ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. CRAFTSMANSHIP FOOTER GUARANTEE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-[#1A1917] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A880]/30 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-block text-[#C5A880] text-xs uppercase tracking-widest font-semibold font-mono">
              The 1987 Standards of Joinery & Austrian Woodcraft
            </div>
            <h2 className="font-['Cinzel'] text-2xl sm:text-4xl font-bold text-white leading-tight">
              Handcrafted for Generations, Measured in Decades
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              We never use flat-pack fasteners or synthetic composite boards. Every mortise is cut to 0.2mm tolerance, steam-bent from American black walnut and rift white oak, and protected with hand-rubbed botanical oils that allow the timber to breathe.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10 text-xs">
              <div>
                <div className="font-bold text-[#C5A880] text-base font-['Cinzel']">10-Year Guarantee</div>
                <div className="text-white/60 mt-1">Structural frame and joinery warranty for lifetime peace of mind.</div>
              </div>
              <div>
                <div className="font-bold text-[#C5A880] text-base font-['Cinzel']">White-Glove Included</div>
                <div className="text-white/60 mt-1">Two-person in-home delivery, room placement, and packaging removal.</div>
              </div>
              <div>
                <div className="font-bold text-[#C5A880] text-base font-['Cinzel']">True 1:1 Scale AR</div>
                <div className="text-white/60 mt-1">Metric calibration eliminates spatial surprises before production begins.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
