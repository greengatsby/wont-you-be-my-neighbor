-- This Supabase project is shared with other apps, so auth.users can already
-- exist from prior signups. The neighbors trigger only fires on INSERT, so
-- pre-existing users end up with no neighbors_users row. Make the insert
-- idempotent and backfill anyone missing.

create or replace function public.neighbors_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.neighbors_users (id, phone, display_name)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'display_name', 'Neighbor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

insert into public.neighbors_users (id, phone, display_name)
select u.id, u.phone, coalesce(u.raw_user_meta_data->>'display_name', 'Neighbor')
from auth.users u
left join public.neighbors_users n on n.id = u.id
where n.id is null;
