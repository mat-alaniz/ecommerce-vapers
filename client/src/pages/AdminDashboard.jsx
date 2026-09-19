import { useState } from 'react'
import AdminStats from '../components/Admin/AdminStats'
import AdminTabs from '../components/Admin/AdminTabs'
import ConfirmDeleteModal from '../components/AdminModals/ConfirmDeleteModal'
import OrderDetailModal from '../components/AdminModals/OrderDetailModal'
import StockEditModal from '../components/AdminModals/StockEditModal'
import ProductFormModal from '../components/AdminModals/ProductFormModal'
import PaymentModal from '../components/AdminModals/PaymentModal'
import UserOrdersModal from '../components/AdminModals/UserOrdersModal'
import OrdersTable from '../components/AdminTables/OrdersTable'
import UsersTable from '../components/AdminTables/UsersTable'
import ProductsTable from '../components/AdminTables/ProductsTable'
import PaymentsTable from '../components/AdminTables/PaymentsTable'
import useAdminDashboard from '../hooks/useAdminDashboard'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('panel')
  const {
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
  } = useAdminDashboard()

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Cargando panel...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Administración</h1>

      <ConfirmDeleteModal modal={modal} onClose={closeModal} />
      <OrderDetailModal
        orderDetail={orderDetail}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
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
      <UserOrdersModal
        isOpen={userOrdersModal.isOpen}
        user={userOrdersModal.user}
        orders={userOrdersModal.orders}
        onClose={closeUserOrdersModal}
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
        <section className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Órdenes</h2>
          <OrdersTable
            orders={allOrders}
            onViewDetail={fetchOrderDetail}
            onDelete={confirmDelete}
          />
        </section>
      )}

      {activeTab === 'usuarios' && (
        <section className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Usuarios</h2>
          <UsersTable
            users={users}
            onDelete={confirmDelete}
            onViewOrders={openUserOrdersModal}
          />
        </section>
      )}

      {activeTab === 'stock' && (
        <section className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
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
        </section>
      )}

      {activeTab === 'pagos' && (
        <section className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">💰 Pagos pendientes</h2>
          <PaymentsTable
            payments={payments}
            onRegisterPayment={openPaymentModal}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </section>
      )}
    </div>
  )
}

export default AdminDashboard