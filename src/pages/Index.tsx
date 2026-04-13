import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, RotateCcw, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products/ProductCard';
import { useForYouProducts } from '@/hooks/useRecommendations';
import { useAuthStore } from '@/store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Index() {
  const { user } = useAuthStore();
  const { data: forYouProducts, isLoading: loadingForYou } = useForYouProducts(8);

  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*), brands(*)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);
      return data ?? [];
    },
  });

  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*), brands(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const { data: trendingProducts, isLoading: loadingTrending } = useQuery({
    queryKey: ['products', 'trending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*), brands(*)')
        .eq('is_active', true)
        .not('compare_at_price', 'is', null)
        .order('base_price', { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .limit(6);
      return data ?? [];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="container py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Smart Shopping
              <span className="text-accent block mt-2">Best Prices, Always</span>
            </h1>
            <p className="text-primary-foreground/70 text-lg mt-6 max-w-md leading-relaxed">
              Discover quality products at unbeatable prices. Shop smart, live better.
            </p>
            <div className="flex gap-3 mt-8">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/products?category=new">New Arrivals</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
      </section>

      {/* Trust badges */}
      <section className="border-b">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, label: 'Free Shipping', desc: 'Orders over ₹999' },
            { icon: Shield, label: 'Secure Payment', desc: '256-bit encryption' },
            { icon: RotateCcw, label: 'Easy Returns', desc: '30-day returns' },
            { icon: Star, label: 'Premium Quality', desc: 'Curated selection' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 text-sm">
              <badge.icon className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="font-medium">{badge.label}</p>
                <p className="text-muted-foreground text-xs">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Shop by Category</h2>
            <Link to="/products" className="text-sm text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={itemVariants}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group relative block aspect-[4/3] rounded-lg overflow-hidden bg-muted"
                >
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-background font-display text-xl font-semibold">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* For You — Personalized Recommendations */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-2xl md:text-3xl font-semibold">
              {user ? 'Picked For You' : 'Popular Right Now'}
            </h2>
          </div>
          <Link to="/products" className="text-sm text-accent hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loadingForYou ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : forYouProducts && forYouProducts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {forYouProducts.map((product: any) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/30 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Featured Collection</h2>
            <Link to="/products?featured=true" className="text-sm text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No featured products yet. Check back soon!</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">New Arrivals</h2>
          <Link to="/products?category=new" className="text-sm text-accent hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loadingNew ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : newProducts && newProducts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {newProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>New products coming soon!</p>
          </div>
        )}
      </section>

      {/* Trending Now */}
      <section className="bg-secondary/30 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Trending Now</h2>
            <Link to="/products?sale=true" className="text-sm text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loadingTrending ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : trendingProducts && trendingProducts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {trendingProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Check back soon for trending picks!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent/10 py-16">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Join the Zmart Family</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Get early access to new arrivals, exclusive deals, and smart shopping tips.
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
