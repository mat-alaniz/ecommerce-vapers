import { supabase } from '../config/supabase.js'

export const getStats = async () => {
  // Total de usuarios
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  // Total de órdenes y suma de montos
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_amount, discount_applied')
  
  if (ordersError) throw ordersError

  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0
  
  // Calcular unidades vendidas desde order_items
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('quantity')
  
  if (itemsError) throw itemsError

  const totalUnitsSold = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
  
  return { totalUsers, totalOrders, totalRevenue, totalUnitsSold }
}
