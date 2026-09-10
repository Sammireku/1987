export type FurnitureCategory = 'chair' | 'table' | 'sofa' | 'credenza' | 'desk' | 'coffee_table' | 'outdoor' | 'lighting' | 'bench';

export interface MaterialOption {
  id: string;
  name: string;
  category: 'wood' | 'fabric' | 'metal';
  colorHex: string;
  textureType?: string;
  roughness: number; // 0 to 1
  metalness: number; // 0 to 1
  priceModifier: number; // +/- $ amount
  origin?: string;
  description: string;
  image?: string;
}

export interface FurnitureDimensions {
  widthCm: number;
  depthCm: number;
  heightCm: number;
  seatHeightCm?: number;
  minWidthCm: number;
  maxWidthCm: number;
  minDepthCm: number;
  maxDepthCm: number;
  minHeightCm: number;
  maxHeightCm: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  subtitle: string;
  category: FurnitureCategory;
  description: string;
  basePrice: number;
  leadTimeWeeks: number;
  dimensions: FurnitureDimensions;
  defaultWoodId: string;
  defaultFabricId: string;
  defaultMetalId: string;
  compatibleWoodIds: string[];
  compatibleFabricIds: string[];
  compatibleMetalIds: string[];
  features: string[];
  craftsmanshipNotes: string;
  geometryType: 'armchair' | 'sectional_sofa' | 'dining_table' | 'credenza' | 'executive_desk' | 'coffee_table' | 'custom_ai';
  parametricSpecs?: {
    cushionCurvature?: number;
    legTaper?: number;
    woodThickness?: number;
    armrestHeight?: number;
    metalAccents?: boolean;
    slatCount?: number;
  };
  catalogPage?: number;
  roomType?: string;
  badge?: string;
  image?: string;
  galleryImages?: string[];
  customModelData?: any;
}

export interface CustomizationSelection {
  productId: string;
  selectedWoodId: string;
  selectedFabricId: string;
  selectedMetalId: string;
  customWidthCm: number;
  customDepthCm: number;
  customHeightCm: number;
  specialInstructions?: string;
  calculatedPrice?: number;
}

export type OrderStatus = 
  | 'Order Confirmed'
  | 'Timber Selection & Kiln Drying'
  | 'Joinery & Frame Fabrication'
  | 'Bespoke Upholstery & Cushioning'
  | 'Master Finisher Inspection'
  | 'White-Glove Dispatch'
  | 'Delivered';

export interface OrderItem {
  id: string;
  product: FurnitureItem;
  customization: CustomizationSelection;
  wood: MaterialOption;
  fabric: MaterialOption;
  metal: MaterialOption;
  quantity: number;
  unitPrice: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryOption: 'white_glove' | 'room_of_choice' | 'curbside';
}

export interface Order {
  id: string;
  date: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'card' | 'apple_pay' | 'wire' | 'affirm';
  paymentLast4?: string;
  estimatedDeliveryDate: string;
  trackingNumber: string;
}

export interface AICadAnalysisResult {
  name: string;
  category: FurnitureCategory;
  description: string;
  basePrice: number;
  dimensions: {
    widthCm: number;
    depthCm: number;
    heightCm: number;
    seatHeightCm?: number;
  };
  suggestedWood: string;
  suggestedMetal: string;
  suggestedFabric: string;
  geometryType: FurnitureItem['geometryType'];
  parametricSpecs: {
    cushionCurvature: number;
    legTaper: number;
    armrestHeight: number;
    woodThickness: number;
    metalAccents: boolean;
    features: string[];
  };
  craftsmanshipNotes: string;
  cadAnalysisSummary: string;
}

export interface SavedDesign {
  id: string;
  timestamp: number;
  product: FurnitureItem;
  customization: CustomizationSelection;
  wood: MaterialOption;
  fabric: MaterialOption;
  metal: MaterialOption;
  calculatedPrice: number;
  label?: string;
}

export type WishlistItem = SavedDesign;

export function calculateFurniturePrice(
  product: FurnitureItem,
  wood: MaterialOption,
  fabric: MaterialOption,
  metal: MaterialOption,
  customWidthCm: number,
  customDepthCm: number,
  customHeightCm: number
): number {
  const deltaW = Math.abs(customWidthCm - product.dimensions.widthCm);
  const deltaD = Math.abs(customDepthCm - product.dimensions.depthCm);
  const deltaH = Math.abs(customHeightCm - product.dimensions.heightCm);
  const dimensionSurcharge = Math.round((deltaW * 6) + (deltaD * 6) + (deltaH * 6));
  return product.basePrice + (wood?.priceModifier || 0) + (fabric?.priceModifier || 0) + (metal?.priceModifier || 0) + dimensionSurcharge;
}

