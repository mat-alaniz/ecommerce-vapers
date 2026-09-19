import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// Finalizar compra
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError) {
      return res.status(401).json({ error: 'Sesión inválida' })
    }

    const { items } = req.body
    const userId = user.id

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no puede estar vacío' })
    }

    const productIds = items.map(item => item?.id)
    const hasInvalidQuantity = items.some(item => (
      !Number.isInteger(Number(item?.quantity)) || Number(item.quantity) <= 0
    ))

    if (productIds.some(id => !Number.isInteger(Number(id))) || hasInvalidQuantity) {
      return res.status(400).json({ error: 'Los productos del carrito no son válidos' })
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds)

    if (productsError) throw productsError

    const productsById = new Map(products.map(product => [String(product.id), product]))
    if (productsById.size !== new Set(productIds.map(String)).size) {
      return res.status(400).json({ error: 'Uno o más productos ya no están disponibles' })
    }
    
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
      const product = productsById.get(String(item.id))
      const quantity = Number(item.quantity)
      const price = Number(product.price)
      let itemTotal = 0
      let itemDiscount = 0
      for (let i = 1; i <= quantity; i++) {
        currentUnits++
        if (currentUnits % 6 === 0) {
          itemTotal += price / 2
          itemDiscount += price / 2
        } else {
          itemTotal += price
        }
      }
      totalWithDiscount += itemTotal
      discountApplied += itemDiscount
      orderItems.push({
        product_id: product.id,
        quantity,
        unit_price: price,
        discount_per_unit: itemDiscount / quantity
      })
    }
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        total_amount: totalWithDiscount, 
        discount_applied: discountApplied, 
        status: 'completada',
        amount_paid: 0,
        is_paid: false,
        payment_method: null
      }])
      .select()
      .single()
    
    if (orderError) throw orderError
    
    for (const item of orderItems) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert([{ ...item, order_id: order.id }])

      if (itemError) throw itemError
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