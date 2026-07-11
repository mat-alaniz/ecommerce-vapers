import toast from 'react-hot-toast'

const StockEditModal = ({ isOpen, product, stock_mobile, stock_warehouse, onChange, onSave, onClose }) => {
  if (!isOpen || !product) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  const handleSave = async () => {
    // Validar que sean números
    if (isNaN(stock_mobile) || isNaN(stock_warehouse)) {
      toast.error('Los valores deben ser números')
      return
    }
    await onSave()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
          <h3 className="text-xl font-semibold text-gray-800">
            Editar stock de {product.name}
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock móvil (entrega inmediata)
              </label>
              <input
                type="number"
                name="stock_mobile"
                value={stock_mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock depósito (coordinar entrega)
              </label>
              <input
                type="number"
                name="stock_warehouse"
                value={stock_warehouse}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-emerald-600 transition font-medium"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default StockEditModal
