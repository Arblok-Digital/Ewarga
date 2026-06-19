-- ==========================================
-- E-WARGA DATABASE SCHEMA & RLS POLICIES
-- ==========================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nama_lengkap text not null,
  nik varchar(16) check (length(nik) = 16 or length(nik) = 0),
  no_kk varchar(16) check (length(no_kk) = 16 or length(no_kk) = 0),
  alamat text,
  rt varchar(3) default '000',
  rw varchar(3) default '000',
  no_wa text,
  role text check (role in ('warga', 'rt', 'rw', 'staff_kecamatan', 'admin')) default 'warga',
  status_verifikasi text check (status_verifikasi in ('pending', 'verified', 'rejected')) default 'pending',
  kabupaten text,
  kecamatan text,
  kelurahan text,
  kampung text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 2. Create Surat Pengantar Table
create table if not exists public.surat_pengantar (
  id uuid default gen_random_uuid() primary key,
  warga_id uuid references public.profiles(id) on delete cascade not null,
  jenis_surat text not null,
  keperluan text not null,
  status text check (status in ('menunggu_rt', 'ditolak_rt', 'menunggu_rw', 'ditolak_rw', 'siap_diambil', 'selesai')) default 'menunggu_rt' not null,
  catatan_rt text,
  catatan_rw text,
  nomor_surat_rt text,
  nomor_surat_rw text,
  file_ktp text, -- URL to Supabase Storage
  file_kk text,  -- URL to Supabase Storage
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Surat Pengantar
alter table public.surat_pengantar enable row level security;

-- 3. Create Workflow Logs Table
create table if not exists public.workflow_logs (
  id uuid default gen_random_uuid() primary key,
  surat_id uuid references public.surat_pengantar(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  actor_nama text not null,
  actor_role text not null,
  status_sebelum text not null,
  status_sesudah text not null,
  catatan text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Workflow Logs
alter table public.workflow_logs enable row level security;

-- 4. Automatically Sync User Registrations to Profiles
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_nama text;
  default_nik text;
  default_no_kk text;
  default_alamat text;
  default_rt text;
  default_rw text;
  default_no_wa text;
  default_role text;
  default_kabupaten text;
  default_kecamatan text;
  default_kelurahan text;
  default_kampung text;
begin
  default_nama := coalesce(new.raw_user_meta_data->>'nama_lengkap', split_part(new.email, '@', 1));
  default_nik := coalesce(new.raw_user_meta_data->>'nik', '');
  default_no_kk := coalesce(new.raw_user_meta_data->>'no_kk', '');
  default_alamat := coalesce(new.raw_user_meta_data->>'alamat', '');
  default_rt := coalesce(new.raw_user_meta_data->>'rt', '001');
  default_rw := coalesce(new.raw_user_meta_data->>'rw', '001');
  default_no_wa := coalesce(new.raw_user_meta_data->>'no_wa', '');
  default_role := coalesce(new.raw_user_meta_data->>'role', 'warga');
  default_kabupaten := coalesce(new.raw_user_meta_data->>'kabupaten', 'Kota Bandung');
  default_kecamatan := coalesce(new.raw_user_meta_data->>'kecamatan', 'Coblong');
  default_kelurahan := coalesce(new.raw_user_meta_data->>'kelurahan', 'Dago');
  default_kampung := coalesce(new.raw_user_meta_data->>'kampung', '');

  insert into public.profiles (
    id, nama_lengkap, nik, no_kk, alamat, rt, rw, no_wa, role, status_verifikasi,
    kabupaten, kecamatan, kelurahan, kampung
  )
  values (
    new.id,
    default_nama,
    default_nik,
    default_no_kk,
    default_alamat,
    default_rt,
    default_rw,
    default_no_wa,
    default_role,
    'pending',
    default_kabupaten,
    default_kecamatan,
    default_kelurahan,
    default_kampung
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger creation for Auth Users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- ROW LEVEL SECURITY (RLS) GENERAL POLICIES
-- ==========================================

-- A. Policies for PROFILES
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

drop policy if exists "RT can view profiles of citizens in their RT & RW" on public.profiles;
create policy "RT can view profiles of citizens in their RT & RW" 
  on public.profiles for select 
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() 
      and (p.role = 'rt' and p.rt = public.profiles.rt and p.rw = public.profiles.rw)
    )
  );

drop policy if exists "RW can view profiles of citizens in their RW" on public.profiles;
create policy "RW can view profiles of citizens in their RW" 
  on public.profiles for select 
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() 
      and (p.role = 'rw' and p.rw = public.profiles.rw)
    )
  );

