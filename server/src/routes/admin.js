import { Router } from 'express'
import { verifyAdmin } from '../middleware/auth.js'
import { handleError } from '../utils/errorHandler.js'
import { validateProduct, validateStock, validatePrice } from '../utils/validation.js'
import * as statsService from '../services/statsService.js'
import * as ordersService from '../services/ordersService.js'
import * as usersService from '../services/usersService.js'
import * as productsService from '../services/productsService.js'

const router = Router()

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
    const orders = await ordersService.getAllOrders()
    res.json(orders)
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
    const users = await usersService.getAllUsers()
    res.json(users)
  } catch (err) {
    handleError(res, err, 'Error en /users')
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
    const products = await productsService.getAllProducts()
    res.json(products)
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

export default router