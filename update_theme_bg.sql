-- Add background_style column to themes table

alter table public.themes 
add column if not exists background_style text default 'default';

-- Update existing row to default
update public.themes set background_style = 'default' where background_style is null;
