-- Bucket para imágenes de productos
-- Este bucket es usado por el admin en client/src/components/AdminModals/ProductFormModal.jsx

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];

-- Rehabilitar RLS si estuviera desactivado
alter table storage.objects enable row level security;

-- Eliminar políticas previas para evitar errores al recrearlas
 drop policy if exists "Public product images are viewable by everyone" on storage.objects;
 drop policy if exists "Anyone can upload product images" on storage.objects;
 drop policy if exists "Anyone can update product images" on storage.objects;
 drop policy if exists "Anyone can delete product images" on storage.objects;

-- Lectura pública: cualquier persona puede ver imágenes del bucket
create policy "Public product images are viewable by everyone"
on storage.objects for select
using (bucket_id = 'product-images');

-- Subida pública: cualquiera puede subir imágenes a este bucket
create policy "Anyone can upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images');

-- Actualización pública: permite reemplazar o editar archivos del bucket
create policy "Anyone can update product images"
on storage.objects for update
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

-- Eliminación pública: permite borrar archivos del bucket
create policy "Anyone can delete product images"
on storage.objects for delete
using (bucket_id = 'product-images');

notify pgrst, 'reload schema';
