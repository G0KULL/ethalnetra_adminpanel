import React, { useState, useEffect } from "react";
import { CreditCard, Search, DollarSign, Calendar, Info, Printer, Download, Plus, Loader2 } from "lucide-react";
import axios from "axios";

const SupplierPayments = () => {
    const [payments, setPayments] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
    const [paymentData, setPaymentData] = useState({
        supplier_id: "",
        purchase_id: "",
        amount: "",
        payment_method: "cash",
        reference_number: "",
        notes: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const [payRes, purRes, supRes] = await Promise.all([
                axios.get("http://localhost:8000/api/admin/purchases/payments", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:8000/api/admin/purchases", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:8000/api/admin/suppliers", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPayments(payRes.data);
            setPurchases(purRes.data);
            setSuppliers(supRes.data);
        } catch (err) {
            setError("Failed to fetch initial payment data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8000/api/admin/purchases/payments", paymentData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowForm(false);
            fetchData();
            setPaymentData({ supplier_id: "", purchase_id: "", amount: "", payment_method: "cash", reference_number: "", notes: "" });
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to record payment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Supplier Payments</h1>
                    <p className="text-gray-500 mt-2 font-medium italic italic capitalize tracking-tight tracking-widest text-xs uppercase font-black text-gray-400">Track financial outflows and balances</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary-600 text-white px-8 py-4 rounded-3xl font-black uppercase text-sm tracking-widest flex items-center gap-3 hover:translate-y-[-4px] transition-all shadow-xl shadow-primary-200 active:scale-95"
                >
                    {showForm ? "Close Form" : <><Plus size={20} /> Record Payment</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[40px] border-4 border-primary-50 p-10 shadow-2xl mb-12 animate-in zoom-in-95 duration-300">
                    <form onSubmit={handlePaymentSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Select Supplier</label>
                            <select 
                                value={paymentData.supplier_id}
                                onChange={(e) => setPaymentData({ ...paymentData, supplier_id: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-500 rounded-2xl p-4 font-bold transition-all outline-none"
                                required
                            >
                                <option value="">Select Supplier...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Select Purchase Invoice</label>
                            <select 
                                value={paymentData.purchase_id}
                                onChange={(e) => setPaymentData({ ...paymentData, purchase_id: e.target.value })}
                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-500 rounded-2xl p-4 font-bold transition-all outline-none"
                                required
                            >
                                <option value="">Select Invoice...</option>
                                {purchases.filter(p => !paymentData.supplier_id || p.supplier_id === paymentData.supplier_id).map(p => (
                                    <option key={p.id} value={p.id}>{p.invoice_number} (Due: ₹{p.due_amount})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Payment Amount (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-500 rounded-2xl p-4 pl-12 font-bold transition-all outline-none"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        {/* More fields... */}
                        <div className="lg:col-span-3 flex justify-end pt-4 border-t-2 border-dashed border-primary-50">
                            <button 
                                disabled={isSubmitting}
                                className="bg-primary-600 text-white px-12 py-5 rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-primary-200 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                {isSubmitting ? <><Loader2 className="animate-spin" /> Processing...</> : "Confirm Payment Record"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border shadow-xl overflow-hidden mt-8">
                <div className="p-8 border-b bg-gray-50 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Transaction History</h2>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white rounded-xl border hover:bg-gray-50 transition-colors shadow-sm"><Download size={18} className="text-gray-500" /></button>
                        <button className="p-3 bg-white rounded-xl border hover:bg-gray-50 transition-colors shadow-sm"><Printer size={18} className="text-gray-500" /></button>
                    </div>
                </div>
                
                <div className="p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6 drop-shadow-xl border-4 border-white">
                        <CreditCard size={32} />
                    </div>
                    <p className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 max-w-xs leading-relaxed"> No recent payments recorded. Start by hitting the Record Payment button above. </p>
                </div>
            </div>
        </div>
    );
};

export default SupplierPayments;
