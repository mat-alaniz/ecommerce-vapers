import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productsRoutes from './routes/products.js'
import authRoutes from './routes/auth.js'
import ordersRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'
import { supabase } from './config/supabase.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/products', productsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/admin', adminRoutes)

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando', 
    timestamp: new Date().toISOString() 
  })
})

// ========================
// INICIAR SERVIDOR
// ========================

app.listen(PORT, async () => {
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