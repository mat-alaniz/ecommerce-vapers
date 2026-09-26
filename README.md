# ecommerce-vapers
Ecommerce de vapers descartables con React, Node.js, Express y Supabase. Incluye panel de admin, descuento acumulativo (50% OFF en 6ta unidad), carrito persistente y diseño responsive.

## Migración de rendimiento

Antes de desplegar esta versión, ejecutá `server/supabase/migrations/007_query_performance_and_checkout.sql` en el SQL Editor de Supabase. Agrega índices, funciones para estadísticas y usuarios paginados, y el checkout transaccional que usa el backend.
