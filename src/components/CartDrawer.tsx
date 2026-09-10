import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { FurnitureItem, CustomizationSelection, MaterialOption } from '../types/furniture';
import { ProductImage } from '../utils/productImages';

interface CartItemData {
  product: FurnitureItem;
  customization: CustomizationSelection;
  wood: MaterialOption;
  fabric: MaterialOption;
  metal: MaterialOption;
  quantity: number;
  unitPrice: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemData[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, qty: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onProceedToCheckout,
}) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Slide-in Panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#E2DDD5] text-[#22201D] z-10"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E2DDD5] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#8C4B23]" />
                <h2 className="font-['Cinzel'] text-lg font-bold text-[#22201D]">
                  Commission Bag ({cartItems.length})
                </h2>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#EFECE6] text-[#766E65] hover:text-[#22201D] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#766E65] space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8C4B23]">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="font-['Cinzel'] font-bold text-base text-[#22201D]">
                Your Bag is Empty
              </div>
              <p className="text-xs max-w-xs">
                Customize any piece in 3D or inspect in Augmented Reality before commissioning.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-[#E2DDD5] shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E2DDD5] bg-[#FAF8F5] shrink-0 relative">
                        <ProductImage
                          product={item.product}
                          alt={item.product.name}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#22201D] font-['Cinzel'] truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-[#8C4B23]">
                          {item.product.leadTimeWeeks} Weeks Handcrafting
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-[#766E65] hover:text-red-600 p-1 transition-colors shrink-0 cursor-pointer"
                      title="Remove piece"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Material & Dimension Specs */}
                  <div className="p-2.5 bg-[#FAF8F5] rounded-lg text-xs space-y-1 font-mono text-[11px] text-[#524B43]">
                    <div className="flex items-center justify-between">
                      <span>Dimensions:</span>
                      <span className="font-bold text-[#22201D]">
                        {item.customization.customWidthCm}W × {item.customization.customDepthCm}D × {item.customization.customHeightCm}H cm
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Wood:</span>
                      <span className="text-[#22201D]">{item.wood.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Fabric:</span>
                      <span className="text-[#22201D]">{item.fabric.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Metal:</span>
                      <span className="text-[#22201D]">{item.metal.name}</span>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center border border-[#E2DDD5] rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#22201D]"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono font-bold bg-white text-[#22201D]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EFECE6] text-[#22201D]"
                      >
                        +
                      </button>
                    </div>

                    <div className="font-mono font-bold text-sm text-[#22201D]">
                      ${(item.unitPrice * item.quantity).toLocaleString('en-US')}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-[#E2DDD5] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#766E65]">
                <span>Commission Subtotal</span>
                <span className="font-mono text-[#22201D] font-bold">
                  ${subtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between text-[#766E65]">
                <span>White-Glove Placement</span>
                <span className="text-emerald-700 font-medium">Standard Included</span>
              </div>
            </div>

            <button
              id="cart-proceed-checkout-button"
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 rounded-xl bg-[#8C4B23] hover:bg-[#723B1B] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Bespoke Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
