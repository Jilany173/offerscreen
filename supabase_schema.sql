-- Create the Offers (Campaigns) table
create table public.offers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  is_active boolean default false
);

-- Create the Courses table
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  offer_id uuid references public.offers(id) on delete cascade not null,
  title text not null,
  original_price numeric not null,
  discounted_price numeric not null
);

-- Enable RLS (Row Level Security) - Optional but recommended
alter table public.offers enable row level security;
alter table public.courses enable row level security;

-- Create policies to allow public read access (for the Offer Screen)
create policy "Enable read access for all users" on public.offers for select using (true);
create policy "Enable read access for all users" on public.courses for select using (true);

-- Create policies to allow authenticated users (Admin) to modify data
-- Note: You might need to adjust this depending on your auth setup. 
-- For simple setups without auth, you can allow all interactions:
create policy "Enable all access for all users" on public.offers for all using (true) with check (true);
create policy "Enable all access for all users" on public.courses for all using (true) with check (true);
