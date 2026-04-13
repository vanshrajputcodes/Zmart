
-- 1. Personalized "For You" recommendations
CREATE OR REPLACE FUNCTION public.get_personalized_recommendations(
  _user_id uuid,
  _limit int DEFAULT 8
)
RETURNS TABLE(product_id uuid, score numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_cats AS (
    -- Categories the user has interacted with
    SELECT DISTINCT p.category_id
    FROM user_interactions ui
    JOIN products p ON p.id = ui.product_id
    WHERE ui.user_id = _user_id
      AND p.category_id IS NOT NULL
  ),
  user_brands AS (
    -- Brands the user has interacted with
    SELECT DISTINCT p.brand_id
    FROM user_interactions ui
    JOIN products p ON p.id = ui.product_id
    WHERE ui.user_id = _user_id
      AND p.brand_id IS NOT NULL
  ),
  user_products AS (
    -- Products user already interacted with
    SELECT DISTINCT ui.product_id
    FROM user_interactions ui
    WHERE ui.user_id = _user_id
  ),
  collaborative AS (
    -- Products bought by users who bought similar items (collaborative filtering)
    SELECT oi2.product_id, COUNT(DISTINCT oi2.order_id)::numeric * 3 AS collab_score
    FROM order_items oi1
    JOIN orders o1 ON o1.id = oi1.order_id AND o1.user_id = _user_id
    JOIN order_items oi2 ON oi2.order_id IN (
      SELECT oi3.order_id
      FROM order_items oi3
      WHERE oi3.product_id = oi1.product_id
        AND oi3.order_id != oi1.order_id
    )
    WHERE oi2.product_id NOT IN (SELECT up.product_id FROM user_products up)
    GROUP BY oi2.product_id
  ),
  content_based AS (
    -- Products in same categories/brands the user likes (content filtering)
    SELECT p.id AS product_id,
      (CASE WHEN p.category_id IN (SELECT category_id FROM user_cats) THEN 2 ELSE 0 END +
       CASE WHEN p.brand_id IN (SELECT brand_id FROM user_brands) THEN 1.5 ELSE 0 END)::numeric AS content_score
    FROM products p
    WHERE p.is_active = true
      AND p.id NOT IN (SELECT up.product_id FROM user_products up)
      AND (p.category_id IN (SELECT category_id FROM user_cats)
           OR p.brand_id IN (SELECT brand_id FROM user_brands))
  ),
  popularity AS (
    -- Fallback: popular products by interaction count
    SELECT ui.product_id, (COUNT(*)::numeric * 0.5) AS pop_score
    FROM user_interactions ui
    JOIN products p ON p.id = ui.product_id AND p.is_active = true
    WHERE ui.product_id NOT IN (SELECT up.product_id FROM user_products up)
    GROUP BY ui.product_id
  ),
  combined AS (
    SELECT
      COALESCE(c.product_id, cb.product_id, pop.product_id) AS product_id,
      COALESCE(c.collab_score, 0) + COALESCE(cb.content_score, 0) + COALESCE(pop.pop_score, 0) AS total_score
    FROM collaborative c
    FULL OUTER JOIN content_based cb ON c.product_id = cb.product_id
    FULL OUTER JOIN popularity pop ON COALESCE(c.product_id, cb.product_id) = pop.product_id
  )
  SELECT combined.product_id, combined.total_score AS score
  FROM combined
  JOIN products p ON p.id = combined.product_id AND p.is_active = true
  ORDER BY combined.total_score DESC
  LIMIT _limit;

  -- If no personalized results, fall back to trending/popular
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT p.id AS product_id, COALESCE(COUNT(ui.id), 0)::numeric AS score
    FROM products p
    LEFT JOIN user_interactions ui ON ui.product_id = p.id
    WHERE p.is_active = true
    GROUP BY p.id
    ORDER BY score DESC, p.created_at DESC
    LIMIT _limit;
  END IF;
END;
$$;

-- 2. Similar products (content-based)
CREATE OR REPLACE FUNCTION public.get_similar_products(
  _product_id uuid,
  _limit int DEFAULT 4
)
RETURNS TABLE(product_id uuid, score numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _category_id uuid;
  _brand_id uuid;
  _price numeric;
  _tags text[];
BEGIN
  SELECT p.category_id, p.brand_id, p.base_price, p.tags
  INTO _category_id, _brand_id, _price, _tags
  FROM products p WHERE p.id = _product_id;

  RETURN QUERY
  SELECT p.id AS product_id,
    (CASE WHEN p.category_id = _category_id AND _category_id IS NOT NULL THEN 3 ELSE 0 END +
     CASE WHEN p.brand_id = _brand_id AND _brand_id IS NOT NULL THEN 2 ELSE 0 END +
     CASE WHEN p.tags && _tags AND _tags IS NOT NULL THEN 1.5 ELSE 0 END +
     CASE WHEN ABS(p.base_price - _price) < _price * 0.3 THEN 1 ELSE 0 END
    )::numeric AS score
  FROM products p
  WHERE p.id != _product_id
    AND p.is_active = true
  ORDER BY score DESC, p.created_at DESC
  LIMIT _limit;
END;
$$;

-- 3. "Customers also bought" (collaborative)
CREATE OR REPLACE FUNCTION public.get_also_bought(
  _product_id uuid,
  _limit int DEFAULT 4
)
RETURNS TABLE(product_id uuid, score numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT oi2.product_id, COUNT(DISTINCT oi2.order_id)::numeric AS score
  FROM order_items oi1
  JOIN order_items oi2 ON oi2.order_id = oi1.order_id AND oi2.product_id != oi1.product_id
  JOIN products p ON p.id = oi2.product_id AND p.is_active = true
  WHERE oi1.product_id = _product_id
  GROUP BY oi2.product_id
  ORDER BY score DESC
  LIMIT _limit;
END;
$$;
