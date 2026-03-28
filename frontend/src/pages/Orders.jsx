import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Eye, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  CheckSquare, 
  XCircle,
  Calendar,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  Download,
  CreditCard
} from 'lucide-react';
import api from '../services/api';

const OrderStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-purple-100 text-purple-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  
  const icons = {
    pending: <Clock size={12} />,
    confirmed: <CheckCircle size={12} />,
    packed: <Package size={12} />,
    shipped: <Truck size={12} />,
    delivered: <CheckSquare size={12} />,
    cancelled: <XCircle size={12} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100"}`}>
      {icons[status]} {status}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    pincode: '',
    date: ''
  });
  const [search, setSearch] = useState('');

  const handlePayment = async (order) => {
    try {
      const res = await api.post('/payments/create-order', { order_id: order.id });
      const { key_id, razorpay_order_id, amount, currency } = res.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Ethalnethra",
        description: `Payment for Order #${order.order_id_string || order.id}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert('Payment Successful!');
            fetchOrders();
            if (selectedOrder && selectedOrder.id === order.id) {
               const detailRes = await api.get(`/orders/${order.id}`);
               setSelectedOrder(detailRes.data);
            }
          } catch (err) {
            console.error(err);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: order.customer_name,
          contact: order.customer_phone
        },
        theme: {
          color: "#10b981"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment: ' + (err.response?.data?.detail || err.message));
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/orders';
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.pincode) params.append('pincode', filters.pincode);
      if (filters.date) {
        params.append('start_date', filters.date + 'T00:00:00');
        params.append('end_date', filters.date + 'T23:59:59');
      }
      
      const res = await api.get(url + (params.toString() ? `?${params.toString()}` : ''));
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}`, { order_status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const res = await api.get(`/orders/${orderId}`);
        setSelectedOrder(res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    o.order_id_string?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  if (selectedOrder) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Orders
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Order Details 
              <span className="text-gray-300 font-medium">#{selectedOrder.order_id_string}</span>
            </h1>
            <p className="text-gray-500">Placed on {new Date(selectedOrder.order_date).toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={selectedOrder.order_status}
              onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
              className="bg-white border-2 border-primary-100 rounded-xl px-4 py-2 font-bold outline-none focus:border-primary-500 transition-all text-sm"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {selectedOrder.payment_status !== 'paid' && selectedOrder.order_status !== 'cancelled' && (
              <button 
                onClick={() => handlePayment(selectedOrder)}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
              >
                <CreditCard size={18} /> Pay Now
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <div className="glass-card rounded-3xl overflow-hidden p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package size={20} className="text-primary-500" /> Order Items
              </h3>
              <div className="divide-y divide-gray-100">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-primary-600">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.product_name}</p>
                        <p className="text-xs text-gray-400 capitalize">{item.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{item.subtotal.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">₹{item.price} per unit</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Shipping</span>
                  <span>₹{selectedOrder.shipping_charge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary-600">₹{selectedOrder.final_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer & Delivery Card */}
            <div className="glass-card rounded-3xl p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                   <User size={14} /> Customer Info
                </h3>
                <div>
                  <p className="font-bold text-lg">{selectedOrder.customer_name}</p>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                    <Phone size={14} /> {selectedOrder.customer_phone}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                   <MapPin size={14} /> Delivery Address
                </h3>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {selectedOrder.delivery_address}
                </p>
                <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase mt-2">
                  Pincode: {selectedOrder.pincode}
                </div>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                   Status Info
                </h3>
                <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                      <span className="text-sm font-bold text-gray-500">Order</span>
                      <OrderStatusBadge status={selectedOrder.order_status} />
                   </div>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                      <span className="text-sm font-bold text-gray-500">Payment</span>
                      <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase ${
                        selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                        selectedOrder.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedOrder.payment_status}
                      </span>
                   </div>
                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                      <span className="text-sm font-bold text-gray-500">Method</span>
                      <span className="text-sm font-black text-gray-700 uppercase">{selectedOrder.payment_method}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-500">Track and manage customer orders.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID, Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-primary-100 focus:bg-white outline-none transition-all font-medium text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={18} />
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 font-medium outline-none focus:border-primary-100 focus:bg-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pincode" 
            value={filters.pincode}
            onChange={(e) => setFilters({...filters, pincode: e.target.value})}
            className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 font-medium outline-none focus:border-primary-100 focus:bg-white text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="text-gray-400" size={18} />
          <input 
            type="date" 
            value={filters.date}
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="flex-1 bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 font-medium outline-none focus:border-primary-100 focus:bg-white text-sm"
          />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                    <span className="text-gray-400 font-bold uppercase tracking-tighter text-xs">Loading Orders...</span>
                  </div>
                </td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-20 text-gray-400">No orders found.</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-primary-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-black text-gray-500 uppercase">
                      {order.order_id_string || order.id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-800">{order.customer_name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {order.pincode}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-primary-600">
                    ₹{order.final_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-5">
                    <OrderStatusBadge status={order.order_status} />
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {order.payment_status !== 'paid' && order.order_status !== 'cancelled' && (
                        <button 
                          onClick={() => handlePayment(order)}
                          className="p-2.5 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition-all"
                          title="Pay Now"
                        >
                          <CreditCard size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:shadow-lg rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
