import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef } from 'react';

/**
 * Fetch full product data for a list of product IDs (from RPC results)
 */
async function fetchProductsByIds(productIds: string[]) {
  if (productIds.length === 0) return [];
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), categories(*), brands(*)')
    .in('id', productIds)
    .eq('is_active', true);
  // Preserve the order from the RPC results
  const map = new Map((data ?? []).map(p => [p.id, p]));
  return productIds.map(id => map.get(id)).filter(Boolean);
}

/** Personalized "For You" recommendations */
export function useForYouProducts(limit = 8) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['recommendations', 'for-you', user?.id, limit],
    queryFn: async () => {
      if (!user) {
        // Fallback: popular/new products for anonymous users
        const { data } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*), brands(*)')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(limit);
        return data ?? [];
      }

      const { data: recs } = await supabase.rpc('get_personalized_recommendations', {
        _user_id: user.id,
        _limit: limit,
      });

      if (!recs || recs.length === 0) {
        const { data } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*), brands(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);
        return data ?? [];
      }

      return fetchProductsByIds(recs.map((r: any) => r.product_id));
    },
    staleTime: 5 * 60 * 1000, // cache 5 min
  });
}

/** Similar products for a given product */
export function useSimilarProducts(productId: string | undefined, limit = 4) {
  return useQuery({
    queryKey: ['recommendations', 'similar', productId, limit],
    queryFn: async () => {
      const { data: recs } = await supabase.rpc('get_similar_products', {
        _product_id: productId!,
        _limit: limit,
      });

      if (!recs || recs.length === 0) return [];
      return fetchProductsByIds(recs.map((r: any) => r.product_id));
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });
}

/** "Customers also bought" for a given product */
export function useAlsoBought(productId: string | undefined, limit = 4) {
  return useQuery({
    queryKey: ['recommendations', 'also-bought', productId, limit],
    queryFn: async () => {
      const { data: recs } = await supabase.rpc('get_also_bought', {
        _product_id: productId!,
        _limit: limit,
      });

      if (!recs || recs.length === 0) return [];
      return fetchProductsByIds(recs.map((r: any) => r.product_id));
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });
}

/** Track user interaction (view, add_to_cart, etc.) */
export function useTrackInteraction() {
  const { user } = useAuthStore();

  const track = async (
    productId: string,
    interactionType: 'view' | 'search' | 'add_to_cart' | 'purchase' | 'wishlist' | 'rating',
    metadata?: Record<string, any>
  ) => {
    if (!user) return;
    await supabase.from('user_interactions').insert({
      user_id: user.id,
      product_id: productId,
      interaction_type: interactionType,
      metadata: metadata ?? {},
    });
  };

  return { track };
}

/** Auto-track a product view with dwell time */
export function useTrackProductView(productId: string | undefined) {
  const { user } = useAuthStore();
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!user || !productId) return;
    startTime.current = Date.now();

    // Record view immediately
    supabase.from('user_interactions').insert({
      user_id: user.id,
      product_id: productId,
      interaction_type: 'view' as const,
      metadata: {},
    });

    // On unmount, update with dwell time
    return () => {
      const dwellMs = Date.now() - startTime.current;
      if (dwellMs > 3000) {
        // Only record dwell if user stayed > 3 seconds
        supabase.from('user_interactions').insert({
          user_id: user.id,
          product_id: productId,
          interaction_type: 'view' as const,
          metadata: { dwell_time_ms: dwellMs },
        });
      }
    };
  }, [user, productId]);
}
