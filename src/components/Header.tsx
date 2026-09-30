import React from 'react';
import { Search, Sparkles, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onOpenFilter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFilter }) => {
  const {
    searchQuery,
    setSearchQuery,
    totalItems,
    setIsCartOpen,
    setIsAiModalOpen,
  } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Constantine Store Announcement Bar */}
      <div className="bg-neutral-900 text-white text-xs px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-amber-300">محل ONE phone</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-gray-300">
          <span className="hidden sm:inline bg-neutral-800 px-2 py-0.5 rounded text-amber-400">
            🚚 توصيل سريع لـ 58 ولاية
          </span>
          <a
            href="tel:+213555123456"
            className="text-emerald-400 hover:text-emerald-300 font-bold tracking-wider"
          >
            0555 12 34 56
          </a>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-3.5 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-lg tracking-tighter">
            1P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-gray-900 leading-none">
                ONE <span className="text-amber-600">phone</span>
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold block leading-tight">
              CONSTANTINE TECH STORE
            </span>
          </div>
        </div>

        {/* AI Specs Tool & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm hover:from-violet-700 hover:to-indigo-700 transition active:scale-95"
            title="فحص الأجهزة بالذكاء الاصطناعي والمستشار الذكي"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span className="hidden sm:inline">ذكاء اصطناعي</span>
            <span className="sm:hidden text-[11px]">AI</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-800"
            aria-label="سلة التسوق"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* AliExpress Style Smart Search Bar */}
      <div className="max-w-7xl mx-auto px-3.5 pb-2.5">
        <div className="relative flex items-center">
          <div className="absolute right-3 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4 text-amber-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن هاتف أو لابتوب (مثال: HP Victus, iPhone 13, RTX 4060, S24)..."
            className="w-full bg-gray-100/90 hover:bg-gray-100 focus:bg-white text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm rounded-xl pr-9 pl-9 py-2.5 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition outline-none shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
