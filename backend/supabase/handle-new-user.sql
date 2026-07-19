-- Create a public.profiles row whenever a new auth.users row is inserted.
-- Never deletes from auth.users (that causes "Database error loading user after sign-up").
-- Same email may register again as a brand-new Auth user after the old account was removed.
--
--   npm run auth:setup -w backend

create table if not exists public.revoked_accounts (
  id text primary key,
  "authUserId" uuid not null unique,
  email text not null,
  reason text,
  "revokedAt" timestamp(3) not null default now()
);

create index if not exists revoked_accounts_email_idx
  on public.revoked_accounts (email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(new.email);
begin
  -- Free the email if a leftover profile from a previous Auth user still holds it.
  delete from public.profiles
  where lower(email) = normalized_email
    and id <> new.id;

  insert into public.profiles (
    id,
    email,
    "fullName",
    role,
    "isBanned",
    "createdAt",
    "updatedAt"
  )
  values (
    new.id,
    normalized_email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    'passenger'::"Role",
    false,
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    "fullName" = coalesce(public.profiles."fullName", excluded."fullName"),
    "updatedAt" = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
