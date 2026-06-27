-- SQL Seed Data for Libro de Reclamaciones Virtual
-- Este script inserta datos de prueba vinculando el perfil al primer usuario registrado en auth.users.
-- Puede ejecutarse en el editor SQL de Supabase.

DO $$
DECLARE
  v_user_id uuid;
  v_est_1 uuid;
  v_est_2 uuid;
  v_est_3 uuid;
  v_cat_1 uuid;
  v_cat_2 uuid;
  v_cat_3 uuid;
  v_cat_4 uuid;
  v_page_id uuid;
BEGIN
  -- 1. Obtener el primer usuario de auth.users.
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario en la tabla auth.users. Por favor crea un usuario en Supabase Auth (Authentication -> Users -> Add User) antes de ejecutar este script.';
  END IF;

  -- 2. Insertar o actualizar el perfil de la empresa vinculada al usuario
  INSERT INTO public.profiles (id, name, company_ruc, company_name, company_address, company_postal_code, company_link, role, created_at, updated_at)
  VALUES (
    v_user_id,
    'Jonas Administrador',
    '20123456789',
    'Inversiones Nona S.A.C.',
    'Av. Larco 123, Miraflores, Lima',
    '15074',
    'https://nona.pe',
    'owner',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    company_ruc = EXCLUDED.company_ruc,
    company_name = EXCLUDED.company_name,
    company_address = EXCLUDED.company_address,
    company_postal_code = EXCLUDED.company_postal_code,
    company_link = EXCLUDED.company_link,
    role = EXCLUDED.role,
    deleted_at = NULL;

  -- 3. Crear 3 establecimientos (2 físicos y 1 virtual)
  v_est_1 := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_est_2 := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
  v_est_3 := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';

  INSERT INTO public.establishments (id, profile_id, name, custom_link, type_address, code, address, department, province, district, zip_code, created_at, updated_at)
  VALUES (
    v_est_1,
    v_user_id,
    'Sede Miraflores (Restaurante)',
    'nona-miraflores',
    'Fisico',
    'EST-001',
    'Calle Las Pizzas 456, Miraflores',
    'Lima',
    'Lima',
    'Miraflores',
    '15074',
    now(),
    now()
  )
  ON CONFLICT (profile_id, custom_link) DO UPDATE SET
    name = EXCLUDED.name,
    type_address = EXCLUDED.type_address,
    code = EXCLUDED.code,
    address = EXCLUDED.address,
    deleted_at = NULL;

  INSERT INTO public.establishments (id, profile_id, name, custom_link, type_address, code, address, department, province, district, zip_code, created_at, updated_at)
  VALUES (
    v_est_2,
    v_user_id,
    'Sede San Isidro (Cafetería)',
    'nona-san-isidro',
    'Fisico',
    'EST-002',
    'Av. Camino Real 789, San Isidro',
    'Lima',
    'Lima',
    'San Isidro',
    '15073',
    now(),
    now()
  )
  ON CONFLICT (profile_id, custom_link) DO UPDATE SET
    name = EXCLUDED.name,
    type_address = EXCLUDED.type_address,
    code = EXCLUDED.code,
    address = EXCLUDED.address,
    deleted_at = NULL;

  INSERT INTO public.establishments (id, profile_id, name, custom_link, type_address, code, web_page, created_at, updated_at)
  VALUES (
    v_est_3,
    v_user_id,
    'E-commerce Tienda Virtual',
    'nona-delivery',
    'Virtual',
    'EST-003',
    'https://delivery.nona.pe',
    now(),
    now()
  )
  ON CONFLICT (profile_id, custom_link) DO UPDATE SET
    name = EXCLUDED.name,
    type_address = EXCLUDED.type_address,
    code = EXCLUDED.code,
    web_page = EXCLUDED.web_page,
    deleted_at = NULL;

  -- 4. Crear Categorías de Reclamos
  v_cat_1 := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11';
  v_cat_2 := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12';
  v_cat_3 := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13';
  v_cat_4 := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14';

  INSERT INTO public.claim_categories (id, profile_id, establishment_id, name, created_at)
  VALUES 
    (v_cat_1, v_user_id, v_est_1, 'Calidad de Comida', now()),
    (v_cat_2, v_user_id, v_est_1, 'Atención del Mesero', now()),
    (v_cat_3, v_user_id, v_est_3, 'Demora en Delivery', now()),
    (v_cat_4, v_user_id, NULL, 'Infraestructura y Limpieza', now())
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    establishment_id = EXCLUDED.establishment_id,
    deleted_at = NULL;

  -- 5. Crear Alertas de Correo (notification_emails)
  INSERT INTO public.notification_emails (profile_id, establishment_id, email, verified, created_at)
  VALUES 
    (v_user_id, v_est_1, 'gerente.miraflores@nona.pe', true, now()),
    (v_user_id, v_est_1, 'reclamaciones@nona.pe', true, now()),
    (v_user_id, v_est_2, 'gerente.sanisidro@nona.pe', true, now()),
    (v_user_id, v_est_3, 'delivery.soporte@nona.pe', true, now()),
    (v_user_id, v_est_3, 'reclamaciones@nona.pe', true, now())
  ON CONFLICT (establishment_id, email) DO UPDATE SET
    verified = EXCLUDED.verified,
    deleted_at = NULL;

  -- 6. Crear una Página de Selección Multi-Establecimiento
  v_page_id := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
  INSERT INTO public.selection_pages (id, profile_id, custom_link, brand_name, logo_url, created_at, updated_at)
  VALUES (
    v_page_id,
    v_user_id,
    'grupo-nona',
    'Corporación La Nona',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    now(),
    now()
  )
  ON CONFLICT (custom_link) DO UPDATE SET
    brand_name = EXCLUDED.brand_name,
    logo_url = EXCLUDED.logo_url,
    deleted_at = NULL;

  -- Relacionar los establecimientos a la página de selección
  INSERT INTO public.establishment_selection_pages (selection_page_id, establishment_id, created_at)
  VALUES 
    (v_page_id, v_est_1, now()),
    (v_page_id, v_est_2, now()),
    (v_page_id, v_est_3, now())
  ON CONFLICT (selection_page_id, establishment_id) DO UPDATE SET
    deleted_at = NULL;

  -- 7. Crear Reclamos de Prueba
  -- Reclamo 1 (Pendiente - Producto - Miraflores)
  INSERT INTO public.claims (
    id, profile_id, establishment_id, name, under_age, parent_name, 
    document_type_id, document_number, email, phone, 
    type_asset, description_asset, currency_type_id, claim_amount, 
    claim_type, claim_text, request_text, state, created_at
  ) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11',
    v_user_id,
    v_est_1,
    'Juan Pérez Díaz',
    false,
    null,
    1, -- DNI
    '45789632',
    'juan.perez@gmail.com',
    '999888777',
    'Producto',
    'Plato de Pasta Carbonara frío y sin sazón',
    1, -- PEN
    65.00,
    'reclamo',
    'El plato de pasta carbonara llegó totalmente frío a la mesa, la pasta estaba dura y sin salsa adecuada.',
    'Exijo la devolución total de lo pagado por el plato de pasta carbonara.',
    'pendiente',
    now() - interval '5 days'
  ) ON CONFLICT (id) DO UPDATE SET deleted_at = NULL;

  -- Mapear Reclamo 1 a su categoría
  INSERT INTO public.claim_category_mappings (claim_id, category_id, created_at)
  VALUES ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11', v_cat_1, now())
  ON CONFLICT DO NOTHING;

  -- Reclamo 2 (Respondido - Servicio - San Isidro)
  INSERT INTO public.claims (
    id, profile_id, establishment_id, name, under_age, parent_name, 
    document_type_id, document_number, email, phone, 
    type_asset, description_asset, currency_type_id, claim_amount, 
    claim_type, claim_text, request_text, state, answer, answer_date, created_at
  ) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12',
    v_user_id,
    v_est_2,
    'María Gómez Torres',
    false,
    null,
    1, -- DNI
    '72458963',
    'maria.gomez@yahoo.com',
    '987654321',
    'Servicio',
    'Servicio de atención en mesa de postres',
    1, -- PEN
    120.00,
    'queja',
    'El mesero fue muy grosero al tomarnos el pedido de postres y demoró más de 40 minutos en traer la cuenta.',
    'Una disculpa formal por parte del personal y capacitación para los meseros.',
    'respondido',
    'Estimada María, lamentamos profundamente el inconveniente con la atención en nuestro local de San Isidro. Hemos tomado medidas correctivas con el mesero involucrado y reforzado la capacitación del equipo.',
    now() - interval '1 day',
    now() - interval '3 days'
  ) ON CONFLICT (id) DO UPDATE SET deleted_at = NULL;

  -- Mapear Reclamo 2 a su categoría
  INSERT INTO public.claim_category_mappings (claim_id, category_id, created_at)
  VALUES ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d12', v_cat_2, now())
  ON CONFLICT DO NOTHING;

  -- Reclamo 3 (Pendiente - Menor de edad - Virtual)
  INSERT INTO public.claims (
    id, profile_id, establishment_id, name, under_age, parent_name, 
    document_type_id, document_number, email, phone, 
    type_asset, description_asset, currency_type_id, claim_amount, 
    claim_type, claim_text, request_text, state, created_at
  ) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13',
    v_user_id,
    v_est_3,
    'Mateo Rodríguez (Menor)',
    true,
    'Carlos Rodríguez Flores',
    1, -- DNI
    '88776655',
    'carlos.rodriguez@outlook.com',
    '955444333',
    'Servicio',
    'Servicio de Delivery por App Web',
    1, -- PEN
    45.50,
    'reclamo',
    'El motorizado de delivery nunca llegó a entregar el pedido, sin embargo figuraba como entregado en la web.',
    'Reembolso del dinero cargado a mi tarjeta de crédito.',
    'pendiente',
    now() - interval '2 hours'
  ) ON CONFLICT (id) DO UPDATE SET deleted_at = NULL;

  -- Mapear Reclamo 3 a su categoría
  INSERT INTO public.claim_category_mappings (claim_id, category_id, created_at)
  VALUES ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d13', v_cat_3, now())
  ON CONFLICT DO NOTHING;

  -- Reclamo 4 (Pendiente - Extranjero - Miraflores)
  INSERT INTO public.claims (
    id, profile_id, establishment_id, name, under_age, parent_name, 
    document_type_id, document_number, email, phone, 
    type_asset, description_asset, currency_type_id, claim_amount, 
    claim_type, claim_text, request_text, state, created_at
  ) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d14',
    v_user_id,
    v_est_1,
    'John Doe Smith',
    false,
    null,
    4, -- Pasaporte
    'P99887766',
    'john.doe@gmail.com',
    '+14155552671',
    'Producto',
    'Botella de vino de colección defectuosa',
    2, -- USD
    150.00,
    'reclamo',
    'The wine bottle served was oxidized (corked) and smelled like vinegar. The manager refused to replace the bottle.',
    'A full refund of 150 USD or a fresh bottle of the same wine vintage.',
    'pendiente',
    now() - interval '1 day'
  ) ON CONFLICT (id) DO UPDATE SET deleted_at = NULL;

  -- Mapear Reclamo 4 a su categoría
  INSERT INTO public.claim_category_mappings (claim_id, category_id, created_at)
  VALUES ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d14', v_cat_1, now())
  ON CONFLICT DO NOTHING;

END $$;
