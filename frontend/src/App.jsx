import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ProductsPage from './pages/customer/ProductsPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import WishlistPage from './pages/customer/WishlistPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import PaymentResultPage from './pages/customer/PaymentResultPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import ProfilePage from './pages/customer/ProfilePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VendorRegisterPage from './pages/vendor/VendorRegisterPage';

// Vendor Pages
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorAddEditProductPage from './pages/vendor/VendorAddEditProductPage';
import VendorInventoryPage from './pages/vendor/VendorInventoryPage';
import VendorOrdersPage from './pages/vendor/VendorOrdersPage';
import VendorEarningsPage from './pages/vendor/VendorEarningsPage';
import VendorProfilePage from './pages/vendor/VendorProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVendorsPage from './pages/admin/AdminVendorsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminCommissionsPage from './pages/admin/AdminCommissionsPage';

// Route Protectors
const ProtectedCustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedVendorRoute = ({ children }) => {
  const { user, isVendor, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading...</div>;
  if (!user || (!isVendor && !isAdmin)) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-400">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Storefront Customer Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route
                path="checkout"
                element={
                  <ProtectedCustomerRoute>
                    <CheckoutPage />
                  </ProtectedCustomerRoute>
                }
              />
              <Route
                path="payment-result/:orderId"
                element={
                  <ProtectedCustomerRoute>
                    <PaymentResultPage />
                  </ProtectedCustomerRoute>
                }
              />
              <Route
                path="my-orders"
                element={
                  <ProtectedCustomerRoute>
                    <MyOrdersPage />
                  </ProtectedCustomerRoute>
                }
              />
              <Route
                path="orders/:id/tracking"
                element={
                  <ProtectedCustomerRoute>
                    <OrderTrackingPage />
                  </ProtectedCustomerRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedCustomerRoute>
                    <ProfilePage />
                  </ProtectedCustomerRoute>
                }
              />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="register-vendor" element={<VendorRegisterPage />} />
            </Route>

            {/* Vendor Management Portal */}
            <Route
              path="/vendor"
              element={
                <ProtectedVendorRoute>
                  <VendorLayout />
                </ProtectedVendorRoute>
              }
            >
              <Route index element={<Navigate to="/vendor/dashboard" replace />} />
              <Route path="dashboard" element={<VendorDashboardPage />} />
              <Route path="products" element={<VendorProductsPage />} />
              <Route path="products/new" element={<VendorAddEditProductPage />} />
              <Route path="products/edit/:id" element={<VendorAddEditProductPage />} />
              <Route path="inventory" element={<VendorInventoryPage />} />
              <Route path="orders" element={<VendorOrdersPage />} />
              <Route path="earnings" element={<VendorEarningsPage />} />
              <Route path="profile" element={<VendorProfilePage />} />
            </Route>

            {/* Administrator Management Console */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="vendors" element={<AdminVendorsPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="commissions" element={<AdminCommissionsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
