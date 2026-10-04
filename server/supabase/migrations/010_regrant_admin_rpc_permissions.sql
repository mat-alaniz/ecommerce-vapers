-- Re-asserts execute permissions for admin RPC functions.
-- Run this in the Supabase SQL Editor if "permission denied for function ..." reappears.

grant usage on schema public to service_role;

revoke all on function public.admin_dashboard_stats() from public, anon, authenticated;
revoke all on function public.admin_users_page(integer, integer) from public, anon, authenticated;
revoke all on function public.create_order(uuid, jsonb, text) from public, anon, authenticated;

grant execute on function public.admin_dashboard_stats() to service_role;
grant execute on function public.admin_users_page(integer, integer) to service_role;
grant execute on function public.create_order(uuid, jsonb, text) to service_role;

-- Safety net: make sure service_role can execute every function currently in public,
-- in case other RPCs hit the same issue later.
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format('grant execute on function %s to service_role;', fn.signature);
  end loop;
end
$$;

notify pgrst, 'reload schema';

-- Verification query (run manually to confirm the grant is in place):
-- select grantee, privilege_type
-- from information_schema.routine_privileges
-- where routine_name in ('admin_dashboard_stats', 'admin_users_page')
--   and grantee = 'service_role';
