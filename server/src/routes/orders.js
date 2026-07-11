import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// Finalizar compra
router.post('/', async (req, res) => {
  try {
    const { items, userId, totalAmount } = req.body
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('total_units_purchased')
      .eq('id', userId)
      .single()
    
    if (profileError) throw profileError
    
    let currentUnits = profile.total_units_purchased || 0
    let totalWithDiscount = 0
    let discountApplied = 0
    let orderItems = []
    
    for (const item of items) {
      let itemTotal = 0
      let itemDiscount = 0
      for (let i = 1; i <= item.quantity; i++) {
        currentUnits++
        if (currentUnits % 6 === 0) {
          itemTotal += item.price / 2
          itemDiscount += item.price / 2
        } else {
          itemTotal += item.price
        }
      }
      totalWithDiscount += itemTotal
      discountApplied += itemDiscount
      orderItems.push({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        discount_per_unit: itemDiscount / item.quantity
      })
    }
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        total_amount: totalWithDiscount, 
        discount_applied: discountApplied, 
        status: 'completada' 
      }])
      .select()
      .single()
    
    if (orderError) throw orderError
    
    for (const item of orderItems) {
      await supabase.from('order_items').insert([{ ...item, order_id: order.id }])
    }
    
    await supabase.from('profiles').update({ total_units_purchased: currentUnits }).eq('id', userId)
    
    res.json({ 
      success: true, 
      orderId: order.id, 
      total: totalWithDiscount, 
      discount: discountApplied, 
      totalUnits: currentUnits 
    })
  } catch (err) {
    console.error('❌ Error al procesar orden:', err)
    res.status(500).json({ error: err.message })
  }
})

// 🆕 HISTORIAL DE ÓRDENES DEL USUARIO
router.get('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError) throw userError
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (ordersError) throw ordersError
    
    const formattedOrders = orders.map(order => ({
      ...order,
      items: order.order_items.map(item => ({
        ...item,
        product_name: item.products?.name
      }))
    }))
    
    res.json(formattedOrders)
  } catch (err) {
    console.error('❌ Error al obtener historial:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router