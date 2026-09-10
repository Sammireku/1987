import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Sliders, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Check, 
  ShieldCheck, 
  TreePine, 
  Maximize2, 
  RotateCw, 
  Ruler, 
  Layers, 
  ArrowLeft,
  Download,
  Sparkles,
  Info,
  ChevronRight,
  Wrench,
  Droplets,
  Copy,
  FileText,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  Send,
  Sparkle,
  Eye
} from 'lucide-react';
import { 
  FurnitureItem, 
  MaterialOption, 
  CustomizationSelection, 
  calculateFurniturePrice 
} from '../types/furniture';
import { ThreeCanvas } from './ThreeCanvas';
import { AssemblyInstructionsModal } from './AssemblyInstructionsModal';
import { ProductImage, getProductGallery } from '../utils/productImages';

interface ProductDetailViewProps {
  product: FurnitureItem;
  catalog: FurnitureItem[];
  woodMaterials: MaterialOption[];
  fabricMaterials: MaterialOption[];
  metalMaterials: MaterialOption[];
  onSelectProduct: (product: FurnitureItem) => void;
  onNavigateBackToProducts: () => void;
  onNavigateToStudio: (product: FurnitureItem) => void;
  onOpenAR: () => void;
  onAddToCart: (item: {
    product: FurnitureItem;
    customization: CustomizationSelection;
    wood: MaterialOption;
    fabric: MaterialOption;
    metal: MaterialOption;
    quantity: number;
    unitPrice: number;
  }) => void;
  onToggleWishlist: (item: {
    product: FurnitureItem;
    customization: CustomizationSelection;
    wood: MaterialOption;
    fabric: MaterialOption;
    metal: MaterialOption;
    unitPrice: number;
  }) => void;
  isWishlisted: boolean;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  catalog,
  woodMaterials,
  fabricMaterials,
  metalMaterials,
  onSelectProduct,
  onNavigateBackToProducts,
  onNavigateToStudio,
  onOpenAR,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  // Local customization selection on this product detail page
  const [selectedWoodId, setSelectedWoodId] = useState<string>(product.defaultWoodId);
  const [selectedFabricId, setSelectedFabricId] = useState<string>(product.defaultFabricId);
  const [selectedMetalId, setSelectedMetalId] = useState<string>(product.defaultMetalId);
  const [customWidthCm, setCustomWidthCm] = useState<number>(product.dimensions?.widthCm ?? 120);
  const [customDepthCm, setCustomDepthCm] = useState<number>(product.dimensions?.depthCm ?? 80);
  const [customHeightCm, setCustomHeightCm] = useState<number>(product.dimensions?.heightCm ?? 75);

