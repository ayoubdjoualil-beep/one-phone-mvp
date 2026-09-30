import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const FloatingWhatsApp: React.FC = () => {
  const { openWhatsAppChat } = useCart();

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 z-40 flex items-center gap-2 group animate-in fade-in duration-300">
      {/* Floating Tooltip Pill */}
      <div className="hidden sm:flex items-center gap-1.5 bg-neutral-900/90 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-neutral-700 pointer-events-none group-hover:scale-105 transition-transform">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>تواصل مع محل قسنطينة</span>
      </div>

      {/* Button */}
      <button
        onClick={() => openWhatsAppChat()}
        className="relative w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="تواصل عبر الواتساب"
        title="تواصل معنا عبر الواتساب"
      >
        <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none"></span>
        <MessageCircle className="w-7 h-7 fill-white text-white relative z-10" />
      </button>
    </div>
  );
};
