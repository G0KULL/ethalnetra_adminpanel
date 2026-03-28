import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Search, Package, Printer, FileText, ChevronRight, Hash, X, Trash2, ArrowLeft, Calendar, User, Receipt } from 'lucide-react';
import api from '../services/api';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '', invoice_number: '', notes: '', shipping: 0, overall_discount: 0, total_amount: 0, items: []
  });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, unit: 'piece', price: 0, subtotal: 0 });

  const resetForm = () => {
    setFormData({
      supplier_id: '', invoice_number: '', notes: '', shipping: 0, overall_discount: 0, total_amount: 0, items: []
    });
    setNewItem({ product_id: '', quantity: 1, unit: 'piece', price: 0, subtotal: 0 });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, prodRes, supRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/products'),
        api.get('/suppliers')
      ]);
      setPurchases(pRes.data);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItemToPurchase = () => {
    if (!newItem.product_id || newItem.quantity <= 0) return;
    const itemSubtotal = newItem.quantity * newItem.price;
    const items = [...formData.items, { ...newItem, subtotal: itemSubtotal }];
    const total = items.reduce((acc, i) => acc + i.subtotal, 0) + formData.shipping - formData.overall_discount;
    setFormData({ ...formData, items, total_amount: total });
    setNewItem({ product_id: '', quantity: 1, unit: 'piece', price: 0, subtotal: 0 });
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Add at least one item');
    try {
      await api.post('/purchases', { ...formData, purchase_date: new Date().toISOString() });
      setShowForm(false);
      fetchData();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{showForm ? 'New Purchase Intake' : 'Inward Tracking'}</h1>
          <p className="text-gray-500">{showForm ? 'Verify and record incoming inventory shipments.' : 'Record inventory intake and supplier invoices.'}</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={20} /> Create Purchase
          </button>
        )}
      </div>

      {!showForm ? (
        <div className="glass-card rounded-[40px] overflow-hidden p-4 animate-in fade-in duration-500">
          <div className="space-y-4">
             {loading ? (
               <div className="py-10 text-center text-gray-400 font-bold animate-pulse">Synchronizing inventory logs...</div>
             ) : purchases.map(pur => (
               <div key={pur.id} className="p-6 bg-gray-50/50 rounded-3xl border-2 border-transparent hover:border-primary-50 hover:bg-white transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary-100/10">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-white rounded-2xl shadow-sm text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <Receipt size={24} />
                     </div>
                     <div>
                        <div className="font-black text-gray-900 flex items-center gap-3">
                           Invoice #{pur.invoice_number}
                           <span className="bg-primary-50 text-primary-600 text-[9px] uppercase font-black px-2 py-1 rounded-lg tracking-widest border border-primary-100">Verified</span>
                        </div>
                        <div className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-2">
                           <User size={14} className="text-gray-300" /> {suppliers.find(s => s.id === pur.supplier_id)?.company_name || 'Vendor'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2 flex items-center gap-1.5 opacity-60">
                           <Calendar size={12} /> {new Date(pur.purchase_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-12">
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1.5">Load Size</p>
                        <p className="font-black text-gray-900">{pur.item_count || 0} Batches</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1.5">Net Payable</p>
                        <p className="text-2xl font-black text-primary-600 tracking-tighter">₹{pur.total_amount.toLocaleString()}</p>
                     </div>
                     <div className="w-10 h-10 flex border rounded-xl items-center justify-center text-gray-300 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
                        <ChevronRight size={20} />
                     </div>
                  </div>
               </div>
             ))}
             {purchases.length === 0 && (
               <div className="py-20 text-center">
                  <Package size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold italic">No inward records found.</p>
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="mb-6">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Records
            </button>
          </div>

          <div className="glass-card rounded-[40px] overflow-hidden">
             <div className="p-10 border-b bg-gray-50/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200"><ShoppingCart size={24} /></div>
                   <h2 className="text-2xl font-black tracking-tight">Inventory Intake Form</h2>
                </div>
             </div>
             
             <div className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Supplier / Vendor</label>
                    <select required value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner">
                        <option value="">Choose Supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Supplier Invoice Ref.</label>
                    <input required value={formData.invoice_number} onChange={e => setFormData({...formData, invoice_number: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner" placeholder="INV/2024/000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Shipping Fees (₹)</label>
                    <input type="number" value={formData.shipping} onChange={e => setFormData({...formData, shipping: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-black text-gray-900 transition-all shadow-inner" />
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 border-l-4 border-primary-500 pl-3">Purchase Manifest</h3>
                   <div className="bg-primary-50/30 p-8 rounded-[32px] grid grid-cols-1 md:grid-cols-5 gap-6 items-end border-2 border-dashed border-primary-100">
                      <div className="col-span-2 space-y-2">
                         <label className="text-[10px] font-black uppercase text-primary-700 ml-1">Select Received Item</label>
                         <select value={newItem.product_id} onChange={e => setNewItem({...newItem, product_id: e.target.value})} className="w-full px-5 py-4 bg-white border-2 border-primary-100 rounded-2xl outline-none font-black text-gray-900 h-[64px]">
                            <option value="">Select Product...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-primary-700 ml-1">Quantity</label>
                         <input type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} className="w-full px-5 py-4 bg-white border-2 border-primary-100 rounded-2xl outline-none font-black" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-primary-700 ml-1">Purchase Cost/Unit</label>
                         <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full px-5 py-4 bg-white border-2 border-primary-100 rounded-2xl outline-none font-black" />
                      </div>
                      <button type="button" onClick={addItemToPurchase} className="bg-primary-600 hover:bg-primary-700 text-white px-8 h-[64px] rounded-2xl font-black shadow-xl shadow-primary-200 transition-all flex items-center justify-center gap-2 transform active:scale-95 leading-none">
                         <Plus size={20} /> Add to Load
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      {formData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-white border-2 border-gray-50 rounded-3xl hover:border-primary-100 transition-all group">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-primary-50 group-hover:text-primary-400 transition-colors"><Package size={20} /></div>
                              <div>
                                 <p className="font-black text-gray-900 leading-none mb-1">{products.find(p => p.id === item.product_id)?.name}</p>
                                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.quantity} units @ ₹{item.price}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-10">
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Subtotal</p>
                                 <p className="font-black text-primary-600">₹{item.subtotal.toLocaleString()}</p>
                              </div>
                              <button onClick={() => {
                                 const items = formData.items.filter((_, i) => i !== idx);
                                 setFormData({...formData, items});
                              }} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all"><Trash2 size={20} /></button>
                           </div>
                        </div>
                      ))}
                      {formData.items.length === 0 && (
                        <div className="py-12 border-2 border-dashed border-gray-50 rounded-[32px] text-center">
                           <p className="text-sm font-bold text-gray-300 italic uppercase">No items added to this purchase load yet.</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             <div className="p-10 border-t bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-baseline gap-6">
                   <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Net Freight & Goods</p>
                      <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none">₹{formData.total_amount.toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest text-sm hover:text-gray-600 transition-colors">Discard</button>
                   <button onClick={handleCreatePurchase} className="px-20 py-6 bg-primary-600 hover:bg-primary-700 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary-200 transition-all transform hover:scale-105 active:scale-95">Complete Intake</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
