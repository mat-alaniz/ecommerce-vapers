drop policy if exists "Anyone can upload product images" on storage.objects;
drop policy if exists "Anyone can update product images" on storage.objects;
drop policy if exists "Anyone can delete product images" on storage.objects;

notify pgrst, 'reload schema';
