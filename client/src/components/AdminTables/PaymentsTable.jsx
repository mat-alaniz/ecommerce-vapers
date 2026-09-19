const PaymentsTable = ({ payments, onRegisterPayment, onMarkAsPaid }) => {
  if (payments.length === 0) {
    return <p className="text-gray-500">No hay pagos pendientes.</p>
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
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Pagado</th>
              <th className="px-4 py-2 text-right">Restante</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(order => {
              const restante = order.total_amount - (order.amount_paid || 0)
              return (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">#{order.id}</td>
                  <td className="px-4 py-2">{order.user_name || order.user_email}</td>
                  <td className="px-4 py-2">{order.user_phone || 'No especificado'}</td>
                  <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-right font-semibold">${order.total_amount}</td>
                  <td className="px-4 py-2 text-right text-green-600">${order.amount_paid || 0}</td>
                  <td className="px-4 py-2 text-right text-red-600 font-semibold">${restante}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button
                        onClick={() => onRegisterPayment(order)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition text-xs"
                      >
                        Registrar pago
                      </button>
                      <button
                        onClick={() => onMarkAsPaid(order.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition text-xs"
                      >
                        Marcar pagada
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <div className="md:hidden space-y-4">
        {payments.map(order => {
          const restante = order.total_amount - (order.amount_paid || 0)
          return (
            <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-gray-800">#{order.id}</p>
                <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600">👤 {order.user_name || order.user_email}</p>
              <p className="text-sm text-gray-600">📱 {order.user_phone || 'No especificado'}</p>
              <div className="grid grid-cols-3 gap-2 my-3 text-center">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-gray-800">${order.total_amount}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Pagado</p>
                  <p className="font-bold text-green-700">${order.amount_paid || 0}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Restante</p>
                  <p className="font-bold text-red-700">${restante}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onRegisterPayment(order)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  Registrar pago
                </button>
                <button
                  onClick={() => onMarkAsPaid(order.id)}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-sm"
                >
                  Marcar pagada
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default PaymentsTable