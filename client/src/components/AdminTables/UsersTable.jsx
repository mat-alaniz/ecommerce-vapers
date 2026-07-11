const UsersTable = ({ users, onDelete }) => {
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
              <th className="px-4 py-2 text-left">Unidades</th>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.full_name || 'Sin nombre'}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.phone || 'No especificado'}</td>
                <td className="px-4 py-2 font-semibold text-primary">{user.total_units_purchased || 0}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role || 'cliente'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onDelete('user', user.id, user.full_name || user.email)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <div className="md:hidden space-y-4">
        {users.map(user => (
          <div key={user.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="font-semibold text-gray-800">{user.full_name || 'Sin nombre'}</p>
            <p className="text-sm text-gray-600">📧 {user.email}</p>
            <p className="text-sm text-gray-600">📱 {user.phone || 'No especificado'}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-primary">Unidades: {user.total_units_purchased || 0}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role || 'cliente'}
              </span>
            </div>
            {user.role !== 'admin' && (
              <button
                onClick={() => onDelete('user', user.id, user.full_name || user.email)}
                className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition text-sm"
              >
                Eliminar usuario
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default UsersTable
