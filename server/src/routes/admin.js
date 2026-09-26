import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'crypto'
import { verifyAdmin } from '../middleware/auth.js'
import { handleError } from '../utils/errorHandler.js'
import { supabase } from '../config/supabase.js'
import { validateProduct, validateStock, validatePrice } from '../utils/validation.js'
import * as statsService from '../services/statsService.js'
import * as ordersService from '../services/ordersService.js'
import * as usersService from '../services/usersService.js'
import * as productsService from '../services/productsService.js'
import * as paymentsService from '../services/paymentsService.js'
import { parsePagination, paginatedResponse } from '../utils/pagination.js'

const router = Router()
const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image')

const parseProductImage = (req, res, next) => {
  productImageUpload(req, res, error => {
    if (!error) return next()
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    return res.status(statusCode).json({ error: 'La imagen debe ser válida y no superar 5 MB' })
  })
}

router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ authorized: true })
})

router.post('/product-images', verifyAdmin, parseProductImage, async (req, res) => {
  try {
    const allowedTypes = new Set(['image/webp', 'image/jpeg', 'image/png'])
    if (!req.file || !allowedTypes.has(req.file.mimetype)) {
      return res.status(400).json({ error: 'Formato de imagen no permitido' })
    }

    const extension = req.file.mimetype === 'image/webp'
      ? 'webp'
      : req.file.mimetype === 'image/png' ? 'png' : 'jpg'
    const filePath = `products/${randomUUID()}.${extension}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, req.file.buffer, { contentType: req.file.mimetype })

    if (error) throw error

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
    res.status(201).json({ imageUrl: data.publicUrl })
  } catch (err) {
    handleError(res, err, 'Error al subir imagen de producto')
  }
})

router.delete('/product-images', verifyAdmin, async (req, res) => {
  try {
    const imageUrl = new URL(req.body.image_url)
    const supabaseOrigin = new URL(process.env.SUPABASE_URL).origin
    const publicPath = '/storage/v1/object/public/product-images/'

    if (imageUrl.origin !== supabaseOrigin || !imageUrl.pathname.includes(publicPath)) {
      return res.status(400).json({ error: 'URL de imagen inválida' })
    }

    const filePath = decodeURIComponent(imageUrl.pathname.split(publicPath)[1])
    if (!filePath.startsWith('products/') || filePath.split('/').includes('..')) {
      return res.status(400).json({ error: 'Ruta de imagen inválida' })
    }

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath])

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    if (err instanceof TypeError) {
      return res.status(400).json({ error: 'URL de imagen inválida' })
    }
    handleError(res, err, 'Error al eliminar imagen de producto')
  }
})

// ========================
// ESTADÍSTICAS
// ========================

router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const stats = await statsService.getStats()
    res.json(stats)
  } catch (err) {
    handleError(res, err, 'Error en /stats')
  }
})

// ========================
// ÓRDENES
// ========================

router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const pagination = parsePagination(req.query)
    const result = await ordersService.getAllOrders(pagination)
    res.json(paginatedResponse(result.data, pagination, result.total))
  } catch (err) {
    handleError(res, err, 'Error en /orders')
  }
})

router.get('/orders/:id/detail', verifyAdmin, async (req, res) => {
  try {
    const order = await ordersService.getOrderDetail(req.params.id)
    res.json(order)
  } catch (err) {
    handleError(res, err, 'Error al obtener detalle de orden')
  }
})

router.delete('/orders/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await ordersService.deleteOrder(req.params.id)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al eliminar orden')
  }
})

// ========================
// USUARIOS
// ========================

router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const pagination = parsePagination(req.query)
    const result = await usersService.getAllUsers(pagination)
    res.json(paginatedResponse(result.data, pagination, result.total))
  } catch (err) {
    handleError(res, err, 'Error en /users')
  }
})

router.get('/users/:id/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await usersService.getUserOrders(req.params.id)
    res.json(orders)
  } catch (err) {
    handleError(res, err, 'Error al obtener órdenes del usuario')
  }
})

router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await usersService.deleteUser(req.params.id)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al eliminar usuario')
  }
})

// ========================
// PRODUCTOS
// ========================

router.get('/products', verifyAdmin, async (req, res) => {
  try {
    const pagination = parsePagination(req.query)
    const result = await productsService.getAllProducts(pagination)
    res.json(paginatedResponse(result.data, pagination, result.total))
  } catch (err) {
    handleError(res, err, 'Error en /products')
  }
})

router.post('/products', verifyAdmin, async (req, res) => {
  try {
    const productData = validateProduct(req.body)
    const result = await productsService.createProduct(productData)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al crear producto')
  }
})

router.put('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const productData = validateProduct(req.body)
    const result = await productsService.updateProduct(req.params.id, productData)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al editar producto')
  }
})

router.put('/products/:id/stock', verifyAdmin, async (req, res) => {
  try {
    const stockData = validateStock(req.body)
    const result = await productsService.updateProductStock(req.params.id, stockData)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al actualizar stock')
  }
})

router.put('/products/:id/price', verifyAdmin, async (req, res) => {
  try {
    const priceData = validatePrice(req.body)
    const result = await productsService.updateProductPrice(req.params.id, priceData)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al actualizar precio')
  }
})

router.delete('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const result = await productsService.deleteProduct(req.params.id)
    res.json(result)
  } catch (err) {
    if (err.message.includes('No se puede eliminar')) {
      return res.status(400).json({ error: err.message })
    }
    handleError(res, err, 'Error al eliminar producto')
  }
})

// ========================
// PAGOS
// ========================

router.get('/payments', verifyAdmin, async (req, res) => {
  try {
    const pagination = parsePagination(req.query)
    const result = await paymentsService.getPendingPayments(pagination)
    res.json(paginatedResponse(result.data, pagination, result.total))
  } catch (err) {
    handleError(res, err, 'Error al obtener pagos pendientes')
  }
})

router.put('/payments/:id/payment', verifyAdmin, async (req, res) => {
  try {
    const { amount_paid, payment_method } = req.body
    const result = await paymentsService.registerPayment(
      req.params.id,
      parseInt(amount_paid),
      payment_method
    )
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al registrar pago')
  }
})

router.put('/payments/:id/paid', verifyAdmin, async (req, res) => {
  try {
    const { payment_method } = req.body
    const result = await paymentsService.markAsPaid(req.params.id, payment_method)
    res.json(result)
  } catch (err) {
    handleError(res, err, 'Error al marcar como pagada')
  }
})

export default router