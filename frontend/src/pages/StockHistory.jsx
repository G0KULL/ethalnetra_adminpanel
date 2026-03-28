import React, { useState, useEffect } from "react";
import { History, Search, ArrowUpCircle, ArrowDownCircle, Info, Calendar } from "lucide-react";
import axios from "axios";

const StockHistory = () => {
    const [movements, setMovements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchMovements();
    }, []);

    const fetchMovements = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/admin/inventory/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMovements(response.data);
        } catch (err) {
            setError("Failed to fetch stock history.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMovements = movements.filter(m => 
        m.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTypeIcon = (type) => {
        switch (type) {
            case "purchase": return <ArrowUpCircle className="text-green-500" size={18} />;
            case "sale": return <ArrowDownCircle className="text-red-500" size={18} />;
            case "adjustment": return <Info className="text-blue-500" size={18} />;
            case "return": return <ArrowUpCircle className="text-orange-500" size={18} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Stock Movements</h1>
                    <p className="text-gray-500 mt-2 font-medium italic">Audit logs for every inventory change across the system</p>
                </div>
                
                <div className="relative group min-w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by Product ID or Type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-3xl text-sm font-black uppercase tracking-widest focus:border-primary-600 transition-all outline-none shadow-sm hover:shadow-md"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border shadow-xl">
                    <History className="animate-spin text-primary-600 mb-4" size={40} />
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Loading History...</p>
                </div>
            ) : error ? (
                <div className="p-10 bg-red-50 border border-red-100 rounded-3xl text-center text-red-600 font-bold">
                    {error}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b">
                                <tr className="text-xs font-black uppercase tracking-widest text-gray-400">
                                    <th className="px-8 py-6">Timestamp & Reference</th>
                                    <th className="px-8 py-6">Type</th>
                                    <th className="px-8 py-6 text-center">Change</th>
                                    <th className="px-8 py-6 text-center">Stock Audit</th>
                                    <th className="px-8 py-6">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMovements.map((m, i) => (
                                    <tr key={i} className="hover:bg-primary-50/10 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 tracking-tighter uppercase mb-1 flex items-center gap-2">
                                                    <Calendar size={12} className="text-primary-600" />
                                                    {new Date(m.created_at).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md self-start">
                                                    Ref: {m.reference_type}-{m.reference_id?.substring(0,6) || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                    {getTypeIcon(m.type)}
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-widest text-gray-700">
                                                    {m.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`text-lg font-black ${m.quantity_change > 0 ? "text-green-600" : "text-red-500"}`}>
                                                {m.quantity_change > 0 ? "+" : ""}{m.quantity_change}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black uppercase text-gray-400">Previous</span>
                                                    <span className="text-sm font-bold text-gray-600">{m.previous_stock}</span>
                                                </div>
                                                <div className="w-4 h-px bg-gray-200" />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black uppercase text-gray-400">New</span>
                                                    <span className="text-sm font-black text-primary-600">{m.new_stock}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-gray-500 font-medium italic max-w-xs leading-relaxed py-2">
                                                {m.note || "No additional details"}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMovements.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center font-black text-gray-400 uppercase tracking-widest bg-gray-50/10"> No movements found </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockHistory;
