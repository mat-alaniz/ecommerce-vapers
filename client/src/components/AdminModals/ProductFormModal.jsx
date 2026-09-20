import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../config/supabaseClient'

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
    battery: '',
    image_url: ''
  })
  const [uploading, setUploading] = useState(false)

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
        battery: product.battery || '',
        image_url: product.image_url || ''
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
        battery: '',
        image_url: ''
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

  // 🆕 SUBIR IMAGEN A SUPABASE STORAGE
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    setUploading(true)

    try {
      // Generar nombre único
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }))

      toast.success('✅ Imagen subida correctamente')
    } catch (error) {
      console.error('Error al subir imagen:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  // 🆕 ELIMINAR IMAGEN
  const handleRemoveImage = async () => {
    if (!formData.image_url) return

    // Extraer el path de la URL
    const urlParts = formData.image_url.split('/product-images/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]

    try {
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath])

      if (error) throw error

      setFormData(prev => ({ ...prev, image_url: '' }))
      toast.success('Imagen eliminada')
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      toast.error('Error al eliminar la imagen')
    }
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
          {/* 🆕 SECCIÓN DE IMAGEN */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del producto
            </label>
            
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Vista previa"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                  title="Eliminar imagen"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <p className="text-gray-500">Subiendo imagen...</p>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-500">Hacé clic para subir una imagen</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG o WEBP (máx 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* RESTO DEL FORMULARIO */}
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
                Stock móvil (entrega inmediata)
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
                Stock depósito (coordinar entrega)
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
                Producto en oferta (6ta unidad 50%)
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
              disabled={uploading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-50"
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