const AdminStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <p className="text-gray-500 text-xs md:text-sm">Usuarios</p>
        <p className="text-2xl md:text-3xl font-bold text-primary">{stats.totalUsers}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <p className="text-gray-500 text-xs md:text-sm">Órdenes</p>
        <p className="text-2xl md:text-3xl font-bold text-primary">{stats.totalOrders}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <p className="text-gray-500 text-xs md:text-sm">Ingresos</p>
        <p className="text-2xl md:text-3xl font-bold text-primary">${stats.totalRevenue.toLocaleString('es-AR')}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <p className="text-gray-500 text-xs md:text-sm">Unidades</p>
        <p className="text-2xl md:text-3xl font-bold text-primary">{stats.totalUnitsSold}</p>
      </div>
    </div>
  )
}

export default AdminStats
