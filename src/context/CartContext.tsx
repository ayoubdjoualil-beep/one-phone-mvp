import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductCategory } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  activeTab: 'home' | 'categories' | 'cart' | 'ai' | 'orders';
  setActiveTab: (tab: 'home' | 'categories' | 'cart' | 'ai' | 'orders') => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  openWhatsAppChat: (productOrMessage?: Product | string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CONSTANTINE_STORE_PHONE = '213555123456'; // Algerian format for WhatsApp

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('onephone_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'cart' | 'ai' | 'orders'>('home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('onephone_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedColor }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const openWhatsAppChat = (productOrMessage?: Product | string) => {
    let message = '';
    if (typeof productOrMessage === 'string') {
      message = productOrMessage;
    } else if (productOrMessage && typeof productOrMessage === 'object') {
      const p = productOrMessage;
      message = `سلام عليكم محل ONE phone قسنطينة 📱\nأريد الاستفسار عن هذا الجهاز:\n- الاسم: ${p.title}\n- السعر: ${p.price.toLocaleString()} دج\n- الحالة: ${p.condition === 'new' ? 'جديد كرتونة' : 'كابا نقي'}\n\nهل الجهاز متوفر حالياً بمحلكم في قسنطينة؟ وهل يمكنكم إرسال صور حقيقية وفيديو للجهاز؟ شكراً!`;
    } else {
      message = `سلام عليكم محل ONE phone قسنطينة 📱\nأريد الاستفسار عن الأجهزة المتوفرة لديكم وتفاصيل التوصيل لولايتي. شكراً!`;
    }

    const url = `https://wa.me/${CONSTANTINE_STORE_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isAiModalOpen,
        setIsAiModalOpen,
        openWhatsAppChat,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
