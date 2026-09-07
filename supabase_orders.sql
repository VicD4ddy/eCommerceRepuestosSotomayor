-- ============================================================
-- TABLAS DE PEDIDOS Y GESTIÓN DE COMPRAS - REPUESTOS SOTOMAYOR
-- Ejecuta todo este script en el Editor SQL de Supabase
-- ============================================================

-- 1. Tabla de Pedidos (orders)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_id_doc TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  vehicle_info TEXT NOT NULL,
  delivery_method TEXT NOT NULL,     -- 'tienda', 'envio', 'delivery'
  delivery_agency TEXT,              -- 'MRW', 'Tealca', 'Zoom', 'Domesa'
  delivery_address TEXT,
  payment_method TEXT NOT NULL,      -- 'pago_movil', 'efectivo', 'zelle', 'usdt', 'punto'
  total_usd NUMERIC(10, 2) NOT NULL,
  total_bs NUMERIC(14, 2),
  bcv_rate NUMERIC(10, 4),
  bcv_multiplier NUMERIC(5, 2) DEFAULT 1.6,
  status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'confirmado', 'pagado', 'despachado', 'cancelado'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Ítems del Pedido (order_items)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_usd NUMERIC(10, 2) NOT NULL,
  price_bs NUMERIC(14, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices para consultas de alta velocidad
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acceso

-- Cualquier visitante (anon o authenticated) puede insertar una orden (realizar compra)
DROP POLICY IF EXISTS "Permitir insercion publica de pedidos" ON orders;
CREATE POLICY "Permitir insercion publica de pedidos"
  ON orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir insercion publica de items de pedido" ON order_items;
CREATE POLICY "Permitir insercion publica de items de pedido"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Permitir lectura publica de un pedido especifico por ID (para ver el recibo /pedido/[id])
DROP POLICY IF EXISTS "Permitir lectura publica de pedido por id" ON orders;
CREATE POLICY "Permitir lectura publica de pedido por id"
  ON orders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica de items de pedido" ON order_items;
CREATE POLICY "Permitir lectura publica de items de pedido"
  ON order_items FOR SELECT
  USING (true);

-- Usuarios autenticados (administradores) tienen permisos totales de actualizacion y borrado
DROP POLICY IF EXISTS "Permitir admin actualizar pedidos" ON orders;
CREATE POLICY "Permitir admin actualizar pedidos"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir admin borrar pedidos" ON orders;
CREATE POLICY "Permitir admin borrar pedidos"
  ON orders FOR DELETE
  TO authenticated
  USING (true);
