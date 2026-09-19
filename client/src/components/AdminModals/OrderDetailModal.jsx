const OrderDetailModal = ({ orderDetail, isOpen, onClose }) => {
  if (!isOpen || !orderDetail) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center sticky top-0">
          <h3 className="text-xl font-semibold text-blue-800">
            Detalle de orden #{orderDetail.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <p><span className="font-medium">Usuario:</span> {orderDetail.user_name || orderDetail.user_email}</p>
            <p><span className="font-medium">Fecha:</span> {new Date(orderDetail.created_at).toLocaleDateString()}</p>
            <p><span className="font-medium">Total:</span> ${orderDetail.total_amount}</p>
            <p><span className="font-medium">Descuento:</span> -${orderDetail.discount_applied}</p>
          </div>
          
          <h4 className="font-medium text-gray-700 mb-2">Productos:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Producto</th>
                  <th className="px-3 py-2 text-center">Cant</th>
                  <th className="px-3 py-2 text-center">Precio</th>
                  <th className="px-3 py-2 text-center">Dto.</th>
                  <th className="px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderDetail.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{item.product_name}</td>
                    <td className="px-3 py-2 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-center">${item.unit_price}</td>
                    <td className="px-3 py-2 text-center text-green-600">-${item.discount_per_unit || 0}</td>
                    <td className="px-3 py-2 text-right font-medium">${item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal
