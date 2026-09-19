import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminStats from '../components/Admin/AdminStats'
import AdminTabs from '../components/Admin/AdminTabs'
import ConfirmDeleteModal from '../components/AdminModals/ConfirmDeleteModal'
import OrderDetailModal from '../components/AdminModals/OrderDetailModal'
import StockEditModal from '../components/AdminModals/StockEditModal'
import ProductFormModal from '../components/AdminModals/ProductFormModal'
import PaymentModal from '../components/AdminModals/PaymentModal'
import OrdersTable from '../components/AdminTables/OrdersTable'
import UsersTable from '../components/AdminTables/UsersTable'
import ProductsTable from '../components/AdminTables/ProductsTable'
import PaymentsTable from '../components/AdminTables/PaymentsTable'
import { adminFetch, clearStoredSession, getStoredProfile, getStoredToken } from '../utils/adminApi'

const AdminDashboard = () => {
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
  const [activeTab, setActiveTab] = useState('panel')
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    itemId: null,
    itemName: ''
  })

  const [editStockModal, setEditStockModal] = useState({
    isOpen: false,
    product: null,
    stock_mobile: '',
    stock_warehouse: ''
  })

  const [orderDetail, setOrderDetail] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [productFormModal, setProductFormModal] = useState({
    isOpen: false,
    product: null
  })

  const [paymentModal, setPaymentModal] = useState({ isOpen: false, order: null })

  const handleUnauthorized = useCallback(() => {
    clearStoredSession()
    toast.error('Tu sesión expiró. Iniciá sesión nuevamente.')
    navigate('/login', { replace: true })
  }, [navigate])

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
      console.error('Error:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

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

  const closeModal = () => {
    setModal({ ...modal, isOpen: false })
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      const { response, data, unauthorized } = await adminFetch(
        `/admin/orders/${orderId}`,
        { method: 'DELETE' },
        handleUnauthorized
      )
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
      const { response, data, unauthorized } = await adminFetch(
        `/admin/users/${userId}`,
        { method: 'DELETE' },
        handleUnauthorized
      )
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Usuario eliminado correctamente')
        fetchAllData()
      } else {
        toast.error(data.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      toast.error('Error de conexión')
    }
  }

  // ========================
  // STOCK
  // ========================

  const openEditStockModal = (product) => {
    setEditStockModal({
      isOpen: true,
      product,
      stock_mobile: product.stock_mobile,
      stock_warehouse: product.stock_warehouse
    })
  }

  const closeEditStockModal = () => {
    setEditStockModal({
      isOpen: false,
      product: null,
      stock_mobile: '',
      stock_warehouse: ''
    })
  }

  const handleStockChange = (name, value) => {
    setEditStockModal(prev => ({
      ...prev,
      [name]: value
    }))
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
          stock_mobile: parseInt(stock_mobile),
          stock_warehouse: parseInt(stock_warehouse)
        })
      }, handleUnauthorized)

      if (unauthorized) return

      if (response.ok) {
        toast.success('✅ Stock actualizado correctamente')
        closeEditStockModal()
        const productsResult = await adminFetch('/admin/products', {}, handleUnauthorized)
        if (productsResult.response.ok) setProducts(productsResult.data)
      } else {
        toast.error(data.error || 'Error al actualizar stock')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión')
    }
  }

  // ========================
  // PRODUCTOS
  // ========================

  const openCreateProductModal = () => {
    setProductFormModal({
      isOpen: true,
      product: null
    })
  }

  const openEditProductModal = (product) => {
    setProductFormModal({
      isOpen: true,
      product
    })
  }

  const closeProductFormModal = () => {
    setProductFormModal({
      isOpen: false,
      product: null
    })
  }

  const handleSaveProduct = async (formData) => {
    const isEditing = !!productFormModal.product
    
    try {
      const url = isEditing 
        ? `/admin/products/${productFormModal.product.id}`
        : '/admin/products'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const { response, data, unauthorized } = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }, handleUnauthorized)

      if (unauthorized) return

      if (response.ok) {
        toast.success(isEditing ? '✅ Producto actualizado' : '✅ Producto creado')
        closeProductFormModal()
        const productsResult = await adminFetch('/admin/products', {}, handleUnauthorized)
        if (productsResult.response.ok) setProducts(productsResult.data)
      } else {
        toast.error(data.error || 'Error al guardar producto')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión')
    }
  }

  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`¿Eliminar el producto "${productName}" permanentemente?`)) return

    try {
      const { response, data, unauthorized } = await adminFetch(
        `/admin/products/${productId}`,
        { method: 'DELETE' },
        handleUnauthorized
      )
      if (unauthorized) return
      if (response.ok) {
        toast.success('✅ Producto eliminado')
        const productsResult = await adminFetch('/admin/products', {}, handleUnauthorized)
        if (productsResult.response.ok) setProducts(productsResult.data)
      } else {
        toast.error(data.error || 'Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('Error de conexión')
    }
  }

  // ========================
  // PAGOS
  // ========================

  const openPaymentModal = (order) => {
    setPaymentModal({ isOpen: true, order })
  }

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, order: null })
  }

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
        fetchAllData()
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
        fetchAllData()
      } else {
        toast.error(data.error || 'Error al marcar como pagada')
      }
    } catch (error) {
      console.error('Error al marcar como pagada:', error)
      toast.error('Error de conexión')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Cargando panel...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Administración</h1>
      
      <ConfirmDeleteModal modal={modal} onClose={closeModal} />
      <OrderDetailModal orderDetail={orderDetail} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
      <StockEditModal
        isOpen={editStockModal.isOpen}
        product={editStockModal.product}
        stock_mobile={editStockModal.stock_mobile}
        stock_warehouse={editStockModal.stock_warehouse}
        onChange={handleStockChange}
        onSave={handleSaveStock}
        onClose={closeEditStockModal}
      />
      <ProductFormModal
        isOpen={productFormModal.isOpen}
        product={productFormModal.product}
        onSave={handleSaveProduct}
        onClose={closeProductFormModal}
      />
      <PaymentModal
        isOpen={paymentModal.isOpen}
        order={paymentModal.order}
        onSave={handleRegisterPayment}
        onClose={closePaymentModal}
      />

      <AdminTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ordersCount={allOrders.length}
        usersCount={users.length}
        productsCount={products.length}
        paymentsCount={payments.length}
      />

      {activeTab === 'panel' && <AdminStats stats={stats} />}

      {activeTab === 'ordenes' && (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Órdenes</h2>
          <OrdersTable orders={allOrders} onViewDetail={fetchOrderDetail} onDelete={confirmDelete} />
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Usuarios</h2>
          <UsersTable users={users} onDelete={confirmDelete} />
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">📦 Stock de productos</h2>
            <button
              onClick={openCreateProductModal}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
            >
              + Agregar producto
            </button>
          </div>
          <ProductsTable
            products={products}
            onEditStock={openEditStockModal}
            onEditProduct={openEditProductModal}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      )}

      {activeTab === 'pagos' && (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Pagos pendientes</h2>
          <PaymentsTable
            payments={payments}
            onRegisterPayment={openPaymentModal}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      )}
    </div>
  )
}

export default AdminDashboard