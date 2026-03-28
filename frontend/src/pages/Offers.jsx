import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Search, CheckCircle, XCircle, ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', offer_type: 'percentage', discount_value: 0, 
    applies_to: 'product', applicable_ids: [], start_date: '', end_date: '', is_active: true
  });
  const [bannerFile, setBannerFile] = useState(null);

  const fetchOffers = async () => {
    const res = await api.get('/offers');
    setOffers(res.data);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const payload = { ...formData, applicable_ids: [] }; 
    data.append('data', JSON.stringify(payload));
    if (bannerFile) data.append('banner', bannerFile);

    try {
      await api.post('/offers', data);
      setShowForm(false);
      fetchOffers();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', offer_type: 'percentage', discount_value: 0, 
      applies_to: 'product', applicable_ids: [], start_date: '', end_date: '', is_active: true
    });
    setBannerFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete offer?')) {
      await api.delete(`/offers/${id}`);
      fetchOffers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{showForm ? 'Create Campaign' : 'Offers & Discounts'}</h1>
          <p className="text-gray-500">{showForm ? 'Set up your promotional discount details.' : 'Manage promotional campaigns.'}</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={20} /> New Offer
          </button>
        )}
      </div>

      {!showForm ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {offers.map(offer => (
            <div key={offer.id} className="glass-card rounded-[32px] overflow-hidden group hover:shadow-2xl hover:shadow-primary-100 transition-all border border-transparent hover:border-primary-100">
              <div className="h-40 bg-gray-50 relative overflow-hidden">
                {offer.banner_image_url ? (
                  <img src={`http://localhost:8000${offer.banner_image_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : <div className="w-full h-full flex items-center justify-center text-primary-200"><Tag size={48} /></div>}
                
                <div className="absolute top-4 left-4">
                   <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1.5 ${offer.is_active ? 'bg-green-500/20 text-green-700 border border-green-200' : 'bg-red-500/20 text-red-700 border border-red-200'}`}>
                      {offer.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {offer.is_active ? 'Active' : 'Paused'}
                   </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors">{offer.title}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 italic">{offer.offer_type} discount model</p>
                </div>
                <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-black text-primary-600">
                      {offer.offer_type === 'percentage' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                   </span>
                   <span className="text-gray-400 font-bold text-sm">OFF</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed pt-6">
                   <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        Until {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                   </div>
                   <button onClick={() => handleDelete(offer.id)} className="text-red-400 hover:text-red-100 hover:bg-red-500 p-2.5 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card rounded-[40px] bg-dashed border-2">
               <Tag size={48} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-bold text-lg italic">No promotional campaigns at the moment.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="mb-6">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Campaigns
            </button>
          </div>

          <div className="glass-card rounded-[40px] overflow-hidden max-w-2xl">
             <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Campaign Title</label>
                      <input required placeholder="Summer Flash Sale 2024" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all text-lg" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Discount Type</label>
                        <select value={formData.offer_type} onChange={e => setFormData({...formData, offer_type: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all">
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Amount (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Discount Value</label>
                        <input required type="number" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-black text-primary-600 transition-all text-lg" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Start Date</label>
                         <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">End Date</label>
                         <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Promo Banner</label>
                      <div className="relative group">
                        <input type="file" id="o-banner" onChange={e => setBannerFile(e.target.files[0])} className="hidden" />
                        <label htmlFor="o-banner" className="flex items-center gap-4 p-5 bg-primary-50/30 rounded-2xl border-2 border-dashed border-primary-100 cursor-pointer group-hover:bg-primary-50 transition-colors">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-500 shadow-sm"><ImageIcon size={20} /></div>
                           <span className="text-sm font-bold text-primary-900">{bannerFile ? bannerFile.name : 'Select JPG/PNG/WebP Files'}</span>
                        </label>
                      </div>
                   </div>
                </div>

                <div className="pt-8 flex gap-6">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-sm hover:text-gray-600 transition-colors">Discard</button>
                  <button type="submit" className="flex-2 px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary-200">
                    Launch Campaign
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
