-- One-time cleanup: revoke + remove Auth users that no longer have a profile.
-- Safe to re-run.
--
--   npx prisma db execute --file supabase/cleanup-orphaned-auth-users.sql --schema prisma/schema.prisma

create table if not exists public.revoked_accounts (
  id text primary key,
  "authUserId" uuid not null unique,
  email text not null,
  reason text,
  "revokedAt" timestamp(3) not null default now()
);

create index if not exists revoked_accounts_email_idx
  on public.revoked_accounts (email);

insert into public.revoked_accounts (id, "authUserId", email, reason, "revokedAt")
select
  gen_random_uuid()::text,
  u.id,
  lower(u.email),
  'cleanup_orphaned_auth_user',
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and u.email is not null
on conflict ("authUserId") do update
set
  email = excluded.email,
  reason = excluded.reason,
  "revokedAt" = now();

delete from auth.users u
where exists (
  select 1 from public.revoked_accounts ra where ra."authUserId" = u.id
)
or not exists (
  select 1 from public.profiles p where p.id = u.id
);
