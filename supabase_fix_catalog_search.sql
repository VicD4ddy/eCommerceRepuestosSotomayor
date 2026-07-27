-- ====================================================================
-- FIX: catalog_search RPC Function
-- Corrige los nombres de las columnas p.price_usd, p.code e p.image_urls
-- y permite el filtrado exacto o insensibles a mayúsculas/espacios por categoría y marca.
-- ====================================================================

DROP FUNCTION IF EXISTS catalog_search(text,text,text,text,integer,integer);

CREATE OR REPLACE FUNCTION catalog_search(
  search_term text DEFAULT '',
  category_filter text DEFAULT NULL,
  brand_filter text DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  page_num int DEFAULT 1,
  page_size int DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  image_2 text,
  code_1 text,
  code_2 text,
  brand_name text,
  brand_image_url text,
  category_name text,
  created_at timestamptz,
  specifications jsonb,
  total_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_term text;
  offset_val int;
BEGIN
  normalized_term := lower(unaccent(COALESCE(NULLIF(search_term, ''), '')));
  offset_val := (page_num - 1) * page_size;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      p.id,
      p.name,
      p.description,
      p.price_usd AS price,
      p.image_url,
      p.image_urls AS image_2,
      p.code AS code_1,
      p.code AS code_2,
      b.name AS brand_name,
      b.logo_url AS brand_image_url,
      c.name AS category_name,
      p.created_at,
      p.fitment AS specifications,
      CASE
        WHEN normalized_term = '' THEN 1.0::real
        ELSE GREATEST(
          similarity(lower(unaccent(p.name)), normalized_term),
          CASE
            WHEN lower(unaccent(p.name)) ILIKE '%' || normalized_term || '%' THEN 0.9
            ELSE 0
          END,
          CASE
            WHEN lower(unaccent(COALESCE(p.code, ''))) ILIKE '%' || normalized_term || '%' THEN 0.95
            ELSE 0
          END
        )
      END AS relevance
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE
      (category_filter IS NULL OR trim(c.name) ILIKE trim(category_filter))
      AND (brand_filter IS NULL OR trim(b.name) ILIKE trim(brand_filter))
      AND (
        normalized_term = ''
        OR lower(unaccent(p.name)) ILIKE '%' || normalized_term || '%'
        OR lower(unaccent(COALESCE(p.code, ''))) ILIKE '%' || normalized_term || '%'
        OR lower(unaccent(COALESCE(p.description, ''))) ILIKE '%' || normalized_term || '%'
      )
      AND (p.is_active IS NULL OR p.is_active = true)
  ),
  counted AS (
    SELECT count(*) AS total FROM filtered
  )
  SELECT
    f.id,
    f.name,
    f.description,
    f.price,
    f.image_url,
    f.image_2,
    f.code_1,
    f.code_2,
    f.brand_name,
    f.brand_image_url,
    f.category_name,
    f.created_at,
    f.specifications,
    c.total AS total_count
  FROM filtered f, counted c
  ORDER BY
    CASE WHEN sort_by = 'relevance' THEN f.relevance END DESC,
    CASE WHEN sort_by = 'lowest_price' THEN f.price END ASC,
    CASE WHEN sort_by = 'highest_price' THEN f.price END DESC,
    CASE WHEN sort_by = 'newest' THEN f.created_at END DESC,
    f.name ASC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;
