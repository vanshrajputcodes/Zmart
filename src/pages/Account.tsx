import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShoppingBag, MapPin, Heart, Star, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const accountNav = [
  { label: 'Dashboard', path: '/account', icon: User },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', path: '/account/wishlist', icon: Heart },
  { label: 'Reviews', path: '/account/reviews', icon: Star },
  { label: 'Settings', path: '/account/settings', icon: Settings },
];

export default function Account() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isExactAccount = location.pathname === '/account';

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-8">My Account</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="md:w-48 flex-shrink-0">
          <ul className="space-y-1">
            {accountNav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      active ? 'bg-accent/10 text-accent font-medium' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex-1">
          {isExactAccount ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-lg border p-6">
                <h2 className="font-display text-xl font-semibold mb-2">Welcome back!</h2>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {accountNav.slice(1).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="rounded-lg border p-4 hover:border-accent transition-colors group"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
                    <p className="font-medium text-sm">{item.label}</p>
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
