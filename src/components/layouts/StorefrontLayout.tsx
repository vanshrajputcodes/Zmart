import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/integrations/supabase/client';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function StorefrontLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAdmin } = useAuthStore();
  const { itemCount, toggleCart } = useCartStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 text-center font-body tracking-wide">
        Free shipping on orders over ₹999 · Use code <span className="font-semibold">WELCOME10</span> for 10% off
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container flex items-center justify-between h-16 gap-4">
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            Zmart
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 font-body text-sm">
            <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Shop All
            </Link>
            <Link to="/products?category=new" className="text-muted-foreground hover:text-foreground transition-colors">
              New Arrivals
            </Link>
            <Link to="/products?featured=true" className="text-muted-foreground hover:text-foreground transition-colors">
              Featured
            </Link>
            <Link to="/products?sale=true" className="text-accent font-medium hover:text-accent/80 transition-colors">
              Sale
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <Link to="/wishlist">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                {isAdmin() && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="hidden md:inline-flex text-xs">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t overflow-hidden"
            >
              <div className="container py-3">
                <Input
                  placeholder="Search products..."
                  className="max-w-lg mx-auto"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/products?search=${(e.target as HTMLInputElement).value}`);
                      setSearchOpen(false);
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b overflow-hidden z-30"
          >
            <nav className="container py-4 flex flex-col gap-3 font-body">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm">Shop All</Link>
              <Link to="/products?category=new" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm">New Arrivals</Link>
              <Link to="/products?featured=true" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm">Featured</Link>
              <Link to="/products?sale=true" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-accent font-medium">Sale</Link>
              {user && isAdmin() && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium">Admin Dashboard</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm font-body">
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Zmart</h3>
            <p className="text-primary-foreground/70 leading-relaxed">
              Smart shopping, best prices. Quality products delivered across India.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link to="/products" className="hover:text-primary-foreground transition-colors">All Products</Link></li>
              <li><Link to="/products?category=new" className="hover:text-primary-foreground transition-colors">New Arrivals</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-primary-foreground transition-colors">Featured</Link></li>
              <li><Link to="/products?sale=true" className="hover:text-primary-foreground transition-colors">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-primary-foreground transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="hover:text-primary-foreground transition-colors">Returns</Link></li>
              <li><Link to="/faq" className="hover:text-primary-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><Link to="/account" className="hover:text-primary-foreground transition-colors">My Account</Link></li>
              <li><Link to="/account/orders" className="hover:text-primary-foreground transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary-foreground transition-colors">Wishlist</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="container py-4 text-xs text-primary-foreground/50 text-center">
            © {new Date().getFullYear()} Zmart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
