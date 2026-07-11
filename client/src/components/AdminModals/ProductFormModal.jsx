import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const ProductFormModal = ({ isOpen, product, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    flavor_es: '',
    price: '',
    stock_mobile: '',
    stock_warehouse: '',
    is_promo: false,
    description: '',
    nicotine: '',
    puffs: '',
    battery: ''
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        flavor_es: product.flavor_es || '',
        price: product.price || '',
        stock_mobile: product.stock_mobile || '',
        stock_warehouse: product.stock_warehouse || '',
        is_promo: product.is_promo || false,
        description: product.description || '',
        nicotine: product.nicotine || '',
        puffs: product.puffs || '',
        battery: product.battery || ''
      })
    } else {
      setFormData({
        name: '',
        brand: '',
        flavor_es: '',
        price: '',
        stock_mobile: '',
        stock_warehouse: '',
        is_promo: false,
        description: '',
        nicotine: '',
        puffs: '',
        battery: ''
      })
    }
  }, [product, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.brand || !formData.flavor_es || !formData.price) {
      toast.error('Nombre, marca, sabor y precio son obligatorios')
      return
    }
    
    await onSave(formData)
  }

  if (!isOpen) return null

  const isEditing = !!product

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 flex justify-between items-center sticky top-0">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditing ? `Editar ${product.name}` : 'Agregar nuevo producto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sabor *
              </label>
              <input
                type="text"
                name="flavor_es"
                value={formData.flavor_es}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock móvil
              </label>
              <input
                type="number"
                name="stock_mobile"
                value={formData.stock_mobile}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock depósito
              </label>
              <input
                type="number"
                name="stock_warehouse"
                value={formData.stock_warehouse}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nicotina
              </label>
              <input
                type="text"
                name="nicotine"
                value={formData.nicotine}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="5%"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puffs
              </label>
              <input
                type="text"
                name="puffs"
                value={formData.puffs}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="5000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batería
              </label>
              <input
                type="text"
                name="battery"
                value={formData.battery}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="650mAh"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_promo"
                checked={formData.is_promo}
                onChange={handleChange}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Producto en oferta
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition font-medium"
            >
              {isEditing ? 'Actualizar producto' : 'Agregar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductFormModal