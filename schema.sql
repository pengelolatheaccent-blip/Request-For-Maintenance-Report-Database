-- ============================================================
-- Skema Database: Maintenance Log - Apartemen The Accent
-- Jalankan file ini di Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  no_form text unique,
  day text,
  date date,
  time text,
  year int,
  month int,
  date1 int,
  unit text,
  tenant text,
  work_requested text,
  any_time text,
  appointment text,
  date2 text,
  time2 text,
  klasifikasi text,
  request_complain text,
  unit_public_area text,
  department text,
  work_required text,
  work_performed text,
  material text,
  quantity text,
  cost text,
  unable text,
  desc_unable text,
  closing_date date,
  closing_time text,
  pic_name text,
  divisi text,
  status text default 'Open',
  completion_target numeric,
  giving_solution text,
  occupant_feedback text,
  keterangan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_maintenance_status on public.maintenance_requests (status);
create index if not exists idx_maintenance_date on public.maintenance_requests (date);
create index if not exists idx_maintenance_unit on public.maintenance_requests (unit);
create index if not exists idx_maintenance_department on public.maintenance_requests (department);
create index if not exists idx_maintenance_request_complain on public.maintenance_requests (request_complain);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_maintenance_updated_at on public.maintenance_requests;
create trigger trg_maintenance_updated_at
before update on public.maintenance_requests
for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security: hanya pengguna yang login (staf) yang bisa
-- membaca dan mengubah data. Sesuaikan jika Anda butuh akses publik
-- read-only, dsb.
-- ============================================================
alter table public.maintenance_requests enable row level security;

drop policy if exists "Authenticated can read" on public.maintenance_requests;
create policy "Authenticated can read"
  on public.maintenance_requests for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert" on public.maintenance_requests;
create policy "Authenticated can insert"
  on public.maintenance_requests for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update" on public.maintenance_requests;
create policy "Authenticated can update"
  on public.maintenance_requests for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete" on public.maintenance_requests;
create policy "Authenticated can delete"
  on public.maintenance_requests for delete
  to authenticated
  using (true);
