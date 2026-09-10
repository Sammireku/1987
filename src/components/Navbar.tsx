import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Compass, 
  Sliders, 
  Layers, 
  PhoneCall, 
  Camera, 
  Package, 
  ChevronDown,
  Heart,
  History,
  Building2,
  TreePine,
  Home,
  MessageSquare,
  ArrowLeftRight
} from 'lucide-react';
import { FurnitureItem } from '../types/furniture';
import { AtelierLogo } from './AtelierLogo';

export type AppView = 'home' | 'products' | 'product' | 'studio' | 'company' | 'contact' | 'backend';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  recentCount: number;
  onOpenRecent: () => void;
  catalog: FurnitureItem[];
  selectedProduct: FurnitureItem;
  onSelectProduct: (product: FurnitureItem) => void;
  onOpenAR: () => void;
  onOpenTrackOrder?: () => void;
  onOpenComparison?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  recentCount,
  onOpenRecent,
  catalog,
  selectedProduct,
  onSelectProduct,
  onOpenAR,
  onOpenTrackOrder,
  onOpenComparison,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#FAF8F5]/95 backdrop-blur-md shadow-xs border-b border-[#E2DDD5] py-1' 
        : 'bg-[#FAF8F5] border-b border-[#E2DDD5]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          
          {/* Logo Brandmark: Wide on large screens, Square on smaller screens or when scrolled */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center group cursor-pointer transition-transform duration-200 hover:opacity-90"
              aria-label="1987 Furniture Atelier"
            >
              <AtelierLogo 
                scrolled={isScrolled} 
                height={isScrolled ? 34 : 38} 
              />
            </button>

            {/* In-Studio Quick Furniture Selector */}
            {currentView === 'studio' && (
              <div className="hidden xl:flex items-center bg-[#EFECE6] p-1 rounded-xl border border-[#E2DDD5] text-xs">
                {catalog.slice(0, 3).map(item => (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => onSelectProduct(item)}
                    className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                      selectedProduct.id === item.id
                        ? 'bg-[#22201D] text-white shadow-sm'
                        : 'text-[#524B43] hover:text-[#22201D]'
                    }`}
                  >
                    {item.name.replace('The 1987 ', '').replace(' Modular Sofa', '').replace(' Architectural Dining Table', '')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
            
            {/* 1. Home */}
            <button
              id="nav-to-home"
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'home'
                  ? 'bg-[#22201D] text-white shadow-sm'
                  : 'text-[#524B43] hover:text-[#22201D] hover:bg-[#EFECE6]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* 2. Products (All 38 Items) */}
            <button
              id="nav-to-products"
              onClick={() => onNavigate('products')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'products'
                  ? 'bg-[#22201D] text-white shadow-sm'
                  : 'text-[#524B43] hover:text-[#22201D] hover:bg-[#EFECE6]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>

            {/* 3. 3D Studio */}
            <button
              id="nav-to-studio"
              onClick={() => onNavigate('studio')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'studio'
                  ? 'bg-[#22201D] text-white shadow-sm'
                  : 'text-[#524B43] hover:text-[#22201D] hover:bg-[#EFECE6]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden md:inline">3D Studio</span>
            </button>

            {/* 4. Company Profile */}
            <button
              id="nav-to-company"
              onClick={() => onNavigate('company')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'company'
                  ? 'bg-[#22201D] text-white shadow-sm'
                  : 'text-[#524B43] hover:text-[#22201D] hover:bg-[#EFECE6]'
              }`}
            >
              <TreePine className="w-3.5 h-3.5 text-[#8C4B23]" />
              <span className="hidden sm:inline">Company</span>
            </button>

            {/* 5. Contact */}
            <button
              id="nav-to-contact"
              onClick={() => onNavigate('contact')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'contact'
                  ? 'bg-[#22201D] text-white shadow-sm'
                  : 'text-[#524B43] hover:text-[#22201D] hover:bg-[#EFECE6]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Contact</span>
            </button>

            {/* 6. AI CAD / Backend */}
            <button
              id="nav-to-backend"
              onClick={() => onNavigate('backend')}
              className={`hidden lg:flex px-3 py-2 rounded-xl transition-all items-center gap-1.5 border border-[#8C4B23]/30 cursor-pointer ${
                currentView === 'backend'
                  ? 'bg-[#8C4B23] text-white shadow-sm'
                  : 'text-[#8C4B23] bg-[#8C4B23]/10 hover:bg-[#8C4B23]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI CAD Ops</span>
            </button>

            {/* True-Scale AR Quick Launch Button */}
            <button
              id="quick-launch-ar-button"
              onClick={onOpenAR}
              className="hidden md:flex px-3 py-2 rounded-xl bg-white border border-[#C5A880] text-[#22201D] hover:bg-[#FAF8F5] transition-all items-center gap-1.5 shadow-2xs cursor-pointer ml-1"
              title="Launch True 1:1 Augmented Reality"
            >
              <Camera className="w-3.5 h-3.5 text-[#8C4B23]" />
              <span>AR In-Space</span>
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-[#E2DDD5] mx-1 hidden sm:block"></div>

            {/* Recent Session Iterations */}
            <button
              id="open-recent-button"
              onClick={onOpenRecent}
              className="relative p-2.5 rounded-xl bg-white border border-[#E2DDD5] text-[#524B43] hover:text-[#8C4B23] hover:border-[#C5A880] transition-colors shadow-2xs flex items-center cursor-pointer"
              title="Recent Design History"
            >
              <History className="w-4 h-4" />
              {recentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8C4B23] text-white text-[9px] font-bold flex items-center justify-center font-mono">
                  {recentCount}
                </span>
              )}
            </button>

            {/* Side-by-Side Architectural Compare */}
            {onOpenComparison && (
              <button
                id="open-comparison-button"
                onClick={onOpenComparison}
                className="relative p-2.5 rounded-xl bg-white border border-[#E2DDD5] text-[#524B43] hover:text-[#8C4B23] hover:border-[#C5A880] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                title="Side-by-Side Comparison (Dimensions & Pricing)"
              >
                <ArrowLeftRight className="w-4 h-4 text-[#8C4B23]" />
                <span className="hidden xl:inline text-[11px]">Compare</span>
              </button>
            )}

            {/* Track My Order / Client Account */}
            {onOpenTrackOrder && (
              <button
                id="open-track-order-button"
                onClick={onOpenTrackOrder}
                className="relative p-2.5 rounded-xl bg-white border border-[#E2DDD5] text-[#524B43] hover:text-[#8C4B23] hover:border-[#C5A880] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                title="Track My Order & Client Account"
              >
                <Package className="w-4 h-4 text-[#8C4B23]" />
                <span className="hidden xl:inline text-[11px]">Track Order</span>
              </button>
            )}

            {/* Saved Wishlist */}
            <button
              id="open-wishlist-button"
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-xl bg-white border border-[#E2DDD5] text-[#524B43] hover:text-rose-600 hover:border-rose-300 transition-colors shadow-2xs flex items-center cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag / Cart */}
            <button
              id="open-bag-button"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-[#22201D] text-white hover:bg-black transition-colors flex items-center gap-2 shadow-md cursor-pointer ml-0.5"
              title="View Custom Commissions Bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#8C4B23] text-white text-[10px] font-bold flex items-center justify-center font-mono animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>

          </nav>

        </div>
      </div>
    </header>
  );
};
