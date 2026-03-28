import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  CheckSquare, 
  XCircle,
  TrendingUp,
  PackageCheck,
  LayoutGrid
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
    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black uppercase ${styles[status] || "bg-gray-100"}`}>
      {icons[status]} {status}
    </span>
  );
};

const OrdersByPincode = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState('');
  const [pincodes, setPincodes] = useState([]);

  // Fetch all orders to get unique pincodes
  const fetchAllOrdersForPincodes = async () => {
    try {
      const res = await api.get('/orders');
      const uniquePincodes = [...new Set(res.data.map(o => o.pincode))].sort();
      setPincodes(uniquePincodes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrdersByPincode = async (pincode) => {
    if (!pincode) {
      setOrders([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/orders?pincode=${pincode}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrdersForPincodes();
  }, []);

  useEffect(() => {
    if (selectedPincode) {
       fetchOrdersByPincode(selectedPincode);
    }
  }, [selectedPincode]);

  const stats = {
     total: orders.length,
     delivered: orders.filter(o => o.order_status === 'delivered').length,
     pending: orders.filter(o => o.order_status === 'pending').length,
     amount: orders.reduce((sum, o) => sum + o.final_amount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Delivery Planning</h1>
          <p className="text-gray-500">Group and manage orders by delivery pincode.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
         <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full space-y-2">
               <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin size={16} className="text-primary-600" /> Select Delivery Pincode
               </label>
               <select 
                  value={selectedPincode}
                  onChange={(e) => setSelectedPincode(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 font-bold outline-none focus:border-primary-100 focus:bg-white transition-all text-lg"
               >
                  <option value="">Choose a pincode...</option>
                  {pincodes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
               </select>
            </div>
            {selectedPincode && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                   <div className="bg-primary-50 px-6 py-4 rounded-3xl text-center">
                      <p className="text-[10px] uppercase font-black text-primary-400 tracking-tighter">Orders</p>
                      <p className="text-2xl font-black text-primary-700">{stats.total}</p>
                   </div>
                   <div className="bg-green-50 px-6 py-4 rounded-3xl text-center">
                      <p className="text-[10px] uppercase font-black text-green-400 tracking-tighter">Delivered</p>
                      <p className="text-2xl font-black text-green-700">{stats.delivered}</p>
                   </div>
                   <div className="bg-yellow-50 px-6 py-4 rounded-3xl text-center">
                      <p className="text-[10px] uppercase font-black text-yellow-400 tracking-tighter">Pending</p>
                      <p className="text-2xl font-black text-yellow-700">{stats.pending}</p>
                   </div>
                   <div className="bg-orange-50 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                      <p className="text-[10px] uppercase font-black text-orange-400 tracking-tighter">Revenue</p>
                      <p className="text-2xl font-black text-orange-700">₹{stats.amount.toFixed(0)}</p>
                   </div>
               </div>
            )}
         </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : selectedPincode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm bg-white rounded-3xl">No orders found for this area.</div>
          ) : orders.map((order) => (
            <div key={order.id} className="glass-card rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-primary-100 transition-all border border-transparent hover:border-primary-50 group">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-gray-400">OrderID</p>
                    <p className="font-bold text-gray-900">#{order.order_id_string || order.id.substring(0,8)}</p>
                  </div>
                  <OrderStatusBadge status={order.order_status} />
                </div>
                
                <div className="h-px bg-gray-50 w-full" />
                
                <div className="space-y-3">
                   <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                         <MapPin size={20} />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Destination</p>
                         <p className="text-sm font-bold text-gray-700 leading-snug line-clamp-2">{order.delivery_address}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                         <Users size={20} />
                      </div>
                      <div className="flex-1">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Customer</p>
                         <p className="text-sm font-bold text-gray-700">{order.customer_name}</p>
                         <p className="text-xs text-primary-500 font-bold">{order.customer_phone}</p>
                      </div>
                   </div>
                </div>

                <div className="h-px bg-gray-50 w-full" />

                <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl group-hover:bg-primary-50 transition-colors">
                   <div className="flex items-center gap-2">
                       <Package size={16} className="text-gray-400" />
                       <span className="text-xs font-black text-gray-500">{order.items.length} Items</span>
                   </div>
                   <p className="text-lg font-black text-gray-900">₹{order.final_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center text-primary-200">
               <MapPin size={48} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-gray-800">Select an Area</h3>
               <p className="text-gray-400 max-w-xs mx-auto mt-2 font-medium">Please select a pincode from the dropdown above to view delivery details for that region.</p>
            </div>
        </div>
      )}
    </div>
  );
};

// Mock Users icon since it wasn't imported properly in previous turn but is used in my mental snippet
import { Users } from 'lucide-react';

export default OrdersByPincode;
