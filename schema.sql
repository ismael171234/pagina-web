-- Ejecuta este script en el editor SQL de tu Supabase Dashboard para agregar soporte a las variaciones en el catálogo de productos:

ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS opciones jsonb;
