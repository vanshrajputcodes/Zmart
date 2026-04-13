import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { user } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('wishlists')
        .select('*, products:product_id(*, product_images(*), brands(*))')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: async (wishlistId: string) => {
      await supabase.from('wishlists').delete().eq('id', wishlistId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({ title: 'Removed from wishlist' });
    },
  });

  const handleAddToCart = (item: any) => {
    const product = item.products;
    const image = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      price: Number(product.base_price),
      image: image?.url,
      quantity: 1,
    });
    openCart();
    toast({ title: 'Added to bag', description: product.name });
  };

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-accent" />
        <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !wishlistItems || wishlistItems.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h2 className="font-display text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm">Save items you love to find them easily later.</p>
          <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/products">Browse Products</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {wishlistItems.map((item: any) => {
              const product = item.products;
              if (!product) return null;
              const image = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
              const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group border rounded-lg overflow-hidden"
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="relative aspect-square bg-muted">
                      {image ? (
                        <img src={image.url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                      )}
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded">
                          -{Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100)}%
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3 space-y-2">
                    {product.brands && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brands.name}</p>
                    )}
                    <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">₹{Number(product.base_price).toFixed(0)}</span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">₹{Number(product.compare_at_price).toFixed(0)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground text-xs" onClick={() => handleAddToCart(item)}>
                        <ShoppingBag className="h-3 w-3 mr-1" /> Add to Bag
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeMutation.mutate(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
