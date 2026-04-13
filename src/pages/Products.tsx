import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products/ProductCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') === 'true';

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data ?? [];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await supabase.from('brands').select('*');
      return data ?? [];
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', search, category, sort, featured, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, product_images(*), categories(*), brands(*)')
        .eq('is_active', true)
        .gte('base_price', priceRange[0])
        .lte('base_price', priceRange[1]);

      if (search) query = query.ilike('name', `%${search}%`);
      if (category && category !== 'new') {
        query = query.eq('categories.slug', category);
      }
      if (featured) query = query.eq('is_featured', true);

      switch (sort) {
        case 'price_asc': query = query.order('base_price', { ascending: true }); break;
        case 'price_desc': query = query.order('base_price', { ascending: false }); break;
        case 'name': query = query.order('name', { ascending: true }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data } = await query.limit(50);
      return data ?? [];
    },
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-sm mb-3">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={1000}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={category === cat.slug}
                  onCheckedChange={(checked) => {
                    const params = new URLSearchParams(searchParams);
                    if (checked) params.set('category', cat.slug);
                    else params.delete('category');
                    setSearchParams(params);
                  }}
                />
                <Label htmlFor={`cat-${cat.id}`} className="text-sm">{cat.name}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {search ? `Results for "${search}"` : featured ? 'Featured' : 'All Products'}
          </h1>
          {products && <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => {
            const params = new URLSearchParams(searchParams);
            params.set('sort', v);
            setSearchParams(params);
          }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>

          {/* Mobile filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filters */}
      {(search || category || featured) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {search && (
            <span className="inline-flex items-center gap-1 bg-secondary text-sm px-3 py-1 rounded-full">
              Search: {search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('search');
                setSearchParams(params);
              }} />
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 bg-secondary text-sm px-3 py-1 rounded-full">
              Category: {category}
              <X className="h-3 w-3 cursor-pointer" onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('category');
                setSearchParams(params);
              }} />
            </span>
          )}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FilterPanel />
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No products found</p>
              <Button variant="outline" onClick={() => setSearchParams({})}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
