import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Package,
  Tag,
  Users,
  ShoppingCart,
  FileBox,
  Truck,
  FileText,
  LogOut,
  UploadCloud,
  History,
  CreditCard
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { title: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { title: "Categories", path: "/categories", icon: <Layers size={20} /> },
    { title: "Products", path: "/products", icon: <Package size={20} /> },
    { title: "Offers", path: "/offers", icon: <Tag size={20} /> },
    { title: "Suppliers", path: "/suppliers", icon: <Users size={20} /> },
    {
      title: "Purchases",
      path: "/purchases",
      icon: <ShoppingCart size={20} />,
    },
    {
      title: "Orders",
      path: "/orders",
      icon: <FileBox size={20} />,
    },
    {
      title: "Invoices",
      path: "/invoices",
      icon: <FileText size={20} />,
    },
    {
      title: "Bulk Upload",
      path: "/bulk-upload",
      icon: <UploadCloud size={20} />,
    },
    {
      title: "Stock History",
      path: "/stock-history",
      icon: <History size={20} />,
    },
    {
      title: "Payment History",
      path: "/supplier-payments",
      icon: <CreditCard size={20} />,
    },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">Ethalnethra</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.icon}
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
