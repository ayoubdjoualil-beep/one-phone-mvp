export type ProductCategory = 'all' | 'phones' | 'laptops' | 'watches' | 'accessories';

export type ProductCondition = 'new' | 'caba_pristine' | 'caba_good';

export interface ProductSpecs {
  brand: string;
  model: string;
  storage?: string;
  ram?: string;
  processor?: string;
  gpu?: string;
  battery?: string;
  screen?: string;
  camera?: string;
  color?: string;
  os?: string;
  features?: string;
}

export interface Product {
  id: string;
  title: string;
  frenchTitle?: string;
  category: 'phones' | 'laptops' | 'watches' | 'accessories';
  brand: string;
  price: number; // in DZD
  oldPrice?: number;
  condition: ProductCondition; // 'new' (جديد كرتونة) | 'caba_pristine' (كابا نقي 10/10)
  inStockConstantine: boolean;
  warrantyMonths: number;
  imageUrl: string;
  additionalImages?: string[];
  specs: ProductSpecs;
  description: string;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  soldCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface Wilaya {
  code: string;
  nameAr: string;
  nameFr: string;
  deskDeliveryFee: number;
  homeDeliveryFee: number;
  communes: string[];
}

export interface Order {
  id?: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryType: 'home' | 'desk';
  deliveryFee: number;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
}
