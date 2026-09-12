-- =========================================================
-- VITALIS ACADEMY · Script único de base de datos
-- Copia y pega TODO este archivo en Supabase > SQL Editor
-- y presiona "Run". Solo se ejecuta UNA vez.
-- =========================================================

-- ---------------------------------------------------------
-- 1) TABLA DE PERFILES (usuarios y sus roles)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'asesor' check (role in ('admin', 'asesor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Función auxiliar: ¿el usuario que hace la consulta es administrador?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Cuando alguien se registra en auth.users, se crea automáticamente
-- su fila en "profiles" con el rol por defecto "asesor".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'asesor'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Un usuario puede ver su propio perfil; el administrador puede ver todos.
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- Un usuario puede editar su propio perfil pero NO puede cambiarse el rol.
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- El administrador puede editar cualquier perfil, incluyendo el rol
-- (esto es lo que usa la pantalla "Usuarios" para asignar roles).
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------
-- 2) TABLA DE CURSOS
-- ---------------------------------------------------------
create table if not exists public.cursos (
  id bigint generated always as identity primary key,
  nombre text not null,
  area text not null check (area in ('Ciencias de la Salud', 'Tecnología', 'Habilidades Blandas')),
  precio numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cursos enable row level security;

create policy "cursos_select_all" on public.cursos
  for select using (auth.role() = 'authenticated');

create policy "cursos_write_admin" on public.cursos
  for insert with check (public.is_admin());

create policy "cursos_update_admin" on public.cursos
  for update using (public.is_admin()) with check (public.is_admin());

create policy "cursos_delete_admin" on public.cursos
  for delete using (public.is_admin());

-- ---------------------------------------------------------
-- 3) TABLA DE INSCRIPCIONES (ventas)
-- ---------------------------------------------------------
create table if not exists public.inscripciones (
  id bigint generated always as identity primary key,
  alumno_nombre text not null,
  celular text not null,
  profesion text,
  departamento text not null,
  curso_id bigint not null references public.cursos (id),
  asesor_id uuid not null references public.profiles (id),
  monto numeric not null default 0,
  fecha date not null default current_date,
  certificado_estado text not null default 'En elaboración'
    check (certificado_estado in ('En elaboración', 'Terminado', 'Entregado')),
  certificado_ruta text,
  created_at timestamptz not null default now()
);

alter table public.inscripciones enable row level security;

-- Un asesor ve solo sus propias ventas; el administrador ve todas.
create policy "inscripciones_select" on public.inscripciones
  for select using (public.is_admin() or asesor_id = auth.uid());

-- Cualquier usuario autenticado puede registrar una venta, siempre
-- que se registre a sí mismo como asesor (o sea administrador).
create policy "inscripciones_insert" on public.inscripciones
  for insert with check (asesor_id = auth.uid() or public.is_admin());

-- Un asesor puede corregir sus propias ventas; el administrador
-- puede editar cualquiera (incluyendo el estado del certificado).
create policy "inscripciones_update" on public.inscripciones
  for update using (public.is_admin() or asesor_id = auth.uid())
  with check (public.is_admin() or asesor_id = auth.uid());

create policy "inscripciones_delete_admin" on public.inscripciones
  for delete using (public.is_admin());

-- ---------------------------------------------------------
-- 4) ALMACENAMIENTO DE CERTIFICADOS (PDF)
--    Antes de esta parte, crea el bucket "certificados" desde
--    el panel de Supabase (Storage > New bucket), marcado como
--    privado. Instrucciones detalladas en el README.
-- ---------------------------------------------------------
create policy "certificados_lectura_escritura"
  on storage.objects
  for all
  using (bucket_id = 'certificados' and auth.role() = 'authenticated')
  with check (bucket_id = 'certificados' and auth.role() = 'authenticated');

-- =========================================================
-- LISTO. La base de datos ya está creada y protegida.
-- Siguiente paso: crea tu usuario administrador desde
-- Authentication > Add user (ver README) y luego ejecuta,
-- reemplazando el correo, esta última línea UNA sola vez:
--
-- update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'TU_CORREO_AQUI');
-- =========================================================
