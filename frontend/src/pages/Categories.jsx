import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, AlertCircle, Layers, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', name_malayalam: '', description: '', is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('name_malayalam', formData.name_malayalam);
    data.append('description', formData.description || '');
    data.append('is_active', formData.is_active);
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, data);
      } else {
        await api.post('/categories', data);
      }
      setShowForm(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', name_malayalam: '', description: '', is_active: true });
    setImageFile(null);
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name,
      name_malayalam: cat.name_malayalam,
      description: cat.description || '',
      is_active: cat.is_active
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.name_malayalam.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{showForm ? (editingId ? 'Edit Category' : 'New Category') : 'Categories'}</h1>
          <p className="text-gray-500">
            {showForm ? 'Fill in the details below to save your category.' : 'Manage your product categories.'}
          </p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={20} /> Add Category
          </button>
        )}
      </div>

      {!showForm ? (
        <div className="glass-card rounded-3xl overflow-hidden p-2">
          <div className="p-4 flex items-center gap-2 bg-gray-50/50 rounded-2xl mb-2">
              <Search className="text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-sm font-medium"
              />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-400 text-sm font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-10">Loading...</td></tr>
                ) : filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border">
                        {cat.image_url ? (
                          <img src={`http://localhost:8000${cat.image_url}`} alt={cat.name} className="w-full h-full object-cover" />
                        ) : <div className="w-full h-full flex items-center justify-center"><Layers size={20} className="text-gray-300" /></div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{cat.name}</div>
                      <div className="text-sm text-gray-400">{cat.name_malayalam}</div>
                    </td>
                    <td className="px-6 py-4">
                      {cat.is_active ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase">
                          <AlertCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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
              <ArrowLeft size={18} /> Back to List
            </button>
          </div>

          <div className="glass-card rounded-[40px] overflow-hidden">
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">General Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Category Name (English)</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 transition-all" 
                        placeholder="e.g. Vegetables"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">വിഭാഗം പേര് (Malayalam)</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name_malayalam}
                        onChange={e => setFormData({...formData, name_malayalam: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-100 focus:bg-white rounded-2xl outline-none font-bold text-gray-900 text-right transition-all" 
                        placeholder="പഴങ്ങൾ"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Media & Status</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Category Cover Image</label>
                      <div className="border-2 border-dashed border-gray-100 rounded-3xl p-8 text-center bg-gray-50/30 hover:bg-primary-50/20 transition-colors cursor-pointer group">
                        <input 
                          type="file" 
                          id="cat-image"
                          onChange={e => setImageFile(e.target.files[0])}
                          className="hidden" 
                        />
                        <label htmlFor="cat-image" className="cursor-pointer space-y-2 block">
                           <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-gray-400 group-hover:text-primary-600 transition-colors">
                              <Plus size={24} />
                           </div>
                           <p className="text-sm font-bold text-gray-500">{imageFile ? imageFile.name : 'Upload banner image'}</p>
                           <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">JPG, PNG, WEBP up to 2MB</p>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl w-fit">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.is_active}
                          onChange={e => setFormData({...formData, is_active: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">Active Status</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest border-l-4 border-primary-500 pl-3">Detailed Description</h3>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Provide a brief overview of this category..."
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
                  className="px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary-200"
                >
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
