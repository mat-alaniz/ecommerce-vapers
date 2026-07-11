const ProductsTable = ({ products, onEditStock, onEditProduct, onDeleteProduct }) => {
  if (products.length === 0) {
    return <p className="text-gray-500">No hay productos cargados.</p>
  }

  return (
    <>
      {/* Tabla en escritorio */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Marca</th>
              <th className="px-4 py-2 text-center">Stock móvil</th>
              <th className="px-4 py-2 text-center">Stock depósito</th>
              <th className="px-4 py-2 text-right">Precio</th>
              <th className="px-4 py-2 text-center">Oferta</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-2">#{product.id}</td>
                <td className="px-4 py-2 font-medium">{product.name}</td>
                <td className="px-4 py-2">{product.brand}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock_mobile > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_mobile || 0}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock_warehouse > 0 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.stock_warehouse || 0}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-semibold">${product.price}</td>
                <td className="px-4 py-2 text-center">
                  {product.is_promo ? (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Sí</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">No</span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    <button
                      onClick={() => onEditStock(product)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded-lg hover:bg-yellow-600 transition text-xs"
                    >
                      Stock
                    </button>
                    <button
                      onClick={() => onEditProduct(product)}
                      className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id, product.name)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tarjetas en móvil */}
      <div className="md:hidden space-y-4">
        {products.map(product => (
          <div key={product.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-gray-800">{product.name}</p>
              <span className="text-xs text-gray-500">#{product.id}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Marca: {product.brand}</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Móvil</p>
                <p className="font-bold text-green-700">{product.stock_mobile || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Depósito</p>
                <p className="font-bold text-blue-700">{product.stock_warehouse || 0}</p>
              </div>
            </div>
            <p className="text-right font-semibold text-primary">${product.price}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => onEditStock(product)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
              >
                Stock
              </button>
              <button
                onClick={() => onEditProduct(product)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => onDeleteProduct(product.id, product.name)}
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

export default ProductsTable