import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, Minus, Plus, Share2, ChevronLeft, Star, ShoppingBag, Sparkles, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { useSimilarProducts, useAlsoBought, useTrackProductView, useTrackInteraction } from '@/hooks/useRecommendations';

export default function ProductDetail() {
  const { slug } = useParams();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*), categories(*), brands(*), reviews(*)')
        .eq('slug', slug!)
        .single();
      return data;
    },
    enabled: !!slug,
  });

  const { data: similarProducts } = useSimilarProducts(product?.id);
  const { data: alsoBoughtProducts } = useAlsoBought(product?.id);
  const { track } = useTrackInteraction();
  useTrackProductView(product?.id);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Product not found</h1>
        <Button asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const images = (product.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const variants = product.product_variants ?? [];
  const reviews = product.reviews ?? [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  const currentVariant = variants.find((v: any) => v.id === selectedVariant);
  const currentPrice = currentVariant ? Number(currentVariant.price) : Number(product.base_price);
  const inStock = currentVariant ? currentVariant.stock > 0 : true;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant || 'default'}`,
      productId: product.id,
      variantId: selectedVariant || undefined,
      name: product.name,
      price: currentPrice,
      image: images[0]?.url,
      size: currentVariant?.size || undefined,
      color: currentVariant?.color || undefined,
      quantity,
    });
    openCart();
    track(product.id, 'add_to_cart', { variant: selectedVariant, quantity });
    toast({ title: 'Added to bag', description: `${product.name} × ${quantity}` });
  };

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-lg overflow-hidden bg-muted"
          >
            {images[selectedImage] ? (
              <img
                src={images[selectedImage].url}
                alt={images[selectedImage].alt_text || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                    i === selectedImage ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {product.brands && (
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{(product.brands as any).name}</p>
          )}
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-accent text-accent' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">₹{currentPrice.toFixed(0)}</span>
            {product.compare_at_price && Number(product.compare_at_price) > currentPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  ₹{Number(product.compare_at_price).toFixed(0)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  Save {Math.round(((Number(product.compare_at_price) - currentPrice) / Number(product.compare_at_price)) * 100)}%
                </Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.short_description || product.description}</p>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Options</h4>
              <div className="flex flex-wrap gap-2">
                {variants.map((v: any) => (
                  <Button
                    key={v.id}
                    variant={selectedVariant === v.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedVariant(v.id)}
                    disabled={!v.is_active || v.stock === 0}
                    className="min-w-[60px]"
                  >
                    {v.name}
                    {v.stock === 0 && ' (Out)'}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-mono text-sm">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {inStock ? 'Add to Bag' : 'Out of Stock'}
            </Button>

            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Tags */}
          {product.tags && (product.tags as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(product.tags as string[]).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <div className="prose max-w-none text-muted-foreground leading-relaxed">
            {product.description || 'No description available.'}
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                      ))}
                    </div>
                    {review.is_verified_purchase && (
                      <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                    )}
                  </div>
                  {review.title && <h4 className="font-medium text-sm">{review.title}</h4>}
                  {review.content && <p className="text-sm text-muted-foreground mt-1">{review.content}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl md:text-2xl font-semibold">Similar Products</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Also Bought */}
      {alsoBoughtProducts && alsoBoughtProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="font-display text-xl md:text-2xl font-semibold">Customers Also Bought</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {alsoBoughtProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
