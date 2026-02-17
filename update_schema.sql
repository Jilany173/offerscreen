-- Robustly update schema

-- 1. Create Courses table (if it doesn't exist)
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  offer_id uuid references public.offers(id) on delete cascade not null,
  title text not null,
  original_price numeric not null,
  discounted_price numeric not null
);

-- 2. Modify Offers table (Add missing start_time)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'offers' and column_name = 'start_time') then
    alter table public.offers add column start_time timestamp with time zone;
  end if;
end $$;

-- 3. Reset Policies for Courses (Drop and Recreate to avoid "already exists" error)
drop policy if exists "Enable read access for all users" on public.courses;
drop policy if exists "Enable all access for all users" on public.courses;

alter table public.courses enable row level security;

create policy "Enable read access for all users" on public.courses for select using (true);
create policy "Enable all access for all users" on public.courses for all using (true) with check (true);
