import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function OrderHistory() {
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products:product_id(name, slug, product_images(*)))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container py-8 px-4">
        <h1 className="font-display text-3xl font-bold mb-8">Order History</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="font-display text-3xl font-bold mb-8">Order History</h1>

      {!orders || orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="font-display text-xl font-semibold">No orders yet</h2>
          <p className="text-muted-foreground text-sm">Start shopping to see your orders here.</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/products">Shop Now</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const orderItems = order.order_items ?? [];

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 md:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <Badge className={`${status.color} border-0 gap-1`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>

                {/* Status timeline */}
                <div className="flex items-center gap-1 mb-4 overflow-x-auto">
                  {['pending', 'processing', 'shipped', 'delivered'].map((s, i) => {
                    const reached = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= i;
                    const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
                    return (
                      <div key={s} className="flex items-center gap-1">
                        {i > 0 && <div className={`w-6 sm:w-10 h-0.5 ${reached && !isCancelled ? 'bg-accent' : 'bg-muted'}`} />}
                        <div className={`h-3 w-3 rounded-full flex-shrink-0 ${reached && !isCancelled ? 'bg-accent' : 'bg-muted'}`} />
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {orderItems.slice(0, 3).map((item: any) => {
                    const product = item.products;
                    const image = product?.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        {image && (
                          <img src={image.url} alt={product?.name || 'Product'} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product?.name || 'Product'}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-sm font-semibold">₹{Number(item.total_price).toLocaleString('en-IN')}</p>
                      </div>
                    );
                  })}
                  {orderItems.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{orderItems.length - 3} more items</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">₹{Number(order.total).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
