const UsersTable = ({ users, onDelete, onViewOrders }) => {
  if (users.length === 0) {
    return <p className="text-gray-500">No hay usuarios registrados.</p>
  }

  return (
    <>
      {/* Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-right">Unidades</th>
              <th className="px-4 py-2 text-right">Total gastado</th>
              <th className="px-4 py-2 text-right">Pagado</th>
              <th className="px-4 py-2 text-right">Debe</th>
              <th className="px-4 py-2 text-center">Rol</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const totalGastado = user.total_spent || 0
              const pagado = user.total_paid || 0
              const debe = totalGastado - pagado
              return (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.full_name || 'Sin nombre'}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.phone || 'No especificado'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-primary">{user.total_units_purchased || 0}</td>
                  <td className="px-4 py-2 text-right">${totalGastado}</td>
                  <td className="px-4 py-2 text-right text-green-600">${pagado}</td>
                  <td className="px-4 py-2 text-right text-red-600 font-semibold">${debe}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role || 'cliente'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button
                        onClick={() => onViewOrders(user)}
                        className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition text-xs"
                      >
                        Ver compras
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => onDelete('user', user.id, user.full_name || user.email)}
                          className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                        >
                          Eliminar
                        </button>
                      )}
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
        {users.map(user => {
          const totalGastado = user.total_spent || 0
          const pagado = user.total_paid || 0
          const debe = totalGastado - pagado
          return (
            <div key={user.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="font-semibold text-gray-800">{user.full_name || 'Sin nombre'}</p>
              <p className="text-sm text-gray-600">📧 {user.email}</p>
              <p className="text-sm text-gray-600">📱 {user.phone || 'No especificado'}</p>
              <div className="grid grid-cols-3 gap-2 my-3 text-center">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-500">Unidades</p>
                  <p className="font-bold text-primary">{user.total_units_purchased || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Pagado</p>
                  <p className="font-bold text-green-700">${pagado}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Debe</p>
                  <p className="font-bold text-red-700">${debe}</p>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role || 'cliente'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewOrders(user)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition text-xs"
                  >
                    Ver compras
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onDelete('user', user.id, user.full_name || user.email)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default UsersTable