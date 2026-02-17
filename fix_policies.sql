-- Fix Offers Table Policies

-- 1. Enable RLS
alter table public.offers enable row level security;

-- 2. Drop existing policies to avoid conflicts
drop policy if exists "Enable read access for all users" on public.offers;
drop policy if exists "Enable all access for all users" on public.offers;

-- 3. Create permissive policies
-- Allow everyone to read offers (for the Offer Screen)
create policy "Enable read access for all users" on public.offers for select using (true);

-- Allow everyone to insert/update/delete (for the Admin Panel - in production this should be authenticated only)
create policy "Enable all access for all users" on public.offers for all using (true) with check (true);
