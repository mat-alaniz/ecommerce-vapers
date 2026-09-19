import { supabase } from '../config/supabase.js'

const normalizeProductId = (productId) => {
  const parsedId = Number.parseInt(productId, 10)

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    const invalidIdError = new Error('ID de producto invalido')
    invalidIdError.statusCode = 400
    throw invalidIdError
  }

  return parsedId
}

export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id')
  
  if (error) throw error
  
  return data
}

export const createProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()
  
  if (error) throw error
  
  return { success: true, product: data }
}

export const updateProduct = async (productId, productData) => {
  const normalizedProductId = normalizeProductId(productId)

  const { error: updateError } = await supabase
    .from('products')
    .update(productData)
    .eq('id', normalizedProductId)

  if (updateError) throw updateError

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', normalizedProductId)
    .maybeSingle()
  
  if (error) throw error
  if (!data) {
    const notFoundError = new Error('Producto no encontrado')
    notFoundError.statusCode = 404
    throw notFoundError
  }
  
  return { success: true, product: data }
}

export const updateProductStock = async (productId, stockData) => {
  const normalizedProductId = normalizeProductId(productId)

  const { error: updateError } = await supabase
    .from('products')
    .update(stockData)
    .eq('id', normalizedProductId)

  if (updateError) throw updateError

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', normalizedProductId)
    .maybeSingle()
  
  if (error) throw error
  if (!data) {
    const notFoundError = new Error('Producto no encontrado')
    notFoundError.statusCode = 404
    throw notFoundError
  }
  
  return { success: true, product: data }
}

export const updateProductPrice = async (productId, priceData) => {
  const normalizedProductId = normalizeProductId(productId)

  const { error: updateError } = await supabase
    .from('products')
    .update(priceData)
    .eq('id', normalizedProductId)

  if (updateError) throw updateError

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', normalizedProductId)
    .maybeSingle()
  
  if (error) throw error
  if (!data) {
    const notFoundError = new Error('Producto no encontrado')
    notFoundError.statusCode = 404
    throw notFoundError
  }
  
  return { success: true, product: data }
}

export const deleteProduct = async (productId) => {
  // Verificar si el producto tiene órdenes asociadas
  const { data: orderItems, error: checkError } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', productId)
    .limit(1)
  
  if (checkError) throw checkError
  
  if (orderItems && orderItems.length > 0) {
    throw new Error('No se puede eliminar este producto porque tiene órdenes asociadas')
  }
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
  
  if (error) throw error
  
  return { success: true, message: 'Producto eliminado correctamente' }
}
