import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CATALOG, 
  INITIAL_WOOD_MATERIALS, 
  INITIAL_FABRIC_MATERIALS, 
  INITIAL_METAL_MATERIALS, 
  INITIAL_ORDERS 
} from './data/initialData';
import { 
  FurnitureItem, 
  MaterialOption, 
  CustomizationSelection, 
  Order,
  SavedDesign,
  calculateFurniturePrice
} from './types/furniture';
import { ThreeCanvas } from './components/ThreeCanvas';
import { CustomizerPanel } from './components/CustomizerPanel';
import { ARViewModal } from './components/ARViewModal';
import { BackendContentManager } from './components/BackendContentManager';
import { ShowroomView } from './components/ShowroomView';
import { Navbar, AppView } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ProductDetailView } from './components/ProductDetailView';
import { CompanyProfileView } from './components/CompanyProfileView';
import { ContactView } from './components/ContactView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { RecentDesignsDrawer } from './components/RecentDesignsDrawer';
import { TrackOrderAccountModal } from './components/TrackOrderAccountModal';
import { ComparisonModal } from './components/ComparisonModal';
import { AssemblyInstructionsModal } from './components/AssemblyInstructionsModal';
import { 
  Camera, 
  Compass, 
  Maximize, 
  RotateCw, 
  Layers, 
  Ruler, 
  Sparkles, 
  Info,
  CheckCircle2,
  Columns2,
  X,
  History
} from 'lucide-react';

