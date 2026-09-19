import { supabase } from '../config/supabase.js'

// Obtener todas las órdenes impagas (pendientes de pago)
export const getPendingPayments = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles(email, full_name, phone)
    `)
    .eq('is_paid', false)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data.map(order => ({
    ...order,
    user_email: order.profiles?.email,
    user_name: order.profiles?.full_name,
    user_phone: order.profiles?.phone
  }))
}

// Registrar pago de una orden (total o parcial)
export const registerPayment = async (orderId, amountPaid, paymentMethod) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('total_amount, amount_paid')
    .eq('id', orderId)
    .single()
  
  if (orderError) throw orderError
  
  const currentAmountPaid = Number(order.amount_paid || 0)
  const newAmountPaid = currentAmountPaid + amountPaid
  if (newAmountPaid > order.total_amount) {
    throw new Error('El monto supera el saldo pendiente')
  }

  const isFullyPaid = newAmountPaid >= order.total_amount

  let updateQuery = supabase
    .from('orders')
    .update({
      amount_paid: newAmountPaid,
      is_paid: isFullyPaid,
      payment_method: paymentMethod || null
    })
    .eq('id', orderId)

  updateQuery = order.amount_paid === null
    ? updateQuery.is('amount_paid', null)
    : updateQuery.eq('amount_paid', order.amount_paid)

  const { data, error } = await updateQuery.select().maybeSingle()
  
  if (error) throw error
  if (!data) throw new Error('La orden fue modificada. Actualizá la lista e intentá nuevamente')
  return { success: true, order: data }
}

// Marcar orden como pagada completamente
export const markAsPaid = async (orderId, paymentMethod) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('id', orderId)
    .single()
  
  if (orderError) throw orderError
  
  const { data, error } = await supabase
    .from('orders')
    .update({
      amount_paid: order.total_amount,
      is_paid: true,
      payment_method: paymentMethod || null
    })
    .eq('id', orderId)
    .eq('is_paid', false)
    .select()
    .maybeSingle()
  
  if (error) throw error
  if (!data) throw new Error('La orden ya fue pagada o fue modificada')
  return { success: true, order: data }
}