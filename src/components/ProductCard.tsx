import React from 'react';
import { ShieldCheck, Truck, ShoppingCart, MessageCircle, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, addToCart, openWhatsAppChat } = useCart();

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group bg-white rounded-2xl border border-gray-100/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Condition Tag */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {product.condition === 'new' ? (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              جديد كرتونة
            </span>
          ) : (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              كابا نقي 10/10
            </span>
          )}

          {discountPercent && discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Constantine Stock Badge */}
        <div className="absolute bottom-2 right-2 left-2">
          <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute"></span>
            <span className="truncate">🟢 متوفر بمحل قسنطينة</span>
          </div>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Sold count */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
            {product.soldCount && (
              <span className="text-[10px] text-gray-400">
                تم بيع {product.soldCount} قطعة
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-amber-700 transition">
            {product.title}
          </h3>

          {/* Specs Snippet */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.specs.processor && (
              <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                {product.specs.processor.split('(')[0]}
              </span>
            )}
            {product.specs.ram && (
              <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                {product.specs.ram.split(' ')[0]} RAM
              </span>
            )}
            {product.specs.storage && (
              <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                {product.specs.storage.split(' ')[0]}
              </span>
            )}
          </div>
        </div>

        <div>
          {/* Trust Badges */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 mb-2 border-t border-gray-100 pt-1.5">
            <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              ضمان {product.warrantyMonths} أشهر
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-0.5 text-gray-600">
              <Truck className="w-3 h-3 text-amber-600 shrink-0" />
              58 ولاية
            </span>
          </div>

          {/* Price & Action Button */}
          <div className="flex items-end justify-between gap-1 pt-1">
            <div>
              {product.oldPrice && (
                <span className="text-[11px] text-gray-400 line-through block leading-none font-mono">
                  {product.oldPrice.toLocaleString()} دج
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-black text-amber-600 tracking-tight font-mono">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-gray-700">دج</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openWhatsAppChat(product);
                }}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition"
                title="تواصل واتساب مباشر"
                aria-label="تواصل واتساب"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="p-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xs transition active:scale-95"
                title="إضافة إلى السلة"
                aria-label="إضافة إلى السلة"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
