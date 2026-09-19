const UserOrdersModal = ({ isOpen, user, orders, onClose }) => {
  if (!isOpen || !user) return null

  const totalGastado = orders.reduce((sum, o) => sum + o.total_amount, 0)
  const totalPagado = orders.reduce((sum, o) => sum + (o.amount_paid || 0), 0)
  const totalDebe = totalGastado - totalPagado

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 flex justify-between items-center sticky top-0">
          <h3 className="text-xl font-semibold text-gray-800">
            Compras de {user.full_name || user.email}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total gastado</p>
              <p className="text-lg font-bold text-gray-800">${totalGastado}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total pagado</p>
              <p className="text-lg font-bold text-green-700">${totalPagado}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Debe</p>
              <p className="text-lg font-bold text-red-700">${totalDebe}</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Este usuario no tiene compras registradas.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">Orden #{order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()} - {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mb-1 ${
                        order.is_paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.is_paid ? 'Pagada' : 'Pendiente'}
                      </span>
                      <p className="text-sm font-semibold text-gray-800">Total: ${order.total_amount}</p>
                      {order.discount_applied > 0 && (
                        <p className="text-xs text-green-600">Descuento: -${order.discount_applied}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Productos:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">Producto</th>
                            <th className="px-2 py-1 text-center">Cant</th>
                            <th className="px-2 py-1 text-right">Precio</th>
                            <th className="px-2 py-1 text-right">Dto.</th>
                            <th className="px-2 py-1 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-1">{item.product_name}</td>
                              <td className="px-2 py-1 text-center">{item.quantity}</td>
                              <td className="px-2 py-1 text-right">${item.unit_price}</td>
                              <td className="px-2 py-1 text-right text-green-600">-${item.discount_per_unit || 0}</td>
                              <td className="px-2 py-1 text-right font-medium">${item.subtotal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t text-xs">
                    <span className="text-green-600">Pagado: ${order.amount_paid || 0}</span>
                    <span className="text-red-600 font-semibold">Restante: ${order.restante}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserOrdersModal