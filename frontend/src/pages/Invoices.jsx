import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Eye, 
  Search, 
  X, 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  FileDown,
  User,
  ShoppingBag
} from 'lucide-react';
import api from '../services/api';

const InvoiceStatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  
  const icons = {
    draft: <FileText size={12} />,
    sent: <Clock size={12} />,
    paid: <CheckCircle size={12} />,
    cancelled: <AlertCircle size={12} />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase ${styles[status] || "bg-gray-100"}`}>
      {icons[status]} {status}
    </span>
  );
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    order_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    tax_calculation: 0
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      // Filter orders that don't have invoices yet (backend validation handles it too)
      // For now, list all non-cancelled orders
      setOrders(res.data.filter(o => o.order_status !== 'cancelled'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', formData);
      setShowForm(false);
      resetForm();
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to create invoice');
    }
  };

  const handleStatusChange = async (id, status) => {
     try {
        await api.patch(`/invoices/${id}`, { status });
        fetchInvoices();
        if (selectedInvoice && selectedInvoice.id === id) {
           const res = await api.get(`/invoices/${id}`);
           setSelectedInvoice(res.data);
        }
     } catch (err) {
        console.error(err);
     }
  };

  const resetForm = () => {
    setFormData({
      order_id: '',
      invoice_date: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: '',
      tax_calculation: 0
    });
  };

  if (selectedInvoice) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedInvoice(null)}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Invoices
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Tax Invoice 
              <span className="text-gray-300 font-medium">#{selectedInvoice.invoice_number}</span>
            </h1>
            <p className="text-gray-500">Issued on {new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-white border-2 border-gray-100 hover:border-primary-100 hover:text-primary-600 px-5 py-2.5 rounded-2xl font-bold transition-all text-sm">
                <Printer size={18} /> Print
             </button>
             <select 
              value={selectedInvoice.status}
              onChange={(e) => handleStatusChange(selectedInvoice.id, e.target.value)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold outline-none shadow-lg shadow-primary-100 transition-all text-sm"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl p-12 border border-gray-100 max-w-4xl mx-auto overflow-hidden relative">
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <FileDown size={200} className="text-primary-600" />
           </div>

           <div className="flex justify-between items-start relative z-10">
              <div>
                 <h2 className="text-4xl font-black text-primary-600 tracking-tighter mb-1">Ethalnethra</h2>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">Grocery Hub</p>
                 <div className="mt-8 text-sm text-gray-500 leading-relaxed font-medium">
                    123 Marketplace Plaza<br />
                    Kochi, Kerala 682001<br />
                    support@ethalnethra.com
                 </div>
              </div>
              <div className="text-right">
                 <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Invoice To</h3>
                 <p className="text-2xl font-black text-gray-900">{selectedInvoice.customer_name}</p>
                 <p className="text-xs font-bold text-primary-600 mt-1 uppercase tracking-tighter bg-primary-50 px-3 py-1 rounded-lg inline-block">Order Ref: {selectedInvoice.order_id.substring(0,8)}</p>
              </div>
           </div>

           <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="space-y-1">
                 <p className="text-xs font-black uppercase text-gray-400">Date Issued</p>
                 <p className="font-bold">{new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black uppercase text-gray-400">Invoice Status</p>
                 <InvoiceStatusBadge status={selectedInvoice.status} />
              </div>
              {selectedInvoice.status === 'paid' && (
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase text-gray-400">Payment Status</p>
                    <p className="text-green-600 font-black uppercase text-sm">Verified Online</p>
                 </div>
              )}
           </div>

           <div className="mt-16 relative z-10">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b-2 border-gray-50">
                       <tr>
                          <th className="py-4 text-xs font-black uppercase text-gray-400 tracking-widest">Description</th>
                          <th className="py-4 text-right text-xs font-black uppercase text-gray-400 tracking-widest">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       <tr className="hover:bg-gray-50/50">
                          <td className="py-6">
                             <p className="font-bold text-lg text-gray-800">Order Subtotal</p>
                             <p className="text-sm text-gray-400">Main value of items purchased from Ethalnethra</p>
                          </td>
                          <td className="py-6 text-right font-bold text-lg">
                             ₹{(selectedInvoice.grand_total - selectedInvoice.tax_calculation).toFixed(2)}
                          </td>
                       </tr>
                       {selectedInvoice.tax_calculation > 0 && (
                          <tr className="hover:bg-gray-50/50">
                             <td className="py-6">
                                <p className="font-bold text-lg text-gray-800">Tax Calculation</p>
                                <p className="text-sm text-gray-400">Applicable taxes and levies</p>
                             </td>
                             <td className="py-6 text-right font-bold text-lg text-primary-500">
                                +₹{selectedInvoice.tax_calculation.toFixed(2)}
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="mt-12 flex justify-end relative z-10">
              <div className="w-full lg:w-1/3 bg-gray-50 rounded-3xl p-8 space-y-4">
                 <div className="flex justify-between items-center text-gray-500 font-bold uppercase tracking-tighter text-sm">
                    <span>Subtotal</span>
                    <span>₹{(selectedInvoice.grand_total - selectedInvoice.tax_calculation).toFixed(2)}</span>
                 </div>
                 <div className="h-px bg-gray-200" />
                 <div className="flex justify-between items-center text-2xl font-black text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">₹{selectedInvoice.grand_total.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           <div className="mt-12 p-8 border-t-2 border-dashed border-gray-100 relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm text-gray-500 font-medium italic leading-relaxed">
                 {selectedInvoice.notes || "Thank you for shopping with Ethalnethra! For any queries regarding this invoice, please reach out to our support team."}
              </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-gray-500">Generate and track customer invoices.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={20} /> Create Invoice
          </button>
        )}
      </div>

      {showForm ? (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="mb-6">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Invoices
            </button>
          </div>

          <div className="glass-card rounded-[40px] overflow-hidden">
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Order Selection</h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Select Order</label>
                        <select 
                          required 
                          value={formData.order_id}
                          onChange={e => setFormData({...formData, order_id: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                        >
                          <option value="">-- Choose an Order --</option>
                          {orders.map(o => (
                            <option key={o.id} value={o.id}>
                               {o.order_id_string || o.id.substring(0,8)} - {o.customer_name} (₹{o.final_amount})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-700">Invoice Date</label>
                         <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                              type="date" 
                              required
                              value={formData.invoice_date}
                              onChange={e => setFormData({...formData, invoice_date: e.target.value})}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Amount & Status</h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Tax Amount (₹)</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                              type="number" 
                              value={formData.tax_calculation}
                              onChange={e => setFormData({...formData, tax_calculation: parseFloat(e.target.value)})}
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                              placeholder="0.00"
                            />
                        </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-700">Status</label>
                         <select 
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all"
                         >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                         </select>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                   <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Internal Notes</h3>
                   <textarea 
                     value={formData.notes}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                     placeholder="Additional information for the customer or internal team..."
                     className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-3xl outline-none font-medium h-32 transition-all"
                   />
                </div>
              </div>

              <div className="pt-8 border-t flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary-100"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-xs font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5">Invoice #</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-bold uppercase tracking-tighter">Loading invoices...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400">No invoices generated yet.</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-primary-50/30 transition-all group">
                    <td className="px-6 py-5">
                      <span className="font-black text-gray-900 group-hover:text-primary-600 transition-colors">{inv.invoice_number}</span>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-700">{inv.customer_name}</td>
                    <td className="px-6 py-5 font-black text-primary-600">₹{inv.grand_total.toFixed(2)}</td>
                    <td className="px-6 py-5">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-3 bg-white border border-gray-100 group-hover:border-primary-100 rounded-xl text-gray-400 group-hover:text-primary-600 transition-all hover:shadow-lg"
                      >
                         <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
