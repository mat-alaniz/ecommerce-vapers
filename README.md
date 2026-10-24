# ecommerce-vapers
Ecommerce de vapers descartables con React, Node.js, Express y Supabase. Incluye panel de admin, descuento acumulativo (50% OFF en 6ta unidad), carrito persistente y diseño responsive.

## Deploy: Vercel + Render + Supabase

### 1. Preparar Supabase

Antes de desplegar, aplicá en el SQL Editor de Supabase las migraciones pendientes de `server/supabase/migrations/`, en orden numérico (`001` a `010`). No vuelvas a ejecutar migraciones ya aplicadas en una base existente. Estas migraciones modifican tablas existentes; verificá que el esquema base (`products`, `profiles`, `orders` y `order_items`) ya esté creado.

Las migraciones `007` a `010` agregan el checkout transaccional y estadísticas, restringen la escritura de imágenes a administradores autenticados y otorgan permisos de RPC a `service_role`. La migración `006` crea el bucket público de lectura `product-images`; la `008` elimina las políticas de escritura pública.

### 2. Desplegar el backend en Render

El archivo `render.yaml` configura el servicio web, el health check y el comando de producción. En Render, creá el servicio usando el Blueprint del repositorio y cargá estos secretos/valores en el servicio:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo en el backend; nunca exponerla al frontend)
- `CORS_ORIGINS`: origen exacto del sitio en Vercel, sin `/` final. Para más de un dominio, separalos por comas.

`NODE_ENV=production` está configurado en el Blueprint. El servidor no inicia en producción si falta `CORS_ORIGINS`. La URL final del backend termina en `/api` al configurar el frontend.

### 3. Desplegar el frontend en Vercel

Importá el repositorio y configurá el **Root Directory** como `client`, con los valores:

- Build command: `npm run build`
- Output directory: `dist`
- `VITE_API_BASE_URL`: URL pública de Render seguida de `/api` (por ejemplo `https://tu-api.onrender.com/api`)
- `VITE_ADMIN_WHATSAPP`: número del administrador en formato internacional, sin `+` ni espacios

`client/vercel.json` reescribe las rutas de la aplicación a `index.html` para que funcionen las rutas de React Router. Si usás un dominio propio, agregalo también a `CORS_ORIGINS` en Render y redeployá el backend.

### 4. Verificación antes de abrir la tienda

1. Confirmá que el health check de Render responde en `/api/health`.
2. Verificá que el frontend público puede cargar productos y que el backend rechaza orígenes que no estén en `CORS_ORIGINS`.
3. Probá registro, inicio/cierre de sesión, compra con stock suficiente e insuficiente, historial y las operaciones principales del panel admin.
4. Confirmá que las imágenes son visibles públicamente, pero solo un administrador autenticado puede subirlas o eliminarlas.
5. En Supabase Auth, revisá la configuración de URL del sitio y los redirect URLs para los dominios de producción.

En desarrollo, copiá `client/.env.example` a `client/.env.local`; Vite redirige `/api` a `http://localhost:5000`. En `server/.env` configurá las tres variables de Supabase. El backend usa `npm run dev` para desarrollo y `npm start` para producción.
