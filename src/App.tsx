import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import { StorefrontLayout } from "@/components/layouts/StorefrontLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { RoleGuard } from "@/components/guards/RoleGuard";

import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import ShippingInfo from "./pages/ShippingInfo";
import Returns from "./pages/Returns";
import FAQ from "./pages/FAQ";
import Wishlist from "./pages/Wishlist";
import OrderHistory from "./pages/OrderHistory";

import AdminOverview from "./pages/admin/AdminOverview";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminRecommendations from "./pages/admin/AdminRecommendations";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

function AppRoutes() {
  useAuth();

  return (
    <Routes>
      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/account" element={
          <RoleGuard><Account /></RoleGuard>
        } />
        <Route path="/account/orders" element={
          <RoleGuard><OrderHistory /></RoleGuard>
        } />
        <Route path="/wishlist" element={
          <RoleGuard><Wishlist /></RoleGuard>
        } />
        <Route path="/checkout" element={
          <RoleGuard><Checkout /></RoleGuard>
        } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<ShippingInfo />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>

      {/* Auth */}
      <Route path="/auth" element={<Auth />} />

      {/* Admin */}
      <Route path="/admin" element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <AdminLayout />
        </RoleGuard>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="recommendations" element={<AdminRecommendations />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
