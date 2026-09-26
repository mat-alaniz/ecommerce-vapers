import { supabase } from '../config/supabase.js'

export const getAllUsers = async ({ page, pageSize }) => {
  const { data: profiles, error } = await supabase.rpc('admin_users_page', {
    p_page: page,
    p_page_size: pageSize
  })

  if (error) throw error

  return {
    data: profiles.filter(user => user.id).map(user => {
      const totalSpent = Number(user.total_spent || 0)
      const totalPaid = Number(user.total_paid || 0)

      return {
        ...user,
        total_spent: totalSpent,
        total_paid: totalPaid,
        pending_debt: totalSpent - totalPaid
      }
    }),
    total: Number(profiles[0]?.total_count || 0)
  }
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