export default function App() {
  // Global Data State
  const [catalog, setCatalog] = useState<FurnitureItem[]>(INITIAL_CATALOG);
  const [woodMaterials, setWoodMaterials] = useState<MaterialOption[]>(INITIAL_WOOD_MATERIALS);
  const [fabricMaterials, setFabricMaterials] = useState<MaterialOption[]>(INITIAL_FABRIC_MATERIALS);
  const [metalMaterials, setMetalMaterials] = useState<MaterialOption[]>(INITIAL_METAL_MATERIALS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // View Navigation: home | products | product | studio | company | contact | backend
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Active Selected Furniture Product for 3D Customizer
  const [selectedProduct, setSelectedProduct] = useState<FurnitureItem>(catalog[0]);

  // Current Customization State
  const [selection, setSelection] = useState<CustomizationSelection>({
    productId: selectedProduct.id,
    selectedWoodId: selectedProduct.defaultWoodId,
    selectedFabricId: selectedProduct.defaultFabricId,
    selectedMetalId: selectedProduct.defaultMetalId,
    customWidthCm: selectedProduct.dimensions.widthCm,
    customDepthCm: selectedProduct.dimensions.depthCm,
    customHeightCm: selectedProduct.dimensions.heightCm,
    specialInstructions: '',
  });

  // 3D Canvas Viewport Settings
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'front' | 'side' | 'top'>('perspective');

  // Modals & Drawers
  const [arModalOpen, setArModalOpen] = useState<boolean>(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState<boolean>(false);
  const [recentDrawerOpen, setRecentDrawerOpen] = useState<boolean>(false);
  const [trackOrderModalOpen, setTrackOrderModalOpen] = useState<boolean>(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState<boolean>(false);
  const [assemblyModalOpen, setAssemblyModalOpen] = useState<boolean>(false);

  // Compare Mode State (Studio View Split-Screen)
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareDesign, setCompareDesign] = useState<SavedDesign | null>(null);

  // Cart Items
  const [cartItems, setCartItems] = useState<{
    product: FurnitureItem;
    customization: CustomizationSelection;
    wood: MaterialOption;
    fabric: MaterialOption;
    metal: MaterialOption;
    quantity: number;
    unitPrice: number;
  }[]>([]);

  // Find active materials
  const currentWood = woodMaterials.find(w => w.id === selection.selectedWoodId) || woodMaterials[0];
  const currentFabric = fabricMaterials.find(f => f.id === selection.selectedFabricId) || fabricMaterials[0];
  const currentMetal = metalMaterials.find(m => m.id === selection.selectedMetalId) || metalMaterials[0];

  // Persistent Wishlist State (Saved Configurations)
  const [wishlist, setWishlist] = useState<SavedDesign[]>(() => {
    try {
      const saved = localStorage.getItem('1987_furniture_wishlist');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse wishlist from storage', e);
    }
    const defaultP = INITIAL_CATALOG[0];
    const defW = INITIAL_WOOD_MATERIALS.find(w => w.id === defaultP.defaultWoodId) || INITIAL_WOOD_MATERIALS[0];
    const defF = INITIAL_FABRIC_MATERIALS.find(f => f.id === defaultP.defaultFabricId) || INITIAL_FABRIC_MATERIALS[0];
    const defM = INITIAL_METAL_MATERIALS.find(m => m.id === defaultP.defaultMetalId) || INITIAL_METAL_MATERIALS[0];
    return [
      {
        id: 'wishlist-initial-1',
        timestamp: Date.now() - 3600000 * 3,
        product: defaultP,
        customization: {
          productId: defaultP.id,
          selectedWoodId: defW.id,
          selectedFabricId: defF.id,
          selectedMetalId: defM.id,
          customWidthCm: defaultP.dimensions.widthCm,
          customDepthCm: defaultP.dimensions.depthCm,
          customHeightCm: defaultP.dimensions.heightCm,
          specialInstructions: 'Hand-finished walnut grain',
        },
        wood: defW,
        fabric: defF,
        metal: defM,
        calculatedPrice: calculateFurniturePrice(
          defaultP,
          defW,
          defF,
          defM,
          defaultP.dimensions.widthCm,
          defaultP.dimensions.depthCm,
          defaultP.dimensions.heightCm
        ),
      },
    ];
  });

  // Persist Wishlist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('1987_furniture_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlist]);

  // Session-based Recent Designs Tracker (Last 5 Configurations)
  const [recentDesigns, setRecentDesigns] = useState<SavedDesign[]>([]);

  // Update Recent Designs when active configuration changes (debounced 400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeCalculatedPrice = calculateFurniturePrice(
        selectedProduct,
        currentWood,
        currentFabric,
        currentMetal,
        selection.customWidthCm,
        selection.customDepthCm,
        selection.customHeightCm
      );

      const newSnapshot: SavedDesign = {
        id: `${selectedProduct.id}-${selection.selectedWoodId}-${selection.selectedFabricId}-${selection.selectedMetalId}-${selection.customWidthCm}x${selection.customDepthCm}x${selection.customHeightCm}`,
        timestamp: Date.now(),
        product: selectedProduct,
        customization: { ...selection },
        wood: currentWood,
        fabric: currentFabric,
        metal: currentMetal,
        calculatedPrice: activeCalculatedPrice,
      };

      setRecentDesigns(prev => {
        if (prev.length > 0 && prev[0].id === newSnapshot.id) {
          return prev;
        }
        const filtered = prev.filter(d => d.id !== newSnapshot.id);
        return [newSnapshot, ...filtered].slice(0, 5);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    selectedProduct.id,
    selection.selectedWoodId,
    selection.selectedFabricId,
    selection.selectedMetalId,
    selection.customWidthCm,
    selection.customDepthCm,
    selection.customHeightCm,
    currentWood,
    currentFabric,
    currentMetal,
  ]);

  const isCurrentConfigurationWishlisted = wishlist.some(
    w =>
      w.product.id === selectedProduct.id &&
      w.wood.id === currentWood.id &&
      w.fabric.id === currentFabric.id &&
      w.metal.id === currentMetal.id &&
      w.customization.customWidthCm === selection.customWidthCm &&
      w.customization.customDepthCm === selection.customDepthCm &&
      w.customization.customHeightCm === selection.customHeightCm
  );

  const isDesignWishlisted = (design: SavedDesign) => {
    return wishlist.some(
      w =>
        w.product.id === design.product.id &&
        w.wood.id === design.wood.id &&
        w.fabric.id === design.fabric.id &&
        w.metal.id === design.metal.id &&
        w.customization.customWidthCm === design.customization.customWidthCm &&
        w.customization.customDepthCm === design.customization.customDepthCm &&
        w.customization.customHeightCm === design.customization.customHeightCm
    );
  };

  const handleSaveCurrentToWishlist = (price?: number) => {
    const calculatedPrice = price || calculateFurniturePrice(
      selectedProduct,
      currentWood,
      currentFabric,
      currentMetal,
      selection.customWidthCm,
      selection.customDepthCm,
      selection.customHeightCm
    );

    if (isCurrentConfigurationWishlisted) {
      setWishlist(prev =>
        prev.filter(
          w =>
            !(
              w.product.id === selectedProduct.id &&
              w.wood.id === currentWood.id &&
              w.fabric.id === currentFabric.id &&
              w.metal.id === currentMetal.id &&
              w.customization.customWidthCm === selection.customWidthCm &&
              w.customization.customDepthCm === selection.customDepthCm &&
              w.customization.customHeightCm === selection.customHeightCm
            )
        )
      );
    } else {
      const designToSave: SavedDesign = {
        id: `wishlist-${Date.now()}`,
        timestamp: Date.now(),
        product: selectedProduct,
        customization: { ...selection },
        wood: currentWood,
        fabric: currentFabric,
        metal: currentMetal,
        calculatedPrice,
      };
      setWishlist(prev => [designToSave, ...prev]);
    }
  };

  const handleSaveProductToWishlist = (product: FurnitureItem) => {
    const isAlready = wishlist.some(w => w.product.id === product.id);
    if (isAlready) {
      setWishlist(prev => prev.filter(w => w.product.id !== product.id));
    } else {
      const prodWood = woodMaterials.find(w => w.id === product.defaultWoodId) || woodMaterials[0];
      const prodFabric = fabricMaterials.find(f => f.id === product.defaultFabricId) || fabricMaterials[0];
      const prodMetal = metalMaterials.find(m => m.id === product.defaultMetalId) || metalMaterials[0];
      const price = calculateFurniturePrice(
        product,
        prodWood,
        prodFabric,
        prodMetal,
        product.dimensions.widthCm,
        product.dimensions.depthCm,
        product.dimensions.heightCm
      );

      const designToSave: SavedDesign = {
        id: `wishlist-prod-${product.id}-${Date.now()}`,
        timestamp: Date.now(),
        product,
        customization: {
          productId: product.id,
          selectedWoodId: prodWood.id,
          selectedFabricId: prodFabric.id,
          selectedMetalId: prodMetal.id,
          customWidthCm: product.dimensions.widthCm,
          customDepthCm: product.dimensions.depthCm,
          customHeightCm: product.dimensions.heightCm,
          specialInstructions: '',
        },
        wood: prodWood,
        fabric: prodFabric,
        metal: prodMetal,
        calculatedPrice: price,
      };
      setWishlist(prev => [designToSave, ...prev]);
    }
  };

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const handleLoadDesign = (design: SavedDesign) => {
    setSelectedProduct(design.product);
    setSelection(design.customization);
    setCurrentView('studio');
  };

  const handleAddToCartFromSavedDesign = (design: SavedDesign) => {
    const newItem = {
      product: design.product,
      customization: design.customization,
      wood: design.wood,
      fabric: design.fabric,
      metal: design.metal,
      quantity: 1,
      unitPrice: design.calculatedPrice,
    };
    setCartItems(prev => [...prev, newItem]);
    setCartDrawerOpen(true);
  };

  // Switch Active Furniture Product
  const handleSelectProduct = (product: FurnitureItem) => {
    setSelectedProduct(product);
    setSelection({
      productId: product.id,
      selectedWoodId: product.defaultWoodId,
      selectedFabricId: product.defaultFabricId,
      selectedMetalId: product.defaultMetalId,
      customWidthCm: product.dimensions.widthCm,
      customDepthCm: product.dimensions.depthCm,
      customHeightCm: product.dimensions.heightCm,
      specialInstructions: '',
    });
    setExplodedAmount(0);
    setCurrentView('studio');
  };

  // Open AR directly for a product
  const handleOpenARForProduct = (product: FurnitureItem) => {
    handleSelectProduct(product);
    setArModalOpen(true);
  };

  // Add Item to Cart
  const handleAddToCart = (customization: CustomizationSelection) => {
    const unitPrice = customization.calculatedPrice || selectedProduct.basePrice;
    const newItem = {
      product: selectedProduct,
      customization,
      wood: currentWood,
      fabric: currentFabric,
      metal: currentMetal,
      quantity: 1,
      unitPrice,
    };

    setCartItems(prev => [...prev, newItem]);
    setCartDrawerOpen(true);
  };

  // Handle New Order Placed
  const handleOrderComplete = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
  };

  // Add Material from Backend
  const handleAddMaterial = (newMat: MaterialOption) => {
    if (newMat.category === 'wood') {
      setWoodMaterials(prev => [...prev, newMat]);
    } else if (newMat.category === 'fabric') {
      setFabricMaterials(prev => [...prev, newMat]);
    } else {
      setMetalMaterials(prev => [...prev, newMat]);
    }
  };

  // Add Product from AI CAD Converter
  const handleAddProduct = (newProduct: FurnitureItem) => {
    setCatalog(prev => [newProduct, ...prev]);
  };

  // Update Product
  const handleUpdateProduct = (updated: FurnitureItem) => {
    setCatalog(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#22201D] selection:bg-[#C5A880]/30 selection:text-[#22201D]">
      
      {/* Top Main Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
        onOpenCart={() => setCartDrawerOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistDrawerOpen(true)}
        recentCount={recentDesigns.length}
        onOpenRecent={() => setRecentDrawerOpen(true)}
        catalog={catalog}
        selectedProduct={selectedProduct}
        onSelectProduct={handleSelectProduct}
        onOpenAR={() => setArModalOpen(true)}
        onOpenTrackOrder={() => setTrackOrderModalOpen(true)}
        onOpenComparison={() => setComparisonModalOpen(true)}
      />

      {/* Main Viewport Router */}
      <main className="flex-1 flex flex-col">
        
        {/* VIEW 1: IMMERSIVE MODERN HOMEPAGE WITH VIDEO BACKGROUND */}
        {currentView === 'home' && (
          <HomeView
            catalog={catalog}
            woodMaterials={woodMaterials}
            onNavigateToProducts={() => setCurrentView('products')}
            onNavigateToProductDetail={(item) => {
              setSelectedProduct(item);
              setCurrentView('product');
            }}
            onNavigateToStudio={() => setCurrentView('studio')}
            onNavigateToCompany={() => setCurrentView('company')}
            onNavigateToContact={() => setCurrentView('contact')}
            onSelectProduct={(item) => {
              setSelectedProduct(item);
              setCurrentView('product');
            }}
            onOpenARForProduct={handleOpenARForProduct}
          />
        )}

        {/* VIEW 2: PRODUCTS SHOWROOM (ALL 38 CATALOGUE ITEMS) */}
        {currentView === 'products' && (
          <ShowroomView
            catalog={catalog}
            onSelectProduct={handleSelectProduct}
            onOpenARForProduct={handleOpenARForProduct}
            woodMaterials={woodMaterials}
            fabricMaterials={fabricMaterials}
            onSaveToWishlist={handleSaveProductToWishlist}
            isWishlistedProduct={(id) => wishlist.some(w => w.product.id === id)}
            onNavigateToProductDetail={(item) => {
              setSelectedProduct(item);
              setCurrentView('product');
            }}
          />
        )}

        {/* VIEW 3: INDIVIDUAL PRODUCT DETAIL PAGE WITH 3D CUSTOMIZER & SPECS */}
        {currentView === 'product' && (
          <ProductDetailView
            product={selectedProduct}
            catalog={catalog}
            woodMaterials={woodMaterials}
            fabricMaterials={fabricMaterials}
            metalMaterials={metalMaterials}
            onSelectProduct={(item) => setSelectedProduct(item)}
            onNavigateBackToProducts={() => setCurrentView('products')}
            onNavigateToStudio={(item) => {
              handleSelectProduct(item);
              setCurrentView('studio');
            }}
            onOpenAR={() => setArModalOpen(true)}
            onAddToCart={(customSelection, price) => {
              handleAddToCart({ ...customSelection, calculatedPrice: price });
            }}
            onToggleWishlist={handleSaveProductToWishlist}
            isWishlisted={wishlist.some(w => w.product.id === selectedProduct.id)}
          />
        )}

        {/* VIEW 4: 3D CONFIGURATOR STUDIO */}
        {currentView === 'studio' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-5rem)] overflow-hidden">
            
            {/* Left/Center: Three.js Interactive 3D Canvas */}
            <div className="flex-1 relative bg-gradient-to-b from-[#F2EFE9] via-[#FAF8F5] to-[#EAE6DE] flex flex-col overflow-hidden">
              
              {/* Floating 3D Navigation & Angle Controls */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                
                {/* Camera Angles Selector */}
                <div className="bg-[#FAF8F5]/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-[#E2DDD5] shadow-sm flex items-center gap-1 text-[11px] font-semibold text-[#524B43]">
                  <Compass className="w-3.5 h-3.5 text-[#8C4B23] ml-1" />
                  <button
                    id="cam-preset-perspective"
                    onClick={() => setCameraPreset('perspective')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      cameraPreset === 'perspective' ? 'bg-[#22201D] text-white shadow-sm' : 'hover:text-[#22201D]'
                    }`}
                  >
                    3D Orbit
                  </button>
                  <button
                    id="cam-preset-front"
                    onClick={() => setCameraPreset('front')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      cameraPreset === 'front' ? 'bg-[#22201D] text-white shadow-sm' : 'hover:text-[#22201D]'
                    }`}
                  >
                    Front
                  </button>
                  <button
                    id="cam-preset-side"
                    onClick={() => setCameraPreset('side')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      cameraPreset === 'side' ? 'bg-[#22201D] text-white shadow-sm' : 'hover:text-[#22201D]'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    id="cam-preset-top"
                    onClick={() => setCameraPreset('top')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      cameraPreset === 'top' ? 'bg-[#22201D] text-white shadow-sm' : 'hover:text-[#22201D]'
                    }`}
                  >
                    Top Plan
                  </button>
                </div>

                {/* Calipers Toggle */}
                <button
                  id="canvas-toggle-calipers"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm ${
                    showDimensions
                      ? 'bg-[#8C4B23] text-white border-[#8C4B23]'
                      : 'bg-[#FAF8F5]/90 text-[#524B43] border-[#E2DDD5] hover:text-[#22201D]'
                  }`}
                  title="Toggle 3D Calipers & Scale"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>{showDimensions ? 'Calipers On' : 'Calipers Off'}</span>
                </button>
              </div>

              {/* Top Right Floating AR In-Space Trigger */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  id="canvas-launch-ar-button"
                  onClick={() => setArModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#22201D]/90 hover:bg-black text-white text-xs font-bold tracking-wider uppercase backdrop-blur-md border border-[#C5A880]/50 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Camera className="w-4 h-4 text-[#C5A880]" />
                  <span>View in AR (1:1 Scale)</span>
                </button>
              </div>

              {/* 3D WebGL Canvas Viewport */}
              <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
                <ThreeCanvas
                  product={selectedProduct}
                  woodMaterial={currentWood}
                  fabricMaterial={currentFabric}
                  metalMaterial={currentMetal}
                  customWidthCm={selection.customWidthCm}
                  customDepthCm={selection.customDepthCm}
                  customHeightCm={selection.customHeightCm}
                  showDimensions={showDimensions}
                  explodedAmount={explodedAmount}
                  wireframeMode={wireframeMode}
                  autoRotate={autoRotate}
                  cameraPreset={cameraPreset}
                />
              </div>

              {/* Bottom Canvas Overlay Information */}
              <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                <div className="bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#E2DDD5] shadow-sm pointer-events-auto">
                  <div className="text-[10px] uppercase font-semibold text-[#8C4B23] tracking-widest">
                    Crafted in Small Batches · Est. 1987
                  </div>
                  <div className="text-xs font-semibold text-[#22201D] mt-0.5">
                    Drag to rotate · Scroll to zoom · Right-click to pan
                  </div>
                </div>

                {explodedAmount > 0 && (
                  <div className="bg-[#22201D]/90 text-white backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#C5A880]/40 shadow-sm pointer-events-auto text-xs flex items-center gap-2 font-mono">
                    <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Exploded Joinery: {Math.round(explodedAmount * 100)}% Expansion</span>
                  </div>
                )}
              </div>

            </div>

            {/* Right Side: Material, Dimension, & Inspection Customizer Panel */}
            <div className="w-full lg:w-[480px] xl:w-[520px] h-full overflow-hidden flex flex-col shrink-0 shadow-2xl">
              <CustomizerPanel
                product={selectedProduct}
                woodMaterials={woodMaterials}
                fabricMaterials={fabricMaterials}
                metalMaterials={metalMaterials}
                selection={selection}
                onUpdateSelection={(updated) => setSelection(prev => ({ ...prev, ...updated }))}
                onAddToCart={handleAddToCart}
                onOpenAR={() => setArModalOpen(true)}
                explodedAmount={explodedAmount}
                onExplodedChange={setExplodedAmount}
                showDimensions={showDimensions}
                onToggleDimensions={() => setShowDimensions(!showDimensions)}
                wireframeMode={wireframeMode}
                onToggleWireframe={() => setWireframeMode(!wireframeMode)}
                autoRotate={autoRotate}
                onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
                onSaveToWishlist={handleSaveCurrentToWishlist}
                isWishlisted={isCurrentConfigurationWishlisted}
                recentCount={recentDesigns.length}
                onOpenRecent={() => setRecentDrawerOpen(true)}
                onOpenComparisonModal={() => setComparisonModalOpen(true)}
              />
            </div>

          </div>
        )}

        {/* VIEW 5: COMPANY PROFILE & 87-YEAR HERITAGE STORY */}
        {currentView === 'company' && (
          <CompanyProfileView
            onNavigateToProducts={() => setCurrentView('products')}
            onNavigateToStudio={() => setCurrentView('studio')}
            onNavigateToContact={() => setCurrentView('contact')}
          />
        )}

        {/* VIEW 6: BESPOKE INQUIRIES & CONTACT CONCIERGE */}
        {currentView === 'contact' && (
          <ContactView />
        )}

        {/* VIEW 3: BACKEND CONTENT MANAGER (AI CAD-to-3D, Materials Library, Orders) */}
        {currentView === 'backend' && (
          <BackendContentManager
            catalog={catalog}
            woodMaterials={woodMaterials}
            fabricMaterials={fabricMaterials}
            metalMaterials={metalMaterials}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onAddMaterial={handleAddMaterial}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onSelectProductFor3DView={(prod) => {
              handleSelectProduct(prod);
              setCurrentView('studio');
            }}
          />
        )}

      </main>

      {/* Augmented Reality Fullscreen Modal */}
      <ARViewModal
        isOpen={arModalOpen}
        onClose={() => setArModalOpen(false)}
        product={selectedProduct}
        woodMaterial={currentWood}
        fabricMaterial={currentFabric}
        metalMaterial={currentMetal}
        customWidthCm={selection.customWidthCm}
        customDepthCm={selection.customDepthCm}
        customHeightCm={selection.customHeightCm}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(idx) => setCartItems(prev => prev.filter((_, i) => i !== idx))}
        onUpdateQuantity={(idx, qty) => setCartItems(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item))}
        onProceedToCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onLoadDesign={handleLoadDesign}
        onAddToCart={handleAddToCartFromSavedDesign}
      />

      {/* Recent Designs (Last 5) Drawer */}
      <RecentDesignsDrawer
        isOpen={recentDrawerOpen}
        onClose={() => setRecentDrawerOpen(false)}
        recentDesigns={recentDesigns}
        activeDesignId={recentDesigns[0]?.id}
        onLoadDesign={handleLoadDesign}
        onSaveToWishlist={handleSaveCurrentToWishlist}
        isWishlisted={isDesignWishlisted}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />

      {/* Track My Order & Account Modal */}
      <TrackOrderAccountModal
        isOpen={trackOrderModalOpen}
        onClose={() => setTrackOrderModalOpen(false)}
        orders={orders}
      />

      {/* Side-by-Side Comparison Modal */}
      <ComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        catalog={catalog}
        recentDesigns={recentDesigns}
        wishlistItems={wishlist}
        woodMaterials={woodMaterials}
        fabricMaterials={fabricMaterials}
        metalMaterials={metalMaterials}
        onLoadDesignInStudio={(design) => {
          handleLoadDesign(design);
          setComparisonModalOpen(false);
        }}
        onSelectProductInStudio={(prod) => {
          handleSelectProduct(prod);
          setCurrentView('studio');
          setComparisonModalOpen(false);
        }}
        onAddToCart={(prod, price, details) => {
          handleAddToCart({
            productId: prod.id,
            selectedWoodId: prod.defaultWoodId,
            selectedFabricId: prod.defaultFabricId,
            selectedMetalId: prod.defaultMetalId,
            customWidthCm: prod.dimensions.widthCm,
            customDepthCm: prod.dimensions.depthCm,
            customHeightCm: prod.dimensions.heightCm,
            specialInstructions: details,
            calculatedPrice: price
          });
          setComparisonModalOpen(false);
        }}
      />

      {/* Assembly Instructions Viewer Modal */}
      <AssemblyInstructionsModal
        isOpen={assemblyModalOpen}
        onClose={() => setAssemblyModalOpen(false)}
        product={selectedProduct}
      />

    </div>
  );
};
