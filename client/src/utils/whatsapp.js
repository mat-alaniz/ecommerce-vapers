// Número de WhatsApp del admin (formato internacional, sin + ni espacios)
export const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP || '5491163736656'

// Generar enlace de WhatsApp con mensaje pre-armado
export const generateWhatsAppLink = (phone, message) => {
  const params = new URLSearchParams({
    phone,
    text: message
  })
  return `https://api.whatsapp.com/send?${params.toString()}`
}

// Generar mensaje de pedido para el admin (con el mensaje para reenviar al cliente)
export const generateAdminOrderMessage = (orderData) => {
  const { orderId, customerName, customerPhone, items, total, discount, totalUnits, stockType } = orderData
  const deliveryMessage = stockType === 'warehouse'
    ? 'Coordinar entrega con el vendedor por WhatsApp.'
    : 'Entrega inmediata desde stock móvil.'

  // Usa escapes Unicode para conservar los emojis modernos en el enlace.
  let adminMessage = `\u{1F4E6} *NUEVO PEDIDO #${orderId}*\n\n`
  adminMessage += `\u{1F464} *Cliente:* ${customerName}\n`
  adminMessage += `\u{260E}\u{FE0F} *Teléfono:* ${customerPhone}\n\n`
  adminMessage += `\u{1F4CB} *Productos:*\n`

  items.forEach(item => {
    adminMessage += `• ${item.quantity}x ${item.name} ($${item.price} c/u)\n`
  })

  adminMessage += `\n\u{1F4B0} *Total:* $${total}\n`
  if (discount > 0) {
    adminMessage += `\u{1F381} *Descuento aplicado:* -$${discount}\n`
  }

  adminMessage += `\n\u{26A0}\u{FE0F} Por favor, contactar al cliente para coordinar el pago y la entrega.\n`
  adminMessage += `\n\u{1F4CD} *Modalidad:* ${deliveryMessage}\n`

  // Mensaje listo para reenviar al cliente
  adminMessage += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
  adminMessage += `\u{1F4CB} *MENSAJE PARA EL CLIENTE:*\n\n`
  adminMessage += `¡Hola ${customerName}! \u{1F44B}\n\n`
  adminMessage += `\u{1F389} ¡Gracias por tu compra!\n\n`
  adminMessage += `\u{1F4CA} Vas *${totalUnits}/5*\n`
  adminMessage += `\u{1F381} El *6to al 50% off*\n\n`
  adminMessage += `\u{1F4AC} Cualquier cosa me escribís!!!\n`
  adminMessage += `\u{1F64C} ¡Muchas gracias!\n`
  adminMessage += `CheVaper \u{1F6CD}\u{FE0F}`
  return adminMessage
}