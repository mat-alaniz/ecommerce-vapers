import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/products?select=*`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    )
    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error('❌ Error en /api/products:', err)
    res.status(500).json({ error: err.message })
  }
})

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/products?select=*&id=eq.${id}`,
      {
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      }
    )
    const data = await response.json()
    if (data.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(data[0])
  } catch (err) {
    console.error('❌ Error en /api/products/:id:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router