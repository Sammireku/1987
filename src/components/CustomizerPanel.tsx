import React, { useState } from 'react';
import { 
  Check, 
  Layers, 
  Ruler, 
  RotateCw, 
  Sparkles, 
  ShoppingBag, 
  Camera, 
  Info, 
  ChevronRight, 
  Eye, 
  FileText, 
  Shield, 
  Truck,
  Heart,
  History,
  Columns2,
  Share2,
  Wrench,
  ArrowLeftRight
} from 'lucide-react';
import { FurnitureItem, MaterialOption, CustomizationSelection } from '../types/furniture';
import { SocialShareModal } from './SocialShareModal';
import { AssemblyInstructionsModal } from './AssemblyInstructionsModal';

interface CustomizerPanelProps {
  product: FurnitureItem;
  woodMaterials: MaterialOption[];
  fabricMaterials: MaterialOption[];
  metalMaterials: MaterialOption[];
  selection: CustomizationSelection;
  onUpdateSelection: (updated: Partial<CustomizationSelection>) => void;
  onAddToCart: (customization: CustomizationSelection) => void;
  onOpenAR: () => void;
  explodedAmount: number;
  onExplodedChange: (val: number) => void;
  showDimensions: boolean;
  onToggleDimensions: () => void;
  wireframeMode: boolean;
  onToggleWireframe: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onSaveToWishlist?: (price: number) => void;
  isWishlisted?: boolean;
  recentCount?: number;
  onOpenRecent?: () => void;
  isCompareMode?: boolean;
  onToggleCompare?: () => void;
  onOpenComparisonModal?: () => void;
}

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  product,
  woodMaterials,
  fabricMaterials,
  metalMaterials,
  selection,
  onUpdateSelection,
  onAddToCart,
  onOpenAR,
  explodedAmount,
  onExplodedChange,
  showDimensions,
  onToggleDimensions,
  wireframeMode,
  onToggleWireframe,
  autoRotate,
  onToggleAutoRotate,
  onSaveToWishlist,
  isWishlisted = false,
  recentCount = 0,
  onOpenRecent,
  isCompareMode = false,
  onToggleCompare,
  onOpenComparisonModal,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'dimensions' | 'view_tools'>('materials');
  const [swatchModalOpen, setSwatchModalOpen] = useState<boolean>(false);
  const [swatchOrdered, setSwatchOrdered] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [assemblyModalOpen, setAssemblyModalOpen] = useState<boolean>(false);

  // Filter compatible materials for current product
  const availableWoods = woodMaterials.filter(w => 
    product.compatibleWoodIds.length === 0 || product.compatibleWoodIds.includes(w.id)
  );

  const availableFabrics = fabricMaterials.filter(f =>
    product.compatibleFabricIds.length === 0 || product.compatibleFabricIds.includes(f.id)
  );

  const availableMetals = metalMaterials.filter(m =>
    product.compatibleMetalIds.length === 0 || product.compatibleMetalIds.includes(m.id)
  );

  const currentWood = woodMaterials.find(w => w.id === selection.selectedWoodId) || woodMaterials[0];
  const currentFabric = fabricMaterials.find(f => f.id === selection.selectedFabricId) || fabricMaterials[0];
  const currentMetal = metalMaterials.find(m => m.id === selection.selectedMetalId) || metalMaterials[0];

  const baseWidth = product.dimensions?.widthCm ?? 120;
  const baseDepth = product.dimensions?.depthCm ?? 80;
  const baseHeight = product.dimensions?.heightCm ?? 75;

  const currentWidth = selection.customWidthCm ?? baseWidth;
  const currentDepth = selection.customDepthCm ?? baseDepth;
  const currentHeight = selection.customHeightCm ?? baseHeight;

  // Price Calculation Breakdown
  const dimensionDeltaWidth = Math.abs(currentWidth - baseWidth);
  const dimensionDeltaDepth = Math.abs(currentDepth - baseDepth);
  const dimensionDeltaHeight = Math.abs(currentHeight - baseHeight);
  const dimensionSurcharge = Math.round((dimensionDeltaWidth * 3) + (dimensionDeltaDepth * 3) + (dimensionDeltaHeight * 2));

  const totalCalculatedPrice = 
    product.basePrice + 
    (currentWood.priceModifier || 0) + 
    (availableFabrics.length > 0 ? (currentFabric.priceModifier || 0) : 0) + 
    (currentMetal.priceModifier || 0) + 
    dimensionSurcharge;

  const handleDimensionChange = (key: 'customWidthCm' | 'customDepthCm' | 'customHeightCm', value: number) => {
    onUpdateSelection({ [key]: value });
  };

  const handleOrderSwatchKit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwatchOrdered(true);
    setTimeout(() => {
      setSwatchOrdered(false);
      setSwatchModalOpen(false);
    }, 2400);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] border-l border-[#E2DDD5] text-[#22201D] overflow-hidden">
      
      {/* Header Info */}
      <div className="p-5 border-b border-[#E2DDD5] bg-[#FAF8F5]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest text-[#8C4B23] font-semibold">
              Atelier Bespoke Edition
            </span>
            <span className="w-1 h-1 rounded-full bg-[#8C4B23]"></span>
            <span className="text-[11px] text-[#766E65]">{product.leadTimeWeeks} Weeks Handcrafting</span>
          </div>
          <span className="text-xs bg-[#EFECE6] text-[#22201D] px-2.5 py-0.5 rounded-full font-mono font-medium">
            Est. 1987
          </span>
        </div>

        <h1 className="font-['Cinzel'] text-2xl font-bold text-[#22201D] mt-1 tracking-tight">
          {product.name}
        </h1>
        <p className="text-xs text-[#766E65] mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Dynamic Price Display */}
        <div className="mt-4 flex items-baseline justify-between pt-3 border-t border-[#EAE6DE]">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#766E65]">Custom Commission Total</div>
            <div className="text-2xl font-bold text-[#22201D] font-['Cinzel']">
              ${totalCalculatedPrice.toLocaleString('en-US')}
            </div>
          </div>
          <div className="text-right text-[11px] text-[#766E65]">
            <div>White-Glove Included</div>
            <div className="text-emerald-700 font-medium">10-Year Frame Guarantee</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#E2DDD5] bg-[#F2EFE9] text-xs font-semibold">
        <button
          id="tab-materials-button"
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-3 px-2 text-center transition-colors relative ${
            activeTab === 'materials'
              ? 'text-[#22201D] bg-[#FAF8F5]'
              : 'text-[#766E65] hover:text-[#22201D]'
          }`}
        >
          1. Finishes & Swatches
          {activeTab === 'materials' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C4B23]"></span>
          )}
        </button>

        <button
          id="tab-dimensions-button"
          onClick={() => setActiveTab('dimensions')}
          className={`flex-1 py-3 px-2 text-center transition-colors relative ${
            activeTab === 'dimensions'
              ? 'text-[#22201D] bg-[#FAF8F5]'
              : 'text-[#766E65] hover:text-[#22201D]'
          }`}
        >
          2. Bespoke Scale
          {activeTab === 'dimensions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C4B23]"></span>
          )}
        </button>

        <button
          id="tab-view-tools-button"
          onClick={() => setActiveTab('view_tools')}
          className={`flex-1 py-3 px-2 text-center transition-colors relative ${
            activeTab === 'view_tools'
              ? 'text-[#22201D] bg-[#FAF8F5]'
              : 'text-[#766E65] hover:text-[#22201D]'
          }`}
        >
          3. 3D Inspection
          {activeTab === 'view_tools' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C4B23]"></span>
          )}
        </button>
      </div>

      {/* Scrollable Configuration Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* TAB 1: MATERIALS & FINISHES */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* 1. Wood Species Selection */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#22201D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4A3525]"></span>
                  Hardwood Species
                </label>
                <span className="text-xs font-medium text-[#8C4B23]">
                  {currentWood.name}
                  {currentWood.priceModifier > 0 && ` (+$${currentWood.priceModifier})`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {availableWoods.map(wood => {
                  const isSelected = wood.id === selection.selectedWoodId;
                  return (
                    <button
                      key={wood.id}
                      id={`select-wood-${wood.id}`}
                      onClick={() => onUpdateSelection({ selectedWoodId: wood.id })}
                      className={`group p-2.5 rounded-lg border text-left transition-all duration-150 relative flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-[#8C4B23] bg-white shadow-sm ring-1 ring-[#8C4B23]'
                          : 'border-[#E2DDD5] bg-white hover:border-[#C5A880] hover:bg-[#FDFCFA]'
                      }`}
                    >
                      {/* Swatch circle with simulated grain */}
                      <div
                        className="w-8 h-8 rounded-full border border-black/10 shrink-0 shadow-inner relative flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: wood.colorHex }}
                      >
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]"></div>
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#22201D] truncate">
                          {wood.name}
                        </div>
                        <div className="text-[10px] text-[#766E65] truncate">
                          {wood.origin?.split(',')[0]}
                        </div>
                        <div className="text-[10px] font-medium text-[#8C4B23] mt-0.5">
                          {wood.priceModifier === 0 ? 'Standard' : `+$${wood.priceModifier}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-[#766E65] mt-2 italic">
                "{currentWood.description}"
              </p>
            </div>

            {/* 2. Fabric / Leather Upholstery Selection */}
            {availableFabrics.length > 0 && (
              <div className="pt-4 border-t border-[#EAE6DE]">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#22201D] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A35339]"></span>
                    Fabric & Leather Upholstery
                  </label>
                  <span className="text-xs font-medium text-[#8C4B23]">
                    {currentFabric.name}
                    {currentFabric.priceModifier > 0 && ` (+$${currentFabric.priceModifier})`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {availableFabrics.map(fabric => {
                    const isSelected = fabric.id === selection.selectedFabricId;
                    return (
                      <button
                        key={fabric.id}
                        id={`select-fabric-${fabric.id}`}
                        onClick={() => onUpdateSelection({ selectedFabricId: fabric.id })}
                        className={`group p-2.5 rounded-lg border text-left transition-all duration-150 relative flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-[#8C4B23] bg-white shadow-sm ring-1 ring-[#8C4B23]'
                            : 'border-[#E2DDD5] bg-white hover:border-[#C5A880] hover:bg-[#FDFCFA]'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border border-black/10 shrink-0 shadow-inner relative flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: fabric.colorHex }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#22201D] truncate">
                            {fabric.name}
                          </div>
                          <div className="text-[10px] text-[#766E65] truncate">
                            {fabric.origin?.split(',')[0]}
                          </div>
                          <div className="text-[10px] font-medium text-[#8C4B23] mt-0.5">
                            {fabric.priceModifier === 0 ? 'Standard' : `+$${fabric.priceModifier}`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-[#766E65] mt-2 italic">
                  "{currentFabric.description}"
                </p>
              </div>
            )}

            {/* 3. Metal Finishes & Hardware */}
            <div className="pt-4 border-t border-[#EAE6DE]">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#22201D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                  Metal Finishes & Ferrules
                </label>
                <span className="text-xs font-medium text-[#8C4B23]">
                  {currentMetal.name}
                  {currentMetal.priceModifier > 0 && ` (+$${currentMetal.priceModifier})`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {availableMetals.map(metal => {
                  const isSelected = metal.id === selection.selectedMetalId;
                  return (
                    <button
                      key={metal.id}
                      id={`select-metal-${metal.id}`}
                      onClick={() => onUpdateSelection({ selectedMetalId: metal.id })}
                      className={`group p-2.5 rounded-lg border text-left transition-all duration-150 relative flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-[#8C4B23] bg-white shadow-sm ring-1 ring-[#8C4B23]'
                          : 'border-[#E2DDD5] bg-white hover:border-[#C5A880] hover:bg-[#FDFCFA]'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-black/10 shrink-0 shadow-inner relative flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundColor: metal.colorHex,
                          boxShadow: 'inset 0 0 4px rgba(255,255,255,0.6)',
                        }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-[#22201D] drop-shadow" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#22201D] truncate">
                          {metal.name}
                        </div>
                        <div className="text-[10px] text-[#766E65] truncate">
                          {metal.origin?.split(',')[0]}
                        </div>
                        <div className="text-[10px] font-medium text-[#8C4B23] mt-0.5">
                          {metal.priceModifier === 0 ? 'Standard' : `+$${metal.priceModifier}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complimentary Swatch Kit Request CTA */}
            <div className="p-3.5 rounded-xl bg-[#EFECE6] border border-[#E2DDD5] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#22201D]">Unsure of textures in your light?</div>
                <div className="text-[11px] text-[#766E65]">Complimentary 5-material tactile sample box</div>
              </div>
              <button
                onClick={() => setSwatchModalOpen(true)}
                className="px-3 py-1.5 rounded-md bg-[#22201D] hover:bg-black text-white text-xs font-medium transition-colors"
              >
                Order Swatches
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: BESPOKE DIMENSIONS */}
        {activeTab === 'dimensions' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-3 bg-[#EAE6DE]/60 rounded-lg text-xs text-[#524B43] leading-relaxed border border-[#E2DDD5]">
              <span className="font-semibold text-[#22201D]">Precision Sizing:</span> Every piece is individually drawn in CAD and milled to your architectural specifications within structural load boundaries.
            </div>

            {/* Width Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#22201D]">Overall Width</span>
                <span className="font-mono text-sm font-bold text-[#8C4B23]">
                  {selection.customWidthCm} cm / {(selection.customWidthCm / 2.54).toFixed(1)}"
                </span>
              </div>
              <input
                id="dimension-width-slider"
                type="range"
                min={product.dimensions?.minWidthCm ?? 60}
                max={product.dimensions?.maxWidthCm ?? 300}
                value={selection.customWidthCm ?? baseWidth}
                onChange={(e) => handleDimensionChange('customWidthCm', Number(e.target.value))}
                className="w-full accent-[#8C4B23] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#766E65] mt-1 font-mono">
                <span>Min: {product.dimensions?.minWidthCm ?? 60}cm</span>
                <span>Standard: {product.dimensions?.widthCm ?? baseWidth}cm</span>
                <span>Max: {product.dimensions?.maxWidthCm ?? 300}cm</span>
              </div>
            </div>

            {/* Depth Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#22201D]">Overall Depth</span>
                <span className="font-mono text-sm font-bold text-[#8C4B23]">
                  {selection.customDepthCm ?? baseDepth} cm / {(((selection.customDepthCm ?? baseDepth)) / 2.54).toFixed(1)}"
                </span>
              </div>
              <input
                id="dimension-depth-slider"
                type="range"
                min={product.dimensions?.minDepthCm ?? 40}
                max={product.dimensions?.maxDepthCm ?? 150}
                value={selection.customDepthCm ?? baseDepth}
                onChange={(e) => handleDimensionChange('customDepthCm', Number(e.target.value))}
                className="w-full accent-[#8C4B23] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#766E65] mt-1 font-mono">
                <span>Min: {product.dimensions?.minDepthCm ?? 40}cm</span>
                <span>Standard: {product.dimensions?.depthCm ?? baseDepth}cm</span>
                <span>Max: {product.dimensions?.maxDepthCm ?? 150}cm</span>
              </div>
            </div>

            {/* Height Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#22201D]">Overall Height</span>
                <span className="font-mono text-sm font-bold text-[#8C4B23]">
                  {selection.customHeightCm ?? baseHeight} cm / {(((selection.customHeightCm ?? baseHeight)) / 2.54).toFixed(1)}"
                </span>
              </div>
              <input
                id="dimension-height-slider"
                type="range"
                min={product.dimensions?.minHeightCm ?? 35}
                max={product.dimensions?.maxHeightCm ?? 120}
                value={selection.customHeightCm ?? baseHeight}
                onChange={(e) => handleDimensionChange('customHeightCm', Number(e.target.value))}
                className="w-full accent-[#8C4B23] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#766E65] mt-1 font-mono">
                <span>Min: {product.dimensions?.minHeightCm ?? 35}cm</span>
                <span>Standard: {product.dimensions?.heightCm ?? baseHeight}cm</span>
                <span>Max: {product.dimensions?.maxHeightCm ?? 120}cm</span>
              </div>
            </div>

            {/* Reset to standard dimensions button */}
            <button
              id="reset-dimensions-button"
              onClick={() => {
                onUpdateSelection({
                  customWidthCm: product.dimensions?.widthCm ?? baseWidth,
                  customDepthCm: product.dimensions?.depthCm ?? baseDepth,
                  customHeightCm: product.dimensions?.heightCm ?? baseHeight,
                });
              }}
              className="w-full py-2 rounded-lg border border-[#E2DDD5] bg-white hover:bg-[#F2EFE9] text-xs font-medium text-[#766E65] hover:text-[#22201D] transition-colors"
            >
              Reset to Standard Atelier Ratio
            </button>

            {/* Craftsmanship Specs Callout */}
            <div className="pt-4 border-t border-[#EAE6DE] space-y-2">
              <div className="text-xs font-bold text-[#22201D] uppercase tracking-wider">
                Craftsmanship Specification
              </div>
              <ul className="text-xs text-[#766E65] space-y-1.5">
                {product.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#8C4B23] font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* TAB 3: 3D INSPECTION TOOLS */}
        {activeTab === 'view_tools' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Exploded Joinery View Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#22201D] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#8C4B23]" />
                  Exploded Joinery View
                </span>
                <span className="font-mono text-xs text-[#8C4B23]">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>
              <input
                id="exploded-view-slider"
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={explodedAmount}
                onChange={(e) => onExplodedChange(Number(e.target.value))}
                className="w-full accent-[#8C4B23] cursor-pointer"
              />
              <p className="text-[11px] text-[#766E65] mt-1">
                Expands cushions, frames, and hardware to reveal inner mortise & tenon joinery.
              </p>
            </div>

            {/* Visual Inspection Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#EAE6DE]">
              <div className="text-xs font-bold text-[#22201D] uppercase tracking-wider mb-2">
                Viewport Overlays
              </div>

              {/* 3D Calipers Dimensions */}
              <button
                id="toggle-calipers-button"
                onClick={onToggleDimensions}
                className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  showDimensions ? 'bg-[#8C4B23]/10 border-[#8C4B23] text-[#8C4B23]' : 'bg-white border-[#E2DDD5] text-[#22201D]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Ruler className="w-4 h-4" />
                  3D Metric Calipers Overlay
                </div>
                <span className="text-[11px] font-mono">{showDimensions ? 'Active' : 'Off'}</span>
              </button>

              {/* Turntable Auto-Rotate */}
              <button
                id="toggle-turntable-button"
                onClick={onToggleAutoRotate}
                className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  autoRotate ? 'bg-[#8C4B23]/10 border-[#8C4B23] text-[#8C4B23]' : 'bg-white border-[#E2DDD5] text-[#22201D]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <RotateCw className="w-4 h-4" />
                  Continuous Turntable Rotation
                </div>
                <span className="text-[11px] font-mono">{autoRotate ? 'Active' : 'Off'}</span>
              </button>

              {/* Wireframe CAD Blueprint */}
              <button
                id="toggle-wireframe-button"
                onClick={onToggleWireframe}
                className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  wireframeMode ? 'bg-[#8C4B23]/10 border-[#8C4B23] text-[#8C4B23]' : 'bg-white border-[#E2DDD5] text-[#22201D]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Eye className="w-4 h-4" />
                  Wireframe / CAD Mesh Mode
                </div>
                <span className="text-[11px] font-mono">{wireframeMode ? 'Active' : 'Off'}</span>
              </button>
            </div>

            {/* Atelier Note */}
            <div className="p-3.5 bg-white border border-[#E2DDD5] rounded-xl text-xs space-y-1">
              <div className="font-semibold text-[#22201D] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#8C4B23]" />
                Handcrafted in Small Batches
              </div>
              <p className="text-[11px] text-[#766E65] leading-relaxed">
                {product.craftsmanshipNotes}
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Footer Actions: AR Preview & Add to Bag */}
      <div className="p-5 bg-white border-t border-[#E2DDD5] space-y-2.5">
        {/* Wishlist & Recent History Quick Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            id="customizer-save-wishlist-btn"
            type="button"
            onClick={() => onSaveToWishlist && onSaveToWishlist(totalCalculatedPrice)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-[#FAF8F5] border-[#E2DDD5] text-[#524B43] hover:text-rose-600 hover:border-rose-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isWishlisted ? 'Wishlisted' : 'Save Wishlist'}</span>
          </button>

          {onToggleCompare ? (
            <button
              id="customizer-split-compare-btn"
              type="button"
              onClick={onToggleCompare}
              className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isCompareMode
                  ? 'bg-[#8C4B23] text-white border-[#8C4B23]'
                  : 'border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#8C4B23]'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>{isCompareMode ? 'Exit Split Screen' : 'Split Compare'}</span>
            </button>
          ) : (
            <button
              id="customizer-open-recent-btn"
              type="button"
              onClick={onOpenRecent}
              className="py-2.5 px-3 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#8C4B23] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#8C4B23]" />
              <span>Compare Recent {recentCount > 0 ? `(${recentCount})` : ''}</span>
            </button>
          )}
        </div>

        {/* Share Configuration & Assembly Instructions Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Social Share Button */}
          <button
            id="customizer-share-btn"
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="py-2 px-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#1A1917] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Generate Shareable Configuration Link"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8C4B23]" />
            <span>Share</span>
          </button>

          {/* Assembly Guide Button */}
          <button
            id="customizer-assembly-guide-btn"
            type="button"
            onClick={() => setAssemblyModalOpen(true)}
            className="py-2 px-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#1A1917] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="View Assembly Instructions & Blueprint"
          >
            <Wrench className="w-3.5 h-3.5 text-[#8C4B23]" />
            <span>Assembly</span>
          </button>

          {/* Side-by-Side Compare Modal Trigger */}
          <button
            id="customizer-open-comparison-modal-btn"
            type="button"
            onClick={onOpenComparisonModal || onOpenRecent}
            className="py-2 px-2.5 rounded-xl border border-[#E2DDD5] bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#524B43] hover:text-[#8C4B23] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Side-by-Side Architectural Comparison"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#8C4B23]" />
            <span>Compare</span>
          </button>
        </div>

        {/* Augmented Reality Button */}
        <button
          id="launch-ar-room-button"
          onClick={onOpenAR}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#22201D] to-[#36322D] hover:from-black hover:to-[#22201D] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 border border-[#C5A880]/30 group cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
          <span>View in Your Room (True 1:1 AR)</span>
        </button>

        {/* Add to Bag Checkout Button */}
        <button
          id="add-custom-furniture-to-cart"
          onClick={() => onAddToCart({ ...selection, calculatedPrice: totalCalculatedPrice })}
          className="w-full py-3.5 rounded-xl bg-[#8C4B23] hover:bg-[#723B1B] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Commission This Custom Piece · ${totalCalculatedPrice.toLocaleString('en-US')}</span>
        </button>
      </div>

      {/* Modal for complimentary sample swatches */}
      {swatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#FAF8F5] border border-[#C5A880] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="font-['Cinzel'] text-xl font-bold text-[#22201D]">
              Request Atelier Sample Box
            </h3>
            <p className="text-xs text-[#766E65] mt-1">
              We will express-mail physical 10×10cm wood blocks and textile swatches for {currentWood.name}, {currentFabric.name}, and {currentMetal.name}.
            </p>

            {swatchOrdered ? (
              <div className="my-8 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-semibold text-sm text-[#22201D]">Sample Box Dispatched!</div>
                <div className="text-xs text-[#766E65] mt-1">Estimated delivery: 2-3 business days. Complimentary.</div>
              </div>
            ) : (
              <form onSubmit={handleOrderSwatchKit} className="space-y-3 mt-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#22201D] uppercase">Full Name</label>
                  <input
                    required
                    type="text"
                    defaultValue="Genevieve Dupond"
                    className="w-full mt-1 p-2.5 bg-white border border-[#E2DDD5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#22201D] uppercase">Shipping Address</label>
                  <input
                    required
                    type="text"
                    defaultValue="74 Mercer Street, Loft 4B, New York, NY 10012"
                    className="w-full mt-1 p-2.5 bg-white border border-[#E2DDD5] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#22201D] uppercase">Email</label>
                  <input
                    required
                    type="email"
                    defaultValue="g.dupond@interiors-studio.com"
                    className="w-full mt-1 p-2.5 bg-white border border-[#E2DDD5] rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSwatchModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#766E65] hover:text-[#22201D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#8C4B23] hover:bg-[#723B1B] text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                  >
                    Send Free Swatch Kit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Social Media Share Configuration Modal */}
      <SocialShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={product}
        selection={selection}
        calculatedPrice={totalCalculatedPrice}
        woodName={currentWood?.name}
        fabricName={currentFabric?.name}
        metalName={currentMetal?.name}
      />

      {/* Assembly Instructions Viewer Modal */}
      <AssemblyInstructionsModal
        isOpen={assemblyModalOpen}
        onClose={() => setAssemblyModalOpen(false)}
        product={product}
      />

    </div>
  );
};
