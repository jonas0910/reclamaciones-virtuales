-- 20260624000000_initial_schema.sql
-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 1. profiles (Información de la empresa, vinculada a auth.users de Supabase Auth)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null, -- Nombre del contacto o administrador
  company_ruc varchar(11) not null unique,
  company_name text not null, -- Razón Social
  company_address text not null, -- Dirección Fiscal
  company_postal_code varchar(10),
  company_link text,
  company_logo text, -- URL pública del bucket de Supabase Storage
  role text not null default 'owner' check (role in ('super_admin', 'owner', 'admin', 'manager')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- 2. establishments (Locales comerciales físicos o virtuales)
create table public.establishments (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  name text not null, -- e.g., "Sede Miraflores" o "E-commerce Principal"
  custom_link text not null, -- Slug para acceso directo (e.g., "miraflores-digital")
  type_address varchar(10) not null check (type_address in ('Fisico', 'Virtual')),
  code varchar(50), -- Código interno asignado por Sunat/empresa
  address text, -- Requerido si es físico
  department text,
  province text,
  district text,
  zip_code varchar(10),
  web_page text, -- Requerido si es virtual
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,
  
  constraint unique_custom_link_per_profile unique(profile_id, custom_link)
);

-- 3. claim_categories (Clasificación de reclamos definida por la empresa)
create table public.claim_categories (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  establishment_id uuid references public.establishments(id) on delete set null,
  name text not null, -- e.g., "Atención al Cliente", "Delivery"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- 4. selection_pages (Páginas multi-establecimiento)
create table public.selection_pages (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  custom_link text not null unique, -- Slug único para la landing (e.g., "grupo-nona")
  brand_name text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- 5. establishment_selection_pages (Pivot Many-to-Many)
create table public.establishment_selection_pages (
  id uuid default gen_random_uuid() primary key,
  selection_page_id uuid references public.selection_pages(id) on delete cascade not null,
  establishment_id uuid references public.establishments(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,
  
  constraint unique_establishment_per_page unique(selection_page_id, establishment_id)
);

-- 6. notification_emails (Emails donde se envían alertas de reclamos entrantes)
create table public.notification_emails (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  establishment_id uuid references public.establishments(id) on delete cascade not null,
  email text not null,
  verified boolean default false not null,
  verification_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,
  
  constraint unique_email_per_establishment unique(establishment_id, email)
);

-- 7. document_types (Catálogo estático de documentos de identidad)
create table public.document_types (
  id serial primary key,
  abbreviation varchar(10) not null unique, -- e.g., "DNI", "CE", "RUC", "Pasaporte"
  character_count integer default 12 not null,
  name text not null,
  is_active boolean default true not null
);

-- 8. currency_types (Catálogo estático de monedas)
create table public.currency_types (
  id serial primary key,
  abbreviation varchar(10) not null unique, -- e.g., "PEN", "USD"
  name text not null,
  symbol varchar(5) not null,
  is_active boolean default true not null
);

-- 9. claims (El reclamo o queja)
create table public.claims (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  establishment_id uuid references public.establishments(id) on delete cascade not null,
  
  -- Datos del Reclamante
  name text not null,
  under_age boolean default false not null,
  parent_name text, -- Obligatorio si under_age = true
  document_type_id integer references public.document_types(id) not null,
  document_number varchar(30) not null,
  email text not null,
  phone varchar(20) not null,
  
  -- Datos del Bien Contratado
  type_asset varchar(10) not null check (type_asset in ('Producto', 'Servicio')),
  description_asset text not null,
  currency_type_id integer references public.currency_types(id),
  claim_amount decimal(12, 2),
  
  -- Detalle del Reclamo
  claim_type varchar(10) not null check (claim_type in ('queja', 'reclamo')),
  claim_text text not null,
  request_text text not null,
  
  -- Campos autogenerados y de control
  numeration bigint, -- Correlativo anual por profile_id
  claim_code varchar(20) unique, -- YYYY-RANDOM (e.g. 2026-B3X9PL7K)
  state varchar(15) default 'pendiente' not null check (state in ('pendiente', 'respondido')),
  
  -- Gestión de respuesta
  answer text,
  answer_date timestamp with time zone,
  email_contact_date timestamp with time zone,
  phone_contact_date timestamp with time zone,
  internal_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- 10. claim_category_mappings (Pivot de clasificación interna de reclamos)
create table public.claim_category_mappings (
  id uuid default gen_random_uuid() primary key,
  claim_id uuid references public.claims(id) on delete cascade not null,
  category_id uuid references public.claim_categories(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);


-- ==========================================
-- TRANSPARENT SOFT DELETE TRIGGERS
-- ==========================================

create or replace function public.soft_delete_profile()
returns trigger language plpgsql security definer as $$
begin
  update public.profiles set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_profiles_soft_delete
  before delete on public.profiles
  for each row execute procedure public.soft_delete_profile();

create or replace function public.soft_delete_establishment()
returns trigger language plpgsql security definer as $$
begin
  update public.establishments set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_establishments_soft_delete
  before delete on public.establishments
  for each row execute procedure public.soft_delete_establishment();

create or replace function public.soft_delete_claim_category()
returns trigger language plpgsql security definer as $$
begin
  update public.claim_categories set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_claim_categories_soft_delete
  before delete on public.claim_categories
  for each row execute procedure public.soft_delete_claim_category();

create or replace function public.soft_delete_selection_page()
returns trigger language plpgsql security definer as $$
begin
  update public.selection_pages set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_selection_pages_soft_delete
  before delete on public.selection_pages
  for each row execute procedure public.soft_delete_selection_page();

create or replace function public.soft_delete_establishment_selection_page()
returns trigger language plpgsql security definer as $$
begin
  update public.establishment_selection_pages set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_establishment_selection_pages_soft_delete
  before delete on public.establishment_selection_pages
  for each row execute procedure public.soft_delete_establishment_selection_page();

create or replace function public.soft_delete_notification_email()
returns trigger language plpgsql security definer as $$
begin
  update public.notification_emails set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_notification_emails_soft_delete
  before delete on public.notification_emails
  for each row execute procedure public.soft_delete_notification_email();

create or replace function public.soft_delete_claim()
returns trigger language plpgsql security definer as $$
begin
  update public.claims set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_claims_soft_delete
  before delete on public.claims
  for each row execute procedure public.soft_delete_claim();

create or replace function public.soft_delete_claim_category_mapping()
returns trigger language plpgsql security definer as $$
begin
  update public.claim_category_mappings set deleted_at = now() where id = old.id;
  return null;
end;
$$;
create trigger trg_claim_category_mappings_soft_delete
  before delete on public.claim_category_mappings
  for each row execute procedure public.soft_delete_claim_category_mapping();


-- ==========================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ==========================================

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger trg_establishments_updated_at before update on public.establishments for each row execute procedure public.handle_updated_at();
create trigger trg_selection_pages_updated_at before update on public.selection_pages for each row execute procedure public.handle_updated_at();
create trigger trg_claims_updated_at before update on public.claims for each row execute procedure public.handle_updated_at();


-- ==========================================
-- CLASSIFICATION AND CORRELATIVE NUMERATION
-- ==========================================

create or replace function public.process_claim_before_insert()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  current_year text;
  random_code text;
  max_num bigint;
  done boolean := false;
begin
  -- 1. Obtener el año actual
  current_year := to_char(now(), 'YYYY');
  
  -- 2. Generar código único aleatorio YYYY-XXXXXXXX (e.g. 2026-F9X2HA81)
  while not done loop
    random_code := current_year || '-' || upper(substring(md5(random()::text) from 1 for 8));
    -- Verificar si existe colisión
    select exists (
      select 1 from public.claims 
      where claim_code = random_code
    ) into done;
    done := not done; -- Si existe, continuar ciclo. Si no existe, finaliza.
  end loop;
  
  new.claim_code := random_code;
  
  -- 3. Calcular correlativo anual de reclamos para la empresa (profile_id)
  select coalesce(max(numeration), 0)
  into max_num
  from public.claims
  where profile_id = new.profile_id
    and extract(year from created_at) = extract(year from now())
    and deleted_at is null;
    
  new.numeration := max_num + 1;
  
  return new;
end;
$$;

create or replace trigger trg_claims_before_insert
  before insert on public.claims
  for each row execute procedure public.process_claim_before_insert();


-- ==========================================
-- PROFILE CREATION AUTOMATION FROM AUTH
-- ==========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, company_ruc, company_name, company_address, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Administrador'),
    coalesce(new.raw_user_meta_data->>'company_ruc', '00000000000'),
    coalesce(new.raw_user_meta_data->>'company_name', 'Mi Empresa S.A.C.'),
    coalesce(new.raw_user_meta_data->>'company_address', 'Dirección Provisional'),
    'owner'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- OPTIMIZED INDEXES (PARTIAL INDEXES FOR SOFT DELETES)
-- ==========================================

create index idx_profiles_ruc on public.profiles(company_ruc) where deleted_at is null;
create index idx_establishments_profile_id on public.establishments(profile_id) where deleted_at is null;
create index idx_establishments_custom_link on public.establishments(custom_link) where deleted_at is null;
create index idx_claims_profile_id on public.claims(profile_id) where deleted_at is null;
create index idx_claims_claim_code on public.claims(claim_code) where deleted_at is null;
create index idx_claims_created_at on public.claims(created_at desc) where deleted_at is null;
create index idx_notification_emails_establishment on public.notification_emails(establishment_id) where deleted_at is null;


-- ==========================================
-- SEED DATA
-- ==========================================

insert into public.document_types (abbreviation, character_count, name, is_active) values
  ('DNI', 8, 'Documento Nacional de Identidad', true),
  ('CE', 15, 'Carnet de Extranjería', true),
  ('RUC', 11, 'Registro Único de Contribuyentes', true),
  ('Pasaporte', 15, 'Pasaporte', true)
on conflict (abbreviation) do update set name = excluded.name, character_count = excluded.character_count, is_active = excluded.is_active;

insert into public.currency_types (abbreviation, name, symbol, is_active) values
  ('PEN', 'Soles', 'S/', true),
  ('USD', 'Dólares', '$', true)
on conflict (abbreviation) do update set name = excluded.name, symbol = excluded.symbol, is_active = excluded.is_active;


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.claim_categories enable row level security;
alter table public.selection_pages enable row level security;
alter table public.establishment_selection_pages enable row level security;
alter table public.notification_emails enable row level security;
alter table public.claims enable row level security;

-- 1. Profiles
create policy "Permitir lectura del propio perfil" on public.profiles
  for select to authenticated using ((select auth.uid()) = id and deleted_at is null);

create policy "Permitir actualización del propio perfil" on public.profiles
  for update to authenticated using ((select auth.uid()) = id and deleted_at is null) with check ((select auth.uid()) = id and deleted_at is null);

-- 2. Establishments
create policy "Lectura pública de establecimientos" on public.establishments
  for select to anon, authenticated using (deleted_at is null);

create policy "Gestión total de establecimientos por el dueño" on public.establishments
  for all to authenticated using ((select auth.uid()) = profile_id and deleted_at is null) with check ((select auth.uid()) = profile_id and deleted_at is null);

-- 3. Claim Categories
create policy "Lectura pública de categorías" on public.claim_categories
  for select to anon, authenticated using (deleted_at is null);

create policy "Gestión de categorías por el dueño" on public.claim_categories
  for all to authenticated using ((select auth.uid()) = profile_id and deleted_at is null) with check ((select auth.uid()) = profile_id and deleted_at is null);

-- 4. Selection Pages
create policy "Lectura pública de landing pages" on public.selection_pages
  for select to anon, authenticated using (deleted_at is null);

create policy "Gestión de landing pages por el dueño" on public.selection_pages
  for all to authenticated using ((select auth.uid()) = profile_id and deleted_at is null) with check ((select auth.uid()) = profile_id and deleted_at is null);

-- 5. Establishment Selection Pages
create policy "Lectura pública de pivot landing-establecimiento" on public.establishment_selection_pages
  for select to anon, authenticated using (deleted_at is null);

create policy "Gestión total de pivot por el dueño de la página" on public.establishment_selection_pages
  for all to authenticated
  using (
    exists (
      select 1 from public.selection_pages sp
      where sp.id = selection_page_id
        and sp.profile_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.selection_pages sp
      where sp.id = selection_page_id
        and sp.profile_id = (select auth.uid())
    )
    and exists (
      select 1 from public.establishments est
      where est.id = establishment_id
        and est.profile_id = (select auth.uid())
    )
  );


-- 6. Notification Emails
create policy "Lectura de emails de notificación para la empresa" on public.notification_emails
  for select to authenticated using ((select auth.uid()) = profile_id and deleted_at is null);

create policy "Gestión de emails de notificación por el dueño" on public.notification_emails
  for all to authenticated using ((select auth.uid()) = profile_id and deleted_at is null) with check ((select auth.uid()) = profile_id and deleted_at is null);

-- 7. Claims
create policy "Lectura de reclamos para la empresa correspondiente" on public.claims
  for select to authenticated using ((select auth.uid()) = profile_id and deleted_at is null);

create policy "Inserción pública de reclamos (consumidor)" on public.claims
  for insert to anon, authenticated with check (deleted_at is null);

create policy "Gestión/Respuesta de reclamos para la empresa" on public.claims
  for update to authenticated using ((select auth.uid()) = profile_id and deleted_at is null) with check ((select auth.uid()) = profile_id and deleted_at is null);
