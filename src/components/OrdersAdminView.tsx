import React, { useState, useEffect } from 'react';
import {
  Package,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RefreshCw,
  Search,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Order } from '../types';
import { fetchStoreOrders, updateOrderStatus } from '../lib/firebase';
import { useCart } from '../context/CartContext';

export const OrdersAdminView: React.FC = () => {
  const { openWhatsAppChat } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStoreOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.phone.includes(searchFilter) ||
      o.orderNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.wilayaName.includes(searchFilter);
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> قيد المراجعة
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> تم التأكيد هاتفياً
          </span>
        );
      case 'shipping':
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" /> مع شركة التوصيل (Yalidine)
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> تم الاستلام والدفع
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" /> ملغي
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 py-6 space-y-6">
      {/* Dashboard Top Stats */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 text-white rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
              لوحة تحكم محل ONE phone قسنطينة
            </span>
            <h1 className="text-xl sm:text-2xl font-black">
              إدارة طلبات الدفع عند الاستلام (COD)
            </h1>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold px-3 py-1.5 rounded-xl transition self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-gray-400 block text-[11px]">إجمالي الطلبات</span>
            <span className="text-xl font-black font-mono text-white">{orders.length}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-gray-400 block text-[11px]">قيد المراجعة</span>
            <span className="text-xl font-black font-mono text-amber-400">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-gray-400 block text-[11px]">في التوصيل</span>
            <span className="text-xl font-black font-mono text-purple-400">
              {orders.filter(o => o.status === 'shipping').length}
            </span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-gray-400 block text-[11px]">قيمة المبيعات التقديرية</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
              {totalRevenue.toLocaleString()} دج
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="بحث برقم الطلب، اسم الزبون، الولاية أو رقم الهاتف..."
            className="w-full bg-gray-50 text-xs rounded-xl pr-9 pl-3 py-2 border border-gray-200 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['all', 'pending', 'confirmed', 'shipping', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all'
                ? 'الكل'
                : st === 'pending'
                ? 'قيد الانتظار'
                : st === 'confirmed'
                ? 'مؤكدة'
                : st === 'shipping'
                ? 'في الطريق'
                : 'مستلمة'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-xs font-semibold">جارِ جلب الطلبات من Firestore...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm">لا توجد طلبات مطابقة حالياً</h3>
          <p className="text-xs text-gray-500">
            عندما يقوم أي زبون بتعبئة استمارة الدفع عند الاستلام، ستظهر تفاصيله هنا مباشرة للتأكيد والشحن.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id || order.orderNumber}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 space-y-3 hover:border-amber-400 transition"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  <span className="text-[11px] text-gray-400 font-mono">
                    {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Location */}
                <div className="bg-gray-50 rounded-xl p-2.5 space-y-1">
                  <span className="text-gray-400 text-[10px] block">عنوان التوصيل:</span>
                  <div className="flex items-start gap-1 text-gray-800 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>
                      {order.wilayaName} ({order.commune}) - {order.deliveryType === 'home' ? 'توصيل للمنزل' : 'مكتب التوصيل'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl p-2.5 space-y-1">
                  <span className="text-gray-400 text-[10px] block">المنتجات المطلوبة:</span>
                  <div className="space-y-0.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="font-bold text-gray-900 truncate">
                        {item.quantity}x {item.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-gray-50 rounded-xl p-2.5 space-y-1">
                  <span className="text-gray-400 text-[10px] block">المبلغ المستحق:</span>
                  <div className="text-base font-black text-amber-700 font-mono">
                    {order.totalAmount.toLocaleString()} دج
                  </div>
                  <span className="text-[10px] text-gray-500">شامل التوصيل ({order.deliveryFee} دج)</span>
                </div>
              </div>

              {/* Action Buttons: Call, WhatsApp, Status change */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${order.phone}`}
                    className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال ({order.phone})</span>
                  </a>

                  <button
                    onClick={() => openWhatsAppChat(
                      `سلام عليكم أخي ${order.customerName} 📱\nمعك مسؤول المبيعات من محل ONE phone قسنطينة بخصوص طلبك رقم ${order.orderNumber} لجهاز ${order.items[0]?.title || ''}.\nنريد تأكيد عنوان الشحن لولاية ${order.wilayaName} لتجهيز وإرسال الطرد اليوم عبر ياليدين. هل تؤكد الطلب؟`
                    )}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </button>
                </div>

                {/* Status select */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-gray-500 text-[11px]">تحديث الحالة:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id || order.orderNumber, e.target.value as Order['status'])}
                    className="bg-gray-100 text-xs font-bold rounded-lg px-2 py-1 border border-gray-200 outline-none"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="shipping">في التوصيل</option>
                    <option value="delivered">تم الاستلام</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
