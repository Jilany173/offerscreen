-- Create Themes Table for configurable Offer Screen text

create table if not exists public.themes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  header_text_1 text default 'Ramadan Special',
  header_text_2 text default '150 Hours',
  is_active boolean default true
);

-- Enable RLS
alter table public.themes enable row level security;

-- Policies
drop policy if exists "Enable read access for all users" on public.themes;
drop policy if exists "Enable all access for all users" on public.themes;

create policy "Enable read access for all users" on public.themes for select using (true);
create policy "Enable all access for all users" on public.themes for all using (true) with check (true);

-- Insert default theme if not exists
insert into public.themes (header_text_1, header_text_2, is_active)
select 'Ramadan Special', '150 Hours', true
where not exists (select 1 from public.themes);
