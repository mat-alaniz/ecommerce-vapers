export const validateProduct = (data) => {
  const {
    name,
    brand,
    flavor_es,
    price,
    stock_mobile,
    stock_warehouse,
    is_promo,
    description,
    nicotine,
    puffs,
    battery
  } = data

  return {
    name,
    brand,
    flavor_es,
    price: parseInt(price),
    stock_mobile: parseInt(stock_mobile) || 0,
    stock_warehouse: parseInt(stock_warehouse) || 0,
    is_promo: is_promo || false,
    description: description || null,
    nicotine: nicotine || null,
    puffs: puffs || null,
    battery: battery || null
  }
}

export const validateStock = (data) => {
  const { stock_mobile, stock_warehouse } = data
  
  return {
    stock_mobile: parseInt(stock_mobile) || 0,
    stock_warehouse: parseInt(stock_warehouse) || 0
  }
}

export const validatePrice = (data) => {
  const { price } = data
  
  return {
    price: parseInt(price)
  }
}

const PAYMENT_METHODS = ['efectivo', 'transferencia', 'mercado_pago']

export const validatePayment = (data) => {
  const amount = Number(data.amount_paid)
  const paymentMethod = data.payment_method

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('El monto del pago debe ser mayor que cero')
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error('Método de pago inválido')
  }

  return { amount, paymentMethod }
}

export const validatePaymentMethod = (data) => {
  const paymentMethod = data.payment_method

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error('Método de pago inválido')
  }

  return paymentMethod
}
