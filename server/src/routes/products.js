import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, brand, flavor_es, price, stock_mobile, stock_warehouse, is_promo, image_url')
      .order('id')

    if (req.query.promo === 'true') query = query.eq('is_promo', true)

    const { data, error } = await query

    if (error) throw error

    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30')
    res.json(data)
  } catch (err) {
    console.error('❌ Error en /api/products:', err)
    const statusCode = err.statusCode || (err.code === 'ENOTFOUND' ? 503 : 500)
    const message = err.code === 'ENOTFOUND'
      ? 'No se pudo conectar con la base de datos. Intenta nuevamente en unos minutos.'
      : err.message
    res.status(statusCode).json({ error: message })
  }
})

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const productId = Number.parseInt(req.params.id, 10)

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'ID de producto inválido' })
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30')
    res.json(data)
  } catch (err) {
    console.error('❌ Error en /api/products/:id:', err)
    const statusCode = err.statusCode || (err.code === 'ENOTFOUND' ? 503 : 500)
    const message = err.code === 'ENOTFOUND'
      ? 'No se pudo conectar con la base de datos. Intenta nuevamente en unos minutos.'
      : err.message
    res.status(statusCode).json({ error: message })
  }
})

export default router