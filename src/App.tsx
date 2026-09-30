import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ShieldCheck,
  Truck,
  Sparkles,
  PhoneCall,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { AiToolsModal } from './components/AiToolsModal';
import { OrdersAdminView } from './components/OrdersAdminView';
import { BottomNav } from './components/BottomNav';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { INITIAL_PRODUCTS } from './data/products';
import { ProductCondition } from './types';

function MainShopContent() {
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsAiModalOpen,
    openWhatsAppChat
  } = useCart();

  // Filters & Sorting
  const [conditionFilter, setConditionFilter] = useState<'all' | ProductCondition>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (conditionFilter !== 'all' && product.condition !== conditionFilter) {
        return false;
      }

      // Brand filter
      if (brandFilter !== 'all' && product.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = product.title.toLowerCase().includes(query);
        const frTitleMatch = product.frenchTitle?.toLowerCase().includes(query);
        const brandMatch = product.brand.toLowerCase().includes(query);
        const specMatch = Object.values(product.specs).some((val) =>
          String(val).toLowerCase().includes(query)
        );
        return titleMatch || frTitleMatch || brandMatch || specMatch;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, conditionFilter, brandFilter, searchQuery, sortBy]);

  // Available brands in the current view
  const availableBrands = useMemo(() => {
    const brands = new Set(INITIAL_PRODUCTS.map((p) => p.brand));
    return ['all', ...Array.from(brands)];
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      <Header />
      <CategoryBar />

      {/* Main Tab Controller */}
      {activeTab === 'orders' ? (
        <OrdersAdminView />
      ) : activeTab === 'categories' ? (
        <div className="max-w-7xl mx-auto px-3.5 py-6 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              تصفح أقسام متجر ONE phone قسنطينة
            </h1>
            <p className="text-xs text-gray-500">
              أجهزة مضمونة متوفرة بمحلنا مع إمكانية التوصيل والدفع عند الاستلام
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'phones',
                title: 'هواتف محمولة (Smartphones)',
                desc: 'iPhone 15 Pro, iPhone 13 كابا, Galaxy S24 Ultra, Redmi Note',
                icon: <Smartphone className="w-8 h-8 text-amber-600" />,
                count: 'متوفر تشكيلة واسعة',
                bg: 'from-amber-500/10 to-orange-500/10'
              },
              {
                id: 'laptops',
                title: 'حواسيب محمولة (Pc portable)',
                desc: 'HP Victus 16, Asus TUF, Lenovo Legion, MacBook Air M2, Dell Caba',
                icon: <Laptop className="w-8 h-8 text-blue-600" />,
                count: 'أقوى أجهزة الجيمنغ والهندسة',
                bg: 'from-blue-500/10 to-indigo-500/10'
              },
              {
                id: 'watches',
                title: 'ساعات ذكية (Smartwatches)',
                desc: 'Apple Watch Ultra 2, Galaxy Watch 6 Classic',
                icon: <Watch className="w-8 h-8 text-emerald-600" />,
                count: 'أصلية بضمان المحل',
                bg: 'from-emerald-500/10 to-teal-500/10'
              },
              {
                id: 'accessories',
                title: 'أكسسوارات أصلية (Accessories)',
                desc: 'AirPods Pro 2 USB-C, شواحن آبل الأصلية 20W, باور بانك 100W',
                icon: <Headphones className="w-8 h-8 text-purple-600" />,
                count: 'ملحقات أصلية 100%',
                bg: 'from-purple-500/10 to-pink-500/10'
              }
            ].map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setActiveTab('home');
                }}
                className={`cursor-pointer rounded-3xl p-5 border border-gray-200/80 bg-gradient-to-br ${cat.bg} hover:shadow-md transition group flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-amber-700 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>{cat.count}</span>
                  <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">←</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Home Tab with AliExpress-style 2-Column Grid */
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6">
          {/* Promotional Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950 text-white p-4 sm:p-6 shadow-xl border border-neutral-800">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center md:text-right max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[11px] font-extrabold px-3 py-1 rounded-full border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>عروض قوية بمحل قسنطينة • وصول دفعات جديدة</span>
                </div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black leading-tight">
                  متجر <span className="text-amber-400">ONE phone</span> للأجهزة الإلكترونية
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  هواتف ذكية وحواسيب محمولة أصلية (جديد كرتونة مغلق أو كابا فرنسا نقي 10/10) مع ضمان رسمي بمحلنا في قسنطينة وتوصيل سريع لـ 58 ولاية والدفع عند الاستلام.
                </p>

                {/* 3 Core Trust Pillars */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-[11px]">
                  <span className="bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1 text-emerald-400 font-bold border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    متوفر بمحل قسنطينة
                  </span>
                  <span className="bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1 text-amber-300 font-bold border border-white/5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ضمان المحل المكتوب
                  </span>
                  <span className="bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1 text-blue-300 font-bold border border-white/5">
                    <Truck className="w-3.5 h-3.5" />
                    توصيل 58 ولاية وفحص قبل الدفع
                  </span>
                </div>
              </div>

              {/* Quick AI & WhatsApp Action Buttons in Hero */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>فحص مواصفات بالذكاء الاصطناعي</span>
                </button>

                <button
                  onClick={() => openWhatsAppChat()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>طلب فيديو وصور للأجهزة المتوفرة</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls Bar: Filters & Sort Pills */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            {/* Condition Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="w-3 h-3 text-amber-600" />
                الحالة:
              </span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'new', label: 'جديد كرتونة' },
                { id: 'caba_pristine', label: 'كابا نقي 10/10' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConditionFilter(c.id as any)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    conditionFilter === c.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Brands Filter & Sort */}
            <div className="flex items-center gap-2">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="bg-gray-100 text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-gray-200 outline-none text-gray-800"
              >
                <option value="all">كل الماركات</option>
                {availableBrands.filter(b => b !== 'all').map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-100 text-xs font-semibold rounded-xl px-2.5 py-1.5 border border-gray-200 outline-none text-gray-800"
              >
                <option value="featured">الأكثر تميزاً</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>
          </div>

          {/* Search Result Feedback if active */}
          {searchQuery && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-amber-900">
              <span>نتائج البحث عن: "<strong>{searchQuery}</strong>" ({filteredProducts.length} جهاز)</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-700 hover:underline font-bold"
              >
                إلغاء البحث
              </button>
            </div>
          )}

          {/* Mobile-First 2-Column Grid (AliExpress Style) */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
              <Laptop className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800 text-sm">لم نجد أجهزة مطابقة لبحثك</h3>
              <p className="text-xs text-gray-500">
                يمكنك كتابة اسم جهاز آخر أو التواصل معنا مباشرة عبر الواتساب لتوفير الجهاز الذي تبحث عنه.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setBrandFilter('all');
                    setConditionFilter('all');
                    setSelectedCategory('all');
                  }}
                  className="bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Constantine Store Physical Visit & Trust Banner */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-gray-900">
                    مقر محل ONE phone بقسنطينة
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    نهج عبان رمضان، وسط مدينة قسنطينة (شارع فرنسا) - بالقرب من ساحة أول نوفمبر (La Brèche)
                  </p>
                </div>
              </div>
              <button
                onClick={() => openWhatsAppChat('سلام عليكم محل ONE phone، أريد موقعكم الجغرافي (Localisation GPS) على خرائط جوجل لزيارتكم في قسنطينة.')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition self-start"
              >
                <span>طلب خريطة الموقع عبر الواتساب</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">معاينة وتجريب مباشر</span>
                  <span className="text-gray-500 text-[11px]">جرب الجهاز بالمحل قبل الشراء مع فحص 3uTools والبطارية</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">فاتورة وضمان مختوم</span>
                  <span className="text-gray-500 text-[11px]">ضمان من 3 أشهر إلى 12 شهراً على القطع والأداء</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">توصيل ياليدين لـ 58 ولاية</span>
                  <span className="text-gray-500 text-[11px]">شحن سريع خلال 24 إلى 48 ساعة والدفع نقداً عند الاستلام</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Global Modals & Persistent Actions */}
      <ProductDetailModal />
      <CartDrawer />
      <AiToolsModal />
      <FloatingWhatsApp />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainShopContent />
    </CartProvider>
  );
}
