revoke all on function public.admin_dashboard_stats() from public, anon, authenticated;
revoke all on function public.admin_users_page(integer, integer) from public, anon, authenticated;
revoke all on function public.create_order(uuid, jsonb, text) from public, anon, authenticated;

grant execute on function public.admin_dashboard_stats() to service_role;
grant execute on function public.admin_users_page(integer, integer) to service_role;
grant execute on function public.create_order(uuid, jsonb, text) to service_role;

notify pgrst, 'reload schema';
