const OrdersTable = ({ orders, onViewDetail, onDelete }) => {
  if (orders.length === 0) {
    return <p className="text-gray-500">No hay órdenes aún.</p>
  }

  return (
    <>
      {/* Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Dto.</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2">#{order.id}</td>
                <td className="px-4 py-2">{order.user_email || order.user_id}</td>
                <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 font-semibold">${order.total_amount}</td>
                <td className="px-4 py-2 text-green-600">-${order.discount_applied}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onViewDetail(order.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-xs mr-1"
                  >
                    Ver detalle
                  </button>
                  <button
                    onClick={() => onDelete('order', order.id, order.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <div className="md:hidden space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-gray-800">#{order.id}</span>
              <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">👤 {order.user_email || order.user_id}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-primary">${order.total_amount}</span>
              {order.discount_applied > 0 && (
                <span className="text-xs text-green-600">-${order.discount_applied}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewDetail(order.id)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm"
              >
                Ver detalle
              </button>
              <button
                onClick={() => onDelete('order', order.id, order.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default OrdersTable
