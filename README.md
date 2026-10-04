# ecommerce-vapers
Ecommerce de vapers descartables con React, Node.js, Express y Supabase. Incluye panel de admin, descuento acumulativo (50% OFF en 6ta unidad), carrito persistente y diseño responsive.

## Migraciones

Antes de desplegar esta versión, ejecutá en orden `server/supabase/migrations/007_query_performance_and_checkout.sql`, `server/supabase/migrations/008_secure_product_image_writes.sql`, `server/supabase/migrations/009_grant_admin_rpc_permissions.sql` y `server/supabase/migrations/010_regrant_admin_rpc_permissions.sql` en el SQL Editor de Supabase. La primera agrega índices, funciones para estadísticas y usuarios paginados, y el checkout transaccional. La segunda elimina las escrituras públicas al bucket de imágenes; las cargas y eliminaciones se hacen mediante rutas admin autenticadas del backend. La tercera y la cuarta aseguran los permisos de ejecución de los RPC para `service_role` (volvé a correr la 010 si el error "permission denied for function" reaparece).
