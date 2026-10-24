import express from 'express'
import compression from 'compression'
import dotenv from 'dotenv'
import { createCorsMiddleware } from './config/cors.js'
import productsRoutes from './routes/products.js'
import authRoutes from './routes/auth.js'
import ordersRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import { supabase } from './config/supabase.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(createCorsMiddleware())
app.use(compression())
app.use(express.json({ limit: '1mb' }))

// Rutas
app.use('/api/products', productsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Health check de Supabase:', error.message)
      return res.status(503).json({ status: 'ERROR', message: 'Base de datos no disponible' })
    }

    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('❌ Health check de Supabase:', err.message)
    res.status(503).json({ status: 'ERROR', message: 'Base de datos no disponible' })
  }
})

// ========================
// INICIAR SERVIDOR
// ========================

app.listen(PORT,'0.0.0.0', async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  
  // Verificar conexión con Supabase
  try {
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })

    if (!error) {
      console.log('✅ Supabase: conectado correctamente')
    } else {
      console.log('❌ Supabase: conexión fallida -', error.message)
    }
  } catch (err) {
    console.log('❌ Supabase: error de conexión -', err.message)
  }
})

export default app