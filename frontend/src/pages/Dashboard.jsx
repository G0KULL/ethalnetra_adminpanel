import React, { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  Package,
  Layers,
  AlertTriangle,
  ShoppingCart,
  RefreshCcw,
  FileBox,
  IndianRupee,
} from "lucide-react";
import api from "../services/api";

const StatCard = ({ title, value, icon, color, subValue }) => (
  <div className="glass-card p-6 rounded-2xl flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
    <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="animate-pulse flex items-center justify-center min-h-[400px]">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">
            Welcome to Ethalnethra Admin. Here's what's happening today.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.total_products || 0}
          icon={<Package size={24} />}
          color="blue"
        />
        <StatCard
          title="Categories"
          value={stats?.total_categories || 0}
          icon={<Layers size={24} />}
          color="purple"
        />
        <StatCard
          title="Active Offers"
          value={stats?.active_offers || 0}
          icon={<AlertTriangle size={24} />}
          color="amber"
          subValue="Active campaigns"
        />
        <StatCard
          title="Total Orders"
          value={stats?.sales_summary?.total_orders || 0}
          icon={<FileBox size={24} />}
          color="indigo"
          subValue={`${stats?.sales_summary?.pending_orders || 0} pending`}
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats?.sales_summary?.total_revenue || 0).toLocaleString()}`}
          icon={<IndianRupee size={24} />}
          color="orange"
          subValue="Excluding cancelled"
        />
        <StatCard
          title="Total Stock"
          value={stats?.stock_summary?.total_items || 0}
          icon={<Plus size={24} />}
          color="green"
          subValue={`${stats?.stock_summary?.low_stock_count || 0} items low`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="p-4 bg-primary-50 rounded-full inline-block text-primary-600 mb-4">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Purchase History Chart
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Visual statistics will appear here as more data is collected.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileBox size={18} /> Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
               <span className="text-sm font-medium text-gray-500">Orders</span>
               <span className="font-bold text-gray-900">{stats?.sales_summary?.total_orders || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
               <span className="text-sm font-medium text-gray-500">Purchases</span>
               <span className="font-bold text-gray-900">{stats?.total_purchases || 0}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
               <span className="text-sm font-medium text-gray-500">Active Offers</span>
               <span className="font-bold text-gray-900">{stats?.active_offers || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
