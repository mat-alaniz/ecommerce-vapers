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

    const { items, stockType = 'mobile' } = req.body
    const userId = user.id

    if (!['mobile', 'warehouse'].includes(stockType)) {
      return res.status(400).json({ error: 'Modalidad de stock inválida' })
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return res.status(400).json({ error: 'El carrito no puede estar vacío' })
    }

    const hasInvalidQuantity = items.some(item => (
      !Number.isInteger(Number(item?.quantity)) || Number(item.quantity) <= 0
    ))

    if (items.some(item => !Number.isInteger(Number(item?.id)) || Number(item.id) <= 0) || hasInvalidQuantity) {
      return res.status(400).json({ error: 'Los productos del carrito no son válidos' })
    }

    const { data: orderResult, error: orderError } = await supabase.rpc('create_order', {
      p_user_id: userId,
      p_items: items.map(item => ({
        product_id: Number(item.id),
        quantity: Number(item.quantity)
      })),
      p_stock_type: stockType
    })

    if (orderError) {
      if (orderError.message?.includes('INSUFFICIENT_STOCK')) {
        return res.status(409).json({ error: 'No hay stock suficiente para uno o más productos' })
      }
      if (orderError.message?.includes('PRODUCT_NOT_FOUND')) {
        return res.status(400).json({ error: 'Uno o más productos ya no están disponibles' })
      }
      throw orderError
    }

    res.json(orderResult)
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