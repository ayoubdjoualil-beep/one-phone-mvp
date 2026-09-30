import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Phone, User, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ALGERIA_WILAYAS } from '../data/wilayas';
import { submitOrder } from '../lib/firebase';
import { Order } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    openWhatsAppChat,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('25'); // Default Constantine
  const [commune, setCommune] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const currentWilaya = ALGERIA_WILAYAS.find(w => w.code === wilayaCode) || ALGERIA_WILAYAS[24];
  const deliveryFee = cart.length === 0 ? 0 : (deliveryType === 'home' ? currentWilaya.homeDeliveryFee : currentWilaya.deskDeliveryFee);
  const totalAmount = subtotal + deliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || customerName.length < 3) {
      setErrorMsg('يرجى إدخال اسمك ولقبك بشكل كامل.');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(05|06|07)[0-9]{8}$/.test(cleanPhone)) {
      setErrorMsg('يرجى إدخال رقم هاتف جزائري صالح (05 / 06 / 07).');
      return;
    }

    if (!commune.trim()) {
      setErrorMsg('يرجى كتابة اسم البلدية أو الحي.');
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
        items: cart.map(i => ({
          id: i.product.id,
          title: i.product.title,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl
        })),
        totalAmount,
        status: 'pending',
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await submitOrder(newOrder);
      setOrderSuccess(newOrder as Order);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء تسجيل طلب السلة. يمكنك الطلب مباشرة عبر الواتساب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-base text-gray-900">سلة التسوق</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.length} منتجات
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setIsCheckingOut(false);
              setOrderSuccess(null);
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {orderSuccess ? (
            <div className="text-center py-10 px-2 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-gray-900">
                تم تسجيل طلب السلة بنجاح!
              </h3>
              <p className="text-xs text-gray-600">
                رقم الطلب: <strong className="font-mono text-amber-700">{orderSuccess.orderNumber}</strong>
              </p>
              <p className="text-xs text-gray-500">
                المجموع للدفع عند الاستلام: <strong className="font-mono text-emerald-700">{orderSuccess.totalAmount.toLocaleString()} دج</strong>
              </p>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setIsCartOpen(false);
                  setIsCheckingOut(false);
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-xl transition"
              >
                مواصلة التسوق
              </button>
            </div>
          ) : isCheckingOut ? (
            /* COD Checkout Form inside Drawer */
            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-900">بيانات التوصيل (الدفع عند الاستلام)</span>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-amber-700 font-bold hover:underline"
                >
                  العودة للمنتجات
                </button>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم واللقب</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="w-full bg-gray-50 text-xs rounded-xl pr-9 pl-3 py-2 border border-gray-200 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05 / 06 / 07 XX XX XX XX"
                    dir="ltr"
                    className="w-full bg-gray-50 text-xs rounded-xl pr-9 pl-3 py-2 border border-gray-200 focus:border-amber-500 outline-none font-mono text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الولاية</label>
                  <select
                    value={wilayaCode}
                    onChange={(e) => {
                      setWilayaCode(e.target.value);
                      const f = ALGERIA_WILAYAS.find(w => w.code === e.target.value);
                      if (f && f.communes.length > 0) setCommune(f.communes[0]);
                    }}
                    className="w-full bg-gray-50 text-xs rounded-xl px-2 py-2 border border-gray-200 focus:border-amber-500 outline-none"
                  >
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w.code} value={w.code}>{w.code} - {w.nameAr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البلدية</label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="البلدية"
                    className="w-full bg-gray-50 text-xs rounded-xl px-3 py-2 border border-gray-200 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">طريقة الاستلام</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('home')}
                    className={`p-2 rounded-xl border text-right ${
                      deliveryType === 'home'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div>توصيل للمنزل</div>
                    <div className="font-mono text-[11px] text-amber-700 font-bold">{currentWilaya.homeDeliveryFee} دج</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('desk')}
                    className={`p-2 rounded-xl border text-right ${
                      deliveryType === 'desk'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div>مكتب التوصيل</div>
                    <div className="font-mono text-[11px] text-amber-700 font-bold">
                      {currentWilaya.deskDeliveryFee === 0 ? 'مجاناً بالمحل' : `${currentWilaya.deskDeliveryFee} دج`}
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition cursor-pointer"
              >
                {isSubmitting ? 'جارِ التأكيد...' : `تأكيد طلب السلة (${totalAmount.toLocaleString()} دج)`}
              </button>
            </form>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-semibold">سلة التسوق فارغة حالياً</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                تصفح أجهزة ONE phone الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-100"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                        {item.product.title}
                      </h4>
                      <div className="text-[11px] font-mono font-bold text-amber-600">
                        {item.product.price.toLocaleString()} دج
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && !isCheckingOut && !orderSuccess && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/80 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-bold text-gray-900">{subtotal.toLocaleString()} دج</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[11px]">
                <span>التوصيل:</span>
                <span>يحسب حسب ولاية التسليم (يبدأ من 0 دج)</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <span>متابعة الطلب والدفع عند الاستلام</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <button
                onClick={() => {
                  const summary = cart
                    .map(i => `- ${i.quantity}x ${i.product.title} (${i.product.price.toLocaleString()} دج)`)
                    .join('\n');
                  openWhatsAppChat(
                    `سلام عليكم محل ONE phone قسنطينة 📱\nأريد تأكيد طلب المنتجات التالية في السلة:\n${summary}\n\nالمجموع: ${subtotal.toLocaleString()} دج.\nهل هي متوفرة للشحن اليوم؟`
                  );
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>الطلب السريع عبر الواتساب</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
