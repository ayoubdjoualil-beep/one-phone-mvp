import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Phone,
  User,
  ShoppingBag,
  Sparkles,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import { submitOrder } from '../lib/firebase';
import { Order } from '../types';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, openWhatsAppChat, addToCart } = useCart();

  // Gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Hybrid Order Form (COD)
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('25'); // Default Constantine
  const [commune, setCommune] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [formError, setFormError] = useState('');

  // AI Description Enhancement
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!selectedProduct) return null;

  const currentWilaya = ALGERIA_WILAYAS.find(w => w.code === wilayaCode) || ALGERIA_WILAYAS[24]; // Wilaya 25 Constantine
  const deliveryFee = deliveryType === 'home' ? currentWilaya.homeDeliveryFee : currentWilaya.deskDeliveryFee;
  const itemsTotal = selectedProduct.price * quantity;
  const grandTotal = itemsTotal + deliveryFee;

  const images = [selectedProduct.imageUrl, ...(selectedProduct.additionalImages || [])];

  const handleFetchAiDescription = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/describe-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedProduct.title,
          brand: selectedProduct.brand,
          category: selectedProduct.category,
          condition: selectedProduct.condition,
          specs: selectedProduct.specs
        })
      });
      const data = await res.json();
      if (data.description) {
        setAiDescription(data.description);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || customerName.length < 3) {
      setFormError('يرجى إدخال الاسم واللقب بشكل صحيح.');
      return;
    }

    // Algerian phone validation: 05, 06, 07 followed by 8 digits
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(05|06|07)[0-9]{8}$/.test(cleanPhone)) {
      setFormError('يرجى إدخال رقم هاتف جزائري صالح (مثال: 0555123456 أو 0661234567).');
      return;
    }

    if (!commune.trim()) {
      setFormError('يرجى تحديد أو كتابة اسم البلدية.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `ONE-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Omit<Order, 'id'> = {
        orderNumber,
        customerName: customerName.trim(),
        phone: cleanPhone,
        wilayaCode: currentWilaya.code,
        wilayaName: currentWilaya.nameAr,
        commune: commune.trim(),
        deliveryType,
        deliveryFee,
        items: [
          {
            id: selectedProduct.id,
            title: selectedProduct.title,
            price: selectedProduct.price,
            quantity,
            imageUrl: selectedProduct.imageUrl
          }
        ],
        totalAmount: grandTotal,
        status: 'pending',
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await submitOrder(newOrder);
      setOrderConfirmed(newOrder as Order);
    } catch (err: any) {
      console.error(err);
      setFormError('حدث خطأ أثناء إرسال الطلب. يرجى إعادة المحاولة أو الطلب عبر الواتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-gray-500 truncate">
              {selectedProduct.brand} • {selectedProduct.category === 'laptops' ? 'حاسوب محمول' : selectedProduct.category === 'phones' ? 'هاتف ذكي' : 'ملحق'}
            </span>
          </div>
          <button
            onClick={() => setSelectedProduct(null)}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Order Confirmation Screen if submitted */}
          {orderConfirmed ? (
            <div className="text-center py-8 px-4 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                  تم تسجيل طلبك بنجاح! 🎉
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                  شكراً لك يا {orderConfirmed.customerName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  رقم طلبك هو:{' '}
                  <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {orderConfirmed.orderNumber}
                  </span>
                </p>
              </div>

              {/* Order summary box */}
              <div className="bg-gray-50 rounded-2xl p-4 text-right border border-gray-200 text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between font-bold text-gray-800 border-b border-gray-200 pb-2">
                  <span>المنتج:</span>
                  <span className="truncate max-w-[200px] text-amber-700">{selectedProduct.title}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>وجهة الشحن:</span>
                  <span>{orderConfirmed.wilayaName} ({orderConfirmed.commune})</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>نوع التوصيل:</span>
                  <span>{orderConfirmed.deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من مكتب التوصيل'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>تكلفة التوصيل:</span>
                  <span className="font-mono">{orderConfirmed.deliveryFee.toLocaleString()} دج</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>المبلغ الإجمالي عند الاستلام:</span>
                  <span className="text-emerald-700 font-mono">{orderConfirmed.totalAmount.toLocaleString()} دج</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs text-right space-y-1 max-w-md mx-auto">
                <div className="font-bold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-700" />
                  الخطوة القادمة:
                </div>
                <p>
                  سيتصل بك فريق محل <strong>ONE phone قسنطينة</strong> هاتفياً على الرقم{' '}
                  <strong className="font-mono">{orderConfirmed.phone}</strong> خلال ساعات لتأكيد الطلب وشحنه فوراً.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={() => openWhatsAppChat(
                    `سلام عليكم، قمت بتأكيد الطلب رقم ${orderConfirmed.orderNumber} لجهاز ${selectedProduct.title}، وأريد متابعة حالته وتأكيده معكم فوراً. شكراً!`
                  )}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  متابعة الطلب عبر الواتساب فوراً
                </button>
                <button
                  onClick={() => {
                    setOrderConfirmed(null);
                    setSelectedProduct(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-3 px-6 rounded-xl transition"
                >
                  مواصلة التسوق في المتجر
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Product Top Grid: Gallery & High-level details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gallery */}
                <div className="space-y-3">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs">
                    <img
                      src={images[activeImageIndex]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover object-center"
                    />

                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {selectedProduct.condition === 'new' ? (
                        <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                          جديد كرتونة مغلق
                        </span>
                      ) : (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                          كابا نقي جداً 10/10
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Row if additional images exist */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                            activeImageIndex === idx
                              ? 'border-amber-500 shadow-sm scale-102'
                              : 'border-gray-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Constantine Store Availability Box */}
                  <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <span className="font-extrabold text-emerald-900 block">
                        🟢 متوفر حالياً بمحل قسنطينة
                      </span>
                      <span className="text-emerald-700">
                        نهج عبان رمضان (شارع فرنسا) - يمكنك زيارتنا ومعاينة وتجريب الجهاز مباشرة بالمحل!
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details & Price Header */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                      {selectedProduct.title}
                    </h1>
                    {selectedProduct.frenchTitle && (
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {selectedProduct.frenchTitle}
                      </p>
                    )}
                  </div>

                  {/* Price Banner */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-amber-800 font-bold block mb-0.5">السعر بالدينار الجزائري:</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight">
                          {selectedProduct.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-gray-800">دج</span>
                      </div>
                    </div>
                    {selectedProduct.oldPrice && (
                      <div className="text-left">
                        <span className="text-xs text-gray-400 line-through font-mono block">
                          {selectedProduct.oldPrice.toLocaleString()} دج
                        </span>
                        <span className="text-[11px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          تخفيض خاص
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Trust Badges Bar */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-gray-800">ضمان المحل</div>
                        <div className="text-[10px] text-gray-500">{selectedProduct.warrantyMonths} أشهر كاملة</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-gray-800">توصيل 58 ولاية</div>
                        <div className="text-[10px] text-gray-500">فحص الطرد قبل الدفع</div>
                      </div>
                    </div>
                  </div>

                  {/* Specs Quick Summary */}
                  <div className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-100 text-xs space-y-2">
                    <span className="font-bold text-gray-800 block text-xs border-b border-gray-200 pb-1.5">
                      المواصفات التقنية الرئيسية (Fiche Technique):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                      {selectedProduct.specs.processor && (
                        <div>
                          <span className="text-gray-500">المعالج (CPU): </span>
                          <span className="font-semibold text-gray-800">{selectedProduct.specs.processor}</span>
                        </div>
                      )}
                      {selectedProduct.specs.ram && (
                        <div>
                          <span className="text-gray-500">الرام (RAM): </span>
                          <span className="font-semibold text-gray-800">{selectedProduct.specs.ram}</span>
                        </div>
                      )}
                      {selectedProduct.specs.storage && (
                        <div>
                          <span className="text-gray-500">التخزين (Stockage): </span>
                          <span className="font-semibold text-gray-800">{selectedProduct.specs.storage}</span>
                        </div>
                      )}
                      {selectedProduct.specs.gpu && (
                        <div>
                          <span className="text-gray-500">كرت الشاشة (GPU): </span>
                          <span className="font-semibold text-gray-800">{selectedProduct.specs.gpu}</span>
                        </div>
                      )}
                      {selectedProduct.specs.screen && (
                        <div>
                          <span className="text-gray-500">الشاشة (Écran): </span>
                          <span className="font-semibold text-gray-800">{selectedProduct.specs.screen}</span>
                        </div>
                      )}
                      {selectedProduct.specs.battery && (
                        <div>
                          <span className="text-gray-500">البطارية (Batterie): </span>
                          <span className="font-semibold text-gray-800">{selectedProduct.specs.battery}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Description */}
                  <div className="text-xs text-gray-700 leading-relaxed bg-white border border-gray-100 rounded-2xl p-3">
                    <div className="font-bold text-gray-900 mb-1 flex items-center justify-between">
                      <span>وصف الجهاز:</span>
                      <button
                        onClick={handleFetchAiDescription}
                        disabled={isLoadingAi}
                        className="text-[11px] text-violet-700 hover:text-violet-800 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        {isLoadingAi ? 'جارِ التحسين بالذكاء الاصطناعي...' : 'تحسين الوصف بـ Gemini AI'}
                      </button>
                    </div>
                    <p className="whitespace-pre-line">
                      {aiDescription || selectedProduct.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: HYBRID ORDER SYSTEM (نظام الطلب الهجين) */}
              <div className="border-t-2 border-dashed border-gray-200 pt-6 space-y-6">
                <div className="text-center space-y-1">
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    نظام الطلب السريع المزدوج • Hybrid Order System
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">
                    كيف تفضل إتمام طلبك اليوم؟
                  </h2>
                  <p className="text-xs text-gray-500">
                    اختر الطريقة الأنسب لك: استمارة الدفع عند الاستلام المباشرة أو محادثة فورية عبر الواتساب
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* OPTION 1: COD Form (الدفع عند الاستلام) */}
                  <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-amber-500/30 p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                          1
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-gray-900">
                            استمارة الدفع عند الاستلام (COD)
                          </h3>
                          <span className="text-[11px] text-gray-500">
                            ادفع نقداً عند استلام ومعاينة طردك
                          </span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        تأكيد فوري
                      </span>
                    </div>

                    {formError && (
                      <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-red-600" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCodSubmit} className="space-y-3.5">
                      {/* Name field */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          الاسم واللقب الكامل <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="مثال: يوسف بلقاسم"
                            className="w-full bg-gray-50 focus:bg-white text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2.5 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                          />
                        </div>
                      </div>

                      {/* Phone field */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          رقم الهاتف الجزائري <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="05 / 06 / 07 XX XX XX XX"
                            dir="ltr"
                            className="w-full bg-gray-50 focus:bg-white text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2.5 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition text-right font-mono"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          سيتصل بك فريقنا لتأكيد شحن الطرد قبل إرساله
                        </span>
                      </div>

                      {/* Wilaya Selection (58 Wilayas) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            الولاية (58 ولاية) <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={wilayaCode}
                            onChange={(e) => {
                              setWilayaCode(e.target.value);
                              const found = ALGERIA_WILAYAS.find(w => w.code === e.target.value);
                              if (found && found.communes.length > 0) {
                                setCommune(found.communes[0]);
                              }
                            }}
                            className="w-full bg-gray-50 focus:bg-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition font-semibold"
                          >
                            {ALGERIA_WILAYAS.map((w) => (
                              <option key={w.code} value={w.code}>
                                {w.code} - {w.nameAr}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Commune Field / Suggestions */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            البلدية أو الحي <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={commune}
                            onChange={(e) => setCommune(e.target.value)}
                            placeholder="اسم البلدية أو العنوان"
                            list="commune-suggestions"
                            className="w-full bg-gray-50 focus:bg-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                          />
                          <datalist id="commune-suggestions">
                            {currentWilaya.communes.map((c, i) => (
                              <option key={i} value={c} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      {/* Delivery Option Toggle */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          مكان الاستلام المفضل:
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setDeliveryType('home')}
                            className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between ${
                              deliveryType === 'home'
                                ? 'border-amber-500 bg-amber-50/70 text-gray-900 font-bold shadow-xs'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div>
                              <span className="block text-xs">توصيل للمنزل 🏠</span>
                              <span className="text-[10px] text-gray-500">إلى باب منزلك</span>
                            </div>
                            <span className="font-mono text-amber-700 font-bold">
                              {currentWilaya.homeDeliveryFee} دج
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeliveryType('desk')}
                            className={`p-2.5 rounded-xl border text-right transition flex items-center justify-between ${
                              deliveryType === 'desk'
                                ? 'border-amber-500 bg-amber-50/70 text-gray-900 font-bold shadow-xs'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div>
                              <span className="block text-xs">مكتب التوصيل 🏢</span>
                              <span className="text-[10px] text-gray-500">
                                {currentWilaya.code === '25' ? 'استلام من المحل بقسنطينة' : 'مكتب ياليدين القريب منك'}
                              </span>
                            </div>
                            <span className="font-mono text-amber-700 font-bold">
                              {currentWilaya.deskDeliveryFee === 0 ? 'مجاناً' : `${currentWilaya.deskDeliveryFee} دج`}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Total Breakdown */}
                      <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 text-xs space-y-1.5">
                        <div className="flex justify-between text-gray-600">
                          <span>سعر الجهاز:</span>
                          <span className="font-mono">{selectedProduct.price.toLocaleString()} دج</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>تكلفة التوصيل لـ ({currentWilaya.nameAr}):</span>
                          <span className="font-mono font-bold text-amber-700">
                            {deliveryFee === 0 ? 'مجاناً (استلام من المحل)' : `${deliveryFee.toLocaleString()} دج`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base font-black text-gray-900 border-t border-gray-200 pt-1.5">
                          <span>المجموع الكلي عند الدفع:</span>
                          <span className="text-amber-700 font-mono">{grandTotal.toLocaleString()} دج</span>
                        </div>
                      </div>

                      {/* Prominent COD Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>جارِ تأكيد وتسجيل الطلب...</span>
                          </div>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>تأكيد الطلب الآن (الدفع عند الاستلام)</span>
                            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* OPTION 2: Direct WhatsApp Order / Live Inquiries */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-500/30 p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-emerald-200 pb-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                          2
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-gray-900">
                            الطلب أو الاستفسار المباشر عبر الواتساب
                          </h3>
                          <span className="text-[11px] text-emerald-800">
                            تواصل مع مسؤول المبيعات في قسنطينة
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed">
                        هل تريد التأكد من نسبة البطارية؟ أو تطلب <strong>صوراً حقيقية وفيديو للجهاز</strong> من داخل المحل في قسنطينة قبل الطلب؟ فريقنا جاهز للرد الفوري عليك!
                      </p>

                      <div className="bg-white/80 rounded-2xl p-3 border border-emerald-200 text-xs space-y-2">
                        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          ماذا ستوفر لك المحادثة المباشرة:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px] pr-1">
                          <li>صور حية وفيديو للجهاز والملحقات.</li>
                          <li>فحص تقرير 3uTools أو صحة الهارد والبطارية.</li>
                          <li>تأكيد الحجز الفوري أو الاستلام بالمتجر.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => openWhatsAppChat(selectedProduct)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                      >
                        <MessageCircle className="w-5 h-5 fill-white text-white" />
                        <span>تواصل معنا عبر الواتساب للاستفسار أو طلب صور حقيقية للجهاز</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToCart(selectedProduct, quantity);
                          setSelectedProduct(null);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <ShoppingBag className="w-4 h-4 text-gray-600" />
                        <span>إضافة إلى سلة الشراء ومتابعة التسوق</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
