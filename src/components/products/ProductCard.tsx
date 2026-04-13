import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    compare_at_price?: number | null;
    product_images?: { url: string; alt_text?: string | null; sort_order: number }[];
    categories?: { name: string } | null;
    brands?: { name: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.product_images?.sort((a, b) => a.sort_order - b.sort_order)[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.base_price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={image.alt_text || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 space-y-1">
          {product.brands && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.brands.name}</p>
          )}
          <h3 className="font-medium text-sm leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">₹{Number(product.base_price).toFixed(0)}</span>
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through">
                ₹{Number(product.compare_at_price).toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
