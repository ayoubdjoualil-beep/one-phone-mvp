import React from 'react';
import { Home, Layers, ShoppingBag, Sparkles, ClipboardList } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, totalItems, setIsCartOpen, setIsAiModalOpen } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'home' ? 'text-amber-600 font-bold scale-105' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">الرئيسية</span>
        </button>

        {/* Categories */}
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'categories' ? 'text-amber-600 font-bold scale-105' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">الفئات</span>
        </button>

        {/* AI Studio Specs & Advisor */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex flex-col items-center gap-1 text-violet-600 hover:text-violet-800 transition"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <span className="text-[10px] font-bold">ذكاء AI</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">السلة</span>
        </button>

        {/* Orders Manager */}
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'orders' ? 'text-amber-600 font-bold scale-105' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">الطلبات</span>
        </button>
      </div>
    </nav>
  );
};
