import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, AlertCircle, Package, Image as ImageIcon, PlusCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', name_malayalam: '', sku: '', category_id: '',
    description: '', description_malayalam: '', price: 0, our_price: 0,
    stock: 0, unit: 'piece', is_active: true, is_preorder: false, is_custom_order: false
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [isQuickEdit, setIsQuickEdit] = useState(false);
  const [quickUpdateData, setQuickUpdateData] = useState({}); // { productId: { our_price, stock } }
  const [isSavingQuick, setIsSavingQuick] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('data', JSON.stringify(formData));
    if (thumbnailFile) data.append('thumbnail', thumbnailFile);
    if (mediaFiles.length > 0) {
      mediaFiles.forEach(file => data.append('media', file));
    }

    try {
      if (editingId) {
        // Update product logic (simplified for now)
        await api.put(`/products/${editingId}`, data);
      } else {
        await api.post('/products', data);
      }
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', name_malayalam: '', sku: '', category_id: '',
      description: '', description_malayalam: '', price: 0, our_price: 0,
      stock: 0, unit: 'piece', is_active: true, is_preorder: false, is_custom_order: false
    });
    setThumbnailFile(null);
    setMediaFiles([]);
    setEditingId(null);
  };

  const handleEdit = (p) => {
    setFormData({
      name: p.name, name_malayalam: p.name_malayalam, sku: p.sku, category_id: p.category_id,
      description: p.description, description_malayalam: p.description_malayalam,
      price: p.price, our_price: p.our_price, stock: p.stock, unit: p.unit,
      is_active: p.is_active, is_preorder: p.is_preorder, is_custom_order: p.is_custom_order
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleQuickUpdateSave = async () => {
    setIsSavingQuick(true);
    try {
      const updates = Object.keys(quickUpdateData).map(id => ({
        product_id: id,
        ...quickUpdateData[id]
      }));
      if (updates.length > 0) {
        await api.patch('/admin/products/quick-update', updates);
        setIsQuickEdit(false);
        setQuickUpdateData({});
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingQuick(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{showForm ? (editingId ? 'Edit Product' : 'New Product') : 'Products'}</h1>
          <p className="text-gray-500">{showForm ? 'Enter complete product specifications.' : 'Manage your product catalog.'}</p>
        </div>
        {!showForm && (
          <div className="flex gap-2">
            {!isQuickEdit ? (
                <button 
                onClick={() => setIsQuickEdit(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2"
                >
                Quick Update
                </button>
            ) : (
                <button 
                onClick={handleQuickUpdateSave}
                disabled={isSavingQuick}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-green-200"
                >
                {isSavingQuick ? 'Saving...' : 'Save All Changes'}
                </button>
            )}
            <button 
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
            >
                <Plus size={20} /> Add Product
            </button>
          </div>
        )}
      </div>

      {!showForm ? (
        <div className="glass-card rounded-3xl overflow-hidden p-2">
          <div className="p-4 flex items-center gap-2 bg-gray-50/50 rounded-2xl mb-2">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or SKU..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
              />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price / Our Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
                ) : filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border shrink-0">
                          {p.thumbnail_url ? (
                            <img src={`http://localhost:8000${p.thumbnail_url}`} alt={p.name} className="w-full h-full object-cover" />
                          ) : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5 leading-none">
                             {p.name}
                             {p.is_preorder && <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-tighter">Preorder</span>}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest leading-none">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold py-1 px-3 rounded-xl bg-gray-100/50 text-gray-600">
                        {categories.find(c => c.id === p.category_id)?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isQuickEdit ? (
                        <div className="space-y-1">
                            <input 
                                type="number" 
                                className="w-20 p-1 border rounded text-xs font-bold"
                                defaultValue={p.our_price}
                                onChange={(e) => setQuickUpdateData({
                                    ...quickUpdateData,
                                    [p.id]: { ...quickUpdateData[p.id], our_price: Number(e.target.value) }
                                })}
                            />
                        </div>
                      ) : (
                        <>
                            <div className="text-gray-300 line-through text-xs font-bold">₹{p.price}</div>
                            <div className="text-primary-600 font-black">₹{p.our_price}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isQuickEdit ? (
                        <input 
                            type="number" 
                            className="w-20 p-1 border rounded text-xs font-bold text-primary-600"
                            defaultValue={p.stock}
                            onChange={(e) => setQuickUpdateData({
                                ...quickUpdateData,
                                [p.id]: { ...quickUpdateData[p.id], stock: Number(e.target.value) }
                            })}
                        />
                      ) : (
                        <div className={`text-sm ${p.stock < 10 ? 'text-red-500 font-black animate-pulse' : 'text-gray-700'}`}>
                            {p.stock} {p.unit}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-500">
           <div className="mb-6">
            <button 
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Catalog
            </button>
          </div>

          <div className="glass-card rounded-[40px] overflow-hidden">
            <form onSubmit={handleSubmit} className="p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Basic Information</h3>
                   <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Product Name (English)</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1 leading-none">ഉൽപ്പന്നത്തിന്റെ പേര് (Malayalam)</label>
                        <input required value={formData.name_malayalam} onChange={e => setFormData({...formData, name_malayalam: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 text-right transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">SKU Code</label>
                            <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 uppercase transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                            <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                   </div>
                  </div>

                  <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Inventory & Pricing</h3>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Market Price (₹)</label>
                        <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-black text-gray-400 line-through transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Our Deal Price (₹)</label>
                        <input required type="number" value={formData.our_price} onChange={e => setFormData({...formData, our_price: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-black text-primary-600 transition-all text-xl" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Opening Stock</label>
                        <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Measuring Unit</label>
                        <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all">
                            <option value="piece">Piece</option>
                            <option value="kg">KG</option>
                            <option value="gram">Gram</option>
                            <option value="litre">Litre</option>
                            <option value="ml">ML</option>
                        </select>
                    </div>
                   </div>
                  </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Media Uploads</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1"><ImageIcon size={14} /> Main Thumbnail</label>
                           <input type="file" onChange={e => setThumbnailFile(e.target.files[0])} className="w-full text-xs font-bold text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1"><PlusCircle size={14} /> Product Gallery</label>
                           <input type="file" multiple onChange={e => setMediaFiles(Array.from(e.target.files))} className="w-full text-xs font-bold text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all" />
                        </div>
                    </div>
                   </div>

                   <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Attributes & Tags</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                          <input type="checkbox" id="p-preorder" checked={formData.is_preorder} onChange={e => setFormData({...formData, is_preorder: e.target.checked})} className="w-5 h-5 accent-primary-600" />
                          <label htmlFor="p-preorder" className="text-xs font-black text-gray-600 uppercase tracking-widest cursor-pointer">Accept Preorders</label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                          <input type="checkbox" id="p-custom" checked={formData.is_custom_order} onChange={e => setFormData({...formData, is_custom_order: e.target.checked})} className="w-5 h-5 accent-primary-600" />
                          <label htmlFor="p-custom" className="text-xs font-black text-gray-600 uppercase tracking-widest cursor-pointer">Customizable</label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Brief Description (English)</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-3xl outline-none font-medium h-32 transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 text-right w-full block mr-1 leading-none">വിവരണം (Malayalam)</label>
                        <textarea value={formData.description_malayalam} onChange={e => setFormData({...formData, description_malayalam: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-3xl outline-none font-medium h-32 text-right transition-all shadow-inner" />
                    </div>
                   </div>
                </div>
              </div>

              <div className="pt-10 border-t flex justify-end gap-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest text-sm hover:text-gray-600 transition-colors">Cancel</button>
                <button type="submit" className="px-16 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary-200 transform hover:scale-105 active:scale-95">
                  Save Product details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
