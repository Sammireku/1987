import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, ArrowRight, Eye, Scale, Check, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { SavedDesign } from '../types/furniture';
import { ProductImage } from '../utils/productImages';

interface RecentDesignsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recentDesigns: SavedDesign[];
  activeDesignId?: string;
  onLoadDesign: (design: SavedDesign) => void;
  onSaveToWishlist: (design: SavedDesign) => void;
  isWishlisted: (design: SavedDesign) => boolean;
}

export const RecentDesignsDrawer: React.FC<RecentDesignsDrawerProps> = ({
  isOpen,
  onClose,
  recentDesigns,
  activeDesignId,
  onLoadDesign,
  onSaveToWishlist,
  isWishlisted,
}) => {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const selectedForCompare = recentDesigns.filter((d) => compareIds.includes(d.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            key="recent-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            key="recent-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2DDD5] text-[#22201D] z-10"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E2DDD5] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#8C4B23]">
                  <History className="w-4 h-4 text-[#8C4B23]" />
                </div>
                <div>
                  <h2 className="font-['Cinzel'] text-lg font-bold text-[#22201D]">
                    Recent Designs ({recentDesigns.length}/5)
                  </h2>
                  <p className="text-[11px] text-[#766E65]">Session history for instant side-by-side comparison</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#EFECE6] text-[#766E65] hover:text-[#22201D] transition-colors cursor-pointer"
                aria-label="Close recent history"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Quick Comparison Section if 2 items selected */}
              {selectedForCompare.length === 2 && (
                <div className="p-4 rounded-xl bg-white border-2 border-[#C5A880] shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C4B23]">
                      <Scale className="w-4 h-4" />
                      <span>Side-by-Side Comparison</span>
                    </div>
                    <button
                      onClick={() => setCompareIds([])}
                      className="text-[11px] text-[#766E65] hover:text-[#22201D] underline"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    {selectedForCompare.map((d, index) => (
                      <div key={d.id} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E2DDD5] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-[#8C4B23]">
                            Option {index === 0 ? 'A' : 'B'}
                          </span>
                          <span className="font-mono font-bold text-sm text-[#22201D]">
                            ${d.calculatedPrice.toLocaleString('en-US')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E2DDD5] shrink-0 bg-white">
                            <ProductImage product={d.product} alt={d.product.name} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                          </div>
                          <h4 className="font-['Cinzel'] font-bold text-xs truncate">{d.product.name}</h4>
                        </div>
                        
                        <div className="space-y-1 text-[11px] text-[#5A534B]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.wood.colorHex }} />
                            <span className="truncate">{d.wood.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fabric.colorHex }} />
                            <span className="truncate">{d.fabric.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.metal.colorHex }} />
                            <span className="truncate">{d.metal.name}</span>
                          </div>
                          <div className="font-mono text-[10px] pt-1 text-[#766E65]">
                            {d.customization.customWidthCm}W × {d.customization.customDepthCm}D × {d.customization.customHeightCm}H cm
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onLoadDesign(d);
                            onClose();
                          }}
                          className="w-full py-1.5 rounded-md bg-[#8C4B23] text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer hover:bg-[#723B1B]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Load Option {index === 0 ? 'A' : 'B'}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Deltas breakdown */}
                  <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[11px] space-y-1 text-[#5A534B]">
                    <div className="flex justify-between font-mono">
                      <span>Price Difference:</span>
                      <span className="font-bold text-[#8C4B23]">
                        {Math.abs(selectedForCompare[0].calculatedPrice - selectedForCompare[1].calculatedPrice) === 0
                          ? 'Identical Price'
                          : `$${Math.abs(selectedForCompare[0].calculatedPrice - selectedForCompare[1].calculatedPrice).toLocaleString('en-US')} delta`}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Width Difference:</span>
                      <span>
                        {Math.abs(selectedForCompare[0].customization.customWidthCm - selectedForCompare[1].customization.customWidthCm)} cm
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions banner */}
              <div className="flex items-center justify-between text-xs text-[#766E65] px-1">
                <span>Select any 2 to compare side-by-side</span>
                <span className="font-mono text-[11px]">{compareIds.length}/2 selected</span>
              </div>

              {/* List of Recent Designs */}
              {recentDesigns.length === 0 ? (
                <div className="py-16 text-center space-y-3 text-[#766E65]">
                  <div className="w-16 h-16 rounded-full bg-[#EFECE6] mx-auto flex items-center justify-center text-[#A49B8F]">
                    <History className="w-7 h-7" />
                  </div>
                  <h3 className="font-['Cinzel'] font-semibold text-base text-[#22201D]">No History Yet</h3>
                  <p className="text-xs max-w-xs mx-auto">
                    As you tune materials and dimension sliders in the 3D studio, your iterations will be captured here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDesigns.map((design, index) => {
                    const isSelectedForCompare = compareIds.includes(design.id);
                    const isFavorited = isWishlisted(design);

                    return (
                      <div
                        key={design.id}
                        className={`p-4 rounded-xl bg-white border transition-all ${
                          isSelectedForCompare
                            ? 'border-[#C5A880] shadow-md ring-2 ring-[#C5A880]/30'
                            : 'border-[#E2DDD5] shadow-2xs hover:border-[#C5A880]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E2DDD5] shrink-0 bg-[#FAF8F5] relative">
                              <ProductImage product={design.product} alt={design.product.name} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono uppercase text-[#8C4B23] font-bold">
                                  Iteration #{index + 1}
                                </span>
                                <span className="text-[10px] text-[#A49B8F]">
                                  {new Date(design.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                              <h4 className="font-['Cinzel'] font-bold text-sm text-[#22201D] truncate">
                                {design.product.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onSaveToWishlist(design)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isFavorited
                                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                                  : 'bg-white border-[#E2DDD5] text-[#766E65] hover:text-rose-500'
                              }`}
                              title={isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}
                            >
                              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
                            </button>
                            
                            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2DDD5] text-xs cursor-pointer hover:bg-[#FAF8F5]">
                              <input
                                type="checkbox"
                                checked={isSelectedForCompare}
                                onChange={() => toggleCompare(design.id)}
                                className="w-3.5 h-3.5 accent-[#8C4B23] cursor-pointer"
                              />
                              <span className="text-[11px] font-medium text-[#5A534B]">Compare</span>
                            </label>
                          </div>
                        </div>

                        {/* Finishes row */}
                        <div className="flex items-center gap-4 py-2.5 text-xs text-[#5A534B] border-y border-[#F0ECE1] my-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: design.wood.colorHex }} />
                            <span className="truncate max-w-[90px]">{design.wood.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: design.fabric.colorHex }} />
                            <span className="truncate max-w-[90px]">{design.fabric.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: design.metal.colorHex }} />
                            <span className="truncate max-w-[90px]">{design.metal.name}</span>
                          </div>
                        </div>

                        {/* Footer row with dimensions & price & restore */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[11px] font-mono text-[#766E65]">
                            <span>{design.customization.customWidthCm}W × {design.customization.customDepthCm}D × {design.customization.customHeightCm}H cm</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-[#22201D]">
                              ${design.calculatedPrice.toLocaleString('en-US')}
                            </span>
                            <button
                              onClick={() => {
                                onLoadDesign(design);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#22201D] hover:bg-[#38342F] text-[#FAF8F5] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View in 3D</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-[#E2DDD5] text-center">
              <p className="text-[11px] text-[#766E65]">
                Captures up to 5 iterations in your active session. Cleared upon browser restart.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
