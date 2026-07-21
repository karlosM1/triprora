-- Hybrid RLS: catalog tables are readable via the Data API; private tables stay locked.
-- RLS is already enabled on all public tables. Private tables intentionally have no
-- policies, so anon/authenticated cannot read or write them. The Express/Prisma API
-- connects as a privileged role and bypasses RLS.
--
--   npm run rls:setup -w backend

-- ---------------------------------------------------------------------------
-- Catalog: public SELECT for anon + authenticated
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read routes" on public.routes;
create policy "Public can read routes"
  on public.routes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read operators" on public.operators;
create policy "Public can read operators"
  on public.operators
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read van classes" on public.van_classes;
create policy "Public can read van classes"
  on public.van_classes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read published vans" on public."Van";
create policy "Public can read published vans"
  on public."Van"
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public can read seats of published vans" on public."Seat";
create policy "Public can read seats of published vans"
  on public."Seat"
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public."Van" v
      where v.id = "Seat"."vanId"
        and v.status = 'published'
    )
  );

-- ---------------------------------------------------------------------------
-- Private tables: RLS enabled, no policies (Data API denied by design)
-- profiles, Booking, booking_snapshots, deliveries, delivery_snapshots,
-- payments, notifications, destination_addresses, vehicles, vehicle_documents,
-- driver_applications, driver_documents, addresses, emergency_contacts,
-- driver_bank_accounts, driver_wallets, wallet_ledger_entries,
-- wallet_daily_settlements, wallet_audit_logs, driver_payouts, revoked_accounts
-- ---------------------------------------------------------------------------
