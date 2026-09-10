import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Trash2, ArrowRight, Eye, ShoppingBag, Check, Sparkles } from 'lucide-react';
import { SavedDesign } from '../types/furniture';
import { ProductImage } from '../utils/productImages';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: SavedDesign[];
  onRemoveFromWishlist: (id: string) => void;
  onLoadDesign: (design: SavedDesign) => void;
  onAddToCart: (design: SavedDesign) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onLoadDesign,
  onAddToCart,
}) => {
  const [addedId, setAddedId] = React.useState<string | null>(null);

  const handleAddToCart = (design: SavedDesign) => {
    onAddToCart(design);
    setAddedId(design.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            key="wishlist-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            key="wishlist-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2DDD5] text-[#22201D] z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E2DDD5] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <h2 className="font-['Cinzel'] text-lg font-bold text-[#22201D]">
                    Saved Wishlist ({wishlist.length})
                  </h2>
                  <p className="text-[11px] text-[#766E65]">Your personal architectural commissions</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#EFECE6] text-[#766E65] hover:text-[#22201D] transition-colors cursor-pointer"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#766E65] space-y-3 py-16">
                  <div className="w-16 h-16 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#A49B8F]">
                    <Heart className="w-7 h-7" />
                  </div>
                  <h3 className="font-['Cinzel'] font-semibold text-[#22201D] text-base">No Saved Designs Yet</h3>
                  <p className="text-xs max-w-xs text-[#766E65]">
                    Click the "Save to Wishlist" button in the 3D Customizer to bookmark your favorite wood finishes, fabrics, and custom scale measurements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white border border-[#E2DDD5] shadow-xs space-y-3.5 hover:border-[#C5A880] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E2DDD5] bg-[#FAF8F5] shrink-0 relative">
                            <ProductImage
                              product={item.product}
                              alt={item.product.name}
                              containerClassName="w-full h-full"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[#8C4B23] font-semibold">
                              {item.product.category}
                            </span>
                            <h4 className="font-['Cinzel'] font-bold text-sm text-[#22201D] truncate">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] text-[#A49B8F]">
                              Saved on {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveFromWishlist(item.id)}
                          className="text-[#A49B8F] hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Finish Swatches */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#F0ECE1] text-[11px]">
                        <div>
                          <span className="text-[10px] text-[#766E65] block">Wood</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: item.wood.colorHex }}
                            />
                            <span className="font-medium truncate text-[#22201D] text-[11px]">{item.wood.name}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#766E65] block">Fabric</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: item.fabric.colorHex }}
                            />
                            <span className="font-medium truncate text-[#22201D] text-[11px]">{item.fabric.name}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#766E65] block">Metal</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: item.metal.colorHex }}
                            />
                            <span className="font-medium truncate text-[#22201D] text-[11px]">{item.metal.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Custom Dimensions */}
                      <div className="flex justify-between items-center text-[11px] font-mono text-[#5A534B] px-2">
                        <span>Dimensions:</span>
                        <span className="font-medium">
                          {item.customization.customWidthCm}W × {item.customization.customDepthCm}D × {item.customization.customHeightCm}H cm
                        </span>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE1] gap-2">
                        <span className="font-mono text-sm font-bold text-[#22201D]">
                          ${item.calculatedPrice.toLocaleString('en-US')}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onLoadDesign(item);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[#C5A880] text-[#8C4B23] hover:bg-[#FAF5EF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Load back into 3D Configurator"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View 3D</span>
                          </button>

                          <button
                            onClick={() => handleAddToCart(item)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#8C4B23] hover:bg-[#723B1B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {addedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="p-4 bg-white border-t border-[#E2DDD5] text-center">
                <p className="text-[11px] text-[#766E65]">
                  Saved locally on your device for easy comparison and future commissions.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
