import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Offers from './pages/Offers';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Orders from './pages/Orders';
import OrdersByPincode from './pages/OrdersByPincode';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import BulkUpload from './pages/BulkUpload';
import StockHistory from './pages/StockHistory';
import SupplierPayments from './pages/SupplierPayments';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="offers" element={<Offers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders-pincode" element={<OrdersByPincode />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
          <Route path="stock-history" element={<StockHistory />} />
          <Route path="supplier-payments" element={<SupplierPayments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
