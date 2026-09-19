import { supabase } from '../config/supabase.js'

export const getAllUsers = async () => {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) throw profilesError

  // Obtener todas las órdenes para calcular totales por usuario
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('user_id, total_amount, amount_paid')

  if (ordersError) throw ordersError

  // Calcular totales por usuario
  const userTotals = {}
  orders.forEach(order => {
    if (!userTotals[order.user_id]) {
      userTotals[order.user_id] = { total_spent: 0, total_paid: 0 }
    }
    userTotals[order.user_id].total_spent += order.total_amount
    userTotals[order.user_id].total_paid += (order.amount_paid || 0)
  })

  return profiles.map(user => ({
    ...user,
    total_spent: userTotals[user.id]?.total_spent || 0,
    total_paid: userTotals[user.id]?.total_paid || 0,
    pending_debt: (userTotals[user.id]?.total_spent || 0) - (userTotals[user.id]?.total_paid || 0)
  }))
}

export const deleteUser = async (id) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true, message: 'Usuario eliminado correctamente' }
}

// Obtener todas las órdenes de un usuario con sus productos
export const getUserOrders = async (userId) => {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, price)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ordersError) throw ordersError

  return orders.map(order => ({
    id: order.id,
    created_at: order.created_at,
    total_amount: order.total_amount,
    discount_applied: order.discount_applied,
    amount_paid: order.amount_paid || 0,
    is_paid: order.is_paid || false,
    payment_method: order.payment_method || null,
    restante: order.total_amount - (order.amount_paid || 0),
    items: order.order_items.map(item => ({
      product_id: item.product_id,
      product_name: item.products?.name || 'Producto eliminado',
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_per_unit: item.discount_per_unit || 0,
      subtotal: (item.unit_price * item.quantity) - ((item.discount_per_unit || 0) * item.quantity)
    }))
  }))
}