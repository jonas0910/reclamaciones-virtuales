-- Migración: Configuración de Supabase Storage para logotipos de empresas y páginas de selección

-- 1. Crear el bucket "logos" si no existe
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;


-- 3. Eliminar políticas existentes para evitar conflictos si se vuelve a correr
drop policy if exists "Acceso público a logos" on storage.objects;
drop policy if exists "Subida de logos por el dueño" on storage.objects;
drop policy if exists "Actualización de logos por el dueño" on storage.objects;
drop policy if exists "Eliminación de logos por el dueño" on storage.objects;

-- 4. Permitir lectura pública de logotipos (necesario para mostrar logos en formularios de reclamos y páginas de selección públicas)
create policy "Acceso público a logos" on storage.objects
  for select to public
  using (bucket_id = 'logos');

-- 5. Permitir a usuarios autenticados subir imágenes en su propio directorio (basado en auth.uid())
create policy "Subida de logos por el dueño" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Permitir a usuarios autenticados modificar imágenes en su propio directorio
create policy "Actualización de logos por el dueño" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. Permitir a usuarios autenticados eliminar imágenes en su propio directorio
create policy "Eliminación de logos por el dueño" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'logos' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );
