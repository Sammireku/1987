import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Ruler, 
  DollarSign, 
  Layers, 
  Box, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Heart, 
  History, 
  ShoppingBag,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { FurnitureItem, MaterialOption, SavedDesign, WishlistItem } from '../types/furniture';
import { ProductImage } from '../utils/productImages';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentDesigns: SavedDesign[];
  wishlistItems: WishlistItem[];
  catalog: FurnitureItem[];
  woodMaterials: MaterialOption[];
  fabricMaterials: MaterialOption[];
  metalMaterials: MaterialOption[];
  onLoadDesignInStudio: (design: SavedDesign) => void;
  onSelectProductInStudio: (product: FurnitureItem) => void;
  onAddToCart: (product: FurnitureItem, price: number, selectionDetails: string) => void;
  initialItemAId?: string;
  initialItemBId?: string;
}

interface UnifiedCompareItem {
  id: string;
  sourceType: 'recent' | 'wishlist' | 'catalog';
  name: string;
  category: string;
  baseProduct: FurnitureItem;
  price: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  seatHeightCm?: number;
  woodName: string;
  fabricName: string;
  metalName: string;
  leadTimeWeeks: number;
  badge?: string;
  originalDesign?: SavedDesign;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  recentDesigns = [],
  wishlistItems = [],
  catalog = [],
  woodMaterials = [],
  fabricMaterials = [],
  metalMaterials = [],
  onLoadDesignInStudio,
  onSelectProductInStudio,
  onAddToCart,
  initialItemAId,
  initialItemBId,
}) => {
  // Build unified comparison items pool
  const allCompareItems: UnifiedCompareItem[] = useMemo(() => {
    const list: UnifiedCompareItem[] = [];

    // 1. From Recent Designs
    recentDesigns.forEach((d) => {
      const prod = d.product || catalog.find((c) => c.id === d.customization?.productId) || catalog[0];
      if (!prod) return;
      const wood = d.wood?.name || woodMaterials.find((w) => w.id === d.customization?.selectedWoodId)?.name || 'Solid Wood';
      const fabric = d.fabric?.name || fabricMaterials.find((f) => f.id === d.customization?.selectedFabricId)?.name || 'Sunbrella™ Canvas';
      const metal = d.metal?.name || metalMaterials.find((m) => m.id === d.customization?.selectedMetalId)?.name || 'Architectural Brass';
      list.push({
        id: `recent_${d.id}`,
        sourceType: 'recent',
        name: d.product?.name || prod.name,
        category: prod.category,
        baseProduct: prod,
        price: d.calculatedPrice,
        widthCm: d.customization?.customWidthCm ?? prod.dimensions?.widthCm ?? 0,
        depthCm: d.customization?.customDepthCm ?? prod.dimensions?.depthCm ?? 0,
        heightCm: d.customization?.customHeightCm ?? prod.dimensions?.heightCm ?? 0,
        seatHeightCm: prod.dimensions?.seatHeightCm,
        woodName: wood,
        fabricName: fabric,
        metalName: metal,
        leadTimeWeeks: prod.leadTimeWeeks,
        badge: 'Recent Customization',
        originalDesign: d,
      });
    });

    // 2. From Wishlist
    wishlistItems.forEach((w) => {
      const prod = w.product || catalog.find((c) => c.id === w.customization?.productId);
      if (!prod) return;
      const wood = w.wood?.name || woodMaterials.find((wd) => wd.id === w.customization?.selectedWoodId)?.name || 'Solid Wood';
      const fabric = w.fabric?.name || fabricMaterials.find((f) => f.id === w.customization?.selectedFabricId)?.name || 'Sunbrella™ Canvas';
      const metal = w.metal?.name || metalMaterials.find((m) => m.id === w.customization?.selectedMetalId)?.name || 'Architectural Brass';
      list.push({
        id: `wishlist_${w.id}`,
        sourceType: 'wishlist',
        name: prod.name,
        category: prod.category,
        baseProduct: prod,
        price: w.calculatedPrice,
        widthCm: w.customization?.customWidthCm ?? prod.dimensions?.widthCm ?? 0,
        depthCm: w.customization?.customDepthCm ?? prod.dimensions?.depthCm ?? 0,
        heightCm: w.customization?.customHeightCm ?? prod.dimensions?.heightCm ?? 0,
        seatHeightCm: prod.dimensions?.seatHeightCm,
        woodName: wood,
        fabricName: fabric,
        metalName: metal,
        leadTimeWeeks: prod.leadTimeWeeks,
        badge: 'Wishlist Item',
      });
    });

    // 3. Fallback / Catalog defaults
    catalog.forEach((c) => {
      const defaultWood = woodMaterials.find((w) => w.id === c.defaultWoodId)?.name || woodMaterials[0]?.name || 'Austrian Walnut';
      const defaultFabric = fabricMaterials.find((f) => f.id === c.defaultFabricId)?.name || fabricMaterials[0]?.name || 'Sunbrella Canvas';
      const defaultMetal = metalMaterials.find((m) => m.id === c.defaultMetalId)?.name || metalMaterials[0]?.name || 'Brushed Brass';
      list.push({
        id: `catalog_${c.id}`,
        sourceType: 'catalog',
        name: c.name,
        category: c.category,
        baseProduct: c,
        price: c.basePrice,
        widthCm: c.dimensions?.widthCm ?? 0,
        depthCm: c.dimensions?.depthCm ?? 0,
        heightCm: c.dimensions?.heightCm ?? 0,
        seatHeightCm: c.dimensions?.seatHeightCm,
        woodName: defaultWood,
        fabricName: defaultFabric,
        metalName: defaultMetal,
        leadTimeWeeks: c.leadTimeWeeks,
        badge: c.badge || 'Standard Specification',
      });
    });

    return list;
  }, [recentDesigns, wishlistItems, catalog, woodMaterials, fabricMaterials, metalMaterials]);

  // Selected item slots
  const [selectedIdA, setSelectedIdA] = useState<string>(() => {
    if (initialItemAId) return initialItemAId;
    return allCompareItems[0]?.id || '';
  });

  const [selectedIdB, setSelectedIdB] = useState<string>(() => {
    if (initialItemBId) return initialItemBId;
    return allCompareItems[1]?.id || allCompareItems[0]?.id || '';
  });

  // Source filters for picker popups
  const [filterTypeA, setFilterTypeA] = useState<'all' | 'recent' | 'wishlist'>('all');
  const [filterTypeB, setFilterTypeB] = useState<'all' | 'recent' | 'wishlist'>('all');

  // Mobile active tab view ('both' | 'itemA' | 'itemB')
  const [mobileActiveView, setMobileActiveView] = useState<'sideBySide' | 'itemA' | 'itemB'>('sideBySide');

  const itemA = allCompareItems.find((i) => i.id === selectedIdA) || allCompareItems[0];
  const itemB = allCompareItems.find((i) => i.id === selectedIdB) || allCompareItems[1] || allCompareItems[0];

  if (!isOpen || !itemA || !itemB) return null;

  // Swap Left and Right
  const handleSwap = () => {
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
  };

  // Difference Calculations
  const priceDiff = (itemA?.price ?? 0) - (itemB?.price ?? 0);
  const widthDiff = (itemA?.widthCm ?? 0) - (itemB?.widthCm ?? 0);
  const depthDiff = (itemA?.depthCm ?? 0) - (itemB?.depthCm ?? 0);
  const heightDiff = (itemA?.heightCm ?? 0) - (itemB?.heightCm ?? 0);

  // Floor footprint in square meters
  const footprintA = (((itemA?.widthCm ?? 0) * (itemA?.depthCm ?? 0)) / 10000).toFixed(2);
  const footprintB = (((itemB?.widthCm ?? 0) * (itemB?.depthCm ?? 0)) / 10000).toFixed(2);

  // Volume in Liters
  const volumeA = Math.round(((itemA?.widthCm ?? 0) * (itemA?.depthCm ?? 0) * (itemA?.heightCm ?? 0)) / 1000);
  const volumeB = Math.round(((itemB?.widthCm ?? 0) * (itemB?.depthCm ?? 0) * (itemB?.heightCm ?? 0)) / 1000);

  // Max dimension for visual ratio bars
  const maxWidth = Math.max(itemA?.widthCm ?? 1, itemB?.widthCm ?? 1, 1);
  const maxDepth = Math.max(itemA?.depthCm ?? 1, itemB?.depthCm ?? 1, 1);
  const maxHeight = Math.max(itemA?.heightCm ?? 1, itemB?.heightCm ?? 1, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="relative bg-[#FAF8F5] w-full max-w-6xl rounded-3xl border border-[#E8E3DA] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="bg-white px-5 sm:px-8 py-4 border-b border-[#E8E3DA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#8C4B23]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel'] font-bold text-base sm:text-lg text-[#1A1917]">
                  Side-by-Side Architectural Comparison
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#8C4B23]/10 text-[#8C4B23] font-semibold uppercase">
                  Precision Analysis
                </span>
              </div>
              <p className="text-xs text-[#766E65]">
                Compare dimensions, materials, volume, and commission pricing between two configurations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl border border-[#E8E3DA] hover:border-[#8C4B23] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#8C4B23] transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Swap Left and Right"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Swap</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#E8E3DA] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#1A1917] transition-colors cursor-pointer"
              title="Close Comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW TOGGLE */}
        <div className="sm:hidden px-4 py-2.5 bg-[#F4EFEA] border-b border-[#E8E3DA] flex items-center justify-center gap-2">
          <button
            onClick={() => setMobileActiveView('sideBySide')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileActiveView === 'sideBySide' ? 'bg-[#1A1917] text-white shadow-xs' : 'bg-white text-[#615951]'
            }`}
          >
            Split Both
          </button>
          <button
            onClick={() => setMobileActiveView('itemA')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileActiveView === 'itemA' ? 'bg-[#8C4B23] text-white shadow-xs' : 'bg-white text-[#615951]'
            }`}
          >
            Design A
          </button>
          <button
            onClick={() => setMobileActiveView('itemB')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileActiveView === 'itemB' ? 'bg-[#8C4B23] text-white shadow-xs' : 'bg-white text-[#615951]'
            }`}
          >
            Design B
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-8 flex-1">
          
          {/* TOP SELECTOR CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* ITEM A SELECTOR CARD */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#8C4B23] font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8C4B23]"></span>
                  Configuration Slot 1
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3DA] text-[#524B43]">
                  {itemA.sourceType.toUpperCase()}
                </span>
              </div>

              {/* Item Selector Dropdown */}
              <select
                value={selectedIdA}
                onChange={(e) => setSelectedIdA(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A1917] focus:outline-none focus:border-[#8C4B23]"
              >
                <optgroup label="Recent Customizations">
                  {allCompareItems.filter(i => i.sourceType === 'recent').map(i => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.price.toLocaleString()}</option>
                  ))}
                </optgroup>
                <optgroup label="Saved Wishlist">
                  {allCompareItems.filter(i => i.sourceType === 'wishlist').map(i => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.price.toLocaleString()}</option>
                  ))}
                </optgroup>
                <optgroup label="Catalogue Silhouettes">
                  {allCompareItems.filter(i => i.sourceType === 'catalog').map(i => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.price.toLocaleString()}</option>
                  ))}
                </optgroup>
              </select>

              {/* Item A Overview Pill */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E8E3DA] shrink-0 relative bg-[#FAF8F5]">
                  <ProductImage
                    product={itemA.baseProduct}
                    alt={itemA.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Cinzel'] font-bold text-base sm:text-lg text-[#1A1917] truncate">
                    {itemA.name}
                  </h3>
                  <p className="text-xs text-[#766E65] capitalize truncate">
                    {itemA.category} · {itemA.woodName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg sm:text-xl font-mono font-bold text-[#8C4B23]">
                    ${itemA.price.toLocaleString('en-US')}
                  </div>
                  <div className="text-[10px] text-[#766E65]">Lead: {itemA.leadTimeWeeks} wks</div>
                </div>
              </div>
            </div>

            {/* ITEM B SELECTOR CARD */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-[#4A6B82] font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4A6B82]"></span>
                  Configuration Slot 2
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3DA] text-[#524B43]">
                  {itemB.sourceType.toUpperCase()}
                </span>
              </div>

              {/* Item Selector Dropdown */}
              <select
                value={selectedIdB}
                onChange={(e) => setSelectedIdB(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#1A1917] focus:outline-none focus:border-[#4A6B82]"
              >
                <optgroup label="Recent Customizations">
                  {allCompareItems.filter(i => i.sourceType === 'recent').map(i => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.price.toLocaleString()}</option>
                  ))}
                </optgroup>
                <optgroup label="Saved Wishlist">
                  {allCompareItems.filter(i => i.sourceType === 'wishlist').map(i => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.price.toLocaleString()}</option>
                  ))}
                </optgroup>
                <optgroup label="Catalogue Silhouettes">
                  {allCompareItems.filter(i => i.sourceType === 'catalog').map(i => (
                    <option key={i.id} value={i.id}>{i.name} — ${i.price.toLocaleString()}</option>
                  ))}
                </optgroup>
              </select>

              {/* Item B Overview Pill */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E8E3DA] shrink-0 relative bg-[#FAF8F5]">
                  <ProductImage
                    product={itemB.baseProduct}
                    alt={itemB.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Cinzel'] font-bold text-base sm:text-lg text-[#1A1917] truncate">
                    {itemB.name}
                  </h3>
                  <p className="text-xs text-[#766E65] capitalize truncate">
                    {itemB.category} · {itemB.woodName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg sm:text-xl font-mono font-bold text-[#4A6B82]">
                    ${itemB.price.toLocaleString('en-US')}
                  </div>
                  <div className="text-[10px] text-[#766E65]">Lead: {itemB.leadTimeWeeks} wks</div>
                </div>
              </div>
            </div>

          </div>

          {/* DELTA SUMMARY BANNER */}
          <div className="bg-white rounded-2xl border border-[#E8E3DA] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C4B23]" />
              <span className="font-semibold text-[#1A1917]">Key Dimensional & Price Variances:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DA] font-mono">
                Price Δ: <strong className={priceDiff > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                  {priceDiff === 0 ? 'Equal' : priceDiff > 0 ? `+$${Math.abs(priceDiff).toLocaleString()}` : `-$${Math.abs(priceDiff).toLocaleString()}`}
                </strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DA] font-mono">
                Width Δ: <strong>{widthDiff > 0 ? `+${widthDiff} cm` : `${widthDiff} cm`}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DA] font-mono">
                Depth Δ: <strong>{depthDiff > 0 ? `+${depthDiff} cm` : `${depthDiff} cm`}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E3DA] font-mono">
                Volume Δ: <strong>{volumeA - volumeB > 0 ? `+${volumeA - volumeB} L` : `${volumeA - volumeB} L`}</strong>
              </span>
            </div>
          </div>

          {/* SIDE-BY-SIDE METRIC COMPARISON TABLE */}
          <div className="bg-white rounded-3xl border border-[#E8E3DA] overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E8E3DA]">
              
              {/* COLUMN A */}
              <div className={`p-6 space-y-6 ${mobileActiveView === 'itemB' ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                  <div className="font-['Cinzel'] font-bold text-base text-[#8C4B23]">
                    {itemA.name}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1A1917]">
                    ${itemA.price.toLocaleString('en-US')}
                  </span>
                </div>

                {/* Dimensions Group */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-[#766E65] font-semibold flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#8C4B23]" />
                    Metric Architectural Dimensions
                  </div>

                  {/* Width bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#615951]">Width (Span):</span>
                      <span className="font-bold text-[#1A1917]">{itemA.widthCm} cm</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#8C4B23] rounded-full transition-all duration-500" 
                        style={{ width: `${(itemA.widthCm / maxWidth) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Depth bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#615951]">Depth (Projection):</span>
                      <span className="font-bold text-[#1A1917]">{itemA.depthCm} cm</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#8C4B23]/80 rounded-full transition-all duration-500" 
                        style={{ width: `${(itemA.depthCm / maxDepth) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Height bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#615951]">Total Height:</span>
                      <span className="font-bold text-[#1A1917]">{itemA.heightCm} cm</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#8C4B23]/60 rounded-full transition-all duration-500" 
                        style={{ width: `${(itemA.heightCm / maxHeight) * 100}%` }}
                      />
                    </div>
                  </div>

                  {itemA.seatHeightCm && (
                    <div className="flex justify-between text-xs pt-1 border-t border-[#FAF8F5]">
                      <span className="text-[#615951]">Seat Height:</span>
                      <span className="font-bold text-[#1A1917]">{itemA.seatHeightCm} cm</span>
                    </div>
                  )}
                </div>

                {/* Footprint & Volume */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA]">
                    <div className="text-[10px] font-mono text-[#766E65] uppercase">Floor Footprint</div>
                    <div className="text-base font-bold text-[#1A1917] font-mono">{footprintA} m²</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA]">
                    <div className="text-[10px] font-mono text-[#766E65] uppercase">Total Volume</div>
                    <div className="text-base font-bold text-[#1A1917] font-mono">{volumeA} L</div>
                  </div>
                </div>

                {/* Material Specification List */}
                <div className="space-y-2 border-t border-[#E8E3DA] pt-4 text-xs">
                  <div className="text-xs font-mono uppercase text-[#766E65] font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#8C4B23]" />
                    Material Selection
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="text-[#615951]">Solid Timber:</span>
                    <span className="font-semibold text-[#1A1917]">{itemA.woodName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="text-[#615951]">Textile / Upholstery:</span>
                    <span className="font-semibold text-[#1A1917]">{itemA.fabricName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="text-[#615951]">Architectural Metal:</span>
                    <span className="font-semibold text-[#1A1917]">{itemA.metalName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#615951]">Certifications:</span>
                    <span className="font-semibold text-emerald-700">Austrian PEFC · 0 Formaldehyde</span>
                  </div>
                </div>

                {/* Action Buttons for Item A */}
                <div className="pt-4 border-t border-[#E8E3DA] flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (itemA.originalDesign) {
                        onLoadDesignInStudio(itemA.originalDesign);
                      } else {
                        onSelectProductInStudio(itemA.baseProduct);
                      }
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#1A1917] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Customize in 3D</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(itemA.baseProduct, itemA.price, `${itemA.woodName} · ${itemA.fabricName}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#1A1917] transition-colors cursor-pointer"
                    title="Add to Atelier Order"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#8C4B23]" />
                  </button>
                </div>
              </div>

              {/* COLUMN B */}
              <div className={`p-6 space-y-6 ${mobileActiveView === 'itemA' ? 'hidden md:block' : 'block'}`}>
                <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-3">
                  <div className="font-['Cinzel'] font-bold text-base text-[#4A6B82]">
                    {itemB.name}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1A1917]">
                    ${itemB.price.toLocaleString('en-US')}
                  </span>
                </div>

                {/* Dimensions Group */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-[#766E65] font-semibold flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#4A6B82]" />
                    Metric Architectural Dimensions
                  </div>

                  {/* Width bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#615951]">Width (Span):</span>
                      <span className="font-bold text-[#1A1917]">{itemB.widthCm} cm</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#4A6B82] rounded-full transition-all duration-500" 
                        style={{ width: `${(itemB.widthCm / maxWidth) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Depth bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#615951]">Depth (Projection):</span>
                      <span className="font-bold text-[#1A1917]">{itemB.depthCm} cm</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#4A6B82]/80 rounded-full transition-all duration-500" 
                        style={{ width: `${(itemB.depthCm / maxDepth) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Height bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#615951]">Total Height:</span>
                      <span className="font-bold text-[#1A1917]">{itemB.heightCm} cm</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#FAF8F5] overflow-hidden">
                      <div 
                        className="h-full bg-[#4A6B82]/60 rounded-full transition-all duration-500" 
                        style={{ width: `${(itemB.heightCm / maxHeight) * 100}%` }}
                      />
                    </div>
                  </div>

                  {itemB.seatHeightCm && (
                    <div className="flex justify-between text-xs pt-1 border-t border-[#FAF8F5]">
                      <span className="text-[#615951]">Seat Height:</span>
                      <span className="font-bold text-[#1A1917]">{itemB.seatHeightCm} cm</span>
                    </div>
                  )}
                </div>

                {/* Footprint & Volume */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA]">
                    <div className="text-[10px] font-mono text-[#766E65] uppercase">Floor Footprint</div>
                    <div className="text-base font-bold text-[#1A1917] font-mono">{footprintB} m²</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA]">
                    <div className="text-[10px] font-mono text-[#766E65] uppercase">Total Volume</div>
                    <div className="text-base font-bold text-[#1A1917] font-mono">{volumeB} L</div>
                  </div>
                </div>

                {/* Material Specification List */}
                <div className="space-y-2 border-t border-[#E8E3DA] pt-4 text-xs">
                  <div className="text-xs font-mono uppercase text-[#766E65] font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#4A6B82]" />
                    Material Selection
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="text-[#615951]">Solid Timber:</span>
                    <span className="font-semibold text-[#1A1917]">{itemB.woodName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="text-[#615951]">Textile / Upholstery:</span>
                    <span className="font-semibold text-[#1A1917]">{itemB.fabricName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#FAF8F5]">
                    <span className="text-[#615951]">Architectural Metal:</span>
                    <span className="font-semibold text-[#1A1917]">{itemB.metalName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#615951]">Certifications:</span>
                    <span className="font-semibold text-emerald-700">Austrian PEFC · 0 Formaldehyde</span>
                  </div>
                </div>

                {/* Action Buttons for Item B */}
                <div className="pt-4 border-t border-[#E8E3DA] flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (itemB.originalDesign) {
                        onLoadDesignInStudio(itemB.originalDesign);
                      } else {
                        onSelectProductInStudio(itemB.baseProduct);
                      }
                      onClose();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#1A1917] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Customize in 3D</span>
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(itemB.baseProduct, itemB.price, `${itemB.woodName} · ${itemB.fabricName}`);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#1A1917] transition-colors cursor-pointer"
                    title="Add to Atelier Order"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#8C4B23]" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-t border-[#E8E3DA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#766E65] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>10-Year Comprehensive Austrian Solid Wood Structural Guarantee</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#E8E3DA] hover:bg-[#DCD5C9] text-[#1A1917] font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>

      </motion.div>
    </div>
  );
};