drop policy if exists "Staff Kecamatan and Admin can view all profiles" on public.profiles;
create policy "Staff Kecamatan and Admin can view all profiles" 
  on public.profiles for select 
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff_kecamatan', 'admin')
    )
  );

drop policy if exists "RT/RW can update citizens verifikasi status" on public.profiles;
create policy "RT/RW can update citizens verifikasi status" 
  on public.profiles for update 
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('rt', 'rw', 'staff_kecamatan', 'admin')
    )
  );


-- B. Policies for SURAT PENGANTAR
drop policy if exists "Warga can view their own submissions" on public.surat_pengantar;
create policy "Warga can view their own submissions"
  on public.surat_pengantar for select
  using (auth.uid() = warga_id);

drop policy if exists "Warga can create their own submissions" on public.surat_pengantar;
create policy "Warga can create their own submissions"
  on public.surat_pengantar for insert
  with check (auth.uid() = warga_id);

drop policy if exists "Warga can update their own pending submissions" on public.surat_pengantar;
create policy "Warga can update their own pending submissions"
  on public.surat_pengantar for update
  using (auth.uid() = warga_id and status = 'menunggu_rt');

drop policy if exists "RT can view submissions in their RT and RW" on public.surat_pengantar;
create policy "RT can view submissions in their RT and RW"
  on public.surat_pengantar for select
  using (
    exists (
      select 1 from public.profiles viewer, public.profiles citizen
      where viewer.id = auth.uid() 
      and citizen.id = public.surat_pengantar.warga_id
      and viewer.role = 'rt' 
      and viewer.rt = citizen.rt 
      and viewer.rw = citizen.rw
    )
  );

drop policy if exists "RT can update submissions in their RT" on public.surat_pengantar;
create policy "RT can update submissions in their RT"
  on public.surat_pengantar for update
  using (
    exists (
      select 1 from public.profiles viewer, public.profiles citizen
      where viewer.id = auth.uid() 
      and citizen.id = public.surat_pengantar.warga_id
      and viewer.role = 'rt' 
      and viewer.rt = citizen.rt 
      and viewer.rw = citizen.rw
    )
  );

drop policy if exists "RW can view submissions in their RW" on public.surat_pengantar;
create policy "RW can view submissions in their RW"
  on public.surat_pengantar for select
  using (
    exists (
      select 1 from public.profiles viewer, public.profiles citizen
      where viewer.id = auth.uid() 
      and citizen.id = public.surat_pengantar.warga_id
      and viewer.role = 'rw' 
      and viewer.rw = citizen.rw
    )
  );

drop policy if exists "RW can update submissions in their RW" on public.surat_pengantar;
create policy "RW can update submissions in their RW"
  on public.surat_pengantar for update
  using (
    exists (
      select 1 from public.profiles viewer, public.profiles citizen
      where viewer.id = auth.uid() 
      and citizen.id = public.surat_pengantar.warga_id
      and viewer.role = 'rw' 
      and viewer.rw = citizen.rw
    )
  );

drop policy if exists "Staff Kecamatan and Admin can view all submissions" on public.surat_pengantar;
create policy "Staff Kecamatan and Admin can view all submissions"
  on public.surat_pengantar for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff_kecamatan', 'admin')
    )
  );

drop policy if exists "Staff Kecamatan and Admin can update all submissions" on public.surat_pengantar;
create policy "Staff Kecamatan and Admin can update all submissions"
  on public.surat_pengantar for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('staff_kecamatan', 'admin')
    )
  );


-- C. Policies for WORKFLOW LOGS
drop policy if exists "Everyone authenticated can read logs linked to visible submissions" on public.workflow_logs;
create policy "Everyone authenticated can read logs linked to visible submissions"
  on public.workflow_logs for select
  using (
    exists (
      select 1 from public.surat_pengantar s
      where s.id = public.workflow_logs.surat_id
    )
  );

drop policy if exists "Everyone authenticated can write logs" on public.workflow_logs;
create policy "Everyone authenticated can write logs"
  on public.workflow_logs for insert
  with check (auth.uid() = actor_id);
