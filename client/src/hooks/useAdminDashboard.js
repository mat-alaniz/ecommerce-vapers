import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminFetch, clearStoredSession, getStoredProfile, getStoredToken } from '../utils/adminApi'
import { invalidateProductsCache } from '../utils/productsCache'

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

const useAdminDashboard = (activeTab) => {
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
  const [counts, setCounts] = useState({ orders: 0, users: 0, products: 0, payments: 0 })
  const [pages, setPages] = useState({ orders: 1, users: 1, stock: 1, pagos: 1 })
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
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

  const fetchStats = useCallback(async () => {
    try {
      const result = await adminFetch('/admin/stats', {}, handleUnauthorized)
      if (!result.unauthorized && result.response.ok) {
        setStats(result.data)
        setCounts({
          orders: result.data.totalOrders,
          users: result.data.totalUsers,
          products: result.data.totalProducts,
          payments: result.data.pendingPayments
        })
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  const loadTabData = useCallback(async (tab, page = 1) => {
    const config = {
      ordenes: { key: 'orders', endpoint: '/admin/orders', setter: setAllOrders },
      usuarios: { key: 'users', endpoint: '/admin/users', setter: setUsers },
      stock: { key: 'products', endpoint: '/admin/products', setter: setProducts },
      pagos: { key: 'payments', endpoint: '/admin/payments', setter: setPayments }
    }[tab]

    if (!config) return

    setListLoading(true)
    try {
      const result = await adminFetch(`${config.endpoint}?page=${page}&limit=20`, {}, handleUnauthorized)
      if (!result.unauthorized && result.response.ok) {
        config.setter(result.data.data)
        setCounts(previous => ({ ...previous, [config.key]: result.data.total }))
        setPages(previous => ({ ...previous, [tab]: result.data.page }))
      }
    } catch (error) {
      console.error(`Error al cargar ${tab}:`, error)
      toast.error('Error al cargar la lista')
    } finally {
      setListLoading(false)
    }
  }, [handleUnauthorized])

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      activeTab === 'panel' ? Promise.resolve() : loadTabData(activeTab, pages[activeTab])
    ])
  }, [activeTab, fetchStats, loadTabData, pages])

  const changePage = (tab, page) => {
    setPages(previous => ({ ...previous, [tab]: page }))
    loadTabData(tab, page)
  }

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

    fetchStats()
  }, [navigate, fetchStats])

  useEffect(() => {
    if (activeTab !== 'panel') loadTabData(activeTab, 1)
  }, [activeTab, loadTabData])

  const fetchProducts = useCallback(() => {
    loadTabData('stock', pages.stock)
  }, [loadTabData, pages.stock])

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
        invalidateProductsCache()
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
        invalidateProductsCache()
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
        invalidateProductsCache()
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
    counts,
    pages,
    loading,
    listLoading,
    modal,
    editStockModal,
    orderDetail,
    showDetailModal,
    productFormModal,
    paymentModal,
    userOrdersModal,
    setShowDetailModal,
    fetchAllData,
    changePage,
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