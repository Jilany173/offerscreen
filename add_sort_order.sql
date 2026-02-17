
alter table public.courses add column sort_order integer default 0;

-- Optional: Update existing courses to have diverse sort_orders based on creation time
with ranked_courses as (
  select id, row_number() over (partition by offer_id order by created_at) as rn
  from public.courses
)
update public.courses
set sort_order = ranked_courses.rn
from ranked_courses
where public.courses.id = ranked_courses.id;
