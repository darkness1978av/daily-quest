-- Morning/Night routine app: tables, security rules and helper functions.
-- Safe to run more than once. All names start with mq_ so the recipes app is not touched.

create table if not exists public.mq_families (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'המשפחה שלנו',
  parent_code text not null unique,
  child_code text not null unique,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.mq_members (
  family_id uuid not null references public.mq_families(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('parent', 'child')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.mq_state (
  family_id uuid primary key references public.mq_families(id) on delete cascade,
  state jsonb not null,
  device text,
  updated_at timestamptz not null default now()
);

-- the server stamps the time, so devices with different clocks agree
create or replace function public.mq_touch() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists mq_state_touch on public.mq_state;
create trigger mq_state_touch before insert or update on public.mq_state
  for each row execute function public.mq_touch();

-- is the signed-in user a member of this family?
create or replace function public.mq_is_member(fid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.mq_members where family_id = fid and user_id = auth.uid());
$$;

create or replace function public.mq_is_parent(fid uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.mq_members where family_id = fid and user_id = auth.uid() and role = 'parent');
$$;

alter table public.mq_families enable row level security;
alter table public.mq_members enable row level security;
alter table public.mq_state enable row level security;

drop policy if exists mq_members_read on public.mq_members;
create policy mq_members_read on public.mq_members for select using (user_id = auth.uid());

drop policy if exists mq_state_read on public.mq_state;
create policy mq_state_read on public.mq_state for select using (public.mq_is_member(family_id));

drop policy if exists mq_state_insert on public.mq_state;
create policy mq_state_insert on public.mq_state for insert with check (public.mq_is_member(family_id));

drop policy if exists mq_state_update on public.mq_state;
create policy mq_state_update on public.mq_state for update
  using (public.mq_is_member(family_id)) with check (public.mq_is_member(family_id));

-- mq_families has no direct policies: everything goes through the functions below.

-- 8-character code without look-alike characters
create or replace function public.mq_new_code() returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out text := '';
begin
  for i in 1..8 loop
    out := out || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return out;
end $$;

-- a parent opens a new family
create or replace function public.mq_create_family(p_name text default 'המשפחה שלנו') returns json
  language plpgsql security definer set search_path = public as $$
declare
  fid uuid;
  pc text;
  cc text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  loop
    pc := public.mq_new_code();
    cc := public.mq_new_code();
    exit when pc <> cc
      and not exists (select 1 from public.mq_families where parent_code in (pc, cc) or child_code in (pc, cc));
  end loop;
  insert into public.mq_families (name, parent_code, child_code) values (p_name, pc, cc) returning id into fid;
  insert into public.mq_members (family_id, user_id, role) values (fid, auth.uid(), 'parent');
  return json_build_object('family_id', fid, 'role', 'parent', 'parent_code', pc, 'child_code', cc);
end $$;

-- join with an invite code. The code decides the role.
create or replace function public.mq_join_family(p_code text) returns json
  language plpgsql security definer set search_path = public as $$
declare
  f public.mq_families;
  r text;
  code text := upper(trim(p_code));
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into f from public.mq_families where parent_code = code or child_code = code;
  if not found then return json_build_object('ok', false); end if;
  r := case when f.parent_code = code then 'parent' else 'child' end;
  insert into public.mq_members (family_id, user_id, role) values (f.id, auth.uid(), r)
    on conflict (family_id, user_id) do nothing;
  select role into r from public.mq_members where family_id = f.id and user_id = auth.uid();
  return json_build_object('ok', true, 'family_id', f.id, 'role', r);
end $$;

-- family details. The invite codes are shown to parents only.
create or replace function public.mq_family_info(p_family uuid) returns json
  language plpgsql stable security definer set search_path = public as $$
declare
  f public.mq_families;
  r text;
begin
  select role into r from public.mq_members where family_id = p_family and user_id = auth.uid();
  if r is null then return null; end if;
  select * into f from public.mq_families where id = p_family;
  return json_build_object(
    'name', f.name,
    'role', r,
    'parent_code', case when r = 'parent' then f.parent_code end,
    'child_code', case when r = 'parent' then f.child_code end
  );
end $$;

-- leave the family (the data stays for the others)
create or replace function public.mq_leave_family(p_family uuid) returns void
  language sql security definer set search_path = public as $$
  delete from public.mq_members where family_id = p_family and user_id = auth.uid();
$$;

grant execute on function public.mq_create_family(text) to authenticated;
grant execute on function public.mq_join_family(text) to authenticated;
grant execute on function public.mq_family_info(uuid) to authenticated;
grant execute on function public.mq_leave_family(uuid) to authenticated;
grant execute on function public.mq_is_member(uuid) to authenticated;
grant execute on function public.mq_is_parent(uuid) to authenticated;
grant select on public.mq_members to authenticated;
grant select, insert, update on public.mq_state to authenticated;
