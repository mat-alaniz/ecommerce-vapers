import { supabase } from '../config/supabase.js'

export const getStats = async () => {
  const [statsResult, productsResult, pendingPaymentsResult] = await Promise.all([
    supabase.rpc('admin_dashboard_stats').single(),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('is_paid', false)
  ])

  if (statsResult.error) throw statsResult.error
  if (productsResult.error) throw productsResult.error
  if (pendingPaymentsResult.error) throw pendingPaymentsResult.error

  return {
    totalUsers: Number(statsResult.data.total_users),
    totalOrders: Number(statsResult.data.total_orders),
    totalRevenue: Number(statsResult.data.total_revenue),
    totalUnitsSold: Number(statsResult.data.total_units_sold),
    totalProducts: productsResult.count || 0,
    pendingPayments: pendingPaymentsResult.count || 0
  }
}
