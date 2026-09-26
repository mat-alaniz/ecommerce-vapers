import { supabase } from '../config/supabase.js'

export const getStats = async () => {
  const { data, error } = await supabase.rpc('admin_dashboard_stats').single()

  if (error) throw error

  return {
    totalUsers: Number(data.total_users),
    totalOrders: Number(data.total_orders),
    totalRevenue: Number(data.total_revenue),
    totalUnitsSold: Number(data.total_units_sold)
  }
}
