import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminFetch, clearStoredSession, getStoredProfile, getStoredToken } from '../utils/adminApi'

const initialModal = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
  itemId: null,
  itemName: ''
}

const initialStockModal = {
  isOpen: false,
  product: null,
  stock_mobile: '',
  stock_warehouse: ''
}

const initialProductModal = { isOpen: false, product: null }
const initialPaymentModal = { isOpen: false, order: null }
const initialUserOrdersModal = { isOpen: false, user: null, orders: [] }

const useAdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUnitsSold: 0
  })
  const [allOrders, setAllOrders] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(initialModal)
  const [editStockModal, setEditStockModal] = useState(initialStockModal)
  const [orderDetail, setOrderDetail] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [productFormModal, setProductFormModal] = useState(initialProductModal)
  const [paymentModal, setPaymentModal] = useState(initialPaymentModal)
  const [userOrdersModal, setUserOrdersModal] = useState(initialUserOrdersModal)

  const handleUnauthorized = useCallback(() => {
    clearStoredSession()
    toast.error('Tu sesión expiró. Iniciá sesión nuevamente.')
    navigate('/login', { replace: true })
  }, [navigate])

  const fetchAllData = useCallback(async () => {
    try {
      const results = await Promise.all([
        adminFetch('/admin/stats', {}, handleUnauthorized),
        adminFetch('/admin/orders', {}, handleUnauthorized),
        adminFetch('/admin/users', {}, handleUnauthorized),
        adminFetch('/admin/products', {}, handleUnauthorized),
        adminFetch('/admin/payments', {}, handleUnauthorized)
      ])

      if (results.some(result => result.unauthorized)) return

      const [statsResult, ordersResult, usersResult, productsResult, paymentsResult] = results
      if (statsResult.response.ok) setStats(statsResult.data)
      if (ordersResult.response.ok) setAllOrders(ordersResult.data)
      if (usersResult.response.ok) setUsers(usersResult.data)
      if (productsResult.response.ok) setProducts(productsResult.data)
      if (paymentsResult.response.ok) setPayments(paymentsResult.data)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  const fetchProducts = useCallback(async () => {
    const result = await adminFetch('/admin/products', {}, handleUnauthorized)
    if (!result.unauthorized && result.response.ok) setProducts(result.data)
  }, [handleUnauthorized])

  useEffect(() => {
    const token = getStoredToken()
    const profile = getStoredProfile()

    if (!token) {
      navigate('/login')
      return
    }

    if (profile.role !== 'admin') {
      navigate('/')
      toast.error('No tenés permisos de administrador')
      return
    }

    fetchAllData()
  }, [navigate, fetchAllData])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchAllData()
    }
    const refreshInterval = setInterval(refreshWhenVisible, 15000)

    window.addEventListener('focus', refreshWhenVisible)
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('focus', refreshWhenVisible)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [fetchAllData])

  const fetchOrderDetail = async (orderId) => {
    try {
      const { response, data, unauthorized } = await adminFetch(
        `/admin/orders/${orderId}/detail`,
        {},
        handleUnauthorized
      )
      if (unauthorized) return
      if (response.ok) {
        setOrderDetail(data)
        setShowDetailModal(true)
      } else {
        toast.error(data.error || 'Error al cargar detalle')
      }
    } catch (error) {
      console.error('Error al cargar detalle:', error)
      toast.error('Error de conexión')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      const { response, data, unauthorized } = await adminFetch(`/admin/orders/${orderId}`, {
        method: 'DELETE'
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Orden eliminada correctamente')
        await fetchAllData()
      } else {
        toast.error(data.error || 'Error al eliminar orden')
      }
    } catch (error) {
      console.error('Error al eliminar orden:', error)
      toast.error('Error de conexión')
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const { response, data, unauthorized } = await adminFetch(`/admin/users/${userId}`, {
        method: 'DELETE'
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Usuario eliminado correctamente')
        await fetchAllData()
      } else {
        toast.error(data.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error('Error de conexión')
    }
  }

  const confirmDelete = (type, id, name) => {
    setModal({
      isOpen: true,
      title: type === 'order' ? 'Eliminar orden' : 'Eliminar usuario',
      message: type === 'order'
        ? `¿Estás seguro de que querés eliminar la orden #${id}? Esta acción no se puede deshacer.`
        : `¿Estás seguro de que querés eliminar al usuario "${name}"? Esta acción no se puede deshacer.`,
      onConfirm: type === 'order' ? handleDeleteOrder : handleDeleteUser,
      itemId: id,
      itemName: name
    })
  }

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }))

  const openEditStockModal = (product) => {
    setEditStockModal({
      isOpen: true,
      product,
      stock_mobile: product.stock_mobile,
      stock_warehouse: product.stock_warehouse
    })
  }

  const closeEditStockModal = () => setEditStockModal(initialStockModal)

  const handleStockChange = (name, value) => {
    setEditStockModal(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveStock = async () => {
    const { product, stock_mobile, stock_warehouse } = editStockModal
    if (isNaN(stock_mobile) || isNaN(stock_warehouse)) {
      toast.error('Los valores deben ser números')
      return
    }

    try {
      const { response, data, unauthorized } = await adminFetch(`/admin/products/${product.id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_mobile: parseInt(stock_mobile, 10),
          stock_warehouse: parseInt(stock_warehouse, 10)
        })
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Stock actualizado correctamente')
        closeEditStockModal()
        await fetchProducts()
      } else {
        toast.error(data.error || 'Error al actualizar stock')
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error)
      toast.error('Error de conexión')
    }
  }

  const openCreateProductModal = () => setProductFormModal({ isOpen: true, product: null })
  const openEditProductModal = (product) => setProductFormModal({ isOpen: true, product })
  const closeProductFormModal = () => setProductFormModal(initialProductModal)

  const handleSaveProduct = async (formData) => {
    const isEditing = !!productFormModal.product
    const path = isEditing ? `/admin/products/${productFormModal.product.id}` : '/admin/products'

    try {
      const { response, data, unauthorized } = await adminFetch(path, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success(isEditing ? '✅ Producto actualizado' : '✅ Producto creado')
        closeProductFormModal()
        await fetchProducts()
      } else {
        toast.error(data.error || 'Error al guardar producto')
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error de conexión')
    }
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`¿Eliminar el producto "${productName}" permanentemente?`)) return

    try {
      const { response, data, unauthorized } = await adminFetch(`/admin/products/${productId}`, {
        method: 'DELETE'
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Producto eliminado')
        await fetchProducts()
      } else {
        toast.error(data.error || 'Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('Error de conexión')
    }
  }

  const openPaymentModal = (order) => setPaymentModal({ isOpen: true, order })
  const closePaymentModal = () => setPaymentModal(initialPaymentModal)

  const handleRegisterPayment = async (orderId, amount, method) => {
    try {
      const { response, data, unauthorized } = await adminFetch(`/admin/payments/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_paid: amount, payment_method: method })
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Pago registrado')
        closePaymentModal()
        await fetchAllData()
      } else {
        toast.error(data.error || 'Error al registrar pago')
      }
    } catch (error) {
      console.error('Error al registrar pago:', error)
      toast.error('Error de conexión')
    }
  }

  const handleMarkAsPaid = async (orderId) => {
    if (!confirm('¿Marcar esta orden como pagada completamente?')) return

    try {
      const { response, data, unauthorized } = await adminFetch(`/admin/payments/${orderId}/paid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'efectivo' })
      }, handleUnauthorized)
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Orden marcada como pagada')
        await fetchAllData()
      } else {
        toast.error(data.error || 'Error al marcar como pagada')
      }
    } catch (error) {
      console.error('Error al marcar pago:', error)
      toast.error('Error de conexión')
    }
  }

  const openUserOrdersModal = async (user) => {
    try {
      const { response, data, unauthorized } = await adminFetch(
        `/admin/users/${user.id}/orders`,
        {},
        handleUnauthorized
      )
      if (unauthorized) return
      if (response.ok) {
        setUserOrdersModal({ isOpen: true, user, orders: data })
      } else {
        toast.error(data.error || 'Error al cargar compras')
      }
    } catch (error) {
      console.error('Error al cargar compras:', error)
      toast.error('Error de conexión')
    }
  }

  const closeUserOrdersModal = () => setUserOrdersModal(initialUserOrdersModal)

  return {
    stats,
    allOrders,
    users,
    products,
    payments,
    loading,
    modal,
    editStockModal,
    orderDetail,
    showDetailModal,
    productFormModal,
    paymentModal,
    userOrdersModal,
    setShowDetailModal,
    fetchAllData,
    confirmDelete,
    closeModal,
    fetchOrderDetail,
    openEditStockModal,
    closeEditStockModal,
    handleStockChange,
    handleSaveStock,
    openCreateProductModal,
    openEditProductModal,
    closeProductFormModal,
    handleSaveProduct,
    handleDeleteProduct,
    openPaymentModal,
    closePaymentModal,
    handleRegisterPayment,
    handleMarkAsPaid,
    openUserOrdersModal,
    closeUserOrdersModal
  }
}

export default useAdminDashboard