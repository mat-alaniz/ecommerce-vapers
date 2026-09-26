import { supabase } from '../config/supabase.js'

export const getAllOrders = async ({ from, to }) => {
  const { data, count, error } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      total_amount,
      discount_applied,
      created_at,
      profiles(email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  
  if (error) throw error
  
  return {
    data: data.map(order => ({
      ...order,
      user_email: order.profiles?.email
    })),
    total: count || 0
  }
}

export const getOrderDetail = async (orderId) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles(email, full_name),
      order_items (
        *,
        products (id, name, price)
      )
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error

  return {
    id: order.id,
    user_email: order.profiles?.email,
    user_name: order.profiles?.full_name,
    total_amount: order.total_amount,
    discount_applied: order.discount_applied,
    created_at: order.created_at,
    items: order.order_items.map(item => ({
      product_id: item.product_id,
      product_name: item.products?.name || 'Producto eliminado',
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_per_unit: item.discount_per_unit || 0,
      subtotal: (item.unit_price * item.quantity) - ((item.discount_per_unit || 0) * item.quantity)
    }))
  }
}

export const deleteOrder = async (orderId) => {
  // 1. Obtener el user_id de la orden antes de eliminarla
  const { data: order, error: orderFindError } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single()

  if (orderFindError) throw orderFindError

  // 2. Eliminar items de la orden
  const { error: itemsError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId)

  if (itemsError) throw itemsError

  // 3. Eliminar la orden
  const { error: orderError } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (orderError) throw orderError

  // 4. Recalcular unidades acumuladas del usuario
  const { data: userOrders, error: userOrdersError } = await supabase
    .from('orders')
    .select(`
      id,
      order_items (quantity)
    `)
    .eq('user_id', order.user_id)

  if (userOrdersError) throw userOrdersError

  let totalUnits = 0
  for (const userOrder of userOrders) {
    for (const item of userOrder.order_items) {
      totalUnits += item.quantity
    }
  }

  // 5. Actualizar el perfil del usuario con el nuevo total
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ total_units_purchased: totalUnits })
    .eq('id', order.user_id)

  if (updateError) throw updateError

  return { success: true, message: 'Orden eliminada y unidades recalculadas correctamente' }
}
