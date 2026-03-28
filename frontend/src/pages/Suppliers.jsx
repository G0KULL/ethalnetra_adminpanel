import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, Phone, Mail, MapPin, ArrowLeft, Briefcase, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', company_name: '', email: '', phone: '',
    gstin: '', address: '', city: '', state: '', pincode: '',
    payment_terms: 'cash', credit_limit: 0, notes: '', is_active: true
  });
  const [editingId, setEditingId] = useState(null);

  const fetchSuppliers = async () => {
    const res = await api.get('/suppliers');
    setSuppliers(res.data);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key, 
        value === '' ? null : value
      ])
    );

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, cleanedData);
      } else {
        await api.post('/suppliers', cleanedData);
      }
      setShowForm(false);
      fetchSuppliers();
      resetForm();
    } catch (err) {
       console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', company_name: '', email: '', phone: '',
      gstin: '', address: '', city: '', state: '', pincode: '',
      payment_terms: 'cash', credit_limit: 0, notes: '', is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (sup) => {
    setFormData(sup);
    setEditingId(sup.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete supplier?')) {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{showForm ? (editingId ? 'Edit Supplier' : 'Onboard Supplier') : 'Suppliers'}</h1>
          <p className="text-gray-500">{showForm ? 'Enter the professional details of your vendor.' : 'Manage your product vendors.'}</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={20} /> Add Supplier
          </button>
        )}
      </div>

      {!showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          {suppliers.map(sup => (
            <div key={sup.id} className="glass-card p-10 rounded-[40px] group border-2 border-transparent hover:border-primary-100 transition-all hover:shadow-2xl hover:shadow-primary-100/20">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary-200">
                      {sup.company_name ? sup.company_name[0] : 'S'}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 leading-none">{sup.company_name}</h3>
                      <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-1.5">
                         <Users size={14} /> {sup.name}
                      </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleEdit(sup)} className="p-3 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                   <button onClick={() => handleDelete(sup.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-dashed pt-8 border-gray-100">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Contact Number</p>
                    <div className="flex items-center gap-2.5 text-sm font-black text-gray-700">
                       <Phone size={14} className="text-primary-400" /> {sup.phone}
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Email Address</p>
                    <div className="flex items-center gap-2.5 text-sm font-black text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
                       <Mail size={14} className="text-primary-400" /> {sup.email || 'N/A'}
                    </div>
                 </div>
                 <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Warehouse Location</p>
                    <div className="flex items-center gap-2.5 text-sm font-black text-gray-700">
                       <MapPin size={14} className="text-primary-400" /> {sup.city || 'Kerala'}, {sup.state || 'IN'}
                    </div>
                 </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-50 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1">Payment Method</span>
                    <span className="text-xs font-black text-primary-700 uppercase">{sup.payment_terms.replace('_', ' ')}</span>
                 </div>
                 <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Credit Facility</span>
                    <span className="text-xs font-black text-gray-900">₹{sup.credit_limit.toLocaleString()}</span>
                 </div>
              </div>
            </div>
          ))}
          {suppliers.length === 0 && <p className="text-gray-400 italic">No suppliers found.</p>}
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="mb-6">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Directory
            </button>
          </div>

          <div className="glass-card rounded-[40px] overflow-hidden max-w-4xl">
             <form onSubmit={handleSubmit} className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Business Identity</h3>
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-sm font-bold text-gray-700 ml-1">Company / Legal Name</label>
                               <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner" placeholder="Acme International" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-bold text-gray-700 ml-1">Contact Person Name</label>
                               <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-bold text-gray-700 ml-1">GSTIN (Optional)</label>
                               <input value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 uppercase transition-all shadow-inner" placeholder="32AAAAA0000A1Z5" />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Communication</h3>
                          <div className="grid grid-cols-1 gap-6">
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Official Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner" />
                             </div>
                          </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Address Details</h3>
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-sm font-bold text-gray-700 ml-1">Street Address</label>
                               <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-medium text-gray-900 transition-all shadow-inner" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-medium text-gray-900 transition-all shadow-inner" />
                               <input placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-medium text-gray-900 transition-all shadow-inner" />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Financial Terms</h3>
                         <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                               <label className="text-sm font-bold text-gray-700 ml-1">Payment Policy</label>
                               <select value={formData.payment_terms} onChange={e => setFormData({...formData, payment_terms: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all shadow-inner">
                                   <option value="cash">Immidiate Cash</option>
                                   <option value="credit_7">7 Days Credit</option>
                                   <option value="credit_15">15 Days Credit</option>
                                   <option value="credit_30">30 Days Credit</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-sm font-bold text-gray-700 ml-1">Credit Limit (₹)</label>
                               <input type="number" value={formData.credit_limit} onChange={e => setFormData({...formData, credit_limit: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-black text-primary-600 transition-all shadow-inner text-xl" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t flex justify-end gap-6">
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest text-sm hover:text-gray-600 transition-colors">Discard</button>
                  <button type="submit" className="px-16 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary-200 transform hover:scale-105 active:scale-95">
                    Register Supplier
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