  // 3D Canvas visual toggles
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeCameraAngle, setActiveCameraAngle] = useState<'perspective' | 'front' | 'side' | 'top'>('perspective');
  const [activeVisualMode, setActiveVisualMode] = useState<'3d' | 'photo'>('photo');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  const [activeMaterialTab, setActiveMaterialTab] = useState<'wood' | 'fabric' | 'metal'>('wood');
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // New Requested Tabs & Modal States:
  const [activeInfoTab, setActiveInfoTab] = useState<'care' | 'assembly' | 'specs' | 'heritage'>('care');
  const [activeCareMaterial, setActiveCareMaterial] = useState<'wood' | 'fabric' | 'metal'>('wood');
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [assemblyViewerOpen, setAssemblyViewerOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);

  // Find active material objects
  const activeWood = woodMaterials.find(w => w.id === selectedWoodId) || woodMaterials[0];
  const activeFabric = fabricMaterials.find(f => f.id === selectedFabricId) || fabricMaterials[0];
  const activeMetal = metalMaterials.find(m => m.id === selectedMetalId) || metalMaterials[0];

  const currentSelection: CustomizationSelection = {
    productId: product.id,
    selectedWoodId,
    selectedFabricId,
    selectedMetalId,
    customWidthCm,
    customDepthCm,
    customHeightCm,
  };

  const calculatedPrice = calculateFurniturePrice(
    product,
    activeWood,
    activeFabric,
    activeMetal,
    customWidthCm,
    customDepthCm,
    customHeightCm
  );

  const handleAddToCart = () => {
    onAddToCart({
      product,
      customization: currentSelection,
      wood: activeWood,
      fabric: activeFabric,
      metal: activeMetal,
      quantity: 1,
      unitPrice: calculatedPrice,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  // Build full shareable URL with parameters
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?view=product&prod=${product.id}&wood=${selectedWoodId}&fabric=${selectedFabricId}&metal=${selectedMetalId}&w=${customWidthCm}&d=${customDepthCm}&h=${customHeightCm}`
    : `https://1987furniture.com/products/${product.id}?wood=${selectedWoodId}&w=${customWidthCm}`;

  const handleCopyShareUrl = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2600);
      }
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2600);
    }
  };

  // Dynamic Assembly Steps by Product Category
  const getAssemblyStepsForCategory = (category: string) => {
    switch (category) {
      case 'table':
        return [
          {
            step: 1,
            title: 'Unpack Tabletop Slabs on Padded Ground',
            detail: 'Carefully unpack the 3-layer cross-laminated solid wood top and rest it face-down onto the included protective soft fleece blanket.',
            tools: 'Padded blanket · 2 persons required',
            duration: '5 mins'
          },
          {
            step: 2,
            title: 'Align Solid Timber or Steel Legs',
            detail: 'Position the trestle or solid timber leg assemblies directly over the pre-installed M8 brass threaded inserts embedded into the underside frame.',
            tools: 'M8 Hardware Crate (Included)',
            duration: '5 mins'
          },
          {
            step: 3,
            title: 'Torque Assembly Bolts Evenly',
            detail: 'Hand-thread all stainless steel bolts with split-lock washers before torquing diagonally with the included 1987 hex key to 12 Nm.',
            tools: '1987 Precision Hex Tool',
            duration: '5 mins'
          },
          {
            step: 4,
            title: 'Extension Mechanism Calibration (If Applicable)',
            detail: 'For nonstop extension models, release the transit retaining pin and slide extension leaf outward to test patented 2it synchronizer cable tension.',
            tools: 'Visual inspection',
            duration: '3 mins'
          },
          {
            step: 5,
            title: 'Invert & Fine-Tune Floor Glides',
            detail: 'With two adults lifting from both ends, invert the table onto its feet. Rotate the solid brass leveling glides to accommodate floor variances.',
            tools: 'Level indicator (Included)',
            duration: '2 mins'
          }
        ];
      case 'chair':
      case 'bench':
        return [
          {
            step: 1,
            title: 'Unpack Artisan Frame',
            detail: 'Remove breathable wrap and inspect the hand-sculpted mortise & tenon corner joints and natural wood grain flow.',
            tools: 'Careful inspection',
            duration: '2 mins'
          },
          {
            step: 2,
            title: 'Install Floor Glides',
            detail: 'Peel and press the supplied heavy-duty acoustic felt pads into the recessed base pockets of all leg ferrules.',
            tools: 'Felt pads included',
            duration: '3 mins'
          },
          {
            step: 3,
            title: 'Position Ergonomic Cushions',
            detail: 'Seat the dual-density natural latex and down topper cushion into the sculpted contour pocket of the solid wood seat plate.',
            tools: 'Hands only',
            duration: '2 mins'
          },
          {
            step: 4,
            title: 'Engage Underside Retaining Strap',
            detail: 'Fasten the concealed magnetic underside strap to ensure zero slippage during daily dining or lounge usage.',
            tools: 'Magnetic clip',
            duration: '1 min'
          }
        ];
      case 'sofa':
        return [
          {
            step: 1,
            title: 'Stage Modular Plinths',
            detail: 'Arrange the perimeter solid timber plinth bases in your designated room layout, maintaining 10cm perimeter clearance from walls.',
            tools: '2 persons recommended',
            duration: '5 mins'
          },
          {
            step: 2,
            title: 'Drop-In Heavy Duty Interlocking Brackets',
            detail: 'Engage the heavy-duty drop-in German steel interlocking connector brackets between sectional modules until an audible click confirms engagement.',
            tools: 'Steel connection brackets',
            duration: '4 mins'
          },
          {
            step: 3,
            title: 'Place Bolster Arms & Cushions',
            detail: 'Align the cylindrical bolster arms onto the solid wood cantilever wings; position backrest channel cushions onto angled support rests.',
            tools: 'Magnetic guide pins',
            duration: '5 mins'
          },
          {
            step: 4,
            title: 'Dress Seams & Flange Details',
            detail: 'Smooth upholstery fabric outward toward the hand-stitched flange borders to establish uniform loft and channel contouring.',
            tools: 'Soft cotton dressing cloth',
            duration: '4 mins'
          }
        ];
      case 'credenza':
      case 'cabinet':
        return [
          {
            step: 1,
            title: 'Position Carcase on Plinth',
            detail: 'Lower the solid timber carcase onto the matching recessed shadow-line plinth with two persons.',
            tools: '2 persons required',
            duration: '5 mins'
          },
          {
            step: 2,
            title: 'Internal Leveling Calibration',
            detail: 'Open cabinet doors and access the four internal Allen leveling spindles at the base; turn clockwise until spirit bubble centers perfectly.',
            tools: 'Supplied 6mm Allen Key',
            duration: '4 mins'
          },
          {
            step: 3,
            title: 'Mount Heavy-Duty Anti-Tip Anchor',
            detail: 'Fasten the supplied aircraft-grade braided steel cable tether to wall studs to guarantee child safety and earthquake compliance.',
            tools: 'Drill & included wall anchors',
            duration: '10 mins'
          },
          {
            step: 4,
            title: 'Insert Shelves & Tune Soft-Close Dampers',
            detail: 'Rest solid wood shelves on vibration-dampened brass pins and turn Blum soft-close door eccentric screws for razor-sharp reveals.',
            tools: 'Flat screwdriver',
            duration: '5 mins'
          }
        ];
      case 'bed':
        return [
          {
            step: 1,
            title: 'Connect Solid Timber Rails to Headboard',
            detail: 'Slot the precision CNC-machined metal-free corner wedged tenons into the solid headboard and footboard posts.',
            tools: 'Wooden alignment mallet',
            duration: '8 mins'
          },
          {
            step: 2,
            title: 'Tension Center Longitudinal Beam',
            detail: 'Lower the central longitudinal solid beech spine and tighten the threaded brass undercarriage tension cable to eliminate frame squeak.',
            tools: 'Tension spanner (Included)',
            duration: '5 mins'
          },
          {
            step: 3,
            title: 'Drop In Flexible Slatted Base',
            detail: 'Unroll the dual-zone flexible 7-ply beechwood slats into the side rail rebates; adjust shoulder and pelvic lumbar firmness sliders.',
            tools: 'None',
            duration: '5 mins'
          },
          {
            step: 4,
            title: 'Mattress Placement & Reveal Check',
            detail: 'Place luxury natural latex or pocket-spring mattress into the frame and verify even 2.5cm perimeter inset reveal.',
            tools: '2 persons',
            duration: '2 mins'
          }
        ];
      default:
        return [
          {
            step: 1,
            title: 'Unpack & Inspect Components',
            detail: 'Carefully unbox all hardware and solid wood components, checking against the packing manifest.',
            tools: 'Soft cutting tool',
            duration: '3 mins'
          },
          {
            step: 2,
            title: 'Attach Hardware & Mounting Plates',
            detail: 'Fasten all architectural metal fixtures and connectors using supplied stainless steel machine screws.',
            tools: 'Hex key included',
            duration: '8 mins'
          },
          {
            step: 3,
            title: 'Final Leveling & In-Room Positioning',
            detail: 'Position in desired room setting and adjust leveling glides for steady, vibration-free placement.',
            tools: 'Level indicator',
            duration: '4 mins'
          }
        ];
    }
  };

  const assemblySteps = getAssemblyStepsForCategory(product.category);

  // Dynamic Care Recommendations by Material
  const getCareRecommendations = (materialType: 'wood' | 'fabric' | 'metal') => {
    switch (materialType) {
      case 'wood':
        return {
          title: `Solid Hardwood Maintenance: ${activeWood.name}`,
          tagline: 'Preserving the living breath of Austrian certified timber',
          origin: activeWood.origin,
          schedule: 'Every 6 to 12 months (or whenever timber feels dry to touch)',
          tips: [
            {
              heading: 'Biological Herbal Oil Nourishment',
              body: `Our ${activeWood.name} is treated with solvent-free, cold-pressed linseed and botanical herbal oils that penetrate deep into the pores without forming a synthetic plastic film. Polish with a thin layer of natural care oil once per year to preserve elasticity and hydrophobic protection.`,
              frequency: 'Annual Polish',
            },
            {
              heading: 'Optimal Ambient Microclimate',
              body: 'Solid timber expands and contracts naturally with ambient atmospheric shifts. Maintain indoor relative humidity between 40% and 60% and room temperature around 18°C–22°C (65°F–72°F). Avoid placing directly over active heating vents or radiant floor hotspots.',
              frequency: 'Constant Climate',
            },
            {
              heading: 'Daily Cleaning & Spill Response',
              body: 'Wipe dust in the direction of the wood grain with a clean, lint-free cotton cloth. For liquid spills, wipe immediately with a damp cloth; never allow water or acidic liquids (wine, vinegar, citrus) to pool. Never use harsh chemical abrasives, ammonia, or silicone furniture polishes.',
              frequency: 'Daily / As needed',
            },
            {
              heading: 'Natural Scratch & Dent Reconditioning',
              body: 'Minor scratches or pressure dents can be easily restored at home! Place a damp cotton cloth over the dent and lightly apply a domestic iron for 5 seconds to expand the timber fibers, followed by hand-buffing with the 1987 finishing fleece and care oil.',
              frequency: 'Restoration Protocol',
            },
          ],
        };
      case 'fabric':
        return {
          title: `Textile & Upholstery Care: ${activeFabric.name}`,
          tagline: 'High-performance stain repellency and lasting fiber resilience',
          origin: activeFabric.origin,
          schedule: 'Monthly light vacuuming; immediate spill blotting',
          tips: [
            {
              heading: 'Immediate Spill Blotting Protocol',
              body: 'Never rub or scrub spills violently, as this pushes particulates deeper into the weave. Immediately blot standing liquid with an absorbent white microfiber or paper towel, working gently from the outside of the stain toward the center.',
              frequency: 'Immediate Action',
            },
            {
              heading: 'Gentle Spot Cleaning Solution',
              body: 'Mix 1/4 cup of mild pH-neutral biodegradable soap or wool-safe detergent into 1 gallon of lukewarm water. Apply lightly with a soft-bristle brush, rinse thoroughly with clean water to remove all soap residue, and air dry naturally.',
              frequency: 'Spot Treatment',
            },
            {
              heading: 'Bi-Weekly Vacuuming & Fiber Fluffing',
              body: 'Regular vacuuming using a low-suction soft upholstery attachment prevents ambient particulate matter and dust from settling into the curly bouclé or canvas weave. Plump cushions weekly to restore interior feather-foam loft.',
              frequency: 'Bi-weekly',
            },
            {
              heading: 'UV & Sun Exposure Resistance',
              body: 'Sunbrella™ solution-dyed acrylic fibers feature pigments locked deep into the fiber core, providing superior UV resistance against fading. However, rotating cushions periodically ensures uniform aesthetic patination across seasons.',
              frequency: 'Quarterly',
            },
          ],
        };
      case 'metal':
        return {
          title: `Architectural Metal Care: ${activeMetal.name}`,
          tagline: 'Living hand-rubbed patinas and structural endurance',
          origin: activeMetal.origin,
          schedule: 'Bi-monthly dusting; annual protective microcrystalline wax',
          tips: [
            {
              heading: 'Living Architectural Patina Evolution',
              body: `Our ${activeMetal.name} features hand-buffed organic surfaces designed to develop a rich, noble patina with age and interaction. Do not use chemical brass strippers, acidic tarn-x solutions, or coarse steel wool, which permanently destroy the brushed artisanal grain.`,
              frequency: 'Guiding Principle',
            },
            {
              heading: 'Microfiber Dusting & Fingerprint Removal',
              body: 'Clean handprints and dust with a soft, dry microfibre cloth. For stubborn grease, lightly moisten the cloth with warm distilled water, wipe gently, and immediately buff dry with a chamois cloth to avoid water evaporation rings.',
              frequency: 'Weekly',
            },
            {
              heading: 'Microcrystalline Museum Wax Protection',
              body: 'For metal ferrules and table base pedestals in high-humidity or coastal environments, apply a microscopic coat of Renaissance microcrystalline wax once per year to seal against atmospheric tarnishing and fingertip acids.',
              frequency: 'Annual Safeguard',
            },
            {
              heading: 'Corrosion & Liquid Protection',
              body: 'Keep metal leg ferrules dry when mopping floors. Do not allow commercial floor detergent solutions to pool around table or chair feet.',
              frequency: 'Daily Care',
            },
          ],
        };
    }
  };

  const currentCareInfo = getCareRecommendations(activeCareMaterial);

  // Downloadable PDF Placeholder Handler
  const handleDownloadAssemblyPDF = () => {
    const content = `1987 FURNITURE ATELIER - OFFICIAL ASSEMBLY SPECIFICATION
================================================================================
Product: ${product.name}
SKU / Catalogue ID: ${product.id.toUpperCase()}
Category: ${product.category.toUpperCase()}
Lead Time: ${product.leadTimeWeeks} Weeks

CUSTOM CONFIGURATION SPECIFICATIONS:
- Selected Timber: ${activeWood.name} (Origin: ${activeWood.origin})
- Selected Fabric: ${activeFabric.name} (Origin: ${activeFabric.origin})
- Architectural Metal: ${activeMetal.name} (Origin: ${activeMetal.origin})
- Metric Dimensions: ${customWidthCm} W × ${customDepthCm} D × ${customHeightCm} H cm
- Calculated Price: $${calculatedPrice.toLocaleString('en-US')}

HARDWARE CRATE MANIFEST:
- (4x) Precision M8 Stainless Steel Hex Machine Screws
- (4x) Solid Architectural Brass Finish Washers
- (1x) 1987 Atelier Precision M8 Hex Wrench Tool
- (4x) High-Density Industrial Acoustic Felt Floor Glides
- (1x) Spirit Bubble Level Indicator

STEP-BY-STEP ASSEMBLY PROTOCOL:
${assemblySteps.map((s, idx) => `
[STEP ${idx + 1}] ${s.title.toUpperCase()}
Duration: ${s.duration} | Required Tools: ${s.tools}
Instructions: ${s.detail}
`).join('')}

MAINTENANCE & WARRANTY:
- 10-Year Comprehensive Structural Joinery Warranty
- 100% Austrian Certified Solid Timber (PEFC Chain of Custody)
- Zero formaldehyde, zero MDF, zero synthetic chemical binders

Atelier Concierge Hotline: +43 1 512 8700 | concierge@1987furniture.com
================================================================================`;

    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `1987-Assembly-Guide-${product.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3500);
  };

  // Related silhouettes from same or adjacent categories
  const relatedProducts = catalog
    .filter(item => item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#22201D] font-sans pb-24">
      
      {/* Top Breadcrumb & Back Navigation */}
      <div className="border-b border-[#E8E3DA] bg-white/60 backdrop-blur-md sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs">
          <button
            onClick={onNavigateBackToProducts}
            className="flex items-center gap-2 text-[#615951] hover:text-[#1A1917] font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </button>

          <div className="flex items-center gap-2 text-[#8C4B23] font-mono">
            <span>Catalogue 87</span>
            <span>/</span>
            <span>{product.category.toUpperCase()}</span>
            <span>/</span>
            <span className="text-[#1A1917] font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Product Layout: Left Interactive 3D Model, Right Customization & Spec Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Product Visual Stage (Interactive 3D Stage & High-Res Architectural Photography) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* View Mode Selector Tabs */}
            <div className="flex items-center justify-between bg-white border border-[#E8E3DA] p-1.5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveVisualMode('photo')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeVisualMode === 'photo'
                      ? 'bg-[#1A1917] text-white shadow-xs'
                      : 'text-[#615951] hover:text-[#1A1917] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Master Photography ({getProductGallery(product).length} Angles)</span>
                </button>

                <button
                  onClick={() => setActiveVisualMode('3d')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeVisualMode === '3d'
                      ? 'bg-[#1A1917] text-white shadow-xs'
                      : 'text-[#615951] hover:text-[#1A1917] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>3D Interactive Studio</span>
                </button>
              </div>

              <span className="hidden sm:inline-block font-mono text-[10px] text-[#8C4B23] font-semibold px-2.5">
                Cat. p. {product.catalogPage || '1'}
              </span>
            </div>

            <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-3xl bg-gradient-to-b from-[#F2EFE9] to-[#E5E0D8] border border-[#E8E3DA] shadow-inner overflow-hidden flex flex-col justify-between">
              
              {/* PHOTOGRAPHY VIEW */}
              {activeVisualMode === 'photo' ? (
                <div className="absolute inset-0 bg-[#F5F2EB] flex items-center justify-center overflow-hidden">
                  <img
                    src={getProductGallery(product)[activePhotoIndex] || product.image || getProductGallery(product)[0]}
                    alt={`${product.name} angle ${activePhotoIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Left Tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#1A1917]/85 backdrop-blur-md text-white font-mono text-[10px] uppercase tracking-wider">
                      Architectural Photography
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#8C4B23] font-mono text-[10px] font-semibold">
                      Angle {activePhotoIndex + 1} of {getProductGallery(product).length}
                    </span>
                  </div>

                  {/* Bottom Bar: Switch to 3D */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                    <div className="text-white text-xs font-mono drop-shadow-sm">
                      Solid Hardwood Finish · Precision Handcrafting
                    </div>
                    <button
                      onClick={() => setActiveVisualMode('3d')}
                      className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-[#1A1917] text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#8C4B23]" />
                      <span>Switch to 3D Orbit</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 3D MODEL VIEW */
                <>
                  <div className="absolute inset-0">
                    <ThreeCanvas
                      product={product}
                      woodMaterial={activeWood}
                      fabricMaterial={activeFabric}
                      metalMaterial={activeMetal}
                      customWidthCm={customWidthCm}
                      customDepthCm={customDepthCm}
                      customHeightCm={customHeightCm}
                      showDimensions={true}
                      explodedAmount={explodedAmount}
                      wireframeMode={wireframeMode}
                      autoRotate={autoRotate}
                      cameraPreset={activeCameraAngle}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Top 3D Viewport Controls */}
                  <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <span className="px-3 py-1 rounded-full bg-[#1A1917]/85 backdrop-blur-md text-white font-mono text-[10px] uppercase tracking-wider">
                        3D Interactive Preview
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#8C4B23] font-mono text-[10px] font-semibold">
                        Cat. p. {product.catalogPage || '1'}
                      </span>
                    </div>

                    {/* Camera Angle Presets */}
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-xl p-1 border border-[#E2DDD5] pointer-events-auto text-[10px] font-mono">
                      {(['perspective', 'front', 'side', 'top'] as const).map(angle => (
                        <button
                          key={angle}
                          onClick={() => setActiveCameraAngle(angle)}
                          className={`px-2 py-1 rounded-md uppercase transition-colors cursor-pointer ${
                            activeCameraAngle === angle ? 'bg-[#1A1917] text-white font-bold' : 'text-[#615951] hover:text-[#1A1917]'
                          }`}
                        >
                          {angle.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom 3D Viewport Toolbar */}
                  <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <button
                        onClick={() => setAutoRotate(!autoRotate)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 border cursor-pointer ${
                          autoRotate ? 'bg-[#1A1917] text-white border-transparent' : 'bg-white/80 text-[#524B43] border-[#E2DDD5]'
                        }`}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Auto Rotate</span>
                      </button>

                      <button
                        onClick={() => setWireframeMode(!wireframeMode)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 border cursor-pointer ${
                          wireframeMode ? 'bg-[#8C4B23] text-white border-transparent' : 'bg-white/80 text-[#524B43] border-[#E2DDD5]'
                        }`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Wireframe</span>
                      </button>
                    </div>

                    {/* Launch True 1:1 AR from Product Detail */}
                    <button
                      id="pdp-launch-ar-button"
                      onClick={onOpenAR}
                      className="pointer-events-auto px-4 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4AF37] text-[#1A1917] font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Launch 1:1 AR in Room</span>
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Gallery Angle Thumbnails Strip */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
              {getProductGallery(product).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx);
                    setActiveVisualMode('photo');
                  }}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeVisualMode === 'photo' && activePhotoIndex === idx
                      ? 'border-[#8C4B23] ring-2 ring-[#8C4B23]/30 scale-105'
                      : 'border-[#E8E3DA] hover:border-[#8C4B23]/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] font-mono px-1 rounded">
                    0{idx + 1}
                  </span>
                </button>
              ))}

              {/* 3D Model Quick Button */}
              <button
                onClick={() => setActiveVisualMode('3d')}
                className={`w-20 h-16 rounded-xl border-2 flex flex-col items-center justify-center p-1 text-center shrink-0 transition-all cursor-pointer ${
                  activeVisualMode === '3d'
                    ? 'border-[#8C4B23] bg-[#FAF8F5] ring-2 ring-[#8C4B23]/30 scale-105 text-[#8C4B23]'
                    : 'border-[#E8E3DA] bg-white text-[#766E65] hover:border-[#8C4B23]/50'
                }`}
              >
                <RotateCw className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-mono uppercase font-bold tracking-wider">3D Orbit</span>
              </button>
            </div>

            {/* Interaction Tip */}
            <div className="flex items-center justify-between text-xs text-[#766E65] px-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#8C4B23]" />
                <span>Drag to orbit 360° · Scroll to zoom into solid timber grain</span>
              </div>
              <button
                onClick={() => onNavigateToStudio(product)}
                className="text-[#8C4B23] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Open in Full 3D Studio</span>
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* RIGHT: Product Narrative, Material Swatches & Order Specifications */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header / Titles */}
            <div className="space-y-2 border-b border-[#E8E3DA] pb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#8C4B23] font-semibold">
                  {product.subtitle || 'Catalogue 87 Silhouette'}
                </span>
                <span className="text-xs font-mono text-[#766E65] bg-white px-2.5 py-1 rounded-md border border-[#E8E3DA]">
                  SKU: {product.id.toUpperCase()}
                </span>
              </div>

              <h1 className="font-['Cinzel'] text-3xl sm:text-4xl font-bold text-[#1A1917]">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 pt-2">
                <span className="font-['Cinzel'] text-3xl font-extrabold text-[#1A1917]">
                  ${calculatedPrice.toLocaleString('en-US')}
                </span>
                <span className="text-xs text-[#766E65]">
                  Includes custom timber finish & white glove delivery
                </span>
              </div>
            </div>

            {/* Architectural Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#1A1917] font-semibold">
                Design Narrative & Proportions
              </h3>
              <p className="text-xs sm:text-sm text-[#524B43] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Material Customization Swatches */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 space-y-4">
              
              {/* Material Category Tabs */}
              <div className="flex items-center gap-2 border-b border-[#E8E3DA] pb-3 text-xs font-semibold">
                <button
                  onClick={() => setActiveMaterialTab('wood')}
                  className={`pb-1 transition-all cursor-pointer border-b-2 ${
                    activeMaterialTab === 'wood' ? 'border-[#8C4B23] text-[#8C4B23]' : 'border-transparent text-[#766E65] hover:text-[#1A1917]'
                  }`}
                >
                  Austrian Hardwood ({activeWood.name})
                </button>
                <button
                  onClick={() => setActiveMaterialTab('fabric')}
                  className={`pb-1 transition-all cursor-pointer border-b-2 ${
                    activeMaterialTab === 'fabric' ? 'border-[#8C4B23] text-[#8C4B23]' : 'border-transparent text-[#766E65] hover:text-[#1A1917]'
                  }`}
                >
                  Sunbrella Textile ({activeFabric.name})
                </button>
                <button
                  onClick={() => setActiveMaterialTab('metal')}
                  className={`pb-1 transition-all cursor-pointer border-b-2 ${
                    activeMaterialTab === 'metal' ? 'border-[#8C4B23] text-[#8C4B23]' : 'border-transparent text-[#766E65] hover:text-[#1A1917]'
                  }`}
                >
                  Hardware Accent ({activeMetal.name})
                </button>
              </div>

              {/* Wood Selection Swatches */}
              {activeMaterialTab === 'wood' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {woodMaterials.slice(0, 6).map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWoodId(w.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedWoodId === w.id
                            ? 'border-[#8C4B23] bg-[#8C4B23]/5 shadow-xs'
                            : 'border-[#E8E3DA] hover:border-[#1A1917]/30'
                        }`}
                      >
                        <span 
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: w.colorHex }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#1A1917] truncate">{w.name}</div>
                          <div className="text-[10px] text-[#766E65] truncate">+${w.priceModifier}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#766E65] leading-relaxed italic">
                    {activeWood.description}
                  </p>
                </div>
              )}

              {/* Fabric Selection Swatches */}
              {activeMaterialTab === 'fabric' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {fabricMaterials.slice(0, 6).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFabricId(f.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedFabricId === f.id
                            ? 'border-[#8C4B23] bg-[#8C4B23]/5 shadow-xs'
                            : 'border-[#E8E3DA] hover:border-[#1A1917]/30'
                        }`}
                      >
                        <span 
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: f.colorHex }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#1A1917] truncate">{f.name}</div>
                          <div className="text-[10px] text-[#766E65] truncate">+${f.priceModifier}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#766E65] leading-relaxed italic">
                    {activeFabric.description}
                  </p>
                </div>
              )}

              {/* Metal Hardware Swatches */}
              {activeMaterialTab === 'metal' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {metalMaterials.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMetalId(m.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedMetalId === m.id
                            ? 'border-[#8C4B23] bg-[#8C4B23]/5 shadow-xs'
                            : 'border-[#E8E3DA] hover:border-[#1A1917]/30'
                        }`}
                      >
                        <span 
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: m.colorHex }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#1A1917] truncate">{m.name}</div>
                          <div className="text-[10px] text-[#766E65] truncate">+${m.priceModifier}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Parametric Dimension Breakdown */}
            <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1A1917] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#8C4B23]" />
                  <span>Metric Dimensions</span>
                </span>
                <span className="font-mono text-[#8C4B23]">
                  {customWidthCm} W × {customDepthCm} D × {customHeightCm} H cm
                </span>
              </div>

              {/* Parametric Width Slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-[#766E65]">
                  <span>Parametric Width:</span>
                  <span className="font-mono font-bold text-[#1A1917]">{customWidthCm} cm</span>
                </div>
                <input
                  type="range"
                  min={Math.round((product.dimensions?.widthCm ?? 120) * 0.8)}
                  max={Math.round((product.dimensions?.widthCm ?? 120) * 1.35)}
                  value={customWidthCm}
                  onChange={(e) => setCustomWidthCm(Number(e.target.value))}
                  className="w-full accent-[#8C4B23] cursor-pointer"
                />
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  id="pdp-add-to-cart-button"
                  onClick={handleAddToCart}
                  className="flex-1 py-4 rounded-2xl bg-[#1A1917] hover:bg-black text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                  <span>{addedToast ? 'Added to Commission Bag!' : 'Add to Commission Bag'}</span>
                </button>

                <button
                  id="pdp-wishlist-button"
                  onClick={() => onToggleWishlist({
                    product,
                    customization: currentSelection,
                    wood: activeWood,
                    fabric: activeFabric,
                    metal: activeMetal,
                    unitPrice: calculatedPrice,
                  })}
                  className={`p-4 rounded-2xl border transition-colors cursor-pointer ${
                    isWishlisted 
                      ? 'bg-rose-50 border-rose-300 text-rose-500' 
                      : 'bg-white border-[#E8E3DA] text-[#615951] hover:text-rose-500'
                  }`}
                  title="Save Configuration to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>

                {/* Social Share Button */}
                <button
                  id="pdp-share-button"
                  onClick={() => setShareModalOpen(true)}
                  className="p-4 rounded-2xl border border-[#E8E3DA] bg-white hover:bg-[#FAF8F5] text-[#615951] hover:text-[#8C4B23] hover:border-[#C5A880] transition-colors cursor-pointer"
                  title="Share This Custom Design"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onNavigateToStudio(product)}
                className="w-full py-3 rounded-2xl bg-white border border-[#C5A880] text-[#1A1917] hover:bg-[#FAF8F5] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-[#8C4B23]" />
                <span>Open Full Customizer in 3D Studio</span>
              </button>
            </div>

            {/* Joinery Guarantees Badge */}
            <div className="pt-4 border-t border-[#E8E3DA] grid grid-cols-2 gap-3 text-[11px] text-[#766E65]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>10-Year Solid Joinery Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Certified Austrian Timber</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* ATELIER TABS: Care & Maintenance | Assembly Instructions | Specifications */}
        {/* ========================================================================= */}
        <div className="mt-20 pt-10 border-t border-[#E8E3DA]">
          
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-[#E8E3DA] pb-4 mb-8">
            <button
              id="tab-care-maintenance"
              onClick={() => setActiveInfoTab('care')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeInfoTab === 'care'
                  ? 'bg-[#1A1917] text-white shadow-md'
                  : 'bg-white border border-[#E8E3DA] text-[#615951] hover:text-[#1A1917] hover:bg-[#FAF8F5]'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Maintenance & Care Tips</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8C4B23]/20 text-[#8C4B23] font-mono">
                Dynamic
              </span>
            </button>

            <button
              id="tab-assembly-instructions"
              onClick={() => setActiveInfoTab('assembly')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeInfoTab === 'assembly'
                  ? 'bg-[#1A1917] text-white shadow-md'
                  : 'bg-white border border-[#E8E3DA] text-[#615951] hover:text-[#1A1917] hover:bg-[#FAF8F5]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Assembly Instructions</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                {product.category.toUpperCase()}
              </span>
            </button>

            <button
              id="tab-joinery-specs"
              onClick={() => setActiveInfoTab('specs')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeInfoTab === 'specs'
                  ? 'bg-[#1A1917] text-white shadow-md'
                  : 'bg-white border border-[#E8E3DA] text-[#615951] hover:text-[#1A1917] hover:bg-[#FAF8F5]'
              }`}
            >
              <Ruler className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Joinery & Timber Specs</span>
            </button>
          </div>

          {/* TAB 1: MAINTENANCE & CARE TIPS */}
          {activeInfoTab === 'care' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Dynamic Material Indicator Banner */}
              <div className="bg-[#FAF6F0] rounded-2xl border border-[#E8DFD3] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C4B23] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dynamic Material Intelligence</span>
                  </div>
                  <h3 className="font-['Cinzel'] text-lg font-bold text-[#1A1917]">
                    {currentCareInfo.title}
                  </h3>
                  <p className="text-xs text-[#766E65]">
                    {currentCareInfo.tagline} · Origin: <span className="font-semibold text-[#1A1917]">{currentCareInfo.origin}</span>
                  </p>
                </div>

                {/* Material Switcher Pills */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-[#E8E3DA] text-xs shrink-0">
                  <button
                    onClick={() => setActiveCareMaterial('wood')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeCareMaterial === 'wood'
                        ? 'bg-[#8C4B23] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1A1917]'
                    }`}
                  >
                    Wood ({activeWood.name.split(' ')[0]})
                  </button>
                  <button
                    onClick={() => setActiveCareMaterial('fabric')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeCareMaterial === 'fabric'
                        ? 'bg-[#8C4B23] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1A1917]'
                    }`}
                  >
                    Fabric ({activeFabric.name.split(' ')[0]})
                  </button>
                  <button
                    onClick={() => setActiveCareMaterial('metal')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeCareMaterial === 'metal'
                        ? 'bg-[#8C4B23] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#1A1917]'
                    }`}
                  >
                    Metal ({activeMetal.name.split(' ')[0]})
                  </button>
                </div>
              </div>

              {/* Maintenance Schedule Notice */}
              <div className="flex items-center gap-3 bg-white rounded-xl border border-[#E8E3DA] px-4 py-3 text-xs text-[#524B43]">
                <Clock className="w-4 h-4 text-[#8C4B23] shrink-0" />
                <span>
                  <strong>Recommended Frequency:</strong> {currentCareInfo.schedule}
                </span>
              </div>

              {/* 4 Care Protocol Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCareInfo.tips.map((tip, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E8E3DA] p-5 space-y-2 hover:border-[#C5A880] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-['Cinzel'] text-sm font-bold text-[#1A1917]">
                        {tip.heading}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E8E3DA] text-[#8C4B23]">
                        {tip.frequency}
                      </span>
                    </div>
                    <p className="text-xs text-[#615951] leading-relaxed">
                      {tip.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Atelier White Glove Care Kit Offer */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#8C4B23]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#1A1917]">Included: 1987 Atelier Reconditioning Care Kit</div>
                    <div className="text-[11px] text-[#766E65]">Every commission includes biological herbal oil, application fleece, and natural beeswax repair sticks.</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-700 font-bold uppercase bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  Complimentary With Crate
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ASSEMBLY INSTRUCTIONS */}
          {activeInfoTab === 'assembly' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header with Downloadable PDF Placeholder Button */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#8C4B23] font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Technical Assembly Manual · {product.category.toUpperCase()}</span>
                  </div>
                  <h3 className="font-['Cinzel'] text-xl font-bold text-[#1A1917]">
                    Step-by-Step Installation & Setup
                  </h3>
                  <p className="text-xs text-[#766E65]">
                    Designed for precision, zero rattle, and lifelong structural stability. Estimated assembly: 15–20 minutes.
                  </p>
                </div>

                {/* Downloadable PDF Placeholder Button & Interactive Blueprint Viewer */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    id="open-interactive-assembly-viewer-btn"
                    onClick={() => setAssemblyViewerOpen(true)}
                    className="px-4 py-3 rounded-xl bg-white border border-[#C5A880] hover:bg-[#FAF8F5] text-[#1A1917] font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 text-[#8C4B23]" />
                    <span>Interactive Diagram Viewer</span>
                  </button>

                  <button
                    id="download-assembly-pdf-button"
                    onClick={handleDownloadAssemblyPDF}
                    className="px-5 py-3 rounded-xl bg-[#1A1917] hover:bg-black text-white font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#C5A880]" />
                    <span>Download PDF Manual</span>
                  </button>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-3">
                {assemblySteps.map((step) => (
                  <div 
                    key={step.step}
                    className="bg-white rounded-2xl border border-[#E8E3DA] p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-[#C5A880] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E3DA] text-[#8C4B23] font-mono font-bold flex items-center justify-center shrink-0">
                      0{step.step}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-['Cinzel'] text-sm font-bold text-[#1A1917]">
                          {step.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#766E65]">
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3DA]">
                            ⏱ {step.duration}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E3DA]">
                            🛠 {step.tools}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#615951] leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assembly Concierge Notice */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-4 text-xs text-[#766E65] flex items-center justify-between">
                <span>Need white glove assembly service? Our certified delivery team will unbox and assemble in your room of choice.</span>
                <span className="font-semibold text-[#1A1917] uppercase tracking-wider font-mono text-[11px] ml-4 shrink-0">White Glove Option Available</span>
              </div>

            </div>
          )}

          {/* TAB 3: JOINERY & TIMBER SPECS */}
          {activeInfoTab === 'specs' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 space-y-3">
                  <div className="text-xs font-mono uppercase text-[#8C4B23] font-semibold">Moisture Equilibrium</div>
                  <div className="font-['Cinzel'] text-2xl font-bold text-[#1A1917]">7% – 9%</div>
                  <p className="text-xs text-[#615951] leading-relaxed">
                    Kiln-dried in gentle vacuum chambers in Austria to eliminate internal tension before hand-milling.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 space-y-3">
                  <div className="text-xs font-mono uppercase text-[#8C4B23] font-semibold">Joinery Method</div>
                  <div className="font-['Cinzel'] text-2xl font-bold text-[#1A1917]">Mortise & Tenon</div>
                  <p className="text-xs text-[#615951] leading-relaxed">
                    Traditional wooden dowels and precision wedged tenons allow natural seasonal micro-expansion without creaking.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E3DA] p-5 space-y-3">
                  <div className="text-xs font-mono uppercase text-[#8C4B23] font-semibold">Toxicity Index</div>
                  <div className="font-['Cinzel'] text-2xl font-bold text-emerald-700">0.00 Formaldehyde</div>
                  <p className="text-xs text-[#615951] leading-relaxed">
                    Zero MDF, particleboard, or synthetic lacquers. Safe for bedrooms and sensitive nursery environments.
                  </p>
                </div>

              </div>

              {/* Hardware Manifest Table */}
              <div className="bg-white rounded-2xl border border-[#E8E3DA] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E8E3DA] font-['Cinzel'] font-bold text-sm text-[#1A1917]">
                  Architectural Hardware & Mechanical Specification
                </div>
                <div className="divide-y divide-[#E8E3DA] text-xs">
                  <div className="px-6 py-3 flex items-center justify-between">
                    <span className="text-[#766E65]">Slide & Hinge Systems</span>
                    <span className="font-semibold text-[#1A1917]">Austrian Blum Blumotion concealed dampers</span>
                  </div>
                  <div className="px-6 py-3 flex items-center justify-between">
                    <span className="text-[#766E65]">Fastening Metal</span>
                    <span className="font-semibold text-[#1A1917]">A4 316 Marine-grade stainless steel machine bolts</span>
                  </div>
                  <div className="px-6 py-3 flex items-center justify-between">
                    <span className="text-[#766E65]">Foot Ferrules</span>
                    <span className="font-semibold text-[#1A1917]">Solid architectural brass with acoustic felt inserts</span>
                  </div>
                  <div className="px-6 py-3 flex items-center justify-between">
                    <span className="text-[#766E65]">Timber Certification</span>
                    <span className="font-semibold text-[#1A1917]">PEFC Chain of Custody (Austria / Germany)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RELATED SILHOUETTES */}
        <div className="mt-24 pt-12 border-t border-[#E8E3DA] space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#8C4B23] font-semibold">
                Catalogue Pairings
              </div>
              <h2 className="font-['Cinzel'] text-2xl font-bold text-[#1A1917]">
                Complementary Pieces in the 87 Collection
              </h2>
            </div>
            <button
              onClick={onNavigateBackToProducts}
              className="text-xs font-mono text-[#8C4B23] hover:underline font-bold uppercase"
            >
              View Full Collection →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel)}
                className="bg-white rounded-2xl border border-[#E8E3DA] p-4 space-y-3 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="aspect-[4/3] bg-[#F5F2EB] rounded-xl overflow-hidden border border-[#E2DDD5] relative">
                  <ProductImage
                    product={rel}
                    alt={rel.name}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#8C4B23] uppercase">{rel.category}</div>
                  <div className="font-['Cinzel'] text-sm font-bold text-[#1A1917] truncate">{rel.name}</div>
                  <div className="font-['Cinzel'] text-xs font-bold text-[#1A1917] mt-1">
                    ${rel.basePrice.toLocaleString('en-US')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SOCIAL SHARE MODAL                                                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-[#E8E3DA] p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#E8E3DA] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E3DA] flex items-center justify-center text-[#8C4B23]">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Cinzel'] font-bold text-sm text-[#1A1917]">
                      Share Custom Configuration
                    </h3>
                    <p className="text-[11px] text-[#766E65]">
                      Generate a direct link with all material selections preserved
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#766E65] hover:text-[#1A1917] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Commission Summary Card */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E3DA] p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2DDD5] flex items-center justify-center font-['Cinzel'] font-bold text-sm text-[#8C4B23] shrink-0">
                  87
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-['Cinzel'] font-bold text-xs text-[#1A1917] truncate">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-[#766E65] truncate">
                    {activeWood.name} · {activeFabric.name}
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#8C4B23] mt-0.5">
                    ${calculatedPrice.toLocaleString('en-US')}
                  </div>
                </div>
              </div>

              {/* Direct Copyable Link Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#524B43] uppercase tracking-wider block">
                  Configuration URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-[#FAF8F5] border border-[#E8E3DA] rounded-xl px-3 py-2 text-xs font-mono text-[#524B43] select-all truncate focus:outline-none"
                  />
                  <button
                    id="copy-share-url-btn"
                    onClick={handleCopyShareUrl}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1A1917] text-white hover:bg-black'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Channels Row */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-semibold text-[#524B43] uppercase tracking-wider">
                  Broadcast via Platform
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Twitter / X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Take a look at my custom ${product.name} in ${activeWood.name} at 1987 Furniture Atelier:`)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                  >
                    <span className="font-bold text-xs text-[#1A1917]">X / Twitter</span>
                    <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                      Share <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>

                  {/* Pinterest */}
                  <a
                    href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(`Custom 1987 Furniture: ${product.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                  >
                    <span className="font-bold text-xs text-[#1A1917]">Pinterest</span>
                    <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                      Pin Spec <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my custom ${product.name} from 1987 Furniture Atelier: ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                  >
                    <span className="font-bold text-xs text-[#1A1917]">WhatsApp</span>
                    <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                      Send Chat <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Custom 1987 Commission: ${product.name}`)}&body=${encodeURIComponent(`I customized this ${product.name} in solid ${activeWood.name}:\n\n${shareUrl}`)}`}
                    className="p-3 rounded-xl border border-[#E8E3DA] hover:border-[#1A1917] hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center gap-1 text-center group cursor-pointer"
                  >
                    <span className="font-bold text-xs text-[#1A1917]">Email Client</span>
                    <span className="text-[10px] text-[#766E65] flex items-center gap-0.5">
                      Send Mail <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(false)}
                className="w-full py-2.5 rounded-xl border border-[#E8E3DA] bg-[#FAF8F5] text-xs font-semibold text-[#524B43] hover:text-[#1A1917] transition-colors cursor-pointer"
              >
                Close Modal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assembly Guide Download Toast */}
      <AnimatePresence>
        {downloadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-[#1A1917] text-white px-5 py-4 rounded-2xl shadow-2xl border border-[#C5A880]/30 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-['Cinzel']">Assembly Guide Downloaded</div>
              <div className="text-[11px] text-[#A89F91]">Saved as 1987-Assembly-Guide-{product.id}.pdf</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Assembly Instructions Modal */}
      <AssemblyInstructionsModal
        isOpen={assemblyViewerOpen}
        onClose={() => setAssemblyViewerOpen(false)}
        product={product}
      />

    </div>
  );
};
